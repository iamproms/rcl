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
from app.schemas.schemas import ContactResponse, AdminStats, NewsletterCreate, NewsletterSend
from app.core.config import settings

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

    cloudinary_url = getattr(settings, "CLOUDINARY_URL", "") or os.environ.get("CLOUDINARY_URL", "")
    
    if cloudinary_url:
        # ── Cloudinary upload (persistent) ──
        # Parse cloudinary://api_key:api_secret@cloud_name
        try:
            import cloudinary
            import cloudinary.uploader
            # Parse credentials from URL
            stripped = cloudinary_url.replace("cloudinary://", "")
            api_key = stripped.split(":")[0]
            rest = stripped.split(":", 1)[1]
            api_secret = rest.split("@")[0]
            cloud_name = rest.split("@")[1]
            cloudinary.config(
                cloud_name=cloud_name,
                api_key=api_key,
                api_secret=api_secret,
                secure=True,
            )
            content = await file.read()
            result = cloudinary.uploader.upload(
                content,
                folder="rcl-uploads",
                resource_type="image",
            )
            return {"url": result["secure_url"]}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Cloudinary upload failed: {str(e)}")
    else:
        # ── Local disk fallback (dev only) ──
        upload_dir = "static/uploads"
        os.makedirs(upload_dir, exist_ok=True)
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        base_url = getattr(settings, "BASE_URL", "").rstrip("/")
        file_url = f"{base_url}/static/uploads/{unique_filename}" if base_url else f"/static/uploads/{unique_filename}"
        return {"url": file_url}


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
