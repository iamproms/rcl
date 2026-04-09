from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.blog_project import BlogPost, Project
from app.models.user import User

# ─── Schemas ────────────────────────────────────────────────
class BlogPostCreate(BaseModel):
    title: str
    slug: str
    excerpt: Optional[str] = None
    content: Optional[str] = None
    author: Optional[str] = None
    category: Optional[str] = None
    featured_image: Optional[str] = None
    is_published: bool = False
    is_featured: bool = False

class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    author: Optional[str] = None
    category: Optional[str] = None
    featured_image: Optional[str] = None
    is_published: Optional[bool] = None
    is_featured: Optional[bool] = None

class BlogPostResponse(BaseModel):
    id: int
    title: str
    slug: str
    excerpt: Optional[str]
    content: Optional[str]
    author: Optional[str]
    category: Optional[str]
    featured_image: Optional[str]
    is_published: bool
    is_featured: bool
    created_at: datetime
    class Config:
        from_attributes = True

class ProjectCreate(BaseModel):
    title: str
    slug: str
    category: Optional[str] = None
    tag: Optional[str] = None
    description: Optional[str] = None
    full_description: Optional[str] = None
    client_name: Optional[str] = None
    completion_year: Optional[str] = None
    featured_image: Optional[str] = None
    is_active: bool = True
    is_featured: bool = False
    sort_order: int = 0

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    tag: Optional[str] = None
    description: Optional[str] = None
    full_description: Optional[str] = None
    client_name: Optional[str] = None
    completion_year: Optional[str] = None
    featured_image: Optional[str] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    sort_order: Optional[int] = None

class ProjectResponse(BaseModel):
    id: int
    title: str
    slug: str
    category: Optional[str]
    tag: Optional[str]
    description: Optional[str]
    client_name: Optional[str]
    completion_year: Optional[str]
    featured_image: Optional[str]
    status: str
    is_active: bool
    is_featured: bool
    sort_order: int
    class Config:
        from_attributes = True


# ─── Blog Router ────────────────────────────────────────────
blog_router = APIRouter()

@blog_router.get("", response_model=List[BlogPostResponse])
async def list_posts(
    category: Optional[str] = None,
    limit: int = Query(10, le=50),
    skip: int = 0,
    db: AsyncSession = Depends(get_db),
    admin: Optional[User] = Depends(get_current_admin),
):
    # If admin is authenticated, show all posts; otherwise only published ones
    if admin:
        query = select(BlogPost).order_by(BlogPost.created_at.desc())
    else:
        query = select(BlogPost).where(BlogPost.is_published == True).order_by(BlogPost.created_at.desc())
    
    if category:
        query = query.where(BlogPost.category == category)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@blog_router.get("/{post_id}", response_model=BlogPostResponse)
async def get_post(post_id: str, db: AsyncSession = Depends(get_db), admin: Optional[User] = Depends(get_current_admin)):
    # Try to get by ID first (for admin access)
    try:
        post_id_int = int(post_id)
        result = await db.execute(select(BlogPost).where(BlogPost.id == post_id_int))
        post = result.scalar_one_or_none()
        if post:
            return post
    except ValueError:
        pass
    
    # Fall back to slug lookup
    if admin:
        # Admin can access all posts
        result = await db.execute(select(BlogPost).where(BlogPost.slug == post_id))
    else:
        # Public can only access published posts
        result = await db.execute(select(BlogPost).where(BlogPost.slug == post_id, BlogPost.is_published == True))
    
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(404, "Post not found")
    return post

@blog_router.post("", response_model=BlogPostResponse, status_code=201)
async def create_post(data: BlogPostCreate, db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    post = BlogPost(**data.model_dump())
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return post

@blog_router.put("/{post_id}", response_model=BlogPostResponse)
async def update_post(post_id: int, data: BlogPostUpdate, db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    result = await db.execute(select(BlogPost).where(BlogPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(404, "Post not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(post, k, v)
    await db.commit()
    await db.refresh(post)
    return post

@blog_router.delete("/{post_id}", status_code=204)
async def delete_post(post_id: int, db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    result = await db.execute(select(BlogPost).where(BlogPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(404, "Post not found")
    await db.delete(post)
    await db.commit()


# ─── Projects Router ─────────────────────────────────────────
projects_router = APIRouter()

@projects_router.get("", response_model=List[ProjectResponse])
async def list_projects(
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    admin: Optional[User] = Depends(get_current_admin),
):
    # If admin is authenticated, show all projects; otherwise only active ones
    if admin:
        query = select(Project).order_by(Project.sort_order, Project.created_at.desc())
    else:
        query = select(Project).where(Project.is_active == True).order_by(Project.sort_order, Project.created_at.desc())
    
    if category:
        query = query.where(Project.category == category)
    if featured is not None:
        query = query.where(Project.is_featured == featured)
    result = await db.execute(query)
    return result.scalars().all()

@projects_router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, db: AsyncSession = Depends(get_db), admin: Optional[User] = Depends(get_current_admin)):
    # Try to get by ID first (for admin access)
    try:
        project_id_int = int(project_id)
        result = await db.execute(select(Project).where(Project.id == project_id_int))
        project = result.scalar_one_or_none()
        if project:
            return project
    except ValueError:
        pass
    
    # Fall back to slug lookup
    if admin:
        # Admin can access all projects
        result = await db.execute(select(Project).where(Project.slug == project_id))
    else:
        # Public can only access active projects
        result = await db.execute(select(Project).where(Project.slug == project_id, Project.is_active == True))
    
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "Project not found")
    return project

@projects_router.post("", response_model=ProjectResponse, status_code=201)
async def create_project(data: ProjectCreate, db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    project = Project(**data.model_dump())
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project

@projects_router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: int, data: ProjectUpdate, db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "Project not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(project, k, v)
    await db.commit()
    await db.refresh(project)
    return project

@projects_router.patch("/{project_id}/status", response_model=ProjectResponse)
async def update_project_status(project_id: int, status: str, db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    if status not in ['active', 'executed']:
        raise HTTPException(400, "Status must be 'active' or 'executed'")
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(404, "Project not found")
    project.status = status
    await db.commit()
    await db.refresh(project)
    return project

