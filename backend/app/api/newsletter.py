from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.email import send_newsletter_notification
from app.models.content import NewsletterSubscription
from app.schemas.schemas import NewsletterCreate, NewsletterResponse

router = APIRouter()

@router.post("", response_model=NewsletterResponse, status_code=201)
async def subscribe_newsletter(data: NewsletterCreate, db: AsyncSession = Depends(get_db)):
    query = await db.execute(select(NewsletterSubscription).where(NewsletterSubscription.email == data.email))
    existing = query.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Email already subscribed")

    subscription = NewsletterSubscription(email=data.email)
    db.add(subscription)
    await db.commit()
    await db.refresh(subscription)

    await send_newsletter_notification(subscription)
    return subscription
