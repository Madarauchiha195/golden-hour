import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
import os

np.random.seed(42)
random.seed(42)

DATA_DIR = "hospital_ai/data/"
os.makedirs(DATA_DIR, exist_ok=True)

# 1. Patient Waiting Time Dataset
def generate_waiting_time_data(n_samples=5000):
    departments = ['Emergency', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine']
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    
    data = {
        'department': np.random.choice(departments, n_samples),
        'time_of_day': np.random.randint(0, 24, n_samples),
        'day_of_week': np.random.choice(days, n_samples),
        'number_of_patients': np.random.randint(5, 100, n_samples),
        'doctor_count': np.random.randint(1, 10, n_samples),
        'emergency_cases': np.random.randint(0, 20, n_samples),
    }
    
    df = pd.DataFrame(data)
    
    # Calculate synthetic waiting time based on logic
    # More patients, fewer doctors, more emergencies = higher wait time
    wait_time = (
        (df['number_of_patients'] * 5) / df['doctor_count'] 
        + (df['emergency_cases'] * 15) 
        + np.random.normal(10, 5, n_samples)
    )
    
    # Night shifts usually have fewer doctors but also fewer patients, adjust slightly
    night_mask = (df['time_of_day'] >= 22) | (df['time_of_day'] <= 5)
    wait_time[night_mask] *= 1.2 
    
    df['waiting_time_minutes'] = np.clip(wait_time, 0, 600).astype(int)
    
    df.to_csv(os.path.join(DATA_DIR, 'waiting_time_data.csv'), index=False)
    print(f"Generated {n_samples} records for Waiting Time")


# 2. Doctor Availability Dataset
def generate_doctor_availability_data(n_samples=3000):
    data = {
        'doctor_id': np.random.randint(100, 200, n_samples),
        'department': np.random.choice(['Emergency', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine'], n_samples),
        'shift_hours': np.random.choice([8, 12, 24], n_samples),
        'historical_workload_patients_per_shift': np.random.randint(10, 50, n_samples),
        'current_appointments': np.random.randint(0, 30, n_samples),
        'department_demand_index': np.random.uniform(0.1, 1.0, n_samples)
    }
    
    df = pd.DataFrame(data)
    
    # Availability percentage (0.0 to 1.0)
    # Higher appointments and demand = lower availability
    availability = 1.0 - (
        (df['current_appointments'] / (df['shift_hours'] * 4)) * 0.6 + 
        (df['department_demand_index'] * 0.4)
    )
    
    df['future_availability_score'] = np.clip(availability + np.random.normal(0, 0.1, n_samples), 0.0, 1.0)
    
    df.to_csv(os.path.join(DATA_DIR, 'doctor_availability_data.csv'), index=False)
    print(f"Generated {n_samples} records for Doctor Availability")


# 3. Emergency Priority Dataset
def generate_emergency_priority_data(n_samples=5000):
    data = {
        'age': np.random.randint(1, 95, n_samples),
        'heart_rate': np.random.randint(40, 180, n_samples),
        'blood_pressure_systolic': np.random.randint(70, 220, n_samples),
        'oxygen_level': np.random.randint(70, 100, n_samples),
        'symptom_severity': np.random.randint(1, 10, n_samples), # 10 is worst
        'has_medical_history': np.random.choice([0, 1], n_samples)
    }
    
    df = pd.DataFrame(data)
    
    priority_scores = []
    labels = []
    
    for i, row in df.iterrows():
        score = 0
        
        if row['oxygen_level'] < 85 or row['heart_rate'] > 140 or row['heart_rate'] < 50 or row['blood_pressure_systolic'] > 180 or row['blood_pressure_systolic'] < 80:
            score += 50
        elif row['oxygen_level'] < 92 or row['heart_rate'] > 120 or row['blood_pressure_systolic'] > 150:
            score += 25
            
        score += row['symptom_severity'] * 3
        score += row['age'] * 0.2
        score += row['has_medical_history'] * 10
        
        # Add some noise
        score += np.random.normal(0, 5)
        
        priority_scores.append(score)
        
        if score > 80:
            labels.append('Critical')
        elif score > 50:
            labels.append('High')
        elif score > 30:
            labels.append('Medium')
        else:
            labels.append('Low')
            
    df['priority_score_raw'] = priority_scores
    df['priority_label'] = labels
    
    df.to_csv(os.path.join(DATA_DIR, 'emergency_priority_data.csv'), index=False)
    print(f"Generated {n_samples} records for Emergency Priority")


# 4. Bed Occupancy Dataset (Time Series)
def generate_bed_occupancy_data(days=365):
    start_date = datetime(2025, 1, 1)
    
    data = []
    current_occupancy = 150 # Base occupancy out of 200
    
    for day in range(days):
        current_date = start_date + timedelta(days=day)
        
        # Seasonal trend (higher in winter)
        season_modifier = np.sin(day / 365.0 * 2 * np.pi) * 20
        
        admission_rate = int(30 + season_modifier + np.random.normal(0, 10))
        discharge_rate = int(28 + season_modifier + np.random.normal(0, 8))
        
        current_occupancy = current_occupancy + admission_rate - discharge_rate
        current_occupancy = np.clip(current_occupancy, 50, 200) # Max 200 beds
        
        data.append({
            'date': current_date.strftime('%Y-%m-%d'),
            'total_beds': 200,
            'occupied_beds': current_occupancy,
            'admission_count': admission_rate,
            'discharge_count': discharge_rate,
            'occupancy_rate': current_occupancy / 200.0
        })
        
    df = pd.DataFrame(data)
    df.to_csv(os.path.join(DATA_DIR, 'bed_occupancy_data.csv'), index=False)
    print(f"Generated {days} days of Bed Occupancy Data")


if __name__ == "__main__":
    print("Generating Synthetic Hospital Data...")
    generate_waiting_time_data()
    generate_doctor_availability_data()
    generate_emergency_priority_data()
    generate_bed_occupancy_data()
    print("Done!")
