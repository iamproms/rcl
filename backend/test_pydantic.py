from app.schemas.schemas import JobCreate

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
}

try:
    job = JobCreate(**payload)
    print("Success:", job)
except Exception as e:
    print("Validation Error:")
    print(e)
