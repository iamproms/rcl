'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const categories = [
  { name:'Engineering', count:12 },{ name:'Safety & HSE', count:8 },
  { name:'Procurement', count:5 },{ name:'Industry News', count:14 },{ name:'Company Updates', count:3 },
];
const recentPosts = [
  { title:'Why Instrumentation Fittings Are Critical in Oil...', date:'OCT 12, 2023', slug:'why-instrumentation-fittings-critical' },
  { title:'Training the Next Generation of Nigerian Welders', date:'OCT 05, 2023', slug:'training-nigerian-welders' },
  { title:'RCL Receives Best Safety Record Award 2023', date:'SEP 28, 2023', slug:'rcl-best-safety-record-2023' },
];
import { articles } from '@/data/blog';

export default function BlogPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [allArticles, setAllArticles] = useState(articles);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog`);
        if (res.ok) {
          const apiArticles = await res.json();
          const mappedArticles = apiArticles.map((a: any) => {
            let imageUrl = a.featured_image || '/images/blog-featured.jpg';
            
            // If it's a backend-hosted static asset, prepend API URL
            if (imageUrl.startsWith('/static')) {
              imageUrl = `${(process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')}${imageUrl}`;
            } 
            // If it's an absolute URL (like Cloudinary), or already has /images or is a local root asset, leave as is
            
            return {
              slug: a.slug,
              category: a.category.toUpperCase(),
              date: new Date(a.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
              title: a.title,
              excerpt: a.excerpt,
              author: a.author || 'Rewaj Team',
              image: imageUrl
            };
          });
          setAllArticles(mappedArticles.length > 0 ? mappedArticles : articles);
        }
      } catch (err) {
        console.error("Failed to fetch articles:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const filteredArticles = allArticles.filter(article => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return [article.title, article.excerpt, article.category, article.author]
      .filter(Boolean)
      .some(field => field.toLowerCase().includes(term));
  });
  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / itemsPerPage));
  const pagedArticles = filteredArticles.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleSubscribe = async () => {
    if (!email) return;
    setIsSubmitting(true);
    setStatusMessage('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSubscribed(true);
        setEmail('');
        setStatusMessage('✅ Subscription successful. Check your inbox for confirmation.');
      } else {
        const data = await res.json().catch(() => null);
        setStatusMessage(data?.detail || 'Subscription failed. Please try again.');
      }
    } catch (error) {
      setStatusMessage('Subscription failed. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  return (
    <>
      <Navbar />
      <main style={{ paddingTop:'72px', background:'var(--white)' }}>
        <section className="blog-header" style={{
          position: 'relative',
          padding: '100px 0',
          background: 'url(/images/blog-featured.jpg) center/cover no-repeat',
          textAlign: 'center',
          color: 'white',
          borderBottom: '4px solid var(--red)'
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.85)', zIndex: 0 }} />
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <h1 className="blog-title" style={{ color: 'white', marginBottom: '16px' }}>Industry Insights</h1>
            <p className="blog-sub" style={{ color: 'rgba(255,255,255,0.8)', margin: '0 auto' }}>Expert analysis and updates on the Nigerian energy sector, engineering innovations, and global oil and gas trends.</p>
          </div>
        </section>
        <section className="blog-content">
          <div className="container blog-layout">
            <div>
              {pagedArticles.map(article => (
                <article key={article.slug} className="article-card">
                  <div className="article-card__image">
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      loading="eager"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/blog-featured.jpg';
                      }}
                    />
                  </div>
                  <div className="article-card__body">
                    <div className="article-meta">
                      <span className="article-category">{article.category}</span>
                      <span className="article-date">{article.date}</span>
                    </div>
                    <h2 className="article-title">{article.title}</h2>
                    <p className="article-excerpt">{article.excerpt}</p>
                    <div className="article-footer">
                      <div className="article-author">
                        <div className="author-avatar">{article.author[0]}</div>
                        <span>{article.author}</span>
                      </div>
                      <Link href={`/blog/${article.slug}`} className="read-more">Read Full Article →</Link>
                    </div>
                  </div>
                </article>
              ))}
              <div className="pagination">
                <button className="page-btn" disabled={page===1} onClick={() => setPage(p => Math.max(1, p - 1))}>‹</button>
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(p => (
                  <button key={p} className={`page-btn${page===p ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="page-btn" disabled={page===totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>›</button>
              </div>
            </div>
            <aside className="blog-sidebar">
              <div className="sidebar-widget">
                <h3 className="sidebar-title">Search Articles</h3>
                <div className="search-box"><input type="search" placeholder="Search insights..." value={searchTerm} onChange={e => handleSearchChange(e.target.value)} /></div>
              </div>
              <div className="sidebar-widget">
                <h3 className="sidebar-title"><span className="sidebar-title__bar"/>Recent Posts</h3>
                <div className="recent-posts">
                  {allArticles.slice(0, 3).map(post=>(
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="recent-post">
                      <div className="recent-post__img">
                        <img 
                          src={post.image} 
                          alt={post.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/blog-featured.jpg';
                          }}
                        />
                      </div>
                      <div>
                        <span className="recent-post__title">{post.title}</span>
                        <span className="recent-post__date">{post.date}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="sidebar-widget">
                <h3 className="sidebar-title"><span className="sidebar-title__bar"/>Categories</h3>
                <div className="categories">
                  {categories.map(cat=>(
                    <div key={cat.name} className="category-row">
                      <span className="category-name">{cat.name}</span>
                      <span className="category-count">{String(cat.count).padStart(2,'0')}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sidebar-widget sidebar-widget--red">
                <h3 className="newsletter-title">Stay Updated</h3>
                <p className="newsletter-sub">Receive the latest industry insights and company news directly in your inbox.</p>
                {subscribed ? (
                  <p style={{color:'#fff',fontSize:'14px',textAlign:'center',padding:'8px 0'}}>✅ You&apos;re subscribed!</p>
                ) : (
                  <>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" className="newsletter-input" />
                    <button className="newsletter-btn" onClick={handleSubscribe} disabled={isSubmitting || !email}>SUBSCRIBE</button>
                  </>
                )}
                {statusMessage && <p style={{color:'#fff',fontSize:'13px',textAlign:'center',padding:'8px 0'}}>{statusMessage}</p>}
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
