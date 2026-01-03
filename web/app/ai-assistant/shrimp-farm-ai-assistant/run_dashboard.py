#!/usr/bin/env python3
"""
Quick start script for the Shrimp Farm Dashboard
"""

import subprocess
import sys
import os

def main():
    print("Starting Shrimp Farm Management Dashboard...")
    print("=" * 50)
    
    # Check if streamlit is installed
    try:
        import streamlit
    except ImportError:
        print("Streamlit not found. Installing...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "streamlit"])
    
    # Check if required packages are installed
    try:
        import crewai
        import langchain_openai
        import pandas
        import plotly
    except ImportError as e:
        print(f"Missing required package: {e}")
        print("Installing requirements...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    
    # Check for OpenAI API key
    if not os.getenv("OPENAI_API_KEY"):
        print("WARNING: OPENAI_API_KEY not found in environment variables")
        print("Please set your OpenAI API key:")
        print("export OPENAI_API_KEY='your_api_key_here'")
        print("\nOr create a .env file with your API key")
        return
    
    print("All requirements satisfied")
    print("Launching dashboard...")
    print("Dashboard will open in your browser at http://localhost:8501")
    print("Press Ctrl+C to stop the dashboard")
    print("=" * 50)
    
    # Launch streamlit dashboard
    try:
        subprocess.run([
            sys.executable, "-m", "streamlit", "run", "dashboard.py",
            "--server.port", "8501",
            "--server.address", "localhost"
        ])
    except KeyboardInterrupt:
        print("\nDashboard stopped by user")
    except Exception as e:
        print(f"Error launching dashboard: {e}")

if __name__ == "__main__":
    main()
