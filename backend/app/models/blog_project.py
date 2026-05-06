from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, func, ForeignKey
from app.core.database import Base


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    slug = Column(String(500), unique=True, nullable=False, index=True)
    excerpt = Column(Text)
    content = Column(Text)
    author = Column(String(255))
    author_role = Column(String(255))
    category = Column(String(100))
    featured_image = Column(String(500))
    is_published = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    published_at = Column(DateTime(timezone=True), nullable=True)


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    slug = Column(String(500), unique=True, nullable=False, index=True)
    category = Column(String(100))
    tag = Column(String(50))
    description = Column(Text)
    full_description = Column(Text)
    client_name = Column(String(255))
    completion_year = Column(String(10))
    featured_image = Column(String(500))
    status = Column(String(20), default='active')  # 'active' or 'executed'
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
