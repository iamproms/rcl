import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  author?: string;
  category?: string;
  featured_image?: string;
  created_at: string;
}

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog/${slug}`, {
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getRecentArticles(): Promise<Article[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function BlogArticlePage({ params }: { params: { slug: string } }) {
  const [article, recentArticles] = await Promise.all([getArticle(params.slug), getRecentArticles()]);

  if (!article) return notFound();

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '72px', background: 'var(--white)' }}>
        <div className="container article-layout">

          {/* Article Body */}
          <article className="article">
            <div className="article__breadcrumb">
              <Link href="/">Home</Link><span>/</span>
              <Link href="/blog">Blog</Link><span>/</span>
              <span className="bc-active">Article</span>
            </div>

            <div className="article__meta">
              <span className="article__cat">{article.category || 'General'}</span>
              <span className="article__date">{new Date(article.created_at).toLocaleDateString()}</span>
              <span className="article__read">8 min read</span>
            </div>

            <h1 className="article__title">
              {article.title}
            </h1>

            <div className="article__author-bar">
              <div className="author-avatar">{(article.author || 'A')[0]}</div>
              <div>
                <span className="author-name">{article.author || 'Anonymous'}</span>
                <span className="author-role">Senior Engineer, Rewaj Corporate Limited</span>
              </div>
            </div>

            {(() => {
              let headerImage = article.featured_image || '/images/blog-default.jpg';
              if (headerImage.startsWith('/static')) {
                headerImage = `${(process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')}${headerImage}`;
              }
              return (
                <div className="article__hero-img">
                  <img 
                    src={headerImage} 
                    alt={article.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/blog-default.jpg';
                    }}
                  />
                </div>
              );
            })()}

            <div className="article__content" dangerouslySetInnerHTML={{ __html: article.content || article.excerpt || '' }} />

            <div className="article__tags">
              {['Technology', 'Safety', 'Oil & Gas', 'Innovation', 'HSE'].map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>

          </article>

          {/* Sidebar */}
          <aside className="article-sidebar">
            <div className="sidebar-widget">
              <h3 className="sidebar-title"><span className="sidebar-title__bar" />Recent Posts</h3>
              {recentArticles.slice(0, 3).map(p => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="recent-item">
                  <div className="recent-img">
                    <img 
                      src={(() => {
                        let sidebarImg = p.featured_image || '/images/blog-default.jpg';
                        if (sidebarImg.startsWith('/static')) {
                          sidebarImg = `${(process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')}${sidebarImg}`;
                        }
                        return sidebarImg;
                      })()} 
                      alt={p.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/blog-default.jpg';
                      }}
                    />
                  </div>
                  <div>
                    <span className="recent-title">{p.title}</span>
                    <span className="recent-date">{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="sidebar-widget">
              <h3 className="sidebar-title"><span className="sidebar-title__bar" />Categories</h3>
              {[['Engineering', 12], ['Safety & HSE', 8], ['Procurement', 5], ['Industry News', 14], ['Company Updates', 3]].map(([name, count]) => (
                <div key={name as string} className="cat-row">
                  <span>{name as string}</span>
                  <span className="cat-count">{String(count).padStart(2, '0')}</span>
                </div>
              ))}
            </div>

            <div className="sidebar-widget sidebar-cta">
              <h3>Ready to work with us?</h3>
              <p>Get in touch with our team to discuss your next project.</p>
              <Link href="/contact" className="sidebar-cta-btn">Contact Us →</Link>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
