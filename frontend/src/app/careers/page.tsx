'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Shield, Award, TrendingUp, CheckCircle, Briefcase, PlusCircle, X } from 'lucide-react';

export default function CareersPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [expandedJobs, setExpandedJobs] = useState<number[]>([]);
  
  const toggleExpand = (id: number) => {
    setExpandedJobs(prev => prev.includes(id) ? prev.filter(jId => jId !== id) : [...prev, id]);
  };
  
  // Application form state
  const [formData, setFormData] = useState({
    full_name: '', email: '', phone: '', dob: '', gender: '', 
    nationality: 'Nigeria', highest_qualification: '', institution: '', 
    course_of_study: '', nysc_status: ''
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
    fetch(`${apiBase}/api/careers/jobs`)
      .then(res => res.json())
      .then(data => {
        setJobs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching jobs:", err);
        setLoading(false);
      });
  }, []);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleApplySubmit = async (e: any) => {
    e.preventDefault();
    if (!cvFile || !cvFile.name.endsWith('.pdf')) {
      setErrorMsg("CV must be a PDF file.");
      return;
    }
    if (cvFile.size > 5 * 1024 * 1024) {
      setErrorMsg("CV file size must be less than 5MB.");
      return;
    }
    if (certFile && certFile.size > 5 * 1024 * 1024) {
      setErrorMsg("Certification file size must be less than 5MB.");
      return;
    }
    
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const data = new FormData();
    data.append('job_id', selectedJob.id);
    Object.keys(formData).forEach(key => data.append(key, (formData as any)[key]));
    data.append('cv_file', cvFile);
    if (certFile) data.append('cert_file', certFile);

    try {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
      const res = await fetch(`${apiBase}/api/careers/apply`, {
        method: 'POST',
        body: data,
      });
      if (res.ok) {
        setSuccessMsg("Application Submitted Successfully. Our recruitment team will review your application and contact you if your profile matches our requirements.");
        setFormData({
            full_name: '', email: '', phone: '', dob: '', gender: '', 
            nationality: 'Nigeria', highest_qualification: '', institution: '', 
            course_of_study: '', nysc_status: ''
        });
        setCvFile(null);
        setCertFile(null);
      } else {
        const errData = await res.json();
        setErrorMsg(errData.detail || "Error submitting application.");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '72px', background: 'var(--bg-lighter)' }}>
        {/* Hero Section */}
        <section style={{ 
            position: 'relative', minHeight: '60vh', display: 'flex', alignItems: 'center', 
            background: 'url(/images/careers/Career1.jpeg) center/cover no-repeat',
            borderBottom: '3px solid var(--red)'
          }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.6) 100%)' }} />
          <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '60px', paddingBottom: '60px' }}>
            <span className="eyebrow" style={{ color: 'var(--red)' }}>CAREERS AT REWAJ</span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, color: 'var(--white)', lineHeight: 1.1, marginBottom: '24px', maxWidth: '900px' }}>
              Build Nigeria&apos;s Energy Future with <span style={{ color: 'var(--red)' }}>Rewaj</span>
            </h1>
            <p style={{ fontSize: 'clamp(16px, 2.5vw, 18px)', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, marginBottom: '40px', maxWidth: '650px' }}>
              Join a 100% indigenous oil & gas leader where safety, excellence, and community impact drive every project.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <a href="#openings" className="btn-red">View Open Roles</a>
            </div>
          </div>
        </section>

        {/* Why Join Us & Perks */}
        <section style={{ padding: '80px 0', background: 'var(--white)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <h2 className="section-title">Why Join Us</h2>
              <div className="section-divider" style={{ margin: '0 auto' }}></div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '80px' }}>
              <div className="service-card" style={{ background: 'var(--bg-lighter)', height: '100%' }}>
                <Shield size={36} color="var(--red)" style={{ marginBottom: '16px' }} />
                <h3 className="service-card__title">Safety-First Culture</h3>
                <p className="service-card__desc">We operate with zero tolerance for compromise. Every team member is empowered to speak up and every project is delivered with zero Lost Time Incidents (LTI).</p>
              </div>
              <div className="service-card" style={{ background: 'var(--bg-lighter)', height: '100%' }}>
                <Award size={36} color="var(--red)" style={{ marginBottom: '16px' }} />
                <h3 className="service-card__title">Technical Excellence</h3>
                <p className="service-card__desc">Partner with leading OEMs and deploy cutting-edge engineering solutions across major installations.</p>
              </div>
              <div className="service-card" style={{ background: 'var(--bg-lighter)', height: '100%' }}>
                <TrendingUp size={36} color="var(--red)" style={{ marginBottom: '16px' }} />
                <h3 className="service-card__title">Career Growth</h3>
                <p className="service-card__desc">Continuous learning, certifications, and exposure to complex engineering systems.</p>
              </div>
              <div className="service-card" style={{ background: 'var(--bg-lighter)', height: '100%' }}>
                <Briefcase size={36} color="var(--red)" style={{ marginBottom: '16px' }} />
                <h3 className="service-card__title">Work That Matters</h3>
                <p className="service-card__desc">Your work directly supports major operators like TotalEnergies, SNEPCO, RAEC, and NLNG on critical offshore and onshore projects.</p>
              </div>
            </div>

            <div className="careers-benefits-grid">
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '24px' }}>Perks & Benefits</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {['Competitive salary packages', 'Health insurance coverage', 'Performance-based bonuses', 'Offshore allowances (where applicable)', 'Training & certification support', 'Career development opportunities'].map((perk, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: 'var(--slate-600)' }}>
                      <CheckCircle size={20} color="var(--red)" /> {perk}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                 <img src="/images/careers/Career2.jpg" alt="Team meeting" style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }} />
                 <img src="/images/careers/Career3.jpg" alt="Field work" style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }} />
              </div>
            </div>
          </div>
        </section>

        {/* Current Openings */}
        <section id="openings" style={{ padding: '80px 0', background: 'var(--bg-lighter)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <span className="eyebrow" style={{ color: 'var(--red)' }}>CURRENT OPPORTUNITIES</span>
              <h2 className="section-title">Join Our Team</h2>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--slate-500)' }}>Loading available positions...</div>
            ) : jobs.length === 0 ? (
               <div className="info-card" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                  <Briefcase size={40} color="var(--slate-400)" style={{ margin: '0 auto 16px' }} />
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>No Open Roles Currently</h3>
                  <p style={{ color: 'var(--slate-500)' }}>We are not actively recruiting right now, but we are always looking for great talent.</p>
               </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
                {jobs.map(job => {
                  const isExpanded = expandedJobs.includes(job.id);
                  return (
                  <div key={job.id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', transition: 'box-shadow 0.2s', height: '100%' }} className="project-card">
                    <div style={{ flexGrow: 1 }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '10px' }}>{job.title}</h3>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '18px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--slate-600)', background: 'var(--bg-lighter)', padding: '4px 10px', borderRadius: '4px', fontWeight: 600 }}>{job.department}</span>
                        <span style={{ fontSize: '13px', color: 'var(--slate-600)', background: 'var(--bg-lighter)', padding: '4px 10px', borderRadius: '4px', fontWeight: 600 }}>{job.location}</span>
                        <span style={{ fontSize: '13px', color: 'var(--slate-600)', background: 'var(--bg-lighter)', padding: '4px 10px', borderRadius: '4px', fontWeight: 600 }}>{job.job_type}</span>
                      </div>
                      <p style={{ fontSize: '14px', color: 'var(--slate-500)', margin: '0 0 16px 0', fontWeight: 500 }}>Deadline: {new Date(job.application_deadline).toLocaleDateString()}</p>
                      
                      {job.summary && (
                         <p style={{ fontSize: '14.5px', color: 'var(--slate-600)', marginBottom: '20px', lineHeight: 1.6 }}>{job.summary}</p>
                      )}

                      {isExpanded && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-lighter)', padding: '16px', borderRadius: '8px' }}>
                          {job.responsibilities && (
                            <div>
                              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={14} color="var(--red)"/> Responsibilities</h4>
                              <p style={{ fontSize: '13.5px', color: 'var(--slate-600)', lineHeight: 1.6, whiteSpace: 'pre-line', margin: 0 }}>{job.responsibilities}</p>
                            </div>
                          )}
                          {job.requirements && (
                            <div>
                              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={14} color="var(--red)"/> Requirements</h4>
                              <p style={{ fontSize: '13.5px', color: 'var(--slate-600)', lineHeight: 1.6, whiteSpace: 'pre-line', margin: 0 }}>{job.requirements}</p>
                            </div>
                          )}
                          {job.qualifications && (
                            <div>
                              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={14} color="var(--red)"/> Qualifications</h4>
                              <p style={{ fontSize: '13.5px', color: 'var(--slate-600)', lineHeight: 1.6, whiteSpace: 'pre-line', margin: 0 }}>{job.qualifications}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button onClick={() => toggleExpand(job.id)} className="btn-outline-white" style={{ borderColor: 'var(--slate-300)', color: 'var(--slate-600)' }}>
                        {isExpanded ? 'Read Less' : 'See Details'}
                      </button>
                      <button onClick={() => setSelectedJob(job)} className="btn-outline-white" style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>
                        Apply Now
                      </button>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
        </section>

        {/* Stay Informed Talent Pool */}
        <section style={{ 
            position: 'relative', 
            padding: '100px 0', 
            background: 'url(/images/team-offshore.jpg) center/cover no-repeat', 
            textAlign: 'center',
            overflow: 'hidden',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.9)', zIndex: 0 }} />
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, color: 'var(--white)', marginBottom: '16px', textTransform: 'uppercase' }}>Join our Talent Pool</h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', maxWidth: '500px', margin: '0 auto 32px' }}>
              Didn&apos;t find a role today? Send us your CV for future considerations.
            </p>
            <button onClick={() => setSelectedJob({ id: 0, title: 'Talent Pool Submission' })} className="btn-red" style={{ gap: '8px' }}>
              <PlusCircle size={18} /> Drop CV Here
            </button>
          </div>
        </section>

      </main>
      <Footer />

      {/* Application Modal */}
      {selectedJob && (
         <div className="modal-overlay">
            <div className="modal-backdrop" onClick={() => setSelectedJob(null)} />
            <div className="modal-content">
               
               <div className="modal-header">
                 <div>
                   <h3 className="modal-title">Apply: {selectedJob.title}</h3>
                   {selectedJob.id !== 0 && <span className="modal-subtitle">{selectedJob.location} • {selectedJob.job_type}</span>}
                 </div>
                 <button onClick={() => setSelectedJob(null)} className="modal-close"><X size={24} /></button>
               </div>

               <div className="modal-body">
                  {successMsg ? (
                    <div className="alert alert--success" style={{ marginBottom: '32px' }}>
                      <h4 style={{ fontWeight: 800, marginBottom: '8px', color: '#166534' }}>{successMsg}</h4>
                    </div>
                  ) : (
                    <form onSubmit={handleApplySubmit} className="login-form">
                      {errorMsg && <div className="alert alert--error">{errorMsg}</div>}
                      
                      <div className="form-row-2">
                        <div className="form-group">
                          <label>Full Name *</label>
                          <input type="text" name="full_name" required value={formData.full_name} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                          <label>Email Address *</label>
                          <input type="email" name="email" required value={formData.email} onChange={handleInputChange} />
                        </div>
                      </div>

                      <div className="form-row-2">
                        <div className="form-group">
                          <label>Phone Number *</label>
                          <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                          <label>Date of Birth *</label>
                          <input type="date" name="dob" required value={formData.dob} onChange={handleInputChange} />
                        </div>
                      </div>

                      <div className="form-row-2">
                        <div className="form-group">
                          <label>Gender *</label>
                          <select name="gender" required value={formData.gender} onChange={handleInputChange}>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Nationality *</label>
                          <select name="nationality" required value={formData.nationality} onChange={handleInputChange}>
                            <option value="Nigeria">Nigeria</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-row-2">
                        <div className="form-group">
                          <label>Highest Qualification *</label>
                          <select name="highest_qualification" required value={formData.highest_qualification} onChange={handleInputChange}>
                            <option value="">Select</option>
                            <option value="OND">OND</option>
                            <option value="HND">HND</option>
                            <option value="BSc">BSc</option>
                            <option value="MSc">MSc</option>
                            <option value="PhD">PhD</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>NYSC Completed *</label>
                          <select name="nysc_status" required value={formData.nysc_status} onChange={handleInputChange}>
                            <option value="">Select</option>
                            <option value="YES">YES</option>
                            <option value="NO">NO</option>
                            <option value="EXEMPTED">EXEMPTED</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-row-2">
                        <div className="form-group">
                          <label>Institution Name *</label>
                          <input type="text" name="institution" required value={formData.institution} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                          <label>Course of Study *</label>
                          <input type="text" name="course_of_study" required value={formData.course_of_study} onChange={handleInputChange} />
                        </div>
                      </div>

                      <div className="form-row-2">
                        <div className="form-group">
                          <label>Upload CV (PDF, Max 5MB) *</label>
                          <input 
                            type="file" 
                            accept=".pdf" 
                            required 
                            onChange={(e: any) => {
                              const file = e.target.files[0];
                              if (file && file.size > 5 * 1024 * 1024) {
                                alert("File is too large. Max size is 5MB.");
                                e.target.value = null;
                                setCvFile(null);
                              } else {
                                setCvFile(file);
                              }
                            }} 
                            style={{ padding: '8px' }} 
                          />
                        </div>
                        <div className="form-group">
                          <label>Relevant Certifications (PDF, Max 5MB)</label>
                          <input 
                            type="file" 
                            accept=".pdf" 
                            onChange={(e: any) => {
                              const file = e.target.files[0];
                              if (file && file.size > 5 * 1024 * 1024) {
                                alert("File is too large. Max size is 5MB.");
                                e.target.value = null;
                                setCertFile(null);
                              } else {
                                setCertFile(file);
                              }
                            }} 
                            style={{ padding: '8px' }} 
                          />
                        </div>
                      </div>

                      <div style={{ marginTop: '24px', background: 'var(--bg-lighter)', padding: '16px', borderRadius: '8px', fontSize: '12px', color: 'var(--slate-500)', lineHeight: 1.6 }}>
                        <p style={{ marginBottom: '8px' }}><strong>Privacy Policy:</strong> Rewaj Corporate Limited collects and processes personal data for recruitment purposes only. Your information will be handled securely and will not be shared with third parties without consent.</p>
                        <p><strong>Equal Opportunity Statement:</strong> Rewaj Corporate Limited is an equal opportunity employer. We do not discriminate on the basis of race, religion, gender, identity, or background. We are committed to building a diverse and inclusive workplace.</p>
                      </div>

                      <button type="submit" disabled={isSubmitting} className="submit-btn" style={{ marginTop: '16px' }}>
                         {isSubmitting ? 'Submitting...' : 'Submit Application'}
                      </button>
                    </form>
                  )}
               </div>
            </div>
         </div>
      )}
    </>
  );
}
