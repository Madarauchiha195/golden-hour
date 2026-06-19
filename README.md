# AI-Powered Emergency Response & Multi-Agent Ambulance Dispatch System

## Project Overview
This project is an advanced **Multi-Agentic Generative AI & Data Structures (DSA)** platform designed to revolutionize emergency medical dispatching. Moving beyond static machine learning models, this system utilizes intelligent LLM Agents, Live Geolocation APIs, and Shortest-Path Routing Algorithms to dynamically dispatch the fastest ambulance and select the most appropriate hospital for a patient anywhere in the world.

## The Architecture: Multi-Agent System

This platform is powered by two distinct AI Agents communicating with a DSA Routing Engine:

### 1. The Triage Agent (Gen AI / Gemini LLM)
When a patient submits an emergency via the Streamlit interface, their vitals (Heart Rate, SpO2, Blood Pressure) and incident description are passed to the Gemini LLM. 
The Triage Agent intelligently analyzes the natural language input to determine:
- **Severity Level**: Critical, Severe, Moderate, or Stable.
- **Required Specialization**: E.g., deducing that "severe burns on arm" requires a specialized "Burns Center" rather than a general hospital.

### 2. The Geospatial Environment Agent (Overpass API)
Real-world emergency vehicles do not broadcast live public GPS. To simulate a true production environment, the Geospatial Agent performs two actions:
- **Dynamic Fleet Synthesis**: Upon receiving the patient's Live GPS coordinates, the Agent dynamically generates a synthetic fleet of ambulances distributed within a 5km radius.
- **Real Hospital Live-Querying**: When the ambulance arrives at the patient, the Agent queries the OpenStreetMap **Overpass API** to download a list of *real, physical hospitals* exactly within a 20km radius of the patient's house.

### 3. The Routing Engine (DSA)
The Routing Engine executes traditional Data Structures and Algorithms logic:
- It processes the Agent locations and utilizes the **Open Source Routing Machine (OSRM) API**.
- It calculates real-world driving distances and Estimated Times of Arrival (ETA) using **Dijkstra's / A* Algorithms** over actual physical road geometries and speed limits.
- It draws the exact driving polyline path on a Folium Map.

## The Learning Memory Cache System
To optimize API usage and decrease dispatch latency, the platform incorporates a **Memory Cache Module**.
When a dispatch mission concludes successfully, the system caches the patient's geographic coordinate hash along with their determined severity and specialty. If a new emergency occurs in the exact same location with the same conditions, the system experiences a **Cache Hit**, bypassing the LLM and Overpass APIs to instantly dispatch the memorized routing strategy.

## Tech Stack
* **Frontend**: Streamlit, Streamlit-Folium (Leaflet Maps)
* **Generative AI**: Google Generative AI (Gemini `gemini-pro`)
* **Geospatial APIs**: OSRM (Routing), Overpass API (OpenStreetMap Entity Querying)
* **Data Manipulation**: Pandas, JSON
* **Memory Management**: Local File I/O Caching

## How to Run the Project Locally
1. Navigate to the `ambulance_dispatch_ai` directory.
2. Initialize the Python virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the Streamlit Dashboard:
   ```bash
   streamlit run app.py
   ```
5. Open the browser to `http://localhost:8501` (or whichever port Streamlit assigns).
6. Enter a valid **Gemini API Key** in the sidebar to activate the Triage Agent!
