'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const categories = ['All Projects', 'Power Systems', 'Automation', 'Fire Suppression', 'Technical Services', 'Operations & Maintenance'];

type Project = {
  id: number;
  slug: string;
  category: string | null;
  tag: string | null;
  title: string;
  description: string | null;
  desc?: string;
  completion_year?: string | null;
  featured_image?: string | null;
  image?: string | null;
  status?: string | null;
};

const initialProjects: Project[] = [
  { id: 1, slug: 'power-system-maintenance', category: 'Power Systems', tag: 'MAINTENANCE', title: 'Power System Maintenance', description: 'Comprehensive overhaul and routine maintenance of HV/LV power distribution units for an offshore production platform, ensuring zero-downtime operations.', desc: 'Comprehensive overhaul and routine maintenance of HV/LV power distribution units for an offshore production platform, ensuring zero-downtime operations.', completion_year: '2023', featured_image: '/images/project-power.jpg', image: '/images/project-power.jpg', status: 'active' },
  { id: 2, slug: 'fire-suppression-upgrades', category: 'Fire Suppression', tag: 'FIRE SAFETY', title: 'Fire Suppression Upgrades', description: 'Installation and commissioning of advanced FM-200 and CO2 suppression systems across multiple remote terminal units (RTUs) for a major IOC.', desc: 'Installation and commissioning of advanced FM-200 and CO2 suppression systems across multiple remote terminal units (RTUs) for a major IOC.', completion_year: '2023', featured_image: '/images/project-fire.jpg', image: '/images/project-fire.jpg', status: 'active' },
  { id: 3, slug: 'automation-systems', category: 'Automation', tag: 'AUTOMATION', title: 'Automation Systems', description: 'Deployment of PLC-based integrated control systems for pipeline pressure monitoring and emergency shutdown (ESD) synchronization.', desc: 'Deployment of PLC-based integrated control systems for pipeline pressure monitoring and emergency shutdown (ESD) synchronization.', completion_year: '2022', featured_image: '/images/project-automation.jpg', image: '/images/project-automation.jpg', status: 'active' },
  { id: 4, slug: 'smart-instrumentation-grid', category: 'Technical Services', tag: 'INSTRUMENTATION', title: 'Smart Instrumentation Grid', description: 'Design and installation of high-precision flowmeters and telemetry systems for real-time crude oil transfer monitoring.', desc: 'Design and installation of high-precision flowmeters and telemetry systems for real-time crude oil transfer monitoring.', completion_year: '2022', featured_image: '/images/project-instrumentation.jpg', image: '/images/project-instrumentation.jpg', status: 'active' },
  { id: 5, slug: 'gas-processing-plant-retrofit', category: 'Technical Services', tag: 'ENGINEERING', title: 'Gas Processing Plant Retrofit', description: 'Full-scale electrical and mechanical retrofit of an aging natural gas processing facility to meet modern environmental standards.', desc: 'Full-scale electrical and mechanical retrofit of an aging natural gas processing facility to meet modern environmental standards.', completion_year: '2021', featured_image: '/images/project-gas.jpg', image: '/images/project-gas.jpg', status: 'active' },
  { id: 6, slug: 'risk-assessment-audits', category: 'Technical Services', tag: 'CONSULTING', title: 'Risk Assessment Audits', description: 'Delivering comprehensive HAZOP and SIL studies for multi-billion dollar brownfield expansion projects across the Niger Delta.', desc: 'Delivering comprehensive HAZOP and SIL studies for multi-billion dollar brownfield expansion projects across the Niger Delta.', completion_year: '2021', featured_image: '/images/project-risk.jpg', image: '/images/project-risk.jpg', status: 'active' },
];
const clients = [
  { name: 'Total Energies', logo: '/images/clients/total-energies.png' },
  { name: 'Shell', logo: '/images/clients/shell.png' },
  { name: 'Renaissance Africa Energy', logo: '/images/clients/renaissance.png' },
  { name: 'NLNG', logo: '/images/clients/NLNG.png' },
  { name: 'NNPC', logo: '/images/clients/NNPC.png' },
  { name: 'Seplat Energy', logo: '/images/clients/seplat.png' }
];

const tagColors: Record<string, string> = {
  'MAINTENANCE': '#FB0202',
  'FIRE SAFETY': '#F97316',
  'AUTOMATION': '#7C3AED',
  'INSTRUMENTATION': '#0EA5E9',
  'ENGINEERING': '#10B981',
  'CONSULTING': '#6366F1',
};

export default function ProjectsPage() {
  const [active, setActive] = useState('All Projects');
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`);
        if (!res.ok) return;

        const data = await res.json();
        setProjects(data.map((project: any) => ({
          ...project,
          description: project.description ?? project.desc ?? project.description ?? '',
          image: project.featured_image ?? project.image ?? '',
          completion_year: project.completion_year ?? project.year ?? project.completion_year ?? '',
        })));
      } catch (error) {
        console.error('Failed to load projects:', error);
      }
    }

    loadProjects();
  }, []);

  const filtered = active === 'All Projects' ? projects : projects.filter(p => p.category === active);

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '72px', background: 'var(--white)' }}>

        {/* Page Header */}
        <section className="page-header">
          <div className="container">
            <div className="breadcrumb">
              <Link href="/">Home</Link>
              <span>/</span>
              <span className="breadcrumb-active">Projects & Experience</span>
            </div>
            <h1 className="page-title">
              Engineering Excellence in<br />
              <span className="text-red">Action</span>
            </h1>
            <p className="page-sub">
              Delivering high-stakes engineering solutions for Nigeria's oil and gas sector. Explore our portfolio of critical infrastructure maintenance, automation, and safety systems.
            </p>
          </div>
        </section>

        {/* Filter Tabs */}
        <section className="filter-section">
          <div className="container">
            <div className="filter-tabs">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`filter-tab${active === cat ? ' active' : ''}`}
                  onClick={() => setActive(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="projects-section">
          <div className="container">
            <div className="projects-grid">
              {filtered.map(project => {
                const statusLabel = project.status === 'executed' ? 'Completed' : 'On-going';
                return (
                  <Link key={project.id} href={`/projects/${project.slug}`} className="project-card">
                    <div className="project-card__img">
                      <img src={project.image ?? ''} alt={project.title} />
                      <span className="project-tag" style={{ background: tagColors[project.tag ?? ''] || 'var(--red)' }}>
                        {project.tag ?? 'PROJECT'}
                      </span>
                    </div>
                    <div className="project-card__body">
                      <h3 className="project-card__title">{project.title}</h3>
                      <p className="project-card__desc">{project.description || project.desc || ''}</p>
                      <div className="project-card__footer">
                        <span className="project-card__year">🕐 {statusLabel}{project.completion_year ? ` · ${project.completion_year}` : ''}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="load-more">
              <button className="load-more-btn">Load More Projects ↓</button>
            </div>
          </div>
        </section>

        {/* Trusted Clients */}
        <section className="clients-section">
          <div className="container">
            <h2 className="clients-title">Our Trusted Clients</h2>
            <div className="clients-divider" />
            <div className="clients-slider">
              <div className="clients-logos">
                {[...clients, ...clients].map((c, idx) => (
                  <div key={`${c.name}-${idx}`} className="client-logo">
                    <img src={c.logo} alt={c.name} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="projects-cta">
          <div className="projects-cta__bg" />
          <div className="container projects-cta__inner">
            <h2 className="projects-cta__title">Ready to start your next project with us?</h2>
            <br />
            <p>Our team of certified engineers is ready to provide the technical <br />expertise and operational excellence your facility deserves.</p>
            <br />
            <br />
            <Link href="/contact" className="btn-red">Get a quote</Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
