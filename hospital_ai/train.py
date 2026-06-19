import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, accuracy_score
import pickle
import os

DATA_DIR = "hospital_ai/data/"
MODELS_DIR = "hospital_ai/models/"
os.makedirs(MODELS_DIR, exist_ok=True)

def train_wait_time_model():
    print("Training Wait Time Model...")
    df = pd.read_csv(os.path.join(DATA_DIR, 'waiting_time_data.csv'))
    
    # Feature Engineering
    df = pd.get_dummies(df, columns=['department', 'day_of_week'])
    
    X = df.drop('waiting_time_minutes', axis=1)
    y = df['waiting_time_minutes']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = xgb.XGBRegressor(n_estimators=100, max_depth=5, learning_rate=0.1)
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    mse = mean_squared_error(y_test, preds)
    print(f"Wait Time Model MSE: {mse:.2f}")
    
    with open(os.path.join(MODELS_DIR, 'wait_time_model.pkl'), 'wb') as f:
        pickle.dump(model, f)

def train_priority_model():
    print("Training Priority Model...")
    df = pd.read_csv(os.path.join(DATA_DIR, 'emergency_priority_data.csv'))
    
    X = df.drop(['priority_label', 'priority_score_raw'], axis=1)
    y = df['priority_label']
    
    # Encode labels
    label_map = {'Low': 0, 'Medium': 1, 'High': 2, 'Critical': 3}
    y = y.map(label_map)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = xgb.XGBClassifier(n_estimators=100, max_depth=5, learning_rate=0.1, objective='multi:softmax')
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"Priority Model Accuracy: {acc:.2f}")
    
    with open(os.path.join(MODELS_DIR, 'priority_model.pkl'), 'wb') as f:
        pickle.dump(model, f)
        
if __name__ == "__main__":
    if os.path.exists(os.path.join(DATA_DIR, 'waiting_time_data.csv')):
        train_wait_time_model()
    else:
        print("Waiting time data not found. Run data_generator.py first.")
        
    if os.path.exists(os.path.join(DATA_DIR, 'emergency_priority_data.csv')):
        train_priority_model()
    else:
        print("Emergency priority data not found. Run data_generator.py first.")
