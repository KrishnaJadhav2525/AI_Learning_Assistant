import os
import requests
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "http://localhost:8000"

def test_api_health():
    print(f"Testing {BASE_URL}/")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}\n")
    except Exception as e:
        print(f"Failed to connect: {e}\n")

if __name__ == "__main__":
    print("--- AI Learning Assistant Diagnostic ---")
    print("Ensure the backend server is running on port 8000.\n")
    test_api_health()
    print("You can manually test processing endpoints by using the frontend UI.")
    print("----------------------------------------")
