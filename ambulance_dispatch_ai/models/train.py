import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import pickle
import os

DATA_DIR = "ambulance_dispatch_ai/data/"
MODELS_DIR = "ambulance_dispatch_ai/models/"
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

def generate_and_train_severity():
    print("Generating Synthetic Severity Data...")
    n_samples = 5000
    df = pd.DataFrame({
        'heart_rate': np.random.randint(40, 180, n_samples),
        'oxygen_level': np.random.randint(70, 100, n_samples),
        'blood_pressure': np.random.randint(70, 220, n_samples),
        'age': np.random.randint(1, 95, n_samples),
        'symptom_severity': np.random.randint(1, 10, n_samples)
    })
    
    # 1: Critical, 2: Severe, 3: Moderate, 4: Stable
    labels = []
    for _, row in df.iterrows():
        if row['oxygen_level'] < 85 or row['heart_rate'] > 140:
            labels.append(1)
        elif row['oxygen_level'] < 92 or row['blood_pressure'] > 160:
            labels.append(2)
        elif row['symptom_severity'] > 6:
            labels.append(3)
        else:
            labels.append(4)
            
    y = np.array(labels)
    # XGBoost requires 0-indexed classes
    y_encoded = y - 1 
    
    X_train, X_test, y_train, y_test = train_test_split(df, y_encoded, test_size=0.2)
    
    print("Training XGBoost Severity Analyzer...")
    model = xgb.XGBClassifier(n_estimators=100, max_depth=5, learning_rate=0.1)
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    print(f"Severity Model Accuracy: {accuracy_score(y_test, preds):.2f}")
    
    with open(os.path.join(MODELS_DIR, 'severity_model.pkl'), 'wb') as f:
        pickle.dump(model, f)

if __name__ == "__main__":
    generate_and_train_severity()
    print("Models Trained Successfully!")
