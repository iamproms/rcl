'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Stats { total_messages: number; unread_messages: number; total_articles: number; total_projects: number; }
interface Message { id: number; name: string; email: string; phone?: string; subject?: string; message: string; is_read: boolean; created_at: string; }
interface Article { id: number; title: string; slug: string; category: string; content?: string; excerpt?: string; author?: string; featured_image?: string; is_published: boolean; created_at: string; }
interface Project { id: number; title: string; slug: string; category: string; description?: string; client_name?: string; completion_year: string; featured_image?: string; status?: string; is_active: boolean; }

const TAG_COLORS: Record<string,string> = { PARTNERSHIP:'#10B981', URGENT:'#EF4444', 'QUOTE REQ':'#F97316', CAREERS:'#6366F1' };

export default function AdminDashboard() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [stats, setStats] = useState<Stats|null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState<Message|null>(null);
  const [projectForm, setProjectForm] = useState({title:'',client:'',description:'',projectImage:'',projectYear:'',author:''});
  const [articleForm, setArticleForm] = useState({title:'',category:'',content:'',excerpt:'',articleImage:'',author:'',slug:'',date:''});
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [notification, setNotification] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newsletterSubject, setNewsletterSubject] = useState('');
  const [newsletterContent, setNewsletterContent] = useState('');
  const [subscribers, setSubscribers] = useState([]);
  const [sendingNewsletter, setSendingNewsletter] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article|null>(null);
  const [editingProject, setEditingProject] = useState<Project|null>(null);

  const token = () => typeof window!=='undefined' ? localStorage.getItem('rcl_token') : null;
  const userEmail = () => typeof window!=='undefined' ? localStorage.getItem('rcl_user') : '';
  const hdrs = useCallback(() => ({'Authorization':`Bearer ${token()}`,'Content-Type':'application/json'}),[]);

  const fetchData = useCallback(async () => {
    if(!token()){router.push('/admin');return;}
    try {
      const [sRes, mRes, aRes, pRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`,{headers:hdrs()}),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/messages`,{headers:hdrs()}),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog`,{headers:hdrs()}),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`,{headers:hdrs()}),
      ]);
      if(sRes.status===401){router.push('/admin');return;}
      setStats(await sRes.json());
      setMessages(await mRes.json());
      setArticles(await aRes.json());
      setProjects(await pRes.json());
    } catch(e){} finally{setLoading(false);}
  },[router,hdrs]);

  useEffect(()=>{fetchData();},[fetchData]);

  const markRead = async (id:number) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/messages/${id}/read`,{method:'PATCH',headers:hdrs()});
    setMessages(prev=>prev.map(m=>m.id===id?{...m,is_read:true}:m));
    if(selectedMsg?.id===id) setSelectedMsg(p=>p?{...p,is_read:true}:null);
    if(stats) setStats(p=>p?{...p,unread_messages:Math.max(0,p.unread_messages-1)}:null);
  };
  const deleteMsg = async (id:number) => {
    if(!confirm('Are you sure you want to delete this message?')) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/messages/${id}`,{method:'DELETE',headers:hdrs()});
    setMessages(prev=>prev.filter(m=>m.id!==id));
    if(selectedMsg?.id===id) setSelectedMsg(null);
  };
  const deleteArticle = async (id:number) => {
    if(!confirm('Delete this article?')) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog/${id}`,{method:'DELETE',headers:hdrs()});
    setArticles(prev=>prev.filter(a=>a.id!==id));
  };
  const deleteProject = async (id:number) => {
    if(!confirm('Delete this project?')) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`,{method:'DELETE',headers:hdrs()});
    setProjects(prev=>prev.filter(p=>p.id!==id));
  };

  const updateProjectStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}/status?status=${newStatus}`, {
        method: 'PATCH',
        headers: hdrs()
      });
      if (res.ok) {
        const updated = await res.json();
        setProjects(prev => prev.map(p => p.id === id ? { ...p, status: updated.status } : p));
        setNotification('Project status updated!');
        setTimeout(() => setNotification(''), 3000);
      } else {
        setNotification('Failed to update status');
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (e) {
      setNotification('Error updating project status');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const createArticle = async () => {
    if(!articleForm.title.trim()) return;
    try {
      const slug = articleForm.slug || articleForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const method = editingArticle ? 'PUT' : 'POST';
      const url = editingArticle ? `${process.env.NEXT_PUBLIC_API_URL}/api/blog/${editingArticle.id}` : `${process.env.NEXT_PUBLIC_API_URL}/api/blog`;
      
      const res = await fetch(url,{
        method,
        headers:hdrs(),
        body:JSON.stringify({
          title: articleForm.title,
          slug,
          excerpt: articleForm.excerpt,
          content: articleForm.content,
          author: articleForm.author,
          category: articleForm.category || 'General',
          featured_image: articleForm.articleImage,
          is_published: false
        })
      });
      if(res.ok){
        const updatedArticle = await res.json();
        if (editingArticle) {
          setArticles(prev=>prev.map(a=>a.id===editingArticle.id?updatedArticle:a));
          setNotification('Article updated successfully!');
        } else {
          setArticles(prev=>[updatedArticle,...prev]);
          setNotification('Article created successfully!');
        }
        setArticleForm({title:'',category:'',content:'',excerpt:'',articleImage:'',author:'',slug:'',date:''});
        setShowArticleForm(false);
        setEditingArticle(null);
        setTimeout(()=>setNotification(''),3000);
      }
    } catch(e){
      setNotification('Failed to save article');
      setTimeout(()=>setNotification(''),3000);
    }
  };

  const createProject = async () => {
    if(!projectForm.title.trim()) return;
    try {
      const slug = projectForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const method = editingProject ? 'PUT' : 'POST';
      const url = editingProject ? `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${editingProject.id}` : `${process.env.NEXT_PUBLIC_API_URL}/api/projects`;
      
      const res = await fetch(url,{
        method,
        headers:hdrs(),
        body:JSON.stringify({
          title: projectForm.title,
          slug,
          description: projectForm.description,
          client_name: projectForm.client,
          completion_year: projectForm.projectYear || new Date().getFullYear().toString(),
          featured_image: projectForm.projectImage,
          is_active: true
        })
      });
      if(res.ok){
        const updatedProject = await res.json();
        if (editingProject) {
          setProjects(prev=>prev.map(p=>p.id===editingProject.id?updatedProject:p));
          setNotification('Project updated successfully!');
        } else {
          setProjects(prev=>[updatedProject,...prev]);
          setNotification('Project created successfully!');
        }
        setProjectForm({title:'',client:'',description:'',projectImage:'',projectYear:'',author:''});
        setShowProjectForm(false);
        setEditingProject(null);
        setTimeout(()=>setNotification(''),3000);
      }
    } catch(e){
      setNotification('Failed to save project');
      setTimeout(()=>setNotification(''),3000);
    }
  };

  const logout = () => {localStorage.removeItem('rcl_token');localStorage.removeItem('rcl_user');router.push('/admin');};

  const editArticle = async (article: Article) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog/${article.id}`, {headers: hdrs()});
      if (res.ok) {
        const fullArticle = await res.json();
        setArticleForm({
          title: fullArticle.title,
          category: fullArticle.category,
          content: fullArticle.content || '',
          excerpt: fullArticle.excerpt || '',
          articleImage: fullArticle.featured_image || '',
          author: fullArticle.author || '',
          slug: fullArticle.slug,
          date: ''
        });
        setEditingArticle(article);
        setShowArticleForm(true);
      }
    } catch (e) {
      setNotification('Failed to load article for editing');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const editProject = async (project: Project) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${project.id}`, {headers: hdrs()});
      if (res.ok) {
        const fullProject = await res.json();
        setProjectForm({
          title: fullProject.title,
          client: fullProject.client_name || '',
          description: fullProject.description || '',
          projectImage: fullProject.featured_image || '',
          projectYear: fullProject.completion_year || '',
          author: ''
        });
        setEditingProject(project);
        setShowProjectForm(true);
      }
    } catch (e) {
      setNotification('Failed to load project for editing');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const fetchSubscribers = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/subscribers`, {headers: hdrs()});
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data);
      }
    } catch (e) {
      console.error('Failed to fetch subscribers:', e);
    }
  }, [hdrs]);

  useEffect(() => {
    if (activeNav === 'Newsletter') {
      fetchSubscribers();
    }
  }, [activeNav, fetchSubscribers]);

  const sendNewsletter = async () => {
    if (!newsletterSubject.trim() || !newsletterContent.trim()) {
      setNotification('Please fill in both subject and content');
      setTimeout(() => setNotification(''), 3000);
      return;
    }
    
    setSendingNewsletter(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/send-newsletter`, {
        method: 'POST',
        headers: hdrs(),
        body: JSON.stringify({
          subject: newsletterSubject,
          content: newsletterContent
        })
      });
      
      if (res.ok) {
        setNotification('Newsletter sent successfully!');
        setNewsletterSubject('');
        setNewsletterContent('');
      } else {
        setNotification('Failed to send newsletter');
      }
    } catch (e) {
      setNotification('Error sending newsletter');
    } finally {
      setSendingNewsletter(false);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const filteredMessages = messages.filter(msg => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return [msg.name, msg.email, msg.subject, msg.message]
      .some(field => (field ?? '').toLowerCase().includes(term));
  });

  const filteredArticles = articles.filter(article => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return [article.title, article.category]
      .some(field => (field ?? '').toLowerCase().includes(term));
  });

  const filteredProjects = projects.filter(project => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return [project.title, project.category]
      .some(field => (field ?? '').toLowerCase().includes(term));
  });

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: 'POST',
        headers: {'Authorization': `Bearer ${token()}`},
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        return data.url;
      } else {
        throw new Error('Upload failed');
      }
    } catch (e) {
      setNotification('File upload failed');
      setTimeout(() => setNotification(''), 3000);
      return null;
    }
  };

  const handleArticleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadFile(file);
      if (url) {
        setArticleForm(p => ({ ...p, articleImage: url }));
      }
    }
  };

  const handleProjectImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadFile(file);
      if (url) {
        setProjectForm(p => ({ ...p, projectImage: url }));
      }
    }
  };

  const navItems = [
    {icon:'📊',label:'Dashboard'},{icon:'🔍',label:'Search'},{icon:'📝',label:'Articles'},{icon:'🏗️',label:'Projects'},
    {icon:'✉️',label:'Inbox',badge:stats?.unread_messages},{icon:'📧',label:'Newsletter'},{icon:'⚙️',label:'Settings'},
  ];

  if(loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#F1F5F9',flexDirection:'column',gap:'16px'}}>
      <div style={{width:'36px',height:'36px',border:'3px solid #E2E8F0',borderTopColor:'#FB0202',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
      <p style={{color:'#64748B',fontSize:'14px'}}>Loading...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div className="admin">
      <aside className="sidebar">
        <div className="sidebar__top">
          <div className="user-info">
            <div className="avatar">R</div>
            <div>
              <p className="uname">Rewaj Admin</p>
              <p className="urole">Super Administrator</p>
            </div>
          </div>
        </div>
        <nav className="snav">
          {navItems.map(item=>(
            <button key={item.label} className={`nitem${activeNav===item.label?' active':''}`} onClick={()=>setActiveNav(item.label)}>
              <span>{item.icon}</span><span>{item.label}</span>
              {item.badge?<span className="nbadge">{item.badge}</span>:null}
            </button>
          ))}
        </nav>
        <div className="sidebar__bottom">
          <button className="logout-trigger" onClick={logout}>Sign Out →</button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="tlogo" style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <img src="/logo.png" alt="RCL Logo" style={{height:'32px',width:'auto',objectFit:'contain'}} />
            <span className="tbrand"><strong>REWAJ</strong> <span style={{color:'#FB0202'}}>CORPORATE LIMITED</span></span>
          </div>
          <div className="tsearch"><span>🔍</span><input type="search" placeholder="Search data..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
          <div className="tactions"><button className="ibtn">🔔</button><button className="ibtn">❓</button><button className="pbtn" onClick={logout}>{userEmail()} ▾</button></div>
        </header>

        <div className="content">
          {notification && (
            <div style={{background:'#10B981',color:'white',padding:'12px 16px',borderRadius:'4px',marginBottom:'20px'}}>
              {notification}
            </div>
          )}
          {activeNav==='Dashboard'&&(
            <div>
              <div className="cheader"><div><h1 className="ctitle">Dashboard Overview</h1><p className="csub">Real-time performance metrics and quick management tools.</p></div><button className="btnprimary" onClick={()=>setActiveNav('Articles')}>+ Add New Article</button></div>
              <div className="srow">
                <div className="sbox"><div><p className="slabel">TOTAL ARTICLES</p><p className="sval">{stats?.total_articles||0}</p><p className="strend">Live database count</p></div><div className="sicon sicon--o">📄</div></div>
                <div className="sbox"><div><p className="slabel">TOTAL PROJECTS</p><p className="sval">{stats?.total_projects||0}</p><p className="strend" style={{color:'#10B981'}}>Portfolio active</p></div><div className="sicon sicon--b">📋</div></div>
                <div className="sbox"><div><p className="slabel">NEW MESSAGES</p><p className="sval">{String(stats?.unread_messages||0).padStart(2,'0')}</p><p className="strend" style={{color:'#EF4444'}}>Requires response</p></div><div className="sicon sicon--r">✉️</div></div>
              </div>
              <div className="dgrid">
                <div className="panel">
                  <div className="ph"><h3 className="ptitle">RECENT ARTICLES</h3><span className="live">● LIVE</span></div>
                  <table className="atable">
                    <thead><tr><th>ARTICLE TITLE</th><th>CATEGORY</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
                    <tbody>
                      {articles.slice(0, 3).map(a=>(
                        <tr key={a.id}>
                          <td><p className="atitle">{a.title}</p><p className="adate">{new Date(a.created_at).toLocaleDateString()}</p></td>
                          <td><span className="cpill">{a.category}</span></td>
                          <td><span className={`spill spill--${a.is_published?'pub':'draft'}`}>● {a.is_published?'Published':'Draft'}</span></td>
                          <td><button className="dicon" onClick={()=>deleteArticle(a.id)}>🗑</button></td>
                        </tr>
                      ))}
                      {articles.length===0 && <tr><td colSpan={4} style={{padding:'20px',textAlign:'center',color:'#94A3B8'}}>No articles found.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className="ipanel">
                  <div className="ph"><h3 className="ptitle">RECENT INBOX</h3><span className="ibadge">{stats?.unread_messages||0}</span></div>
                  <div>
                    {filteredMessages.slice(0, 3).map(msg=>(
                      <div key={msg.id} className="iitem" onClick={()=>{setSelectedMsg(msg);setActiveNav('Inbox');}}>
                        <div className="iavatar">{msg.name[0]}</div>
                        <div className="ibody">
                          <div className="imeta"><div><p className="iname">{msg.name}{msg.company ? ` (${msg.company})` : ''}</p><p className="iemail">{msg.email}</p></div><span className="itime">{new Date(msg.created_at).toLocaleDateString()}</span></div>
                          <p className="ipreview">{msg.message.substring(0, 70)}...</p>
                        </div>
                      </div>
                    ))}
                    {filteredMessages.length===0 && <p style={{padding:'20px',textAlign:'center',color:'#94A3B8'}}>No matched messages.</p>}
                  </div>
                  <button className="valltbn" onClick={()=>setActiveNav('Inbox')}>VIEW ALL NOTIFICATIONS</button>
                </div>
              </div>
            </div>
          )}

          {activeNav==='Inbox'&&(
            <div>
              <div className="cheader"><div><h1 className="ctitle">Message Inbox</h1><p className="csub">All contact submissions from the website.</p></div></div>
              <div className="inboxlayout">
                <div className="inboxlist">
                  {filteredMessages.length===0&&<p style={{padding:'24px',color:'#94A3B8',fontSize:'14px'}}>No matched messages.</p>}
                  {filteredMessages.map(msg=>(
                    <div key={msg.id} className={`msgrow${!msg.is_read?' unread':''}${selectedMsg?.id===msg.id?' selected':''}`} onClick={()=>{setSelectedMsg(msg);if(!msg.is_read)markRead(msg.id);}}>
                      <div className="msgav">{msg.name[0]}</div>
                      <div className="msgb"><div className="msgtop"><span className="msgname">{msg.name}{msg.company ? ` (${msg.company})` : ''}</span><span className="msgtime">{new Date(msg.created_at).toLocaleDateString()}</span></div><p className="msgsubj">{msg.subject||'General Inquiry'}</p><p className="msgprev">{msg.message.substring(0,80)}...</p></div>
                    </div>
                  ))}
                </div>
                <div className="msgdetail">
                  {selectedMsg?(
                    <>
                      <div className="mdheader"><div><h2 className="mdname">{selectedMsg.name}{selectedMsg.company ? ` (${selectedMsg.company})` : ''}</h2><a href={`mailto:${selectedMsg.email}`} className="mdemail">{selectedMsg.email}</a></div><button className="delbtn" onClick={()=>deleteMsg(selectedMsg.id)}>🗑 Delete</button></div>
                      <p className="mdsubj">{selectedMsg.subject||'General Inquiry'}</p>
                      <p className="mddate">{new Date(selectedMsg.created_at).toLocaleString()}</p>
                      <div className="mdbody">{selectedMsg.message}</div>
                      <a href={`mailto:${selectedMsg.email}?subject=Re: ${selectedMsg.subject}`} className="replylink">✉️ Reply via Email</a>
                    </>
                  ):<div className="emptydetail">Select a message to read</div>}
                </div>
              </div>
            </div>
          )}

          {activeNav==='Search'&&(
            <div>
              <div className="cheader"><div><h1 className="ctitle">Global Search</h1><p className="csub">Search across all content: messages, articles, and projects.</p></div></div>
              
              {searchQuery.trim() ? (
                <div className="dgrid">
                  {/* Messages Results */}
                  <div className="panel">
                    <div className="ph"><h3 className="ptitle">MESSAGES ({filteredMessages.length})</h3></div>
                    <div style={{maxHeight:'300px',overflowY:'auto'}}>
                      {filteredMessages.length === 0 ? (
                        <p style={{padding:'20px',textAlign:'center',color:'#94A3B8'}}>No matching messages.</p>
                      ) : (
                        filteredMessages.map(msg => (
                          <div key={msg.id} className={`msgrow${!msg.is_read?' unread':''}`} onClick={()=>{setSelectedMsg(msg);setActiveNav('Inbox');}} style={{margin:'0',borderBottom:'1px solid var(--border)'}}>
                            <div className="msgav">{msg.name[0]}</div>
                            <div className="msgb">
                              <div className="msgtop"><span className="msgname">{msg.name}{msg.company ? ` (${msg.company})` : ''}</span><span className="msgtime">{new Date(msg.created_at).toLocaleDateString()}</span></div>
                              <p className="msgsubj">{msg.subject||'General Inquiry'}</p>
                              <p className="msgprev">{msg.message.substring(0,60)}...</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Articles Results */}
                  <div className="panel">
                    <div className="ph"><h3 className="ptitle">ARTICLES ({filteredArticles.length})</h3></div>
                    <div style={{maxHeight:'300px',overflowY:'auto'}}>
                      {filteredArticles.length === 0 ? (
                        <p style={{padding:'20px',textAlign:'center',color:'#94A3B8'}}>No matching articles.</p>
                      ) : (
                        <table className="atable" style={{width:'100%'}}>
                          <tbody>
                            {filteredArticles.map(a => (
                              <tr key={a.id} style={{cursor:'pointer'}} onClick={()=>setActiveNav('Articles')}>
                                <td><p className="atitle">{a.title}</p><p className="adate">{a.category} • {new Date(a.created_at).toLocaleDateString()}</p></td>
                                <td><span className={`spill spill--${a.is_published?'pub':'draft'}`}>● {a.is_published?'Published':'Draft'}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                  {/* Projects Results */}
                  <div className="panel">
                    <div className="ph"><h3 className="ptitle">PROJECTS ({filteredProjects.length})</h3></div>
                    <div style={{maxHeight:'300px',overflowY:'auto'}}>
                      {filteredProjects.length === 0 ? (
                        <p style={{padding:'20px',textAlign:'center',color:'#94A3B8'}}>No matching projects.</p>
                      ) : (
                        <table className="atable" style={{width:'100%'}}>
                          <tbody>
                            {filteredProjects.map(p => (
                              <tr key={p.id} style={{cursor:'pointer'}} onClick={()=>setActiveNav('Projects')}>
                                <td><p className="atitle">{p.title}</p><p className="adate">{p.category} • {p.completion_year}</p></td>
                                <td><span className="cpill">{p.status || 'active'}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{textAlign:'center',padding:'60px 20px',color:'#94A3B8'}}>
                  <div style={{fontSize:'48px',marginBottom:'16px'}}>🔍</div>
                  <h3 style={{fontSize:'18px',marginBottom:'8px',color:'var(--text-heading)'}}>Start Searching</h3>
                  <p>Enter a search term in the top search bar to find content across all sections.</p>
                </div>
              )}
            </div>
          )}

          {activeNav==='Articles'&&(
            <div>
              <div className="cheader"><div><h1 className="ctitle">Blog Articles</h1><p className="csub">Manage all website articles.</p></div><button className="btnprimary" onClick={()=>setShowArticleForm(!showArticleForm)}>+ New Article</button></div>
              {showArticleForm && (
                <div className="panel" style={{marginBottom:'20px',padding:'20px'}}>
                  <h3 style={{marginBottom:'16px'}}>{editingArticle ? 'Edit Article' : 'Create New Article'}</h3>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Title</label><input value={articleForm.title} onChange={e=>setArticleForm(p=>({...p,title:e.target.value}))} placeholder="Article title" /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Slug</label><input value={articleForm.slug} onChange={e=>setArticleForm(p=>({...p,slug:e.target.value}))} placeholder="url-friendly-slug" /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Excerpt</label><textarea value={articleForm.excerpt} onChange={e=>setArticleForm(p=>({...p,excerpt:e.target.value}))} placeholder="Brief summary" rows={2} /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Author</label><input value={articleForm.author} onChange={e=>setArticleForm(p=>({...p,author:e.target.value}))} placeholder="Author name" /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Date</label><input type="date" value={articleForm.date} onChange={e=>setArticleForm(p=>({...p,date:e.target.value}))} /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Category</label><input value={articleForm.category} onChange={e=>setArticleForm(p=>({...p,category:e.target.value}))} placeholder="e.g. Technology, Business" /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Article Image</label><input type="file" accept="image/*" onChange={handleArticleImageChange} /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Content</label><textarea value={articleForm.content} onChange={e=>setArticleForm(p=>({...p,content:e.target.value}))} placeholder="Article content" rows={6} /></div>
                  <div style={{display:'flex',gap:'10px'}}>
                    <button className="btnprimary" onClick={createArticle}>{editingArticle ? 'Update Article' : 'Create Article'}</button>
                    <button onClick={()=>{setShowArticleForm(false);setEditingArticle(null);setArticleForm({title:'',category:'',content:'',excerpt:'',articleImage:'',author:'',slug:'',date:''});}} style={{background:'none',border:'1px solid #CBD5E1',color:'#64748B'}}>Cancel</button>
                  </div>
                </div>
              )}
              <div className="panel">
                <table className="atable" style={{width:'100%'}}>
                  <thead><tr><th>ARTICLE TITLE</th><th>CATEGORY</th><th>STATUS</th><th>DATE</th><th>ACTIONS</th></tr></thead>
                  <tbody>
                    {filteredArticles.map(a=>(
                      <tr key={a.id}>
                        <td><p className="atitle">{a.title}</p></td>
                        <td><span className="cpill">{a.category}</span></td>
                        <td><span className={`spill spill--${a.is_published?'pub':'draft'}`}>● {a.is_published?'Published':'Draft'}</span></td>
                        <td style={{fontSize:'13px',color:'#94A3B8'}}>{new Date(a.created_at).toLocaleDateString()}</td>
                        <td><button className="dicon" onClick={()=>editArticle(a)}>✏️</button><button className="dicon" onClick={()=>deleteArticle(a.id)}>🗑</button></td>
                      </tr>
                    ))}
                    {filteredArticles.length===0 && <tr><td colSpan={5} style={{padding:'40px',textAlign:'center',color:'#94A3B8'}}>No matching articles.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeNav==='Projects'&&(
            <div>
              <div className="cheader"><div><h1 className="ctitle">Projects</h1><p className="csub">Manage portfolio projects.</p></div><button className="btnprimary" onClick={()=>setShowProjectForm(!showProjectForm)}>+ New Project</button></div>
              {showProjectForm && (
                <div className="panel" style={{marginBottom:'20px',padding:'20px'}}>
                  <h3 style={{marginBottom:'16px'}}>{editingProject ? 'Edit Project' : 'Create New Project'}</h3>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Title</label><input value={projectForm.title} onChange={e=>setProjectForm(p=>({...p,title:e.target.value}))} placeholder="Project title" /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Client</label><input value={projectForm.client} onChange={e=>setProjectForm(p=>({...p,client:e.target.value}))} placeholder="Client name" /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Author</label><input value={projectForm.author} onChange={e=>setProjectForm(p=>({...p,author:e.target.value}))} placeholder="Author name" /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Project Year</label><input value={projectForm.projectYear} onChange={e=>setProjectForm(p=>({...p,projectYear:e.target.value}))} placeholder="2024" /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Project Image</label><input type="file" accept="image/*" onChange={handleProjectImageChange} /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Description</label><textarea value={projectForm.description} onChange={e=>setProjectForm(p=>({...p,description:e.target.value}))} placeholder="Project description" rows={4} /></div>
                  <div style={{display:'flex',gap:'10px'}}>
                    <button className="btnprimary" onClick={createProject}>{editingProject ? 'Update Project' : 'Create Project'}</button>
                    <button onClick={()=>{setShowProjectForm(false);setEditingProject(null);setProjectForm({title:'',client:'',description:'',projectImage:'',projectYear:'',author:''});}} style={{background:'none',border:'1px solid #CBD5E1',color:'#64748B'}}>Cancel</button>
                  </div>
                </div>
              )}
              <div className="panel">
                <table className="atable" style={{width:'100%'}}>
                  <thead><tr><th>PROJECT TITLE</th><th>CATEGORY</th><th>YEAR</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
                  <tbody>
                    {filteredProjects.map(p=>(
                      <tr key={p.id}>
                        <td><p className="atitle">{p.title}</p></td>
                        <td><span className="cpill">{p.category}</span></td>
                        <td style={{fontSize:'13px',color:'#94A3B8'}}>{p.completion_year}</td>
                        <td><select value={p.status || 'active'} onChange={e => updateProjectStatus(p.id, e.target.value)} style={{padding:'6px 10px',border:'1px solid #CBD5E1',borderRadius:'4px',fontSize:'13px',cursor:'pointer',background:'white'}}><option value="active">On-going</option><option value="executed">Executed</option></select></td>
                        <td><button className="dicon" onClick={()=>editProject(p)}>✏️</button><button className="dicon" onClick={()=>deleteProject(p.id)}>🗑</button></td>
                      </tr>
                    ))}
                    {filteredProjects.length===0 && <tr><td colSpan={5} style={{padding:'40px',textAlign:'center',color:'#94A3B8'}}>No matching projects.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeNav==='Newsletter'&&(
            <div>
              <div className="cheader"><div><h1 className="ctitle">Newsletter Management</h1><p className="csub">Send updates to newsletter subscribers.</p></div></div>
              <div className="dgrid">
                <div className="panel">
                  <div className="ph"><h3 className="ptitle">SUBSCRIBERS</h3><span className="live">{subscribers.length}</span></div>
                  <div style={{maxHeight:'300px',overflowY:'auto'}}>
                    {subscribers.length === 0 ? (
                      <p style={{padding:'20px',textAlign:'center',color:'#94A3B8'}}>No subscribers yet.</p>
                    ) : (
                      subscribers.map((sub: any, idx: number) => (
                        <div key={idx} style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <div>
                            <p style={{fontSize:'14px',fontWeight:600,color:'var(--text-heading)'}}>{sub.email}</p>
                            <p style={{fontSize:'12px',color:'var(--slate-400)'}}>{new Date(sub.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="panel">
                  <div className="ph"><h3 className="ptitle">SEND NEWSLETTER</h3></div>
                  <div style={{padding:'20px'}}>
                    <div className="fgroup" style={{marginBottom:'16px'}}>
                      <label>Subject</label>
                      <input 
                        value={newsletterSubject} 
                        onChange={e => setNewsletterSubject(e.target.value)} 
                        placeholder="Newsletter subject" 
                      />
                    </div>
                    <div className="fgroup" style={{marginBottom:'16px'}}>
                      <label>Content</label>
                      <textarea 
                        value={newsletterContent} 
                        onChange={e => setNewsletterContent(e.target.value)} 
                        placeholder="Newsletter content..." 
                        rows={8}
                      />
                    </div>
                    <button 
                      className="btnprimary" 
                      onClick={sendNewsletter} 
                      disabled={sendingNewsletter || !newsletterSubject.trim() || !newsletterContent.trim()}
                      style={{width:'100%'}}
                    >
                      {sendingNewsletter ? 'Sending...' : `Send to ${subscribers.length} Subscribers`}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeNav==='Settings'&&(
            <div>
              <div className="cheader"><div><h1 className="ctitle">Settings</h1><p className="csub">Manage account and website settings.</p></div></div>
              <div className="panel" style={{padding:'32px'}}>
                <h3 style={{fontFamily:'var(--font-display)',fontSize:'18px',fontWeight:800,marginBottom:'20px',color:'var(--text-heading)'}}>Account Information</h3>
                <div className="fr2"><div className="fgroup"><label>Email Address</label><input defaultValue={userEmail()||'admin@rewajcorporate.com'} readOnly /></div><div className="fgroup"><label>Full Name</label><input defaultValue="Admin User" readOnly /></div></div>
                <div className="fgroup"><label>Change Password (Coming Soon)</label><input type="password" placeholder="••••••••" disabled /></div>
                <button className="btnprimary" style={{marginTop:'8px', opacity: 0.5, cursor: 'not-allowed'}}>Save Changes</button>
                <div style={{marginTop:'32px',paddingTop:'32px',borderTop:'1px solid var(--border)'}}>
                  <h3 style={{fontFamily:'var(--font-display)',fontSize:'18px',fontWeight:800,marginBottom:'16px',color:'#EF4444'}}>Danger Zone</h3>
                  <button onClick={logout} style={{background:'none',border:'1.5px solid #EF4444',color:'#EF4444',padding:'10px 24px',borderRadius:'4px',fontWeight:600,cursor:'pointer',fontSize:'14px',transition:'all 0.2s'}}>Sign Out</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
