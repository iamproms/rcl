from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# --- Contact ---
class ContactCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=50)
    company: Optional[str] = Field(None, max_length=255)
    subject: Optional[str] = Field(None, max_length=255)
    message: str = Field(..., min_length=5)

class ContactResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    company: Optional[str]
    subject: Optional[str]
    message: str
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True


# --- Auth ---
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_email: str
    user_name: Optional[str]


# --- Services ---
class ServiceCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    slug: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    icon: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0

class ServiceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None

class ServiceResponse(BaseModel):
    id: int
    title: str
    slug: str
    description: Optional[str]
    icon: Optional[str]
    is_active: bool
    sort_order: int
    class Config:
        from_attributes = True


# --- Admin User ---
class AdminStats(BaseModel):
    total_messages: int
    unread_messages: int
    total_articles: int
    total_projects: int


class NewsletterCreate(BaseModel):
    email: EmailStr


class NewsletterResponse(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime
    class Config:
        from_attributes = True

class NewsletterSend(BaseModel):
    subject: str
    content: str

# --- Careers ---
from datetime import date

class JobBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    department: str = Field(..., max_length=100)
    location: str = Field(..., max_length=255)
    job_type: str = Field(..., max_length=100)
    summary: Optional[str] = None
    responsibilities: str
    requirements: str
    qualifications: str
    application_deadline: date
    expiry_date: Optional[date] = None
    internal_notes: Optional[str] = None
    status: str = "Draft"

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    summary: Optional[str] = None
    responsibilities: Optional[str] = None
    requirements: Optional[str] = None
    qualifications: Optional[str] = None
    application_deadline: Optional[date] = None
    expiry_date: Optional[date] = None
    internal_notes: Optional[str] = None
    status: Optional[str] = None

class JobResponse(JobBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class JobApplicationCreate(BaseModel):
    job_id: Optional[int] = None
    full_name: str = Field(..., max_length=255)
    email: EmailStr
    phone: str = Field(..., max_length=50)
    dob: date
    gender: str = Field(..., max_length=50)
    nationality: str = Field(..., max_length=100)
    highest_qualification: str = Field(..., max_length=100)
    institution: str = Field(..., max_length=255)
    course_of_study: str = Field(..., max_length=255)
    nysc_status: str = Field(..., max_length=50)
    
class JobApplicationResponse(JobApplicationCreate):
    id: int
    cv_path: str
    certifications_path: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
