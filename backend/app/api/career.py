from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import date
import os
import shutil
from uuid import uuid4

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.job import Job, JobApplication, JobStatus
from app.schemas.schemas import JobResponse, JobApplicationResponse, JobCreate, JobUpdate
from app.models.user import User
from app.core.upload import upload_to_cloudinary, save_local_file

router = APIRouter()

UPLOAD_DIR = "static/uploads/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/jobs", response_model=List[JobResponse])
async def get_published_jobs(db: AsyncSession = Depends(get_db)):
    """Fetch all published internal jobs."""
    result = await db.execute(select(Job).filter(Job.status == JobStatus.published))
    jobs = result.scalars().all()
    return jobs

@router.get("/jobs/{job_id}", response_model=JobResponse)
async def get_job(job_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).filter(Job.id == job_id, Job.status == JobStatus.published))
    job = result.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.post("/apply", response_model=JobApplicationResponse, status_code=status.HTTP_201_CREATED)
async def apply_to_job(
    job_id: int = Form(...),
    full_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    dob: date = Form(...),
    gender: str = Form(...),
    nationality: str = Form(...),
    highest_qualification: str = Form(...),
    institution: str = Form(...),
    course_of_study: str = Form(...),
    nysc_status: str = Form(...),
    cv_file: UploadFile = File(...),
    cert_file: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    """Submit a job application with CV upload."""
    job = None
    if job_id != 0:
        result = await db.execute(select(Job).filter(Job.id == job_id))
        job = result.scalars().first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
            
        # Check if job is still active
        if job.status != JobStatus.published:
            raise HTTPException(status_code=400, detail="This job is no longer accepting applications.")
            
        if job.application_deadline and date.today() > job.application_deadline:
            raise HTTPException(status_code=400, detail="The application deadline has passed.")

    # Validate file type
    if not cv_file.filename.endswith('.pdf'):
         raise HTTPException(status_code=400, detail="CV must be a PDF file.")
         
    # Save CV using Cloudinary (preferred) or local fallback
    cv_url = await upload_to_cloudinary(cv_file, folder="resumes", resource_type="auto")
    if not cv_url:
        # Local fallback
        await cv_file.seek(0)
        content = await cv_file.read()
        cv_url = save_local_file(content, cv_file.filename, "static/uploads/resumes")
        
    # Save Cert
    cert_url = None
    if cert_file:
        if not cert_file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Certifications must be a PDF file.")
        
        cert_url = await upload_to_cloudinary(cert_file, folder="resumes", resource_type="raw")
        if not cert_url:
            await cert_file.seek(0)
            content = await cert_file.read()
            cert_url = save_local_file(content, cert_file.filename, "static/uploads/resumes")

    application = JobApplication(
        job_id=job_id if job_id != 0 else None,
        full_name=full_name,
        email=email,
        phone=phone,
        dob=dob,
        gender=gender,
        nationality=nationality,
        highest_qualification=highest_qualification,
        institution=institution,
        course_of_study=course_of_study,
        nysc_status=nysc_status,
        cv_path=cv_url,
        certifications_path=cert_url
    )
    db.add(application)
    await db.commit()
    await db.refresh(application)
    
    return application

# --- Admin Routes ---

@router.get("/admin/jobs", response_model=List[JobResponse])
async def get_all_jobs_admin(db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    result = await db.execute(select(Job).order_by(Job.created_at.desc()))
    return result.scalars().all()

@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(job_in: JobCreate, db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    job = Job(**job_in.model_dump())
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return job

@router.put("/{job_id}", response_model=JobResponse)
async def update_job(job_id: int, job_in: JobUpdate, db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    result = await db.execute(select(Job).filter(Job.id == job_id))
    job = result.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    update_data = job_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)
        
    await db.commit()
    await db.refresh(job)
    return job

@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(job_id: int, db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    result = await db.execute(select(Job).filter(Job.id == job_id))
    job = result.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    await db.delete(job)
    await db.commit()

@router.get("/admin/applications", response_model=List[JobApplicationResponse])
async def get_all_applications(db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    result = await db.execute(select(JobApplication).order_by(JobApplication.created_at.desc()))
    return result.scalars().all()

@router.delete("/admin/applications/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(application_id: int, db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    result = await db.execute(select(JobApplication).filter(JobApplication.id == application_id))
    application = result.scalars().first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    await db.delete(application)
    await db.commit()

@router.delete("/admin/applications/clear-all", status_code=status.HTTP_204_NO_CONTENT)
async def clear_all_applications(db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    from sqlalchemy import delete
    await db.execute(delete(JobApplication))
    await db.commit()
