import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.ASYNC_DATABASE_URL)
    async with engine.begin() as conn:
        print("Dropping NOT NULL constraint on job_applications.job_id...")
        await conn.execute(text("ALTER TABLE job_applications ALTER COLUMN job_id DROP NOT NULL;"))
        print("Done.")

if __name__ == "__main__":
    asyncio.run(main())
