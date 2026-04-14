import Link from 'next/link';
export function CTABanner() {
  return (
    <section className="cta-banner">
      <div className="cta-banner__bg" />
      <div className="container cta-banner__inner">
        <h2 className="cta-banner__title">Ready to Engineer the Future?</h2>
        <p className="cta-banner__sub">Partner with a team that places precision, safety, and local expertise at the core of every energy project.</p>
        <Link href="/contact" className="btn-red">Get a Quote</Link>
      </div>
    </section>
  );
}
