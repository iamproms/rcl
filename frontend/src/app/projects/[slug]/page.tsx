import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

interface Project {
  id: number;
  title: string;
  slug: string;
  description?: string;
  client_name?: string;
  completion_year: string;
  featured_image?: string;
  category?: string;
}

async function getProject(slug: string): Promise<Project | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${slug}`, {
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const project = await getProject(params.slug);

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
  'power-system-maintenance': {
    title: 'Power System Maintenance', tag: 'MAINTENANCE', tagColor: '#FB0202',
    category: 'Power Systems', client: 'Confidential IOC', year: '2023',
    location: 'Offshore Niger Delta', duration: '6 Months',
    overview: 'Comprehensive overhaul and routine maintenance of HV/LV power distribution units for an offshore production platform, ensuring zero-downtime operations throughout.',
    challenge: 'The client faced ageing HV switchgear and transformers operating beyond their design life, with increasing fault frequency threatening production continuity. Full platform shutdown was not commercially viable.',
    solution: 'Rewaj deployed a specialist maintenance team to execute a phased maintenance programme, replacing critical components during scheduled mini-shutdowns while maintaining full production capacity on unaffected circuits.',
    outcomes: ['Zero unplanned production downtime during the project','All 12 HV switchgear panels overhauled and tested','3 transformers rewound and returned to service','Full electrical safety compliance audit completed'],
    services: ['Maintenance Services','Testing & Calibration','Field Support Services'],
    image: '/images/project-power.jpg',
  },
  'fire-suppression-upgrades': {
    title: 'Fire Suppression Upgrades', tag: 'FIRE SAFETY', tagColor: '#F97316',
    category: 'Fire Suppression', client: 'Major IOC', year: '2023',
    location: 'Onshore — Multiple Sites', duration: '8 Months',
    overview: 'Installation and commissioning of advanced FM-200 and CO2 suppression systems across multiple remote terminal units (RTUs) for a major oil company.',
    challenge: 'Ageing Halon suppression systems across 14 RTU sites required replacement due to environmental regulations phasing out Halon. Sites were geographically dispersed across the Niger Delta, some in remote locations with challenging logistics.',
    solution: 'Rewaj managed the full replacement programme including detailed design, equipment procurement, phased site installation, and commissioning. A dedicated logistics coordinator managed transportation and access to remote locations.',
    outcomes: ['14 RTU sites upgraded on schedule','Full Halon phase-out compliance achieved','All systems commissioned and accepted by client HSE','3-year maintenance contract awarded post-project'],
    services: ['Engineering & Design','Equipment Installation & Commissioning','Procurement & Supply'],
    image: '/images/project-fire.jpg',
  },
  'automation-systems': {
    title: 'Automation Systems', tag: 'AUTOMATION', tagColor: '#7C3AED',
    category: 'Automation', client: 'Midstream Operator', year: '2022',
    location: 'Onshore — Rivers State', duration: '12 Months',
    overview: 'Deployment of PLC-based integrated control systems for pipeline pressure monitoring and emergency shutdown (ESD) synchronisation across a 120km pipeline system.',
    challenge: 'The operator was running a critical export pipeline with manual pressure monitoring at key valve stations, creating safety and operational efficiency risks. Real-time visibility and automated ESD capability were required.',
    solution: 'Rewaj designed and deployed a PLC-based control system at 8 valve stations, integrated via a fibre optic SCADA network to a central control room. Full ESD functionality with automatic isolation on pressure exceedance.',
    outcomes: ['Real-time SCADA visibility across all 8 stations','ESD response time reduced from 45 min (manual) to <30 sec','ISO 13849 SIL 2 functional safety compliance','Full system FAT and SAT completed with zero punch-list items'],
    services: ['Control Systems Integration','Instrumentation & Automation','Engineering & Design'],
    image: '/images/project-automation.jpg',
  },
  'smart-instrumentation-grid': {
    title: 'Smart Instrumentation Grid', tag: 'INSTRUMENTATION', tagColor: '#0EA5E9',
    category: 'Technical Services', client: 'Terminal Operator', year: '2022',
    location: 'Export Terminal — Bonny', duration: '5 Months',
    overview: 'Design and installation of high-precision Coriolis flowmeters and telemetry systems for real-time crude oil transfer monitoring at an export terminal.',
    challenge: 'The terminal was experiencing significant metering discrepancies between loading figures and cargo documentation, creating commercial disputes with tanker operators and royalty reporting issues.',
    solution: 'Rewaj implemented a fiscal metering upgrade using Endress+Hauser Coriolis meters with Micro Motion flow computers, integrated to an upgraded SCADA system with automatic batch management and report generation.',
    outcomes: ['Metering uncertainty reduced to ±0.05%','Eliminated metering disputes with tanker operators','Automated batch reports accepted by NNPC for royalty purposes','Full OIML R117 custody transfer compliance'],
    services: ['Instrumentation & Automation','Testing & Calibration','Control Systems Integration'],
    image: '/images/project-instrumentation.jpg',
  },
  'gas-processing-plant-retrofit': {
    title: 'Gas Processing Plant Retrofit', tag: 'ENGINEERING', tagColor: '#10B981',
    category: 'Technical Services', client: 'Independent Producer', year: '2021',
    location: 'Onshore — Delta State', duration: '18 Months',
    overview: 'Full-scale electrical and mechanical retrofit of an aging natural gas processing facility to meet modern environmental and safety standards.',
    challenge: 'A 1980s-era gas plant was producing above regulatory emission limits and faced shutdown by NESREA. The client needed a comprehensive upgrade within a tight budget and schedule to avoid production loss.',
    solution: 'Rewaj executed a phased retrofit covering new combustion turbines, upgraded gas compression, modern instrumentation and control, and a new flare management system, while maintaining partial production throughout.',
    outcomes: ['Emissions reduced by 67% — within NESREA limits','Plant throughput increased by 22% with new compression','Full ATEX electrical compliance achieved','Successful NESREA inspection and clearance'],
    services: ['Engineering & Design','Equipment Installation & Commissioning','Instrumentation & Automation'],
    image: '/images/project-gas.jpg',
  },
  'risk-assessment-audits': {
    title: 'Risk Assessment Audits', tag: 'CONSULTING', tagColor: '#6366F1',
    category: 'Technical Services', client: 'Multiple IOCs', year: '2021',
    location: 'Niger Delta — Multiple Locations', duration: '9 Months',
    overview: 'Delivering comprehensive HAZOP and SIL studies for multi-billion dollar brownfield expansion projects across the Niger Delta.',
    challenge: 'Three separate IOC clients required HAZOP, What-if, and SIL determination studies for brownfield expansion projects as a condition of their lender technical due diligence process. Tight timelines and internationally qualified facilitators were required.',
    solution: 'Rewaj assembled a team of certified HAZOP leaders and SIL engineers, developing study packages and facilitating workshops with client process and operations teams. All studies were delivered to IEC 61882 and IEC 61511 standards.',
    outcomes: ['18 HAZOP studies completed across 3 projects','47 SIL-rated loops identified and documented','All studies accepted by lender technical advisors','Post-study HAZOP close-out tracking system implemented'],
    services: ['Engineering & Design','Inspection Services','Field Support Services'],
    image: '/images/project-risk.jpg',
  },
};

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '72px' }}>

        {/* Hero */}
        <section className="proj-detail-hero" style={{ backgroundImage: `url(${project.featured_image || '/images/project-default.jpg'})` }}>
          <div className="proj-detail-hero__overlay" />
          <div className="container proj-detail-hero__content">
            <div className="breadcrumb">
              <Link href="/">Home</Link><span>/</span>
              <Link href="/projects">Projects</Link><span>/</span>
              <span className="breadcrumb-active">{project.title}</span>
            </div>
            <span className="proj-tag" style={{ background: '#FB0202' }}>PROJECT</span>
            <h1 className="proj-detail-title">{project.title}</h1>
            <div className="proj-detail-meta">
              <span>👤 {project.client_name || 'Confidential Client'}</span>
              <span>📅 Completed: {project.completion_year}</span>
              <span>🏷️ {project.category || 'Engineering'}</span>
            </div>
          </div>
        </section>

        <div className="container proj-detail-layout">

          {/* Main */}
          <div className="proj-detail-main">
            <div className="proj-detail-section">
              <h2>Project Overview</h2>
              <p>{project.description || 'This project demonstrates our expertise in delivering high-quality engineering solutions for the oil and gas industry.'}</p>
            </div>

            <div className="proj-detail-section">
              <h2>Client</h2>
              <p>{project.client_name || 'Confidential Client'}</p>
            </div>

            <div className="proj-detail-section">
              <h2>Completion Year</h2>
              <p>{project.completion_year}</p>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="proj-detail-sidebar">
            <div className="proj-detail-card">
              <h3>Project Details</h3>
              <div className="proj-detail-info">
                <span>Client:</span>
                <span>{project.client_name || 'Confidential'}</span>
                <span>Year:</span>
                <span>{project.completion_year}</span>
                <span>Category:</span>
                <span>{project.category || 'Engineering'}</span>
              </div>
            </div>
          </aside>
        </div>

        {/* CTA */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2>Ready to Start Your Project?</h2>
              <p>Let's discuss how we can help bring your vision to life.</p>
              <Link href="/contact" className="btn-primary">Get In Touch</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
          <div className="proj-detail-main">
            <div className="proj-detail-img">
              <img src={project.image} alt={project.title} />
            </div>

            <div className="proj-detail-section">
              <h2 className="proj-detail-section__title">Project Overview</h2>
              <p className="proj-detail-section__body">{project.overview}</p>
            </div>

            <div className="proj-detail-section">
              <h2 className="proj-detail-section__title">The Challenge</h2>
              <p className="proj-detail-section__body">{project.challenge}</p>
            </div>

            <div className="proj-detail-section">
              <h2 className="proj-detail-section__title">Our Solution</h2>
              <p className="proj-detail-section__body">{project.solution}</p>
            </div>

            <div className="proj-detail-section">
              <h2 className="proj-detail-section__title">Key Outcomes</h2>
              <ul className="proj-outcomes-list">
                {project.outcomes.map(o => (
                  <li key={o} className="proj-outcome-item">
                    <span className="proj-outcome-check">✓</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="proj-detail-cta">
              <h3>Have a similar project?</h3>
              <p>Our team is ready to bring the same level of expertise and dedication to your next challenge.</p>
              <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', marginTop:'20px' }}>
                <Link href="/contact" className="btn-red">Start a Conversation →</Link>
                <Link href="/projects" className="btn-outline-navy">← Back to Projects</Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="proj-detail-sidebar">
            <div className="proj-sidebar-widget">
              <h3 className="proj-sidebar-title">Project Details</h3>
              {[
                { label:'Client', value: project.client },
                { label:'Category', value: project.category },
                { label:'Location', value: project.location },
                { label:'Completed', value: project.year },
                { label:'Duration', value: project.duration },
              ].map(d => (
                <div key={d.label} className="proj-detail-row">
                  <span className="proj-detail-row__label">{d.label}</span>
                  <span className="proj-detail-row__value">{d.value}</span>
                </div>
              ))}
            </div>

            <div className="proj-sidebar-widget">
              <h3 className="proj-sidebar-title">Services Delivered</h3>
              {project.services.map(s => (
                <span key={s} className="proj-service-tag">{s}</span>
              ))}
            </div>

            <div className="proj-sidebar-widget proj-sidebar-widget--dark">
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:'16px', fontWeight:800, color:'white', marginBottom:'8px' }}>Start Your Project</h3>
              <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.65)', lineHeight:'1.6', marginBottom:'16px' }}>Ready to work with Nigeria's leading oil and gas engineering team?</p>
              <Link href="/contact" className="svc-contact-btn">Get a Quote →</Link>
            </div>

            <div className="proj-sidebar-widget">
              <h3 className="proj-sidebar-title">More Projects</h3>
              {otherProjects.map(([slug, p]) => (
                <Link key={slug} href={`/projects/${slug}`} className="proj-related-item">
                  <span className="proj-related-tag" style={{ background: p.tagColor }}>{p.tag}</span>
                  <span className="proj-related-title">{p.title}</span>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
