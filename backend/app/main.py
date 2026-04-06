from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base
from app.api import contact, auth, services, admin
from app.api.blog_projects import blog_router, projects_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
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

@app.get("/")
async def root():
    return {"message": "Rewaj Corporate Limited API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "ok"}
