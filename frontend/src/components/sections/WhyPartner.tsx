'use client';
import Link from 'next/link';
import { Award, AlertCircle, Lightbulb, Trophy } from 'lucide-react';

const reasons = [
  { Icon: Award, title: 'Local Content Excellence', desc: 'Proudly Nigerian, maximizing local talent and resources for every project.' },
  { Icon: AlertCircle, title: 'Uncompromising Safety', desc: 'Our "Safety First" culture ensures zero incidents and complete compliance.' },
  { Icon: Lightbulb, title: 'Innovative Solutions', desc: 'We leverage the latest engineering methods and technology to deliver smarter, more efficient outcomes.' },
];

export default function WhyPartner() {
  return (
    <section className="why-partner" id="about">
      <div className="container why-partner__inner">
        <div>
          <div className="why-partner__img-wrap">
            <img src="/images/team-offshore.jpg" alt="Rewaj team on-site" className="why-partner__img" />
            <div className="why-partner__badge">
              <Award className="badge__icon" size={30} />
              <div><strong>ISO Certified</strong><span>Quality Management System</span></div>
            </div>
          </div>
        </div>
        <div>
          <span className="eyebrow">OUR ADVANTAGE</span>
          <h2 className="section-title">Why Companies Partner with Rewaj</h2>
          <div className="section-divider" />
          <p className="why-partner__lead">At Rewaj Corporate Limited, we combine global standards with deep local expertise to deliver results that exceed expectations.</p>
          <div className="reasons">
            {reasons.map((r, i) => (
              <div key={i} className="reason reason--animate">
                <r.Icon className="reason__icon" />
                <div><h4 className="reason__title">{r.title}</h4><p className="reason__desc">{r.desc}</p></div>
              </div>
            ))}
          </div>
          <Link href="/contact" className="btn-red">Start a Conversation →</Link>
        </div>
      </div>
    </section>
  );
}
