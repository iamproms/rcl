import asyncio
from app.core.database import AsyncSessionLocal
from sqlalchemy import select
from app.models.job import Job

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Job))
        jobs = res.scalars().all()
        print(f"Jobs in DB: {len(jobs)}")
        for j in jobs:
            print(j.title)

if __name__ == "__main__":
    asyncio.run(main())
