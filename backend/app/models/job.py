from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class JobStatus(str, enum.Enum):
    draft = "Draft"
    published = "Published"
    archived = "Archived"

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    department = Column(String(100), nullable=False)
    location = Column(String(255), nullable=False)
    job_type = Column(String(100), nullable=False)
    summary = Column(Text, nullable=True)
    
    # Store these as text/markdown or plain text
    responsibilities = Column(Text, nullable=False)
    requirements = Column(Text, nullable=False)
    qualifications = Column(Text, nullable=False)
    
    application_deadline = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=True) # Auto-archive after
    internal_notes = Column(Text, nullable=True)
    status = Column(SQLEnum(JobStatus), default=JobStatus.draft)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    applications = relationship("JobApplication", back_populates="job", cascade="all, delete-orphan")

class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    dob = Column(Date, nullable=False)
    gender = Column(String(50), nullable=False)
    nationality = Column(String(100), nullable=False, default="Nigeria")
    highest_qualification = Column(String(100), nullable=False)
    institution = Column(String(255), nullable=False)
    course_of_study = Column(String(255), nullable=False)
    nysc_status = Column(String(50), nullable=False)
    
    cv_path = Column(String(255), nullable=False)
    certifications_path = Column(String(255), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    job = relationship("Job", back_populates="applications")
