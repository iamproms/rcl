from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine, Base
from app.api import contact, auth, services, admin, newsletter
from app.api.blog_projects import blog_router, projects_router
from seed_content import seed

async def ensure_project_status_column(conn):
    dialect = conn.dialect.name
    if dialect == "sqlite":
        result = await conn.execute(text("PRAGMA table_info(projects)"))
        columns = [row[1] for row in result.fetchall()]
    else:
        # PostgreSQL / others
        result = await conn.execute(text(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'projects'"
        ))
        columns = [row[0] for row in result.fetchall()]
        
    if 'status' not in columns:
        await conn.execute(text("ALTER TABLE projects ADD COLUMN status VARCHAR(20) DEFAULT 'active'"))
        await conn.execute(text("UPDATE projects SET status='active' WHERE status IS NULL"))

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables and run migrations on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await ensure_project_status_column(conn)
    
    # Run seeding logic (creates admin + initial content if database is empty)
    try:
        await seed()
    except Exception as e:
        print(f"Seeding failed: {e}")
        
    yield

app = FastAPI(
    title="Rewaj Corporate Limited API",
    description="Backend API for Rewaj Corporate Limited website",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Routers
app.include_router(contact.router, prefix="/api/contact", tags=["Contact"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(services.router, prefix="/api/services", tags=["Services"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(blog_router, prefix="/api/blog", tags=["Blog"])
app.include_router(projects_router, prefix="/api/projects", tags=["Projects"])
app.include_router(newsletter.router, prefix="/api/newsletter", tags=["Newsletter"])

# Direct upload route to match frontend
from app.api.admin import upload_file
app.post("/api/upload", tags=["Upload"])(upload_file)

@app.get("/")
async def root():
    return {"message": "Rewaj Corporate Limited API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "ok"}
