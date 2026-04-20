import asyncio
from fastapi.testclient import TestClient
from app.main import app

def test_api():
    client = TestClient(app)
    
    # 1. Login
    res = client.post("/api/auth/login", data={"username": "admin@rewajcorporate.com", "password": "admin"})
    token = res.json().get("access_token")
    if not token:
        print("Login failed:", res.json())
        return

    # 2. Try creating job exact same payload frontend sends
    payload = {
        'title': 'Test title',
        'department': 'Eng',
        'location': 'PH',
        'job_type': 'Full',
        'summary': '',
        'responsibilities': 'x',
        'requirements': 'y',
        'qualifications': 'z',
        'application_deadline': '2025-01-01',
        'status': 'Draft'
        # expiry_date and internal_notes are deleted in frontend
    }

    res2 = client.post("/api/careers/", json=payload, headers={"Authorization": f"Bearer {token}"})
    print("Post Create Job -> status:", res2.status_code)
    print("Response info:", res2.json())

if __name__ == "__main__":
    test_api()
