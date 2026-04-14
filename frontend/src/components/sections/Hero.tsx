import Link from 'next/link';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__bg" /> <img src="/hero-offshore.png" alt="Hero Background" className="hero__bg" />
      <div className="hero__overlay" />
      <div className="container hero__content">
        <span className="hero__eyebrow">Nigeria's energy partner</span>
        <h1 className="hero__heading">
          Engineering<br />
          <span className="hero__heading--red">solutions</span> for<br />
          the Energy<br />
          Industry
        </h1>
        <p className="hero__subtext">
          Delivering world-class oil and gas engineering solutions, procurement
          services, and infrastructure development across Nigeria and beyond.
        </p>
        <div className="hero__actions">
          <Link href="/services" className="btn-red">Our Services ↓</Link>
          <Link href="/about" className="btn-outline">Learn More</Link>
        </div>
      </div>
    </section>
  );
}
