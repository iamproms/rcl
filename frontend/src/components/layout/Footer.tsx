import Link from 'next/link';
import { MapPin, Phone, Mail, LinkedIn } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__top">
        <div className="footer__brand">
          <div className="footer__logo">
            <img src="/logo.png" alt="Rewaj Corporate Limited" className="logo-icon" />
            <div className="logo-text">
              <span className="logo-white">REWAJ </span>
              <span className="logo-red">CORPORATE LIMITED</span>
            </div>
          </div>
          <p className="footer__desc">
            Leading provider of engineering, procurement and industrial services, specializing in
            electrical, instrumentation and mechanical solutions for the Nigerian Oil and Gas Industry.
          </p>
          <div className="footer__socials">
            <a href="https://m.facebook.com/rewajcorporateltd/" aria-label="Facebook" className="social-btn">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://www.linkedin.com/company/rewaj-corporate-ltd/" aria-label="LinkedIn" className="social-btn">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.732-2.004 1.438-.103.249-.129.597-.129.946v5.421h-3.554s.051-8.795 0-9.704h3.554v1.374c.43-.664 1.199-1.61 2.920-1.61 2.135 0 3.753 1.395 3.753 4.402v5.538zM5.337 9.433c-1.144 0-1.915-.759-1.915-1.71 0-.956.768-1.71 1.959-1.71 1.189 0 1.914.754 1.938 1.71 0 .951-.749 1.71-1.982 1.71zm1.582 11.019H3.656V8.248h3.263v12.204zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="mailto:info@rewajcorporate.com" aria-label="Email" className="social-btn">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </a>
          </div>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-title">Quick Links</h4>
          <ul>
            {[
              { label: 'Our Services', href: '/services' },
              { label: 'Blog', href: '/blog' },
              { label: 'Project Gallery', href: '/projects' },
              { label: 'Careers', href: '/careers' },
            ].map(l => <li key={l.href}><Link href={l.href} className="footer__link">{l.label}</Link></li>)}
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-title">Contact Us</h4>
          <div className="contact-item">
            <MapPin size={16} className="contact-icon" />
            <span>No. 7 Ezimgbu Crescent, Presidential Estate, Phase IV, New GRA, Port Harcourt. Rivers State. Nigeria.</span>
          </div>
          <div className="contact-item">
            <Phone size={16} className="contact-icon" />
            <a href="tel:+2347037830548" className="footer__link">+234 703 783 0548</a>
          </div>
          <div className="contact-item">
            <Mail size={16} className="contact-icon" />
            <a href="mailto:info@rewajcorporate.com" className="footer__link">info@rewajcorporate.com</a>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© {new Date().getFullYear()} Rewaj Corporate Limited. All rights reserved. Professionalism in Engineering.</p>
        </div>
      </div>
    </footer>
  );
}
