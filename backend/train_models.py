import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier, MLPRegressor
from sklearn.svm import SVR
from sklearn.linear_model import LinearRegression

# Load Dataset
try:
    df = pd.read_csv('../shrimp_data.csv')
except FileNotFoundError:
    # Create dummy data if file not found for demonstration
    data = {
        'pH': np.random.uniform(6, 9, 1000),
        'DO': np.random.uniform(3, 8, 1000),
        'Temperature': np.random.uniform(25, 32, 1000),
        'Salinity': np.random.uniform(10, 30, 1000),
        'WQI': np.random.uniform(0, 100, 1000),
        'Class': np.random.choice(['Good', 'Medium', 'Bad', 'Very Bad'], 1000)
    }
    df = pd.DataFrame(data)

# 1. Preprocessing & Scaling
scaler = StandardScaler()
features = ['pH', 'DO', 'Temperature', 'Salinity']
X = df[features]
y_class = df['Class']
y_wqi = df['WQI']

X_scaled = scaler.fit_transform(X)

# 2. Classification (Random Forest)
rf_clf = RandomForestClassifier(n_estimators=100, random_state=42)
rf_clf.fit(X_scaled, y_class)

# 3. Regression (Forecasting) - Training multiple models as per paper
reg_models = {}
for target in features:
    y_reg = df[target]
    # ANN
    ann = MLPRegressor(hidden_layer_sizes=(50,50), max_iter=500).fit(X_scaled, y_reg)
    # SVM
    svm = SVR(kernel='rbf').fit(X_scaled, y_reg)
    # MLR
    mlr = LinearRegression().fit(X_scaled, y_reg)
    
    reg_models[target] = {'ANN': ann, 'SVM': svm, 'MLR': mlr}

# 4. WQI Model
wqi_model = RandomForestClassifier(n_estimators=100).fit(X_scaled, y_wqi.astype(int))

# Save everything needed for inference
with open('models.pkl', 'wb') as f:
    pickle.dump({
        'scaler': scaler,
        'rf_clf': rf_clf,
        'reg_models': reg_models,
        'wqi_model': wqi_model
    }, f)

print("Models trained and saved to models.pkl")
