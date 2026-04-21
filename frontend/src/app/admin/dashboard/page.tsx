'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Stats { total_messages: number; unread_messages: number; total_articles: number; total_projects: number; }
interface Message { id: number; name: string; email: string; company?: string; phone?: string; subject?: string; message: string; is_read: boolean; created_at: string; }
interface Article { id: number; title: string; slug: string; category: string; content?: string; excerpt?: string; author?: string; featured_image?: string; is_published: boolean; created_at: string; }
interface Project { id: number; title: string; slug: string; category: string; description?: string; client_name?: string; completion_year: string; featured_image?: string; status?: string; is_active: boolean; }
interface Job { id: number; title: string; department: string; location: string; job_type: string; summary?: string; responsibilities: string; requirements: string; qualifications: string; application_deadline: string; expiry_date?: string; internal_notes?: string; status: string; created_at: string; updated_at?: string; }
interface JobApplication { id: number; job_id: number; full_name: string; email: string; phone: string; dob: string; gender: string; nationality: string; highest_qualification: string; institution: string; course_of_study: string; nysc_status: string; cv_path: string; certifications_path?: string; created_at: string; }

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
  const [projectForm, setProjectForm] = useState({title:'',client:'',description:'',projectImage:'',projectYear:'',category:'',tag:''});
  const [articleForm, setArticleForm] = useState({title:'',category:'',content:'',excerpt:'',articleImage:'',author:'',slug:'',date:'', is_published: false});
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
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobForm, setJobForm] = useState({title:'',department:'',location:'',job_type:'',summary:'',responsibilities:'',requirements:'',qualifications:'',application_deadline:'',expiry_date:'',internal_notes:'',status:'Draft'});
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job|null>(null);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication|null>(null);
  const [expandedAppId, setExpandedAppId] = useState<number|null>(null);
  
  const [profileForm, setProfileForm] = useState({full_name:'',email:''});
  const [passwordForm, setPasswordForm] = useState({old_password:'',new_password:'',confirm_password:''});
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [lastSeenAppId, setLastSeenAppId] = useState<number>(0);

  const token = () => typeof window!=='undefined' ? localStorage.getItem('rcl_token') : null;
  const userEmail = () => typeof window!=='undefined' ? localStorage.getItem('rcl_user') : '';
  const hdrs = () => ({
    'Authorization': `Bearer ${token()}`,
    'Content-Type': 'application/json'
  });

  const resolveImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    if (url.startsWith('/images/')) return url; // Seeder images
    
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
    // Ensure url starts with a slash
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
    return `${apiBase}${normalizedUrl}`;
  };

  const stripTags = (html: string) => {
    if (!html) return '';
    // Replace <p> tags with newlines, remove others
    return html.replace(/<p>/gi, '').replace(/<\/p>/gi, '\n').replace(/<br\s*\/?>/gi, '\n').trim();
  };

  const wrapTags = (text: string) => {
    if (!text) return '';
    return text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.startsWith('<') ? line : `<p>${line}</p>`)
      .join('');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('rcl_last_seen_app_id');
      if (stored) setLastSeenAppId(parseInt(stored));
    }
  }, []);

  useEffect(() => {
    if (activeNav === 'Jobs' && applications.length > 0) {
      const currentMax = Math.max(...applications.map(a => a.id));
      if (currentMax > lastSeenAppId) {
        setLastSeenAppId(currentMax);
        localStorage.setItem('rcl_last_seen_app_id', currentMax.toString());
      }
    }
  }, [activeNav, applications, lastSeenAppId]);

  const fetchData = useCallback(async () => {
    const tkn = typeof window !== 'undefined' ? localStorage.getItem('rcl_token') : null;
    if (!tkn) { router.push('/admin'); return; }
    const _hdrs = {
      'Authorization': `Bearer ${tkn}`,
      'Content-Type': 'application/json'
    };
    try {
      const [sRes, mRes, aRes, pRes, jRes, appRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`, { headers: _hdrs }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/messages`, { headers: _hdrs }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog`, { headers: _hdrs }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`, { headers: _hdrs }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/careers/admin/jobs`, { headers: _hdrs }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/careers/admin/applications`, { headers: _hdrs }),
      ]);
      if (sRes.status === 401) { router.push('/admin'); return; }
      setStats(await sRes.json());
      setMessages(await mRes.json());
      setArticles(await aRes.json());
      setProjects(await pRes.json());
      setJobs(await jRes.json());
      setApplications(await appRes.json());
    } catch(e) {} finally { setLoading(false); }
  }, []);

  useEffect(()=>{fetchData();},[]);

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

  const updateArticleStatus = async (id: number, published: boolean) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog/${id}`, {
        method: 'PUT',
        headers: hdrs(),
        body: JSON.stringify({ is_published: published })
      });
      if (res.ok) {
        const updated = await res.json();
        setArticles(prev => prev.map(a => a.id === id ? { ...a, is_published: updated.is_published } : a));
        setNotification(`Article ${published ? 'published' : 'moved to draft'}!`);
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (e) {
      setNotification('Error updating article status');
      setTimeout(() => setNotification(''), 3000);
    }
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

  const deleteJob = async (id:number) => {
    if(!confirm('Delete this job?')) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/careers/${id}`,{method:'DELETE',headers:hdrs()});
    setJobs(prev=>prev.filter(j=>j.id!==id));
  };
  
  const updateJobStatus = async (id: number, newStatus: string) => {
    try {
      const targetJob = jobs.find(j => j.id === id);
      if (!targetJob) return;
      const payload = { ...targetJob, status: newStatus };
      if (!payload.expiry_date) delete (payload as any).expiry_date;
      if (!payload.internal_notes) delete (payload as any).internal_notes;
      if (!(payload as any).updated_at) delete (payload as any).updated_at;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/careers/${id}`, {
        method: 'PUT',
        headers: hdrs(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        setJobs(prev => prev.map(j => j.id === id ? { ...j, status: updated.status } : j));
        setNotification('Job status updated!');
        setTimeout(() => setNotification(''), 3000);
      }
    } catch(e) {}
  };

  const deleteApplication = async (id:number) => {
    if(!confirm('Delete this application?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/careers/admin/applications/${id}`,{method:'DELETE',headers:hdrs()});
      if(res.ok) {
        setApplications(prev=>prev.filter(a=>a.id!==id));
        if(expandedAppId===id) setExpandedAppId(null);
        setNotification('Application deleted');
        setTimeout(()=>setNotification(''),3000);
      }
    } catch(e){}
  };

  const clearAllApplications = async () => {
    if(!confirm('Are you sure you want to delete ALL applications? This cannot be undone.')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/careers/admin/applications/clear-all`,{method:'DELETE',headers:hdrs()});
      if(res.ok) {
        setApplications([]);
        setExpandedAppId(null);
        setNotification('All applications cleared');
        setTimeout(()=>setNotification(''),3000);
      }
    } catch(e){}
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/profile`, { headers: hdrs() });
      if (res.ok) {
        const data = await res.json();
        setProfileForm({ full_name: data.full_name, email: data.email });
      }
    } catch(e){}
  };

  const updateProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/profile`, {
        method: 'PATCH',
        headers: hdrs(),
        body: JSON.stringify({ full_name: profileForm.full_name, email: profileForm.email })
      });
      if (res.ok) {
        const data = await res.json();
        setNotification('Profile updated successfully!');
        if (typeof window !== 'undefined') localStorage.setItem('rcl_user', data.email);
        setTimeout(()=>setNotification(''),3000);
      }
    } catch(e){} finally { setSavingProfile(false); }
  };

  const changePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setNotification('Passwords do not match');
      setTimeout(()=>setNotification(''),3000);
      return;
    }
    setChangingPass(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/profile/password`, {
        method: 'PATCH',
        headers: hdrs(),
        body: JSON.stringify({ old_password: passwordForm.old_password, new_password: passwordForm.new_password })
      });
      if (res.ok) {
        setNotification('Password changed successfully!');
        setPasswordForm({old_password:'',new_password:'',confirm_password:''});
        setTimeout(()=>setNotification(''),3000);
      } else {
        const err = await res.json();
        setNotification(err.detail || 'Change password failed');
        setTimeout(()=>setNotification(''),3000);
      }
    } catch(e){} finally { setChangingPass(false); }
  };

  const createJob = async () => {
    if(!jobForm.title.trim() || !jobForm.application_deadline) return;
    try {
      const method = editingJob ? 'PUT' : 'POST';
      const url = editingJob ? `${process.env.NEXT_PUBLIC_API_URL}/api/careers/${editingJob.id}` : `${process.env.NEXT_PUBLIC_API_URL}/api/careers/`;
      
      const payload = { ...jobForm };
      if (!payload.expiry_date) delete (payload as any).expiry_date;
      if (!payload.internal_notes) delete (payload as any).internal_notes;

      const res = await fetch(url, {
        method, headers: hdrs(), body: JSON.stringify(payload)
      });
      if(res.ok) {
        const updatedJob = await res.json();
        if(editingJob) setJobs(prev=>prev.map(j=>j.id===editingJob.id?updatedJob:j));
        else setJobs(prev=>[updatedJob,...prev]);
        setNotification(`Job ${editingJob?'updated':'created'} successfully!`);
        setShowJobForm(false);
        setEditingJob(null);
        setJobForm({title:'',department:'',location:'',job_type:'',summary:'',responsibilities:'',requirements:'',qualifications:'',application_deadline:'',expiry_date:'',internal_notes:'',status:'Draft'});
        setTimeout(()=>setNotification(''),3000);
      }
    } catch(e){}
  };

  const createArticleStatus = async (id: number, published: boolean) => {
    // This is handled via the edit function or updateArticleStatus
  };

  const editJob = (job: Job) => {
    setJobForm({
      title: job.title, department: job.department, location: job.location, job_type: job.job_type,
      summary: job.summary || '', responsibilities: job.responsibilities, requirements: job.requirements, qualifications: job.qualifications,
      application_deadline: job.application_deadline, expiry_date: job.expiry_date || '', internal_notes: job.internal_notes || '', status: job.status
    });
    setEditingJob(job);
    setShowJobForm(true);
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
          content: wrapTags(articleForm.content),
          author: articleForm.author,
          category: articleForm.category || 'General',
          featured_image: articleForm.articleImage,
          is_published: articleForm.is_published
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
        setArticleForm({title:'',category:'',content:'',excerpt:'',articleImage:'',author:'',slug:'',date:'', is_published: false});
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
          category: projectForm.category,
          tag: projectForm.tag,
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
        setProjectForm({title:'',client:'',description:'',projectImage:'',projectYear:'',category:'',tag:''});
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
          category: fullArticle.category || '',
          content: stripTags(fullArticle.content || ''),
          excerpt: fullArticle.excerpt || '',
          articleImage: fullArticle.featured_image || '',
          author: fullArticle.author || '',
          slug: fullArticle.slug || '',
          date: '',
          is_published: fullArticle.is_published || false
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
          category: fullProject.category || '',
          tag: fullProject.tag || ''
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
  }, []);

  useEffect(() => {
    if (activeNav === 'Newsletter') {
      fetchSubscribers();
    }
    if (activeNav === 'Settings') {
      fetchProfile();
    }
  }, [activeNav]);

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
    if (file.size > 4.5 * 1024 * 1024) {
      setNotification(`File too large (${(file.size/1024/1024).toFixed(1)}MB). Max 4.5MB allowed.`);
      setTimeout(() => setNotification(''), 4000);
      return null;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/upload`;
      console.log("Uploading to:", url, "Size:", file.size);
      
      const res = await fetch(url, {
        method: 'POST',
        headers: {'Authorization': `Bearer ${token()}`},
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        return data.url;
      } else {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson.detail || `Server error ${res.status}`;
        console.error("Upload failed:", res.status, errJson);
        setNotification(`Upload failed: ${errMsg}`);
        setTimeout(() => setNotification(''), 5000);
        return null;
      }
    } catch (e: any) {
      console.error("Upload network exception:", e);
      setNotification(`Network error: ${e.message}`);
      setTimeout(() => setNotification(''), 4000);
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
    {icon:'💼',label:'Jobs',badge:applications.filter(a => a.id > lastSeenAppId).length},{icon:'✉️',label:'Inbox',badge:stats?.unread_messages},{icon:'📧',label:'Newsletter'},{icon:'⚙️',label:'Settings'},
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
                  <div className="fgroup" style={{marginBottom:'12px'}}>
                    <label>Article Image</label>
                    <input type="file" accept="image/*" onChange={handleArticleImageChange} />
                    {articleForm.articleImage && (
                      <div style={{marginTop:'8px', height:'100px', width:'150px', border:'1px solid #E2E8F0', borderRadius:'4px', overflow:'hidden', background:`url(${resolveImageUrl(articleForm.articleImage)}) center/cover` }} />
                    )}
                  </div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Content</label><textarea value={articleForm.content} onChange={e=>setArticleForm(p=>({...p,content:e.target.value}))} placeholder="Article content" rows={6} /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}>
                    <label>Status</label>
                    <select 
                      value={articleForm.is_published ? 'Published' : 'Draft'} 
                      onChange={e => setArticleForm(p => ({ ...p, is_published: e.target.value === 'Published' }))}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>
                  <div style={{display:'flex',gap:'10px'}}>
                    <button className="btnprimary" onClick={createArticle}>{editingArticle ? 'Update Article' : 'Create Article'}</button>
                    <button onClick={()=>{setShowArticleForm(false);setEditingArticle(null);setArticleForm({title:'',category:'',content:'',excerpt:'',articleImage:'',author:'',slug:'',date:'', is_published: false});}} style={{background:'none',border:'1px solid #CBD5E1',color:'#64748B'}}>Cancel</button>
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
                        <td>
                          <select 
                            value={a.is_published ? 'Published' : 'Draft'} 
                            onChange={(e) => updateArticleStatus(a.id, e.target.value === 'Published')}
                            className={`spill spill--${a.is_published?'pub':'draft'}`}
                            style={{ border: 'none', cursor: 'pointer', outline: 'none', padding: '4px 8px' }}
                          >
                            <option value="Draft">Draft</option>
                            <option value="Published">Published</option>
                          </select>
                        </td>
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
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Category</label><input value={projectForm.category} onChange={e=>setProjectForm(p=>({...p,category:e.target.value}))} placeholder="e.g. Technical Services" /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Tag</label><input value={projectForm.tag} onChange={e=>setProjectForm(p=>({...p,tag:e.target.value}))} placeholder="e.g. MAINTENANCE" /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Completion Year</label><input value={projectForm.projectYear} onChange={e=>setProjectForm(p=>({...p,projectYear:e.target.value}))} placeholder="2024" /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}>
                    <label>Project Image</label>
                    <input type="file" accept="image/*" onChange={handleProjectImageChange} />
                    {projectForm.projectImage && (
                      <div style={{marginTop:'8px', height:'100px', width:'150px', border:'1px solid #E2E8F0', borderRadius:'4px', overflow:'hidden', background:`url(${resolveImageUrl(projectForm.projectImage)}) center/cover` }} />
                    )}
                  </div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Description</label><textarea value={projectForm.description} onChange={e=>setProjectForm(p=>({...p,description:e.target.value}))} placeholder="Project description" rows={4} /></div>
                  <div style={{display:'flex',gap:'10px'}}>
                    <button className="btnprimary" onClick={createProject}>{editingProject ? 'Update Project' : 'Create Project'}</button>
                    <button onClick={()=>{setShowProjectForm(false);setEditingProject(null);setProjectForm({title:'',client:'',description:'',projectImage:'',projectYear:'',category:'',tag:''});}} style={{background:'none',border:'1px solid #CBD5E1',color:'#64748B'}}>Cancel</button>
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

          {activeNav==='Jobs'&&(
            <div>
              <div className="cheader"><div><h1 className="ctitle">Careers & Jobs</h1><p className="csub">Manage job postings and view applications.</p></div><button className="btnprimary" onClick={()=>setShowJobForm(!showJobForm)}>+ New Job</button></div>
              {showJobForm && (
                <div className="panel" style={{marginBottom:'20px',padding:'20px'}}>
                  <h3 style={{marginBottom:'16px'}}>{editingJob ? 'Edit Job' : 'Create New Job'}</h3>
                  <div className="fr2">
                    <div className="fgroup" style={{marginBottom:'12px'}}><label>Title *</label><input value={jobForm.title} onChange={e=>setJobForm(p=>({...p,title:e.target.value}))} placeholder="Job Title" /></div>
                    <div className="fgroup" style={{marginBottom:'12px'}}><label>Location *</label><input value={jobForm.location} onChange={e=>setJobForm(p=>({...p,location:e.target.value}))} placeholder="Port Harcourt, Nigeria" /></div>
                  </div>
                  <div className="fr2">
                    <div className="fgroup" style={{marginBottom:'12px'}}><label>Department *</label><input value={jobForm.department} onChange={e=>setJobForm(p=>({...p,department:e.target.value}))} placeholder="Engineering" /></div>
                    <div className="fgroup" style={{marginBottom:'12px'}}><label>Job Type *</label><input value={jobForm.job_type} onChange={e=>setJobForm(p=>({...p,job_type:e.target.value}))} placeholder="Full-Time" /></div>
                  </div>
                  <div className="fr2">
                    <div className="fgroup" style={{marginBottom:'12px'}}><label>Application Deadline *</label><input type="date" value={jobForm.application_deadline} onChange={e=>setJobForm(p=>({...p,application_deadline:e.target.value}))} /></div>
                    <div className="fgroup" style={{marginBottom:'12px'}}><label>Status</label><select value={jobForm.status} onChange={e=>setJobForm(p=>({...p,status:e.target.value}))} style={{padding:'10px',border:'1px solid #CBD5E1',borderRadius:'4px'}}><option value="Draft">Draft</option><option value="Published">Published</option><option value="Archived">Archived</option></select></div>
                  </div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Job Summary</label><textarea value={jobForm.summary} onChange={e=>setJobForm(p=>({...p,summary:e.target.value}))} placeholder="A short 1-2 sentence overview of the role" rows={2} /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Responsibilities *</label><textarea value={jobForm.responsibilities} onChange={e=>setJobForm(p=>({...p,responsibilities:e.target.value}))} placeholder="List of responsibilities" rows={3} /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Requirements *</label><textarea value={jobForm.requirements} onChange={e=>setJobForm(p=>({...p,requirements:e.target.value}))} placeholder="List of requirements" rows={3} /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Qualifications *</label><textarea value={jobForm.qualifications} onChange={e=>setJobForm(p=>({...p,qualifications:e.target.value}))} placeholder="Qualifications" rows={2} /></div>
                  <div className="fgroup" style={{marginBottom:'12px'}}><label>Internal Notes</label><textarea value={jobForm.internal_notes} onChange={e=>setJobForm(p=>({...p,internal_notes:e.target.value}))} placeholder="For internal HR use" rows={2} /></div>
                  <div style={{display:'flex',gap:'10px'}}>
                    <button className="btnprimary" onClick={createJob}>{editingJob ? 'Update Job' : 'Create Job'}</button>
                    <button onClick={()=>{setShowJobForm(false);setEditingJob(null);setJobForm({title:'',department:'',location:'',job_type:'',summary:'',responsibilities:'',requirements:'',qualifications:'',application_deadline:'',expiry_date:'',internal_notes:'',status:'Draft'});}} style={{background:'none',border:'1px solid #CBD5E1',color:'#64748B'}}>Cancel</button>
                  </div>
                </div>
              )}
              
              <div className="panel" style={{marginBottom:'24px'}}>
                <div className="ph"><h3 className="ptitle">JOB POSTINGS</h3></div>
                <table className="atable" style={{width:'100%'}}>
                  <thead><tr><th>JOB TITLE</th><th>DEPARTMENT</th><th>LOCATION</th><th>DEADLINE</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
                  <tbody>
                    {jobs.map(j=>(
                      <tr key={j.id}>
                        <td><p className="atitle">{j.title}</p></td>
                        <td><span className="cpill">{j.department}</span></td>
                        <td><span className="cpill" style={{background:'#F1F5F9',color:'#475569'}}>{j.location}</span></td>
                        <td style={{fontSize:'13px',color:'#94A3B8'}}>{new Date(j.application_deadline).toLocaleDateString()}</td>
                        <td><select value={j.status} onChange={e => updateJobStatus(j.id, e.target.value)} style={{padding:'6px 10px',border:'1px solid #CBD5E1',borderRadius:'4px',fontSize:'13px',cursor:'pointer',background:'white'}}><option value="Draft">Draft</option><option value="Published">Published</option><option value="Archived">Archived</option></select></td>
                        <td><button className="dicon" onClick={()=>editJob(j)}>✏️</button><button className="dicon" onClick={()=>deleteJob(j.id)}>🗑</button></td>
                      </tr>
                    ))}
                    {jobs.length===0 && <tr><td colSpan={6} style={{padding:'40px',textAlign:'center',color:'#94A3B8'}}>No job postings found.</td></tr>}
                  </tbody>
                </table>
              </div>

              <div className="panel">
                <div className="ph">
                  <h3 className="ptitle">JOB APPLICATIONS ({applications.length})</h3>
                  {applications.length > 0 && (
                    <button 
                      onClick={clearAllApplications}
                      style={{background:'#FEF2F2',color:'#EF4444',border:'1px solid #FEE2E2',padding:'6px 12px',borderRadius:'4px',fontSize:'12px',fontWeight:700,cursor:'pointer'}}
                    >
                      CLEAR ALL
                    </button>
                  )}
                </div>
                <table className="atable" style={{width:'100%'}}>
                  <thead><tr><th>APPLICANT</th><th>APPLIED FOR</th><th>DEGREE</th><th>NYSC</th><th>DATE</th><th>ACTIONS</th></tr></thead>
                  <tbody>
                    {applications.map(app=>(
                      <React.Fragment key={app.id}>
                        <tr style={{cursor:'pointer'}} onClick={()=>setExpandedAppId(expandedAppId===app.id?null:app.id)}>
                          <td><p className="atitle">{app.full_name}</p><a href={`mailto:${app.email}`} style={{fontSize:'12px',color:'#3B82F6'}} onClick={e=>e.stopPropagation()}>{app.email}</a></td>
                          <td><span className="cpill" style={{background:'#FEF2F2',color:'#FB0202'}}>{app.job_id ? (jobs.find(j=>j.id===app.job_id)?.title || `Job #${app.job_id}`) : 'Talent Pool'}</span></td>
                          <td style={{fontSize:'13px'}}>{app.highest_qualification}</td>
                          <td><span className="cpill" style={{background:app.nysc_status==='YES'?'#ECFDF5':'#F8FAFC',color:app.nysc_status==='YES'?'#10B981':'#475569'}}>{app.nysc_status}</span></td>
                          <td style={{fontSize:'13px',color:'#94A3B8'}}>{new Date(app.created_at).toLocaleDateString()}</td>
                          <td>
                            <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
                                <a href={resolveImageUrl(app.cv_path)} target="_blank" rel="noreferrer" style={{color:'#6366F1',fontSize:'13px',textDecoration:'none',fontWeight:600}} onClick={e=>e.stopPropagation()}>CV ↗</a>
                                {app.certifications_path && <a href={resolveImageUrl(app.certifications_path)} target="_blank" rel="noreferrer" style={{color:'#6366F1',fontSize:'13px',textDecoration:'none',fontWeight:600}} onClick={e=>e.stopPropagation()}>Cert ↗</a>}
                                <button className="dicon" style={{color:'#EF4444'}} onClick={(e)=>{e.stopPropagation(); deleteApplication(app.id);}}>🗑</button>
                                <span style={{fontSize:'14px',color:'#94A3B8'}}>{expandedAppId===app.id?'▴':'▾'}</span>
                            </div>
                          </td>
                        </tr>
                        {expandedAppId === app.id && (
                          <tr>
                            <td colSpan={6} style={{padding:'20px',background:'#F8FAFC'}}>
                               <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))',gap:'20px'}}>
                                  <div>
                                    <p style={{fontSize:'11px',fontWeight:700,color:'#94A3B8',marginBottom:'4px'}}>CONTACT</p>
                                    <p style={{fontSize:'13.5px'}}>{app.phone}</p>
                                  </div>
                                  <div>
                                    <p style={{fontSize:'11px',fontWeight:700,color:'#94A3B8',marginBottom:'4px'}}>NATIONALITY / GENDER</p>
                                    <p style={{fontSize:'13.5px'}}>{app.nationality} • {app.gender}</p>
                                  </div>
                                  <div>
                                    <p style={{fontSize:'11px',fontWeight:700,color:'#94A3B8',marginBottom:'4px'}}>DATE OF BIRTH</p>
                                    <p style={{fontSize:'13.5px'}}>{new Date(app.dob).toLocaleDateString()}</p>
                                  </div>
                                  <div>
                                    <p style={{fontSize:'11px',fontWeight:700,color:'#94A3B8',marginBottom:'4px'}}>INSTITUTION / COURSE</p>
                                    <p style={{fontSize:'13.5px',fontWeight:600}}>{app.institution}</p>
                                    <p style={{fontSize:'12px',color:'#64748B'}}>{app.course_of_study}</p>
                                  </div>
                               </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                    {applications.length===0 && <tr><td colSpan={6} style={{padding:'40px',textAlign:'center',color:'#94A3B8'}}>No applications received yet.</td></tr>}
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
              <div className="panel" style={{padding:'32px', maxWidth: '800px'}}>
                <h3 style={{fontFamily:'var(--font-display)',fontSize:'18px',fontWeight:800,marginBottom:'20px',color:'var(--text-heading)'}}>Account Information</h3>
                <div className="fr2">
                  <div className="fgroup">
                    <label>Email Address</label>
                    <input value={profileForm.email} onChange={e=>setProfileForm(p=>({...p,email:e.target.value}))} placeholder="admin@rewajcorporate.com" />
                  </div>
                  <div className="fgroup">
                    <label>Full Name</label>
                    <input value={profileForm.full_name} onChange={e=>setProfileForm(p=>({...p,full_name:e.target.value}))} placeholder="Admin User" />
                  </div>
                </div>
                <button className="btnprimary" style={{marginTop:'16px'}} onClick={updateProfile} disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Update Profile'}
                </button>

                <div style={{marginTop:'40px',paddingTop:'40px',borderTop:'1px solid var(--border)'}}>
                  <h3 style={{fontFamily:'var(--font-display)',fontSize:'18px',fontWeight:800,marginBottom:'20px',color:'var(--text-heading)'}}>Change Password</h3>
                  <div className="fgroup" style={{marginBottom:'16px'}}>
                    <label>Current Password</label>
                    <input type="password" value={passwordForm.old_password} onChange={e=>setPasswordForm(p=>({...p,old_password:e.target.value}))} placeholder="••••••••" />
                  </div>
                  <div className="fr2">
                    <div className="fgroup">
                      <label>New Password</label>
                      <input type="password" value={passwordForm.new_password} onChange={e=>setPasswordForm(p=>({...p,new_password:e.target.value}))} placeholder="••••••••" />
                    </div>
                    <div className="fgroup">
                      <label>Confirm New Password</label>
                      <input type="password" value={passwordForm.confirm_password} onChange={e=>setPasswordForm(p=>({...p,confirm_password:e.target.value}))} placeholder="••••••••" />
                    </div>
                  </div>
                  <button className="btnprimary" style={{marginTop:'16px'}} onClick={changePassword} disabled={changingPass}>
                    {changingPass ? 'Checking...' : 'Change Password'}
                  </button>
                </div>

                <div style={{marginTop:'40px',paddingTop:'40px',borderTop:'1px solid var(--border)'}}>
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
