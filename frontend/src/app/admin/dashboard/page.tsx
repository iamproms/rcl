'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Stats { total_messages: number; unread_messages: number; total_articles: number; total_projects: number; }
interface Message { id: number; name: string; email: string; phone?: string; subject?: string; message: string; is_read: boolean; created_at: string; }
interface Article { id: number; title: string; category: string; is_published: boolean; created_at: string; }
interface Project { id: number; title: string; category: string; is_active: boolean; completion_year: string; }

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
  const [projectForm, setProjectForm] = useState({title:'',client:'',description:'',projectImage:'',projectYear:''});
  const [articleForm, setArticleForm] = useState({title:'',category:'',content:'',excerpt:'',articleImage:'',author:'',slug:''});
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [notification, setNotification] = useState('');

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

  const createArticle = async () => {
    if(!articleForm.title.trim()) return;
    try {
      const slug = articleForm.slug || articleForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog`,{
        method:'POST',
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
        const newArticle = await res.json();
        setArticles(prev=>[newArticle,...prev]);
        setArticleForm({title:'',category:'',content:'',excerpt:'',articleImage:'',author:'',slug:''});
        setShowArticleForm(false);
        setNotification('Article created successfully!');
        setTimeout(()=>setNotification(''),3000);
      }
    } catch(e){
      setNotification('Failed to create article');
      setTimeout(()=>setNotification(''),3000);
    }
  };

  const createProject = async () => {
    if(!projectForm.title.trim()) return;
    try {
      const slug = projectForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`,{
        method:'POST',
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
        const newProject = await res.json();
        setProjects(prev=>[newProject,...prev]);
        setProjectForm({title:'',client:'',description:'',projectImage:'',projectYear:''});
        setShowProjectForm(false);
        setNotification('Project created successfully!');
        setTimeout(()=>setNotification(''),3000);
      }
    } catch(e){
      setNotification('Failed to create project');
      setTimeout(()=>setNotification(''),3000);
    }
  };

  const logout = () => {localStorage.removeItem('rcl_token');localStorage.removeItem('rcl_user');router.push('/admin');};

  const navItems = [
    {icon:'📊',label:'Dashboard'},{icon:'📝',label:'Articles'},{icon:'🏗️',label:'Projects'},
    {icon:'✉️',label:'Inbox',badge:stats?.unread_messages},{icon:'⚙️',label:'Settings'},
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
          <div className="tsearch"><span>🔍</span><input type="search" placeholder="Search data..."/></div>
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
                    {messages.slice(0, 3).map(msg=>(
                      <div key={msg.id} className="iitem" onClick={()=>{setSelectedMsg(msg);setActiveNav('Inbox');}}>
                        <div className="iavatar">{msg.name[0]}</div>
                        <div className="ibody">
                          <div className="imeta"><div><p className="iname">{msg.name}</p><p className="iemail">{msg.email}</p></div><span className="itime">{new Date(msg.created_at).toLocaleDateString()}</span></div>
                          <p className="ipreview">{msg.message.substring(0, 70)}...</p>
                        </div>
                      </div>
                    ))}
                    {messages.length===0 && <p style={{padding:'20px',textAlign:'center',color:'#94A3B8'}}>Inbox is empty.</p>}
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
                  {messages.length===0&&<p style={{padding:'24px',color:'#94A3B8',fontSize:'14px'}}>No messages yet.</p>}
                  {messages.map(msg=>(
                    <div key={msg.id} className={`msgrow${!msg.is_read?' unread':''}${selectedMsg?.id===msg.id?' selected':''}`} onClick={()=>{setSelectedMsg(msg);if(!msg.is_read)markRead(msg.id);}}>
                      <div className="msgav">{msg.name[0]}</div>
                      <div className="msgb"><div className="msgtop"><span className="msgname">{msg.name}</span><span className="msgtime">{new Date(msg.created_at).toLocaleDateString()}</span></div><p className="msgsubj">{msg.subject||'General Inquiry'}</p><p className="msgprev">{msg.message.substring(0,80)}...</p></div>
                    </div>
                  ))}
                </div>
                <div className="msgdetail">
                  {selectedMsg?(
                    <>
                      <div className="mdheader"><div><h2 className="mdname">{selectedMsg.name}</h2><a href={`mailto:${selectedMsg.email}`} className="mdemail">{selectedMsg.email}</a></div><button className="delbtn" onClick={()=>deleteMsg(selectedMsg.id)}>🗑 Delete</button></div>
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

          {activeNav==='Articles'&&(
            <div>
              <div className="cheader"><div><h1 className="ctitle">Blog Articles</h1><p className="csub">Manage all website articles.</p></div><button className="btnprimary" onClick={()=>setShowArticleForm(!showArticleForm)}>+ New Article</button></div>
              {showArticleForm && (
                <div className="panel" style={{marginBottom:'20px',padding:'20px'}}>
                  <h3 style={{marginBottom:'16px'}}>Create New Article</h3>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Title</label><input value={articleForm.title} onChange={e=>setArticleForm(p=>({...p,title:e.target.value}))} placeholder="Article title" /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Slug</label><input value={articleForm.slug} onChange={e=>setArticleForm(p=>({...p,slug:e.target.value}))} placeholder="url-friendly-slug" /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Excerpt</label><textarea value={articleForm.excerpt} onChange={e=>setArticleForm(p=>({...p,excerpt:e.target.value}))} placeholder="Brief summary" rows={2} /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Author</label><input value={articleForm.author} onChange={e=>setArticleForm(p=>({...p,author:e.target.value}))} placeholder="Author name" /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Category</label><input value={articleForm.category} onChange={e=>setArticleForm(p=>({...p,category:e.target.value}))} placeholder="e.g. Technology, Business" /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Article Image URL</label><input value={articleForm.articleImage} onChange={e=>setArticleForm(p=>({...p,articleImage:e.target.value}))} placeholder="https://example.com/image.jpg" /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Content</label><textarea value={articleForm.content} onChange={e=>setArticleForm(p=>({...p,content:e.target.value}))} placeholder="Article content" rows={6} /></div>
                  <div style={{display:'flex',gap:'10px'}}>
                    <button className="btnprimary" onClick={createArticle}>Create Article</button>
                    <button onClick={()=>setShowArticleForm(false)} style={{background:'none',border:'1px solid #CBD5E1',color:'#64748B'}}>Cancel</button>
                  </div>
                </div>
              )}
              <div className="panel">
                <table className="atable" style={{width:'100%'}}>
                  <thead><tr><th>ARTICLE TITLE</th><th>CATEGORY</th><th>STATUS</th><th>DATE</th><th>ACTIONS</th></tr></thead>
                  <tbody>
                    {articles.map(a=>(
                      <tr key={a.id}>
                        <td><p className="atitle">{a.title}</p></td>
                        <td><span className="cpill">{a.category}</span></td>
                        <td><span className={`spill spill--${a.is_published?'pub':'draft'}`}>● {a.is_published?'Published':'Draft'}</span></td>
                        <td style={{fontSize:'13px',color:'#94A3B8'}}>{new Date(a.created_at).toLocaleDateString()}</td>
                        <td><button className="dicon" onClick={()=>deleteArticle(a.id)}>🗑</button></td>
                      </tr>
                    ))}
                    {articles.length===0 && <tr><td colSpan={5} style={{padding:'40px',textAlign:'center',color:'#94A3B8'}}>No articles in database.</td></tr>}
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
                  <h3 style={{marginBottom:'16px'}}>Create New Project</h3>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Title</label><input value={projectForm.title} onChange={e=>setProjectForm(p=>({...p,title:e.target.value}))} placeholder="Project title" /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Client</label><input value={projectForm.client} onChange={e=>setProjectForm(p=>({...p,client:e.target.value}))} placeholder="Client name" /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Project Year</label><input value={projectForm.projectYear} onChange={e=>setProjectForm(p=>({...p,projectYear:e.target.value}))} placeholder="2024" /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Project Image URL</label><input value={projectForm.projectImage} onChange={e=>setProjectForm(p=>({...p,projectImage:e.target.value}))} placeholder="https://example.com/image.jpg" /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Description</label><textarea value={projectForm.description} onChange={e=>setProjectForm(p=>({...p,description:e.target.value}))} placeholder="Project description" rows={4} /></div>
                  <div style={{display:'flex',gap:'10px'}}>
                    <button className="btnprimary" onClick={createProject}>Create Project</button>
                    <button onClick={()=>setShowProjectForm(false)} style={{background:'none',border:'1px solid #CBD5E1',color:'#64748B'}}>Cancel</button>
                  </div>
                </div>
              )}
              <div className="panel">
                <table className="atable" style={{width:'100%'}}>
                  <thead><tr><th>PROJECT TITLE</th><th>CATEGORY</th><th>YEAR</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
                  <tbody>
                    {projects.map(p=>(
                      <tr key={p.id}>
                        <td><p className="atitle">{p.title}</p></td>
                        <td><span className="cpill">{p.category}</span></td>
                        <td style={{fontSize:'13px',color:'#94A3B8'}}>{p.completion_year}</td>
                        <td><span className={`spill spill--${p.is_active?'pub':'draft'}`}>● {p.is_active?'Active':'Inactive'}</span></td>
                        <td><button className="dicon" onClick={()=>deleteProject(p.id)}>🗑</button></td>
                      </tr>
                    ))}
                    {projects.length===0 && <tr><td colSpan={5} style={{padding:'40px',textAlign:'center',color:'#94A3B8'}}>No projects found.</td></tr>}
                  </tbody>
                </table>
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
