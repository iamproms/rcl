import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.ASYNC_DATABASE_URL)
    async with engine.begin() as conn:
        print("Adding author_role column to blog_posts...")
        try:
            await conn.execute(text("ALTER TABLE blog_posts ADD COLUMN author_role VARCHAR(255);"))
            print("Successfully added author_role column.")
        except Exception as e:
            if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
                print("Column author_role already exists.")
            else:
                print(f"Error adding column: {e}")

if __name__ == "__main__":
    asyncio.run(main())
