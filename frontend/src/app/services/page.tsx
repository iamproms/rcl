import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { Cog, Zap, Wrench, Package, Shield, Gauge, Hammer, Bot, Search } from 'lucide-react';

export const metadata = {
  title: 'Our Services | Rewaj Corporate Limited',
  description: 'Comprehensive oil and gas engineering services — from design and automation to maintenance and procurement.',
};

const services = [
  { icon: Cog, title: 'Engineering & Design', slug: 'engineering-design', image: 'engineering-design.jpg', desc: 'Comprehensive engineering design solutions for oil and gas maintenance, upgrades, modifications, and facility enhancements, tailored to international standards and Nigerian local regulations.', highlights: ['FEED & Detail Engineering', 'Structural Repair & Fabrication Design', 'Process, Electrical & Instrumentation System Engineering'] },
  { icon: Zap, title: 'Control Systems Integration', slug: 'control-systems', image: 'control-systems.jpg', desc: 'End-to-end integration of control and automation systems including SCADA, DCS, and PLC systems for optimal plant performance and safety.', highlights: ['SCADA Systems', 'DCS Integration', 'PLC Programming', 'HMI Development'] },
  { icon: Wrench, title: 'Maintenance Services', slug: 'maintenance', image: 'maintenance.jpg', desc: 'Planned and corrective maintenance programs for oil and gas equipment to maximize uptime and extend the operational lifecycle of critical assets.', highlights: ['Preventive Maintenance', 'Corrective Maintenance', 'Shutdown/Turnaround', 'Asset Management'] },
  { icon: Package, title: 'Procurement & Supply', slug: 'procurement', image: 'procurement.jpg', desc: 'Strategic procurement of specialized materials, and equipment, and components from vetted global and local suppliers with full quality assurance.', highlights: ['Equipment Sourcing', 'Vendor Management', 'Material Supply', 'Logistics Support'] },
  { icon: Shield, title: 'Field Support Services', slug: 'field-support', image: 'field-support.jpg', desc: 'On-site technical support by certified engineers and technicians to ensure safe, efficient, and compliant field operations at all times.', highlights: ['Site Supervision', 'Technical Assistance', 'HSE Compliance', '24/7 Emergency Response'] },
  { icon: Gauge, title: 'Testing & Calibration', slug: 'testing', image: 'testing-calibration.jpg', desc: 'Precision testing and calibration of instrumentation and safety systems to meet all regulatory and operational performance requirements.', highlights: ['Instrument Calibration', 'Functional Testing', 'FAT/SAT Support', 'Pressure Testing'] },
  { icon: Hammer, title: 'Equipment Installation & Commissioning', slug: 'installation', image: 'installation.jpg', desc: 'Full installation, hook-up, and commissioning of oil and gas equipment including rotating machinery and static equipment from mobilization to handover.', highlights: ['Mechanical Installation', 'Electrical Hook-up', 'Pre-commissioning', 'Commissioning'] },
  { icon: Bot, title: 'Instrumentation & Automation', slug: 'automation', image: 'automation.jpg', desc: 'Design and deployment of cutting-edge instrumentation and automation solutions to improve process efficiency and ensure operational safety.', highlights: ['Flow Measurement', 'Level & Pressure Instruments', 'Safety Instrumented Systems', 'Fire & Gas Detection'] },
  {
    icon: Search,
    title: 'Inspection Services',
    slug: 'inspection',
    image: 'inspection.jpg',
    desc: 'Structural and equipment inspection using advanced techniques to ensure asset integrity, safety compliance, and long-term reliability across all oilfield operations.',
    highlights: ['Fire Suppression & Safety System Inspections', 'Electrical, UPS & Battery System Integrity Management']
  },
];

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '72px' }}>
        {/* Hero */}
        <section className="services-page-hero">
          <div className="container">
            <span className="eyebrow">WHAT WE OFFER</span>
            <h1 className="services-page-hero__title">Our Engineering Services</h1>
            <p className="services-page-hero__sub">From concept to commissioning, Rewaj Corporate Limited delivers a full spectrum of technical services for the Nigerian oil and gas sector.</p>
          </div>
        </section>

        {/* Services Grid */}
        <section style={{ background: 'var(--bg-light)', paddingBottom: '80px' }}>
          <div className="container">
            <div className="services-full-grid">
              {services.map((svc) => (
                <div key={svc.slug} className="service-detail-card">
                  <div className="service-detail-thumb">
                    <img src={`/images/${svc.image}`} alt={`${svc.title} placeholder`} />
                  </div>
                  <div className="service-detail-icon"><svc.icon size={40} strokeWidth={1.5} /></div>
                  <h3 className="service-detail-title">{svc.title}</h3>
                  <p className="service-detail-desc">{svc.desc}</p>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    {svc.highlights.map(h => (
                      <li key={h} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--slate-600)' }}>
                        <span style={{ color: 'var(--red)', fontWeight: 800 }}>✓</span> {h}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/contact?service=${svc.slug}`} className="service-detail-link">
                    Request This Service →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Partners */}
        <section className="partners-section">
          <div className="container partners-inner">
            <h2>Our Partners</h2>
            <p>Delivering excellence through global partnerships</p>
            <div className="partners-marquee-wrap">
              <div className="partners-marquee">
                <div className="partners-track">
                  {[
                    { name: 'CHLORIDE', logo: '/images/partners/CHLORIDE.png' },
                    { name: 'MESA', logo: '/images/partners/MESA.png' },
                    { name: 'NOBEL', logo: '/images/partners/NOBEL.png' },
                    { name: 'DALE POWER', logo: '/images/partners/DALE.png' },
                    { name: 'NIDEC/KATO/LEROY SOMER', logo: '/images/partners/NIDEC.png' },
                    { name: 'WEG', logo: '/images/partners/WEG.png' }
                  ].map((partner, idx) => (
                    <div key={`${partner.name}-${idx}`} className="partner-chip">
                      <div className="partner-logo-placeholder">
                        <img src={partner.logo} alt={`${partner.name} logo`} style={{ maxHeight: '60px', width: 'auto' }} />
                      </div>
                      <div className="partner-info">
                        <div className="partner-name">{partner.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="partners-track" aria-hidden="true">
                  {[
                    { name: 'CHLORIDE', logo: '/images/partners/CHLORIDE.png' },
                    { name: 'MESA', logo: '/images/partners/MESA.png' },
                    { name: 'NOBEL', logo: '/images/partners/NOBEL.png' },
                    { name: 'DALE POWER', logo: '/images/partners/DALE.png' },
                    { name: 'NIDEC/KATO/LEROY SOMER', logo: '/images/partners/NIDEC.png' },
                    { name: 'WEG', logo: '/images/partners/WEG.png' }
                  ].map((partner, idx) => (
                    <div key={`dup-${partner.name}-${idx}`} className="partner-chip">
                      <div className="partner-logo-placeholder">
                        <img src={partner.logo} alt={`${partner.name} logo`} style={{ maxHeight: '60px', width: 'auto' }} />
                      </div>
                      <div className="partner-info">
                        <div className="partner-name">{partner.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: 'var(--navy)', padding: '80px 0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 100%, rgba(251,2,2,0.1) 0%, transparent 70%)' }} />
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: 'var(--white)', textTransform: 'uppercase', marginBottom: '16px' }}>
              Need a Tailored Solution?
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.65)', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px', lineHeight: '1.7' }}>
              Our engineering team will work with you to develop a custom service package that meets your specific operational requirements.
            </p>
            <Link href="/contact" className="btn-red">Get in Touch →</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
