from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
import os
import uuid
import io

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.content import ContactSubmission, Service, NewsletterSubscription
from app.models.blog_project import BlogPost, Project
from app.models.user import User
from app.schemas.schemas import ContactResponse, AdminStats, NewsletterCreate, NewsletterSend, UserResponse, ProfileUpdate, PasswordChange
from app.core.config import settings
from app.core.upload import upload_to_cloudinary, save_local_file

router = APIRouter()


@router.get("/stats", response_model=AdminStats)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    total_msgs = await db.scalar(select(func.count()).select_from(ContactSubmission))
    unread_msgs = await db.scalar(
        select(func.count()).select_from(ContactSubmission).where(ContactSubmission.is_read == False)
    )
    total_articles = await db.scalar(select(func.count()).select_from(BlogPost))
    total_projects = await db.scalar(select(func.count()).select_from(Project))
    
    return AdminStats(
        total_messages=total_msgs or 0,
        unread_messages=unread_msgs or 0,
        total_articles=total_articles or 0,
        total_projects=total_projects or 0,
    )


@router.get("/messages", response_model=List[ContactResponse])
async def get_messages(
    skip: int = 0,
    limit: int = 50,
    unread_only: bool = False,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    query = select(ContactSubmission).order_by(ContactSubmission.created_at.desc())
    if unread_only:
        query = query.where(ContactSubmission.is_read == False)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.patch("/messages/{message_id}/read", response_model=ContactResponse)
async def mark_message_read(
    message_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    result = await db.execute(select(ContactSubmission).where(ContactSubmission.id == message_id))
    msg = result.scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    msg.is_read = True
    await db.commit()
    await db.refresh(msg)
    return msg


@router.delete("/messages/{message_id}", status_code=204)
async def delete_message(
    message_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    result = await db.execute(select(ContactSubmission).where(ContactSubmission.id == message_id))
    msg = result.scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    await db.delete(msg)
    await db.commit()


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    admin: User = Depends(get_current_admin),
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    url = await upload_to_cloudinary(file, folder="rcl-uploads", resource_type="image")
    if not url:
        # Fallback to local
        await file.seek(0)
        content = await file.read()
        url = save_local_file(content, file.filename, "static/uploads")
        # Ensure base URL is prepended if not already
        if not url.startswith("http"):
            base_url = getattr(settings, "BASE_URL", "").rstrip("/")
            if base_url:
                url = f"{base_url}{url}"
    
    return {"url": url}


@router.get("/subscribers")
async def get_subscribers(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    query = select(NewsletterSubscription).order_by(NewsletterSubscription.created_at.desc())
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/send-newsletter")
async def send_newsletter(
    data: NewsletterSend,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    from app.core.email import send_bulk_newsletter
    
    subject = data.subject
    content = data.content
    
    # Get all subscribers
    query = select(NewsletterSubscription)
    result = await db.execute(query)
    subscribers = result.scalars().all()
    
    if not subscribers:
        return {"message": "No subscribers found"}
    
    # Send newsletter to all subscribers
    await send_bulk_newsletter(subscribers, subject, content)
    
    return {"message": f"Newsletter sent to {len(subscribers)} subscribers"}

@router.get("/profile", response_model=UserResponse)
async def get_profile(admin: User = Depends(get_current_admin)):
    return admin

@router.patch("/profile", response_model=UserResponse)
async def update_profile(
    profile_in: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(admin, field, value)
    
    await db.commit()
    await db.refresh(admin)
    return admin

@router.patch("/profile/password")
async def change_password(
    password_in: PasswordChange,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    from app.core.security import verify_password, hash_password
    
    if not verify_password(password_in.old_password, admin.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect old password")
    
    admin.hashed_password = hash_password(password_in.new_password)
    await db.commit()
    return {"message": "Password updated successfully"}

@router.get("/check-storage")
async def check_storage(admin: User = Depends(get_current_admin)):
    """Diagnostic endpoint to check if Cloudinary is configured and static folders exist."""
    cloudinary_url = getattr(settings, "CLOUDINARY_URL", "") or os.environ.get("CLOUDINARY_URL", "")
    has_cloudinary = bool(cloudinary_url)
    
    upload_dir = "static/uploads/resumes"
    exists = os.path.exists(upload_dir)
    
    return {
        "cloudinary_configured": has_cloudinary,
        "cloudinary_url_prefix": cloudinary_url[:20] + "..." if has_cloudinary else None,
        "local_upload_dir_exists": exists,
        "cwd": os.getcwd(),
        "static_files_present": os.listdir("static/uploads") if os.path.exists("static/uploads") else []
    }
