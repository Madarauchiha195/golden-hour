from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pickle
import pandas as pd
import os
import uvicorn

app = FastAPI(title="Smart Hospital API", version="1.0")

MODELS_DIR = "hospital_ai/models/"

# Try loading models
try:
    with open(os.path.join(MODELS_DIR, 'wait_time_model.pkl'), 'rb') as f:
        wait_time_model = pickle.load(f)
except:
    wait_time_model = None

try:
    with open(os.path.join(MODELS_DIR, 'priority_model.pkl'), 'rb') as f:
        priority_model = pickle.load(f)
except:
    priority_model = None


class WaitTimeRequest(BaseModel):
    department: str
    time_of_day: int
    day_of_week: str
    number_of_patients: int
    doctor_count: int
    emergency_cases: int

class PriorityRequest(BaseModel):
    age: int
    heart_rate: int
    blood_pressure_systolic: int
    oxygen_level: int
    symptom_severity: int
    has_medical_history: int

@app.get("/")
def health_check():
    return {"status": "Hospital AI API is running"}

@app.post("/predict_wait_time")
def predict_wait_time(req: WaitTimeRequest):
    if wait_time_model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
        
    df = pd.DataFrame([req.dict()])
    
    # Needs one-hot encoding matching training
    # Mock return for scaffolding
    wait = (req.number_of_patients * 5) / max(req.doctor_count, 1) + (req.emergency_cases * 15)
    return {"predicted_wait_time_minutes": round(wait, 1)}

@app.post("/predict_priority")
def predict_priority(req: PriorityRequest):
    if priority_model is None:
        # Mock logic matching data generator if model not loaded
        score = 0
        if req.oxygen_level < 85 or req.heart_rate > 140:
            return {"priority": "Critical"}
        if req.oxygen_level < 92 or req.heart_rate > 120:
            return {"priority": "High"}
            
        return {"priority": "Medium" if req.symptom_severity > 5 else "Low"}
        
    df = pd.DataFrame([req.dict()])
    pred = priority_model.predict(df)[0]
    
    mapping = {0: 'Low', 1: 'Medium', 2: 'High', 3: 'Critical'}
    return {"priority": mapping.get(pred, 'Unknown')}

@app.post("/optimize_hospital")
def optimize_hospital():
    # Placeholder for Reinforcement Learning DQN action
    return {
        "recommended_action": "Reassign 1 doctor from Ward to ER",
        "expected_reward_score": 45.2,
        "rationale": "High congestion detected in ER queue."
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
