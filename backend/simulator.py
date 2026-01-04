import requests
import time
import random

API_URL = "http://localhost:5000/api/process"

def generate_data():
    return {
        'pH': round(random.uniform(6.0, 9.0), 2),
        'DO': round(random.uniform(3.0, 8.0), 2),
        'Temperature': round(random.uniform(25.0, 33.0), 1),
        'Salinity': round(random.uniform(10.0, 30.0), 1)
    }

print("Starting ESP32 Simulator...")
while True:
    data = generate_data()
    try:
        response = requests.post(API_URL, json=data)
        print(f"Sent: {data} | Response: {response.status_code}")
    except Exception as e:
        print(f"Error sending data: {e}")
    
    time.sleep(5) # Send every 5 seconds
