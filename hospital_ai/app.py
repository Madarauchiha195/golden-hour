import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime
import time

# --- Setup & Configuration ---
st.set_page_config(
    page_title="Smart Hospital Command Center",
    page_icon="🏥",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for styling
st.markdown("""
<style>
    .reportview-container {
        background: #f0f2f6;
    }
    .big-font {
        font-size: 24px !important;
        font-weight: bold;
    }
    .metric-card {
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        text-align: center;
    }
    .critical { color: #ff4b4b; }
    .warning { color: #fec036; }
    .good { color: #21c354; }
</style>
""", unsafe_allow_html=True)

# --- Sidebar Navigation ---
st.sidebar.title("🏥 Smart Hospital AI")
st.sidebar.markdown("---")

page = st.sidebar.radio("Navigation", [
    "Dashboard Overview",
    "Patient Queue Monitor",
    "Doctor Availability",
    "Emergency Prediction",
    "Bed Occupancy Forecasting",
    "RL Control Center"
])

st.sidebar.markdown("---")
st.sidebar.info("Status: System Online ✅")
st.sidebar.text(f"Last updated: {datetime.now().strftime('%H:%M:%S')}")

# --- Helper Functions ---
@st.cache_data
def load_mock_data():
    # Will be replaced with FastAPI calls
    return {
        "total_patients": 142,
        "active_doctors": 12,
        "waiting_patients": 45,
        "emergency_cases": 8,
        "avg_wait_time": 42
    }

# --- Pages ---
if page == "Dashboard Overview":
    st.title("📊 Hospital Overview Dashboard")
    st.markdown("Real-time snapshot of hospital operations and congestion levels.")
    
    data = load_mock_data()
    
    col1, col2, col3, col4, col5 = st.columns(5)
    with col1:
        st.metric(label="Total Patients", value=data["total_patients"], delta=12)
    with col2:
        st.metric(label="Active Doctors", value=data["active_doctors"], delta="-2")
    with col3:
        st.metric(label="Waiting Patients", value=data["waiting_patients"], delta=5, delta_color="inverse")
    with col4:
        st.metric(label="Emergency Cases", value=data["emergency_cases"], delta=2, delta_color="inverse")
    with col5:
        st.metric(label="Avg Wait (mins)", value=data["avg_wait_time"], delta="8 min", delta_color="inverse")
        
    st.markdown("---")
    
    col_chart1, col_chart2 = st.columns(2)
    with col_chart1:
        st.subheader("Current Congestion by Department")
        # Mock Data
        dept_data = pd.DataFrame({
            "Department": ["Emergency", "OPD", "Cardiology", "Neurology", "Pediatrics"],
            "Patients": [30, 45, 12, 8, 20]
        })
        fig = px.bar(dept_data, x="Department", y="Patients", color="Department", template="plotly_white")
        st.plotly_chart(fig, use_container_width=True)
        
    with col_chart2:
        st.subheader("Wait Time Trend (Last 24h)")
        times = pd.date_range(end=datetime.now(), periods=24, freq='h')
        waits = [np.random.randint(20, 60) for _ in range(24)]
        trend_data = pd.DataFrame({"Time": times, "Wait Time (mins)": waits})
        fig2 = px.line(trend_data, x="Time", y="Wait Time (mins)", markers=True, template="plotly_white")
        st.plotly_chart(fig2, use_container_width=True)

elif page == "Patient Queue Monitor":
    st.title("⏱️ Patient Queue Monitor")
    st.markdown("AI-driven predictions for patient waiting times and dynamic queue routing.")
    
    st.subheader("Active Queue")
    # Mock Queue Data
    queue_df = pd.DataFrame({
        "Patient ID": [f"P{i:04d}" for i in range(1, 6)],
        "Department": ["Emergency", "OPD", "OPD", "Cardiology", "Pediatrics"],
        "Priority": ["Critical", "Low", "Medium", "High", "Low"],
        "Time in Queue": ["15m", "45m", "30m", "10m", "25m"],
        "Predicted Wait Left": ["0m (Immediate)", "35m", "15m", "5m", "20m"]
    })
    
    st.dataframe(queue_df, use_container_width=True)
    
    st.markdown("---")
    st.subheader("Queue Optimization AI")
    st.info("💡 AI Suggestion: Open Counter 3 in OPD to reduce wait time by 12 minutes.")

elif page == "Doctor Availability":
    st.title("👨‍⚕️ Doctor Availability Dashboard")
    st.markdown("Predictive scheduling and workload balancing.")
    
    doc_data = pd.DataFrame({
        "Doctor": ["Dr. Smith", "Dr. Johnson", "Dr. Williams", "Dr. Brown"],
        "Department": ["Emergency", "OPD", "Cardiology", "Pediatrics"],
        "Status": ["Busy", "Available", "Busy", "Available"],
        "Utilization %": [95, 45, 88, 30],
        "Predicted Available In": ["2 hrs", "Now", "45 mins", "Now"]
    })
    
    st.dataframe(doc_data, use_container_width=True)
    
elif page == "Emergency Prediction":
    st.title("🚑 Emergency Priority Prediction")
    st.markdown("Deep Learning based triage scoring.")
    
    col1, col2 = st.columns([1, 2])
    with col1:
        st.subheader("Input Vitals")
        hr = st.slider("Heart Rate (bpm)", 40, 200, 85)
        bp = st.slider("Systolic BP", 70, 220, 120)
        spo2 = st.slider("Oxygen Level (%)", 70, 100, 98)
        age = st.number_input("Age", 1, 100, 45)
        
        if st.button("Predict Triage Priority"):
            with st.spinner("AI analyzing..."):
                time.sleep(1)
                # Mock logic
                if spo2 < 90 or hr > 150:
                    st.error("🚨 CRITICAL PRIORITY")
                else:
                    st.success("✅ LOW PRIORITY")
                    
    with col2:
        st.subheader("SHAP Feature Importance (Explainable AI)")
        st.image("https://raw.githubusercontent.com/slundberg/shap/master/docs/artwork/shap_header.png", use_column_width=True)

elif page == "Bed Occupancy Forecasting":
    st.title("🛏️ Bed Occupancy Forecasting")
    st.markdown("Time series predictions for ward and ICU availability.")
    
    st.metric("Total Beds Occupied", "154 / 200", "77% Capacity")
    
    st.subheader("7-Day Occupancy Forecast")
    dates = pd.date_range(start=datetime.now(), periods=7)
    forecast = [154, 160, 165, 172, 180, 175, 168]
    forecast_df = pd.DataFrame({"Date": dates, "Forecasted Occupied Beds": forecast})
    
    fig = px.area(forecast_df, x="Date", y="Forecasted Occupied Beds", template="plotly_white")
    fig.add_hline(y=200, line_dash="dash", line_color="red", annotation_text="Max Capacity")
    st.plotly_chart(fig, use_container_width=True)

elif page == "RL Control Center":
    st.title("🧠 RL Control Center")
    st.markdown("Deep Q-Network dynamically optimizing hospital workflow.")
    
    col1, col2 = st.columns(2)
    with col1:
        st.subheader("Current Hospital State")
        st.json({
            "queue_lengths": {"OPD": 45, "ER": 12},
            "available_doctors": 3,
            "bed_availability": 46
        })
        
    with col2:
        st.subheader("RL Recommended Action")
        st.success("🎯 Action: Reassign 1 available doctor from General Ward to Emergency Room.")
        st.metric("Expected Reward (Wait Time Reduction)", "+45.2")
        
    st.markdown("---")
    st.subheader("Optimization Reward Curve")
    steps = list(range(100))
    rewards = np.log(np.array(steps) + 1) * 10 + np.random.normal(0, 2, 100)
    reward_df = pd.DataFrame({"Episode": steps, "Cumulative Reward": rewards})
    fig = px.line(reward_df, x="Episode", y="Cumulative Reward", template="plotly_white")
    st.plotly_chart(fig, use_container_width=True)
