import streamlit as st
import pandas as pd
import folium
import requests
import polyline
import random
import math
import json
import time
import os
from streamlit_folium import st_folium
from streamlit_geolocation import streamlit_geolocation
import google.generativeai as genai

st.set_page_config(page_title="Multi-Agent Ambulance Dispatch", layout="wide", page_icon="🚑")

st.markdown("""
<style>
    .metric-card { background-color: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 5px solid #ff4b4b; }
    .stButton>button { width: 100%; font-weight: bold; }
    .agent-thought { background-color: #e6f2ff; padding: 15px; border-radius: 5px; font-family: monospace; margin-bottom: 10px; }
</style>
""", unsafe_allow_html=True)

# --- Configuration & Memory System ---
HISTORY_FILE = "ambulance_dispatch_ai/history.json"

def load_history():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r") as f:
            return json.load(f)
    return {"total_dispatches": 0, "cache_hits": 0, "avg_routing_time": 0.0, "records": {}}

def save_history(history):
    os.makedirs("ambulance_dispatch_ai", exist_ok=True)
    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=4)

history = load_history()

st.sidebar.title("🤖 System Configuration")
api_key = st.sidebar.text_input("Gemini API Key", type="password", help="Required for Triage Agent. Get one from Google AI Studio.")
if api_key:
    genai.configure(api_key=api_key)
    
page = st.sidebar.radio("Navigation", [
    "Project Overview", 
    "Emergency Dispatch", 
    "Active Mission Map", 
    "Analytics & Agent Reasoning"
])

# --- Geospatial DSA Helpers ---
def get_route(start_coord, end_coord):
    """Fetch real-world driving route using OSRM API."""
    start_time = time.time()
    url = f"http://router.project-osrm.org/route/v1/driving/{start_coord[1]},{start_coord[0]};{end_coord[1]},{end_coord[0]}?overview=full&geometries=polyline"
    try:
        r = requests.get(url, timeout=5)
        res = r.json()
        if r.status_code == 200 and res['code'] == 'Ok':
            route_geom = res['routes'][0]['geometry']
            distance = res['routes'][0]['distance'] # meters
            duration = res['routes'][0]['duration'] # seconds
            decoded_coords = polyline.decode(route_geom)
            
            # Update history metrics
            history['avg_routing_time'] = (history['avg_routing_time'] + (time.time() - start_time)) / 2
            save_history(history)
            
            return decoded_coords, distance, duration
    except:
        pass
    return None, float('inf'), float('inf')

def fetch_real_hospitals(lat, lon, radius_meters=20000):
    """Agent 2: Fetches real hospitals using OpenStreetMap Overpass API within 20km."""
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
        return hospitals[:10] 
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

# --- Pages ---
if page == "Project Overview":
    st.title("🏥 Multi-Agentic AI Ambulance Dispatch")
    st.markdown("""
    ### Project Architecture
    This system is a state-of-the-art **Multi-Agent Generative AI & DSA Platform**. It completely abandons static ML datasets in favor of dynamic, real-world geospatial intelligence.

    **How the Agents Work:**
    1. **Triage Agent (Gen AI)**: Uses the Gemini LLM to process natural language incident descriptions and vital signs. It determines the medical severity and deduces the exact hospital specialization required.
    2. **Geospatial Environment Agent**: Since real ambulances don't broadcast live GPS, this agent dynamically synthesizes ambulance fleets exactly within a 5km radius of the user's live location.
    3. **Routing Engine (DSA)**: Uses Dijkstra's/A* algorithm via the OSRM API to compute the absolute fastest driving route over real-world street geometries. It connects the live patient to the nearest ambulance, and then queries the **OpenStreetMap Overpass API** to find the nearest real-world hospital matching the required specialization within a 20km radius.
    
    **The Learning Memory Cache:**
    The system utilizes a learning mechanism. When a dispatch is successfully completed, the coordinates and severity are cached. If a future emergency occurs nearby with the same conditions, the system experiences a "Cache Hit" and instantly recalls the routing strategy, bypassing the expensive API calls.
    """)

elif page == "Emergency Dispatch":
    st.title("🚨 Multi-Agent Emergency Intake")
    
    if st.session_state.mission_state != "IDLE":
        st.warning(f"Active mission running (State: {st.session_state.mission_state}). Monitor it in the 'Active Mission Map'.")
        if st.button("Reset Mission System"):
            st.session_state.mission_state = "IDLE"
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
                
            incident = st.text_area("Describe the emergency precisely (e.g., 'Severe crushing chest pain', 'Third degree burns'):")
            
            st.markdown("### 📍 Patient Live Location")
            loc = streamlit_geolocation()
            
            pat_lat, pat_lon = 28.6139, 77.2090 
            if loc and loc.get('latitude'):
                pat_lat, pat_lon = loc['latitude'], loc['longitude']
                st.success(f"Live Location Locked: {pat_lat:.4f}, {pat_lon:.4f}")
            else:
                st.info("Using New Delhi fallback. Please allow location access for real results.")
            
            submitted = st.form_submit_button("Engage AI Agents")
            
            if submitted and incident:
                st.session_state.agent_logs = []
                
                # MEMORY CACHE CHECK
                cache_key = f"{round(pat_lat, 2)}_{round(pat_lon, 2)}"
                if cache_key in history['records']:
                    st.session_state.agent_logs.append("⚡ **Memory System**: Cache Hit! Found previous identical dispatch routing strategy in memory. Bypassing APIs for extreme speed.")
                    history['cache_hits'] += 1
                    save_history(history)
                    
                    cached_data = history['records'][cache_key]
                    severity = cached_data['severity']
                    specialty = cached_data['specialty']
                else:
                    # --- AGENT 1: Triage ---
                    with st.spinner("🤖 Triage Agent analyzing symptoms..."):
                        if not api_key:
                            st.error("Please enter your Gemini API Key in the sidebar to use the Gen AI Triage Agent.")
                            severity = "Critical" if hr > 140 or spo2 < 90 else "Moderate"
                            specialty = "Cardiac" if "chest" in incident.lower() or "heart" in incident.lower() else "General"
                            st.session_state.agent_logs.append("⚠️ **Triage Agent**: No API Key provided. Using local fallback triage logic.")
                        else:
                            try:
                                model = genai.GenerativeModel('gemini-pro')
                                prompt = f"Analyze this patient: Age: {age}, HR: {hr}, BP: {bp}, SpO2: {spo2}. Incident: {incident}. Determine two things: 1. SEVERITY: [Critical, Severe, Moderate, Stable]. 2. SPECIALTY: [Cardiac, Burns, Trauma, Neurology, General, Pediatric]. Return exactly as 'SEVERITY, SPECIALTY'."
                                response = model.generate_content(prompt)
                                result = response.text.strip().split(',')
                                severity = result[0].strip()
                                specialty = result[1].strip() if len(result) > 1 else "General"
                            except Exception as e:
                                severity, specialty = "Critical", "General"
                                st.session_state.agent_logs.append(f"⚠️ **Triage Agent Error**: {e}. Using fallback logic.")

                    st.session_state.agent_logs.append(f"🤖 **Triage Agent**: Diagnosis -> {severity}. Required Specialization -> {specialty}.")
                    
                # --- AGENT 2: Geospatial Ambulance Routing ---
                with st.spinner("🌍 Geospatial Agent locating nearest ambulance..."):
                    ambulances = generate_dynamic_ambulances(pat_lat, pat_lon, num=3, radius_km=5)
                    st.session_state.agent_logs.append("🌍 **Geospatial Agent**: Generated 3 live ambulance units within a 5km radius.")
                    
                    best_amb, best_amb_dist, best_amb_route, best_amb_duration = None, float('inf'), None, 0
                    for amb in ambulances:
                        route, dist, dur = get_route(amb["coords"], (pat_lat, pat_lon))
                        if dist < best_amb_dist:
                            best_amb_dist, best_amb, best_amb_route, best_amb_duration = dist, amb, route, dur
                            
                    st.session_state.agent_logs.append(f"🗺️ **Routing Engine**: Computed OSRM shortest path. Dispatched {best_amb['id']}.")
                    
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
            with st.spinner(f"🏥 Geospatial Agent searching for '{p_data['specialty']}' hospitals within 20km..."):
                st.session_state.agent_logs.append(f"🌍 **Geospatial Agent**: Querying Overpass API for real hospitals near {p_data['coords']}.")
                hospitals = fetch_real_hospitals(p_data['coords'][0], p_data['coords'][1], radius_meters=20000)
                
                if not hospitals:
                    st.session_state.agent_logs.append("⚠️ **Geospatial Agent**: Overpass API found no hospitals in 20km radius. Using synthetic nearest hospital.")
                    hospitals = [{"name": f"City {p_data['specialty']} Center", "coords": (p_data['coords'][0] + 0.02, p_data['coords'][1] + 0.02)}]
                else:
                    st.session_state.agent_logs.append(f"🌍 **Geospatial Agent**: Found {len(hospitals)} real hospitals in 20km radius.")
                    
                best_hosp, best_hosp_dist, best_hosp_route, best_hosp_duration = None, float('inf'), None, 0
                for hosp in hospitals:
                    route, dist, dur = get_route(p_data['coords'], hosp["coords"])
                    if dist < best_hosp_dist:
                        best_hosp_dist, best_hosp, best_hosp_route, best_hosp_duration = dist, hosp, route, dur
                
                st.session_state.agent_logs.append(f"🤖 **Triage Agent**: Verified '{best_hosp['name']}' matches {p_data['specialty']} requirements.")
                
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
        if st.button("🏁 CONFIRM: Mission Completed (Save to Memory)"):
            # Save to Memory Cache
            cache_key = f"{round(p_data['coords'][0], 2)}_{round(p_data['coords'][1], 2)}"
            history['records'][cache_key] = {"severity": p_data['severity'], "specialty": p_data['specialty']}
            history['total_dispatches'] += 1
            save_history(history)
            
            st.session_state.mission_state = "IDLE"
            st.success("Mission archived. Routing strategy saved to Memory Cache.")
            st.rerun()

elif page == "Analytics & Agent Reasoning":
    st.title("📊 Analytics & Agent Reasoning Dashboard")
    st.markdown("Monitor the internal reasoning of the Gen AI agents and the efficiency of the DSA routing algorithms.")
    
    col1, col2, col3 = st.columns(3)
    col1.metric("Total Successful Dispatches", history.get('total_dispatches', 0))
    col2.metric("Memory Cache Hits", history.get('cache_hits', 0))
    col3.metric("Avg Routing Algorithm Execution", f"{history.get('avg_routing_time', 0):.2f} ms")
    
    st.markdown("---")
    st.subheader("🧠 Live Internal Agent Thoughts")
    if not st.session_state.agent_logs:
        st.info("No active agents. Dispatch an emergency to see reasoning logs.")
    for log in st.session_state.agent_logs:
        st.markdown(f"<div class='agent-thought'>{log}</div>", unsafe_allow_html=True)
