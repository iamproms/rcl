import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { Award, Wrench, Users, Shield, Target, Eye, Leaf, CheckCircle, Ruler } from 'lucide-react';

export const metadata = {
  title: 'About Us | Rewaj Corporate Limited',
  description: 'Over two decades of engineering excellence in the Nigerian oil and gas sector.',
};

const stats = [
  { Icon: Award, value: '150+', label: 'Clients served' },
  { Icon: Wrench, value: '200+', label: 'Projects completed' },
  { Icon: Users, value: '50+', label: 'Skilled personnel' },
  { Icon: Shield, value: '0 LTI', label: 'Safety milestone' },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '72px' }}>
        {/* Hero */}
        <section className="about-hero">
          <div className="about-hero__overlay" />
          <div className="container about-hero__content">
            <h1 className="about-hero__title">Built on Integrity,<br /><span className="text-red">Driven by Excellence.</span></h1>
            <p className="about-hero__sub">Providing world-class oil and gas engineering services and solutions in Nigeria since 2001.</p>
          </div>
        </section>

        {/* Legacy */}
        <section className="legacy-section">
          <div className="container legacy__inner">
            <div>
              <span className="eyebrow">OUR LEGACY</span>
              <h2 className="section-title">Over Two Decades of Engineering Excellence</h2>
              <p className="body-text">Rewaj Corporate Limited was founded in 2001 with a vision to revolutionize the Nigerian oil and gas services sector. What started as a focused engineering firm has grown into a multi-disciplinary powerhouse, delivering complex projects across the Niger Delta and beyond.</p>
              <p className="body-text" style={{ marginTop: '16px' }}>Our journey has been defined by a relentless commitment to local content development, technical innovation, and an unwavering focus on client satisfaction. We have weathered industry cycles by maintaining a core team of world-class engineers and technicians who share our passion for excellence.</p>
              <div className="badges">
                <span className="badge"><Award size={16} /> ISO Certified</span>
                <span className="badge"><CheckCircle size={16} /> NipeX Registered</span>
              </div>
            </div>
            <div className="legacy__image">
              <img src="/images/team-offshore.jpg" alt="Rewaj engineer on site" />
              <div className="legacy__img-accent" />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="about-stats-section">
          <div className="container about-stats-grid">
            {stats.map((s, i) => (
              <div key={i} className="about-stat">
                <span className="about-stat__icon"><s.Icon size={24} /></span>
                <span className="about-stat__value">{s.value}</span>
                <span className="about-stat__label">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="mission-section">
          <div className="container">
            <div className="section-header-center">
              <span className="eyebrow" style={{ display: 'block', textAlign: 'center' }}>THE REWAJ WAY</span>
              <h2 className="section-title-white">Our Mission &amp; Vision</h2>
            </div>
            <div className="mv-grid">
              <div className="mv-card">
                <div className="mv-card__icon-wrap" style={{ background: 'rgba(251,2,2,0.2)', color: '#FB0202' }}><Target size={20} /></div>
                <h3 className="mv-card__title">Our mission</h3>
                <p className="mv-card__text">To deliver innovative, cost-effective, and sustainable engineering solutions to the energy sector, while upholding the highest standards of safety, quality, and local participation. We strive to be the partner of choice for energy infrastructure development in Africa.</p>
              </div>
              <div className="mv-card">
                <div className="mv-card__icon-wrap" style={{ background: 'rgba(124,58,237,0.2)', color: '#7C3AED' }}><Eye size={20} /></div>
                <h3 className="mv-card__title">Our vision</h3>
                <p className="mv-card__text">To be a premier global energy services provider, recognized for our technical prowess, operational efficiency, and transformative impact on the communities where we operate.</p>
              </div>
            </div>
          </div>
        </section>

        {/* HSE & QA */}
        <section className="hse-section">
          <div className="container hse-inner">
            <div>
              <span className="eyebrow">COMMITMENT TO STANDARDS</span>
              <h2 className="section-title">Health, Safety &amp; Environment (HSE)</h2>
              <p className="body-text">Safety is not just a priority at Rewaj; it is our culture. We operate under a robust HSE Management System that ensures every employee returns home safely every day. Our &apos;Goal Zero&apos; initiative targets zero accidents, zero injuries, and zero environmental damage.</p>
              <div className="hse-points">
                <div className="hse-point">
                  <span className="hse-point__dot"><Shield size={16} /></span>
                  <div><strong style={{ display: 'block', fontSize: '14.5px', color: '#0F172A', marginBottom: '4px' }}>Zero LTI performance</strong><p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: '1.6' }}>Consistent track record of accident-free man-hours across all sites.</p></div>
                </div>
                <div className="hse-point">
                  <span className="hse-point__dot"><Leaf size={16} /></span>
                  <div><strong style={{ display: 'block', fontSize: '14.5px', color: '#0F172A', marginBottom: '4px' }}>Environmental stewardship</strong><p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: '1.6' }}>Minimal footprint through advanced waste management and spill prevention protocols.</p></div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="hse-right__title">Quality Assurance (QA/QC)</h3>
              <p className="body-text">Our quality management systems are designed to meet and exceed international benchmarks such as ISO 9001:2015. We implement rigorous inspection and testing plans (ITP) at every stage of project delivery.</p>
              <div className="qa-cards">
                <div className="qa-card"><span className="qa-icon"><Ruler size={20} /></span><strong>Precision</strong><p>Stringent dimensional and material controls.</p></div>
                <div className="qa-card"><span className="qa-icon"><CheckCircle size={20} /></span><strong>Compliance</strong><p>Adherence to API, ASME, and ASTM standards.</p></div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="about-cta">
          <h2 className="about-cta__title">Ready to Power Your Next Project?</h2>
          <p className="about-cta__sub">Get in touch with our expert engineering team to discuss how we can deliver value to your operations.</p>
          <div className="cta-btns">
            <Link href="/contact" className="btn-outline-white">Contact Our Team</Link>
            <Link href="/REWAJ-COMPANY-PROFILE-2026.pdf" className="btn-red">Download Brochure</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
