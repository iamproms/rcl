import asyncio
import json
from datetime import date
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.user import User

async def get_admin_token():
    from fastapi.testclient import TestClient
    from app.main import app
    client = TestClient(app)
    # create dummy admin or get existing
    res = client.post("/api/auth/login", data={"username": "admin@rewajcorporate.com", "password": "securepassword"})
    return res.json().get("access_token")

def test_create_job():
    from fastapi.testclient import TestClient
    from app.main import app
    client = TestClient(app)
    
    res = client.post("/api/auth/login", data={"username": "admin@rewajcorporate.com", "password": "securepassword"})
    token = res.json().get("access_token")
    if not token:
        print("Login failed:", res.text)
        return
    
    payload = {
        "title": "Test Job",
        "department": "Engineering",
        "location": "Lagos",
        "job_type": "Full-Time",
        "summary": "",
        "responsibilities": "Test res",
        "requirements": "Test req",
        "qualifications": "Test qual",
        "application_deadline": "2026-12-31",
        "status": "Draft"
    }
    
    res = client.post("/api/careers/", json=payload, headers={"Authorization": f"Bearer {token}"})
    print("Status:", res.status_code)
    print("Response:", res.json())

if __name__ == "__main__":
    test_create_job()
