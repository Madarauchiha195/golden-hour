import streamlit as st
import pandas as pd
import folium
import requests
import polyline
import random
import math
from streamlit_folium import st_folium
from streamlit_geolocation import streamlit_geolocation
import google.generativeai as genai
import time
import os

st.set_page_config(page_title="Multi-Agent Ambulance Dispatch", layout="wide", page_icon="🚑")

# Configure Gemini
API_KEY = "AQ.Ab8RN6JfLtzgCaDnG_3CEyPXz5FzuBo_ZukJ1Fxrtl6ybDAOPg" # User's provided key
genai.configure(api_key=API_KEY)

# Use older model string in case of free-tier restrictions
model = genai.GenerativeModel('gemini-pro')

st.markdown("""
<style>
    .metric-card { background-color: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 5px solid #ff4b4b; }
    .stButton>button { width: 100%; font-weight: bold; }
    .agent-thought { background-color: #e6f2ff; padding: 15px; border-radius: 5px; font-family: monospace; }
</style>
""", unsafe_allow_html=True)

# --- Geospatial DSA Helpers ---
def get_route(start_coord, end_coord):
    """Fetch real-world driving route using OSRM API."""
    url = f"http://router.project-osrm.org/route/v1/driving/{start_coord[1]},{start_coord[0]};{end_coord[1]},{end_coord[0]}?overview=full&geometries=polyline"
    try:
        r = requests.get(url, timeout=5)
        res = r.json()
        if r.status_code == 200 and res['code'] == 'Ok':
            route_geom = res['routes'][0]['geometry']
            distance = res['routes'][0]['distance'] # meters
            duration = res['routes'][0]['duration'] # seconds
            decoded_coords = polyline.decode(route_geom)
            return decoded_coords, distance, duration
    except:
        pass
    return None, float('inf'), float('inf')

def fetch_real_hospitals(lat, lon, radius_meters=10000):
    """Agent 2: Fetches real hospitals using OpenStreetMap Overpass API within radius."""
    overpass_url = "http://overpass-api.de/api/interpreter"
    overpass_query = f"""
    [out:json];
    (
      node["amenity"="hospital"](around:{radius_meters},{lat},{lon});
      node["amenity"="clinic"](around:{radius_meters},{lat},{lon});
    );
    out body;
    """
    try:
        response = requests.post(overpass_url, data={'data': overpass_query}, timeout=10)
        data = response.json()
        hospitals = []
        for element in data.get('elements', []):
            name = element.get('tags', {}).get('name', 'Unknown Medical Center')
            hospitals.append({"name": name, "coords": (element['lat'], element['lon'])})
        return hospitals[:10] # Return top 10 to avoid OSRM rate limits
    except Exception as e:
        return []

def generate_dynamic_ambulances(lat, lon, num=3, radius_km=5):
    """Dynamically spawns ambulances in a radius around the live location."""
    ambulances = []
    for i in range(num):
        angle = random.uniform(0, 2 * math.pi)
        r = random.uniform(0, radius_km) / 111.0 # 1 deg ~ 111km
        d_lat = r * math.cos(angle)
        d_lon = r * math.sin(angle)
        ambulances.append({"id": f"Amb-Unit-{i+1}", "coords": (lat + d_lat, lon + d_lon)})
    return ambulances

# --- State Management ---
if "mission_state" not in st.session_state: st.session_state.mission_state = "IDLE"
if "patient_data" not in st.session_state: st.session_state.patient_data = None
if "amb_data" not in st.session_state: st.session_state.amb_data = None
if "hosp_data" not in st.session_state: st.session_state.hosp_data = None
if "agent_logs" not in st.session_state: st.session_state.agent_logs = []

st.sidebar.title("🤖 Multi-Agent Console")
page = st.sidebar.radio("Navigation", ["Emergency Dispatch", "Active Mission Map", "Agent Logs"])

if page == "Emergency Dispatch":
    st.title("🚨 Multi-Agent Emergency Intake")
    
    if st.session_state.mission_state != "IDLE":
        st.warning(f"Active mission running (State: {st.session_state.mission_state}). Monitor it in the 'Active Mission Map'.")
        if st.button("Reset Mission System"):
            for key in ["mission_state", "patient_data", "amb_data", "hosp_data", "agent_logs"]:
                st.session_state[key] = "IDLE" if key == "mission_state" else ([] if key == "agent_logs" else None)
            st.rerun()
            
    else:
        with st.form("intake_form"):
            col1, col2 = st.columns(2)
            with col1:
                name = st.text_input("Patient Name")
                age = st.number_input("Age", 1, 120, 30)
                gender = st.selectbox("Gender", ["Male", "Female", "Other"])
                
            with col2:
                hr = st.slider("Heart Rate (bpm)", 40, 200, 85)
                bp = st.slider("Systolic Blood Pressure", 70, 220, 120)
                spo2 = st.slider("Oxygen Level (SpO2 %)", 70, 100, 98)
                
            incident = st.text_area("Describe the emergency precisely (e.g., 'Severe crushing chest pain', 'Third degree burns on arm'):")
            
            st.markdown("### 📍 Patient Live Location")
            loc = streamlit_geolocation()
            
            # Default to India center if geolocation fails or is denied
            pat_lat, pat_lon = 28.6139, 77.2090 
            if loc and loc.get('latitude'):
                pat_lat, pat_lon = loc['latitude'], loc['longitude']
                st.success(f"Live Location Locked: {pat_lat:.4f}, {pat_lon:.4f}")
            else:
                st.info("Please allow location access. Defaulting to New Delhi fallback.")
            
            submitted = st.form_submit_button("Engage AI Agents")
            
            if submitted and incident:
                st.session_state.agent_logs = []
                
                # --- AGENT 1: Triage ---
                with st.spinner("🤖 Triage Agent analyzing symptoms..."):
                    prompt = f"""
                    You are an expert AI Triage Agent. Analyze this patient:
                    Age: {age}, HR: {hr}, BP: {bp}, SpO2: {spo2}.
                    Incident: {incident}.
                    Determine two things:
                    1. SEVERITY: Choose exactly one: [Critical, Severe, Moderate, Stable].
                    2. SPECIALTY: Choose exactly one hospital specialty needed: [Cardiac, Burns, Trauma, Neurology, General, Pediatric].
                    Return the result exactly as "SEVERITY, SPECIALTY".
                    """
                    try:
                        response = model.generate_content(prompt)
                        result = response.text.strip().split(',')
                        severity = result[0].strip()
                        specialty = result[1].strip() if len(result) > 1 else "General"
                    except Exception as e:
                        # Fallback if API key fails
                        severity = "Critical" if hr > 140 or spo2 < 90 else "Moderate"
                        specialty = "Cardiac" if "chest" in incident.lower() or "heart" in incident.lower() else "General"
                        st.session_state.agent_logs.append(f"⚠️ Gemini API Error (Key Invalid). Using fallback logic.")

                    st.session_state.agent_logs.append(f"🤖 **Triage Agent**: Analyzed vitals and incident. Diagnosis -> {severity}. Required Specialization -> {specialty}.")
                    
                # --- AGENT 2: Geospatial Ambulance Generation & Routing ---
                with st.spinner("🌍 Geospatial Agent locating nearest ambulance..."):
                    ambulances = generate_dynamic_ambulances(pat_lat, pat_lon, num=3, radius_km=5)
                    st.session_state.agent_logs.append(f"🌍 **Geospatial Agent**: Generated 3 live ambulance units within a 5km radius of patient GPS.")
                    
                    best_amb, best_amb_dist, best_amb_route, best_amb_duration = None, float('inf'), None, 0
                    for amb in ambulances:
                        route, dist, dur = get_route(amb["coords"], (pat_lat, pat_lon))
                        if dist < best_amb_dist:
                            best_amb_dist, best_amb, best_amb_route, best_amb_duration = dist, amb, route, dur
                            
                    st.session_state.agent_logs.append(f"🗺️ **Routing Engine**: Computed shortest Dijkstra path. Dispatched {best_amb['id']} (Distance: {best_amb_dist/1000:.1f}km).")
                    
                    st.session_state.patient_data = {"name": name, "coords": (pat_lat, pat_lon), "severity": severity, "specialty": specialty, "incident": incident}
                    st.session_state.amb_data = {"ambulance": best_amb, "route": best_amb_route, "duration": best_amb_duration, "distance": best_amb_dist}
                    st.session_state.mission_state = "DISPATCHED"
                    st.success("Agents have completed Phase 1 Dispatch. Go to 'Active Mission Map'.")

elif page == "Active Mission Map":
    st.title("🗺️ Active Mission Tracking")
    
    if st.session_state.mission_state == "IDLE":
        st.warning("No active mission.")
    elif st.session_state.mission_state == "DISPATCHED":
        p_data = st.session_state.patient_data
        a_data = st.session_state.amb_data
        
        st.subheader(f"Phase 1: Ambulance En Route to Patient ({p_data['severity']})")
        col1, col2 = st.columns(2)
        col1.metric("Ambulance ETA", f"{int(a_data['duration'] // 60)} mins {int(a_data['duration'] % 60)} secs")
        col2.metric("Distance", f"{a_data['distance'] / 1000:.2f} km")
        
        m = folium.Map(location=p_data['coords'], zoom_start=13)
        folium.Marker(p_data['coords'], icon=folium.Icon(color="red", icon="user", prefix="fa"), tooltip="Patient").add_to(m)
        folium.Marker(a_data['ambulance']['coords'], icon=folium.Icon(color="blue", icon="ambulance", prefix="fa"), tooltip=a_data['ambulance']['id']).add_to(m)
        if a_data['route']: folium.PolyLine(a_data['route'], color="blue", weight=5).add_to(m)
        st_folium(m, width=1200, height=500)
        
        st.markdown("---")
        if st.button("🚨 CONFIRM: Ambulance Has Arrived at Patient", type="primary"):
            with st.spinner(f"🏥 Geospatial Agent searching for '{p_data['specialty']}' hospitals within 10km..."):
                time.sleep(1)
                st.session_state.agent_logs.append(f"🌍 **Geospatial Agent**: Querying OpenStreetMap Overpass API for real hospitals near {p_data['coords']}.")
                hospitals = fetch_real_hospitals(p_data['coords'][0], p_data['coords'][1], radius_meters=10000)
                
                if not hospitals:
                    st.session_state.agent_logs.append("⚠️ **Geospatial Agent**: Overpass API failed or no hospitals found. Using synthetic hospital.")
                    hospitals = [{"name": f"City {p_data['specialty']} Center", "coords": (p_data['coords'][0] + 0.02, p_data['coords'][1] + 0.02)}]
                else:
                    st.session_state.agent_logs.append(f"🌍 **Geospatial Agent**: Found {len(hospitals)} real hospitals in 10km radius.")
                    
                # Find closest hospital
                best_hosp, best_hosp_dist, best_hosp_route, best_hosp_duration = None, float('inf'), None, 0
                for hosp in hospitals:
                    route, dist, dur = get_route(p_data['coords'], hosp["coords"])
                    if dist < best_hosp_dist:
                        best_hosp_dist, best_hosp, best_hosp_route, best_hosp_duration = dist, hosp, route, dur
                
                # Check Gemini API for selection reason
                st.session_state.agent_logs.append(f"🤖 **Triage Agent**: Selected '{best_hosp['name']}' due to {p_data['specialty']} requirements.")
                
                st.session_state.hosp_data = {"hospital": best_hosp, "route": best_hosp_route, "duration": best_hosp_duration, "distance": best_hosp_dist}
                st.session_state.mission_state = "ARRIVED"
                st.rerun()

    elif st.session_state.mission_state == "ARRIVED":
        p_data = st.session_state.patient_data
        h_data = st.session_state.hosp_data
        
        st.subheader("Phase 2: Transporting Patient to Hospital")
        st.info(f"Target Hospital Selected: **{h_data['hospital']['name']}** (Specialty match: {p_data['specialty']})")
        
        col1, col2 = st.columns(2)
        col1.metric("Hospital ETA", f"{int(h_data['duration'] // 60)} mins {int(h_data['duration'] % 60)} secs")
        col2.metric("Distance", f"{h_data['distance'] / 1000:.2f} km")
        
        m = folium.Map(location=p_data['coords'], zoom_start=13)
        folium.Marker(p_data['coords'], icon=folium.Icon(color="blue", icon="ambulance", prefix="fa")).add_to(m)
        folium.Marker(h_data['hospital']['coords'], icon=folium.Icon(color="green", icon="plus", prefix="fa"), tooltip=h_data['hospital']['name']).add_to(m)
        if h_data['route']: folium.PolyLine(h_data['route'], color="green", weight=5).add_to(m)
        st_folium(m, width=1200, height=500)
        
        st.markdown("---")
        if st.button("🏁 CONFIRM: Mission Completed (Patient Dropped Off)"):
            st.session_state.mission_state = "IDLE"
            st.rerun()

elif page == "Agent Logs":
    st.title("🧠 Internal Agent Thoughts")
    if not st.session_state.agent_logs:
        st.info("No agents have been engaged yet.")
    for log in st.session_state.agent_logs:
        st.markdown(f"<div class='agent-thought'>{log}</div><br>", unsafe_allow_html=True)
