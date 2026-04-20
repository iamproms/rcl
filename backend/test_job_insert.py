import asyncio
from datetime import date
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.job import Job

async def main():
    async with AsyncSessionLocal() as db:
        print("Inserting internal test job directly via SQLAlchemy")
        j = Job(
            title="Senior Test Engineer",
            department="QA",
            location="Remote",
            job_type="Full-Time",
            summary="Test job",
            responsibilities="Test everything",
            requirements="Know python",
            qualifications="BSc",
            application_deadline=date(2027, 12, 31),
            status="Published"
        )
        db.add(j)
        await db.commit()
        print("Done inserted.")

if __name__ == "__main__":
    asyncio.run(main())
