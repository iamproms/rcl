import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { User, Calendar, Tag, Clock, ChevronRight } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  slug: string;
  category?: string;
  tag?: string;
  description?: string;
  full_description?: string;
  client_name?: string;
  completion_year?: string;
  featured_image?: string;
  status?: string;
  is_active: boolean;
}

const tagColors: Record<string, string> = {
  MAINTENANCE: '#FB0202',
  'FIRE SAFETY': '#F97316',
  AUTOMATION: '#7C3AED',
  INSTRUMENTATION: '#0EA5E9',
  ENGINEERING: '#10B981',
  CONSULTING: '#6366F1',
};

async function getProject(slug: string): Promise<Project | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${slug}`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getOtherProjects(currentSlug: string): Promise<Project[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data.filter((project: Project) => project.slug !== currentSlug) : [];
  } catch {
    return [];
  }
}

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const [project, otherProjects] = await Promise.all([getProject(params.slug), getOtherProjects(params.slug)]);

  if (!project) {
    return (
      <>
        <Navbar />
        <main style={{ paddingTop: '72px', background: 'var(--white)', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <h1>Project Not Found</h1>
            <p>The project you're looking for doesn't exist.</p>
            <Link href="/projects" style={{ color: '#FB0202', textDecoration: 'none' }}>← Back to Projects</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const relatedProjects = otherProjects.slice(0, 3);

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '72px' }}>

        {/* Hero */}
        <section
          className="proj-detail-hero"
          style={{
            backgroundImage: `url(${project.featured_image?.startsWith('/') && !project.featured_image.startsWith('/images')
              ? `${(process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')}${project.featured_image}`
              : (project.featured_image || '/images/project-default.jpg')})`
          }}
        >
          <div className="proj-detail-hero__overlay" />
          <div className="container proj-detail-hero__content">
            <div className="breadcrumb">
              <Link href="/">Home</Link><span>/</span>
              <Link href="/projects">Projects</Link><span>/</span>
              <span className="breadcrumb-active">{project.title}</span>
            </div>
            <span className="proj-tag" style={{ background: tagColors[project.tag ?? ''] || '#FB0202' }}>{project.tag || 'PROJECT'}</span>
            <h1 className="proj-detail-title">{project.title}</h1>
            <div className="proj-detail-meta">
              <span><User size={18} /> {project.client_name || 'Confidential Client'}</span>
              <span><Calendar size={18} /> Completed: {project.completion_year || 'TBD'}</span>
              <span><Tag size={18} /> {project.category || 'Engineering'}</span>
            </div>
          </div>
        </section>

        <div className="container proj-detail-layout">
          <div className="proj-detail-main">
            <div className="proj-detail-section">
              <h2>Project Description</h2>
              <p>{project.full_description || project.description || 'This project demonstrates our expertise in delivering high-quality engineering solutions for the oil and gas industry.'}</p>
            </div>

            {project.description && project.full_description && (
              <div className="proj-detail-section">
                <h2>Scope of Work</h2>
                <p>{project.description}</p>
              </div>
            )}
          </div>

          <aside className="proj-detail-sidebar">
            <div className="proj-detail-card">
              <h3>Project Information</h3>
              <div className="proj-detail-info">
                <div className="proj-detail-info-item">
                  <div className="icon"><User size={16} /></div>
                  <div className="text">
                    <label>Client</label>
                    <span>{project.client_name || 'Confidential'}</span>
                  </div>
                </div>

                <div className="proj-detail-info-item">
                  <div className="icon"><Calendar size={16} /></div>
                  <div className="text">
                    <label>Year</label>
                    <span>{project.completion_year || 'N/A'}</span>
                  </div>
                </div>

                <div className="proj-detail-info-item">
                  <div className="icon"><Tag size={16} /></div>
                  <div className="text">
                    <label>Category</label>
                    <span>{project.category || 'Engineering'}</span>
                  </div>
                </div>

                <div className="proj-detail-info-item">
                  <div className="icon"><Clock size={16} /></div>
                  <div className="text">
                    <label>Status</label>
                    <span>{project.status === 'executed' ? 'Executed' : 'On-going'}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <section className="related-projects" style={{ padding: '60px 0' }}>
          <div className="container">
            <h2>More Projects</h2>
            {relatedProjects.length > 0 ? (
              <div className="projects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
                {relatedProjects.map(project => (
                  <Link key={project.id} href={`/projects/${project.slug}`} className="project-card" style={{ textDecoration: 'none' }}>
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
                      <div
                        style={{
                          height: '180px',
                          background: `url(${project.featured_image?.startsWith('/') && !project.featured_image.startsWith('/images')
                            ? `${(process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')}${project.featured_image}`
                            : (project.featured_image || '/images/project-default.jpg')}) center/cover`
                        }}
                      />
                      <div style={{ padding: '18px' }}>
                        <span style={{ display: 'inline-block', marginBottom: '8px', padding: '4px 10px', borderRadius: '999px', background: tagColors[project.tag ?? ''] || '#FB0202', color: '#fff', fontSize: '12px' }}>
                          {project.tag || 'PROJECT'}
                        </span>
                        <h3 style={{ margin: '0 0 8px', fontSize: '18px' }}>{project.title}</h3>
                        <p style={{ margin: 0, color: '#64748B', fontSize: '14px' }}>{project.description ?? 'Learn more about this project.'}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748B' }}>No additional projects available.</p>
            )}
          </div>
        </section>

        <section className="cta-section">
          <div className="container">
            <div className="cta-card">
              <div className="cta-card__content">
                <h2 className="cta-card__title">Ready to Start Your Project?</h2>
                <p className="cta-card__text">Let's discuss how we can help bring your vision to life and deliver the operational excellence your facility deserves.</p>
                <Link href="/contact" className="btn-primary">Get In Touch</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

