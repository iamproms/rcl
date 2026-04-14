'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services & Support', href: '/services' },
  { label: 'About Us', href: '/about' },
  { label: 'Projects', href: '/projects' },
  { label: 'Blog', href: '/blog' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isLight = ['/contact','/blog','/projects','/about','/services'].some(p => pathname === p || pathname.startsWith(p + '/'));

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav className={`navbar${scrolled?' scrolled':''}${isLight?' navbar--light':''}`}>
      <div className="container navbar__inner">
        <Link href="/" className="navbar__logo">
          <img src="/logo.png" alt="Rewaj Corporate Limited" className="logo-icon" />
          <span className="logo-text"><strong>REWAJ</strong> <span className="logo-red">CORPORATE LIMITED</span></span>
        </Link>
        <ul className="navbar__links">
          {navLinks.map(link => (
            <li key={link.href}>
              <Link href={link.href} className={`navbar__link${pathname===link.href||(link.href!=='/'&&pathname.startsWith(link.href))?'  active':''}`}>{link.label}</Link>
            </li>
          ))}
        </ul>
        <Link href="/contact" className="btn btn--red nav-cta">Contact Us</Link>
        <button className={`hamburger${menuOpen?' open':''}`} onClick={()=>setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span/><span/><span/>
        </button>
      </div>
      {menuOpen&&(
        <div className="mobile-menu">
          {navLinks.map(link=>(
            <Link key={link.href} href={link.href} className="mobile-link" onClick={()=>setMenuOpen(false)}>{link.label}</Link>
          ))}
          <Link href="/contact" className="btn btn--red" style={{justifyContent:'center',marginTop:'8px'}} onClick={()=>setMenuOpen(false)}>Contact Us</Link>
        </div>
      )}
    </nav>
  );
}
