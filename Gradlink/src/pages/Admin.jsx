import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Users, Settings, Briefcase, Bell, Eye, EyeOff, Shield,
  Trash2, Edit2, Plus, X, CheckCircle, MapPin, Clock, Loader2, Key, Image
} from 'lucide-react';
import { loginAdmin, logout, restoreSession, updateAdminCredentials } from '../store/slices/adminAuthSlice';
import {
  fetchAllData, saveTeamMember, saveAnnouncement,
  saveService, saveJob, deleteItem
} from '../store/slices/dataSlice';
import { supabase } from '../utils/supabaseClient';

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const adminTabs = [
  { id: 'dashboard',     name: 'Dashboard',        icon: Settings },
  { id: 'team',          name: 'Team Members',     icon: Users },
  { id: 'announcements', name: 'Announcements',    icon: Bell },
  { id: 'services',      name: 'Services',         icon: Briefcase },
  { id: 'jobs',          name: 'Job Postings',     icon: Briefcase },
  { id: 'gallery',       name: 'Gallery',          icon: Image },
  { id: 'settings',      name: 'Account Settings', icon: Key },
];

// ─── Login Schema ──────────────────────────────────────────────────────────────
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

// ─── Reusable Field Component ──────────────────────────────────────────────────
const Field = ({ label, children, hint }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold text-foreground">{label}</label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition';
const btnPrimary = 'inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed';
const btnOutline = 'inline-flex items-center gap-2 px-5 py-2.5 border border-border rounded-xl font-semibold hover:bg-muted transition disabled:opacity-50';

// ─── Main Component ────────────────────────────────────────────────────────────
const Admin = () => {
  const dispatch  = useDispatch();
  const { isAdmin, admin, loading: authLoading, attempts } = useSelector(s => s.adminAuth);
  const { team, announcements, services, jobs, loading, saving } = useSelector(s => s.data);

  const [activeTab,    setActiveTab]    = useState('dashboard');
  const [editingItem,  setEditingItem]  = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const imageFileRef = useRef(null);

  // Gallery state
  const [gallery, setGallery] = useState([]);
  const [galleryFile, setGalleryFile] = useState(null);
  const [galleryLoading, setGalleryLoading] = useState(false);

  // Restore session & fetch on mount
  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchAllData());
      fetchGallery();
    }
  }, [isAdmin, dispatch]);

  // ─── Fetch Gallery Images ──────────────────────────────────────────────────
  const fetchGallery = async () => {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setGallery(data);
    }
  };

  // ─── Upload Gallery Image ──────────────────────────────────────────────────
  const handleGalleryUpload = async () => {
    if (!galleryFile) {
      alert("Select image first");
      return;
    }

    try {
      setGalleryLoading(true);

      const fileName = `${Date.now()}-${galleryFile.name}`;

      const { error: uploadError } = await supabase
        .storage
        .from('gallery-images')
        .upload(fileName, galleryFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase
        .storage
        .from('gallery-images')
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      const { error: insertError } = await supabase
        .from('gallery')
        .insert([{ image_url: imageUrl }]);

      if (insertError) throw insertError;

      setGalleryFile(null);
      fetchGallery();
      alert("Image uploaded successfully");

    } catch (error) {
      console.log(error);
      alert(error.message);
    } finally {
      setGalleryLoading(false);
    }
  };

  // ─── Delete Gallery Image ──────────────────────────────────────────────────
  const handleDeleteGallery = async (id) => {
    if (!window.confirm('Delete this image? This cannot be undone.')) return;
    
    try {
      setGalleryLoading(true);
      
      // First, get the image URL to delete from storage
      const { data: imageData } = await supabase
        .from('gallery')
        .select('image_url')
        .eq('id', id)
        .single();
      
      if (imageData) {
        // Extract filename from URL
        const urlParts = imageData.image_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        // Delete from storage
        await supabase
          .storage
          .from('gallery-images')
          .remove([fileName]);
      }
      
      // Delete from database
      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);

      if (!error) {
        fetchGallery();
      } else {
        alert(error.message);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete image');
    } finally {
      setGalleryLoading(false);
    }
  };

  // ─── Login Form ─────────────────────────────────────────────────────────────
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmitLogin = (data) => dispatch(loginAdmin(data));

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleDelete = (table, id) => {
    if (!window.confirm('Delete this item? This cannot be undone.')) return;
    dispatch(deleteItem({ table, id }));
  };

  const handleSaveTeam = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const imageFile = imageFileRef.current?.files?.[0] || null;
    const data = {
      name:         fd.get('name'),
      role:         fd.get('role'),
      bio:          fd.get('bio'),
      image:        editingItem?.image || '',
      linkedin_url: fd.get('linkedin_url'),
      twitter_url:  fd.get('twitter_url'),
    };
    const res = await dispatch(saveTeamMember({ data, imageFile, editingId: editingItem?.id }));
    if (res.meta.requestStatus === 'fulfilled') {
      setEditingItem(null);
      dispatch(fetchAllData());
    }
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      title:   fd.get('title'),
      message: fd.get('message'),
      type:    fd.get('type'),
      expires: fd.get('expires'),
    };
    const res = await dispatch(saveAnnouncement({ data, editingId: editingItem?.id }));
    if (res.meta.requestStatus === 'fulfilled') {
      setEditingItem(null);
      dispatch(fetchAllData());
    }
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      title:       fd.get('title'),
      icon:        fd.get('icon'),
      description: fd.get('description'),
      features:    fd.get('features'),
    };
    const res = await dispatch(saveService({ data, editingId: editingItem?.id }));
    if (res.meta.requestStatus === 'fulfilled') {
      setEditingItem(null);
      dispatch(fetchAllData());
    }
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      title:       fd.get('title'),
      department:  fd.get('department'),
      location:    fd.get('location'),
      type:        fd.get('type'),
      description: fd.get('description'),
      deadline:    fd.get('deadline'),
      apply_link:  fd.get('apply_link'),
    };
    const res = await dispatch(saveJob({ data, editingId: editingItem?.id }));
    if (res.meta.requestStatus === 'fulfilled') {
      setEditingItem(null);
      dispatch(fetchAllData());
    }
  };

  const handleUpdateAdminSettings = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const username = fd.get('username');
    const email = fd.get('email');
    const newPassword = fd.get('new_password');

    await dispatch(updateAdminCredentials({
      id: admin?.id || 1,
      username,
      email,
      newPassword,
    }));
  };

  // ─── Login Screen ────────────────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 px-4 bg-muted/30">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="glass-card p-8 rounded-2xl">
            <div className="text-center mb-8">
              <div className="mx-auto w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary border border-primary/20">
                <Shield className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold mb-1">Admin Portal</h1>
              <p className="text-sm text-muted-foreground">Enter your admin credentials to access the dashboard</p>
            </div>

            <form onSubmit={handleSubmit(onSubmitLogin)} className="space-y-5">
              <Field label="Username">
                <input type="text" {...register('username')} className={`${inputCls} ${errors.username ? 'border-red-400' : ''}`} placeholder="Gradlink.Admin" />
                {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>}
              </Field>
              <Field label="Email">
                <input type="email" {...register('email')} className={`${inputCls} ${errors.email ? 'border-red-400' : ''}`} placeholder="admin@gradlink.com" />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </Field>
              <Field label="Password">
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} {...register('password')} className={`${inputCls} pr-10 ${errors.password ? 'border-red-400' : ''}`} />
                  <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </Field>

              {attempts >= 3 && (
                <p className="text-sm text-red-500 text-center font-medium">
                  Too many failed attempts. Please verify your credentials.
                </p>
              )}

              <button type="submit" disabled={authLoading || isSubmitting || attempts >= 5} className={`w-full ${btnPrimary} justify-center py-3 mt-2`}>
                {authLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : 'Login to Admin'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Dashboard ───────────────────────────────────────────────────────────────
  return (
    <div className="pt-24 pb-20 min-h-screen bg-muted/20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-start gap-8">

          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="glass-card rounded-2xl p-4 sticky top-24">
              <h2 className="text-lg font-bold px-4 mb-4 pb-4 border-b border-border">Admin Panel</h2>
              <nav className="space-y-1">
                {adminTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setEditingItem(null); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${activeTab === tab.id ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted'}`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.name}
                  </button>
                ))}
              </nav>
              <button onClick={() => dispatch(logout())} className="w-full mt-8 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl font-medium text-left text-sm transition">
                Logout
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-grow">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card rounded-2xl p-6 md:p-8 min-h-[500px]">

                <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                  <h3 className="text-2xl font-bold capitalize">{activeTab.replace('-', ' ')}</h3>
                  {activeTab !== 'dashboard' && activeTab !== 'settings' && !editingItem && (
                    <button onClick={() => setEditingItem({})} className={btnPrimary}>
                      <Plus className="w-4 h-4" /> Add New
                    </button>
                  )}
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin" /> Loading data from Supabase...
                  </div>
                ) : (
                  <>
                    {/* ─── DASHBOARD ─── */}
                    {activeTab === 'dashboard' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: 'Team Members', count: team.length, icon: Users },
                          { label: 'Announcements', count: announcements.length, icon: Bell },
                          { label: 'Services', count: services.length, icon: Settings },
                          { label: 'Job Postings', count: jobs.length, icon: Briefcase },
                          { label: 'Gallery Images', count: gallery.length, icon: Image },
                        ].map(({ label, count, icon: Icon }) => (
                          <div key={label} className="p-6 bg-muted/50 rounded-xl border border-border text-center">
                            <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
                            <p className="text-3xl font-bold text-primary mb-1">{count}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ─── TEAM ─── */}
                    {activeTab === 'team' && (
                      <div>
                        {editingItem ? (
                          <form onSubmit={handleSaveTeam} className="space-y-4 max-w-xl">
                            <Field label="Full Name">
                              <input name="name" defaultValue={editingItem.name} required className={inputCls} placeholder="Jane Doe" />
                            </Field>
                            <Field label="Role / Title">
                              <input name="role" defaultValue={editingItem.role} required className={inputCls} placeholder="Lead Consultant" />
                            </Field>
                            <Field label="Bio">
                              <textarea name="bio" defaultValue={editingItem.bio} required rows={3} className={inputCls} placeholder="Brief bio..." />
                            </Field>
                            <Field label="Profile Image" hint="Max 2MB. Leave blank to keep current image.">
                              {editingItem?.image && <img src={editingItem.image} alt="" className="w-16 h-16 rounded-full object-cover mb-3 border-2 border-primary/20" />}
                              <input ref={imageFileRef} type="file" accept="image/*" className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                            </Field>
                            <Field label="LinkedIn URL">
                              <input name="linkedin_url" defaultValue={editingItem.linkedin_url} className={inputCls} placeholder="https://linkedin.com/in/..." />
                            </Field>
                            <Field label="Twitter URL">
                              <input name="twitter_url" defaultValue={editingItem.twitter_url} className={inputCls} placeholder="https://twitter.com/..." />
                            </Field>
                            <div className="flex gap-2 pt-2">
                              <button type="submit" disabled={saving} className={btnPrimary}>
                                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><CheckCircle className="w-4 h-4" /> Save Member</>}
                              </button>
                              <button type="button" onClick={() => setEditingItem(null)} disabled={saving} className={btnOutline}><X className="w-4 h-4" /> Cancel</button>
                            </div>
                          </form>
                        ) : (
                          <div className="space-y-3">
                            {team.length === 0 && <p className="text-muted-foreground py-8 text-center">No team members yet. Add one!</p>}
                            {team.map(member => (
                              <div key={member.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/30 hover:border-primary/30 transition">
                                <img src={member.image} alt={member.name} className="w-12 h-12 rounded-full object-cover shrink-0 border border-border" />
                                <div className="flex-grow min-w-0">
                                  <p className="font-semibold truncate">{member.name}</p>
                                  <p className="text-sm text-muted-foreground truncate">{member.role}</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                  <button onClick={() => setEditingItem(member)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                                  <button onClick={() => handleDelete('team', member.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ─── ANNOUNCEMENTS ─── */}
                    {activeTab === 'announcements' && (
                      <div>
                        {editingItem ? (
                          <form onSubmit={handleSaveAnnouncement} className="space-y-4 max-w-xl">
                            <Field label="Title">
                              <input name="title" defaultValue={editingItem.title} required className={inputCls} placeholder="e.g. Fall 2027 Admissions Now Open!" />
                            </Field>
                            <Field label="Message">
                              <textarea name="message" defaultValue={editingItem.message} required rows={4} className={inputCls} placeholder="Enter the full announcement message..." />
                            </Field>
                            <Field label="Type" hint="e.g. info, warning, success, news, urgent">
                              <input name="type" defaultValue={editingItem.type || 'info'} required className={inputCls} placeholder="info" />
                            </Field>
                            <Field label="Expiry Date">
                              <input name="expires" type="date" defaultValue={editingItem.expires} required className={inputCls} />
                            </Field>
                            {!editingItem.id && (
                              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-primary">
                                🔑 A unique ID (e.g. <strong>glk5</strong>, <strong>ann19</strong>) will be automatically generated for this announcement.
                              </div>
                            )}
                            <div className="flex gap-2 pt-2">
                              <button type="submit" disabled={saving} className={btnPrimary}>
                                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><CheckCircle className="w-4 h-4" /> Save Announcement</>}
                              </button>
                              <button type="button" onClick={() => setEditingItem(null)} disabled={saving} className={btnOutline}><X className="w-4 h-4" /> Cancel</button>
                            </div>
                          </form>
                        ) : (
                          <div className="space-y-3">
                            {announcements.length === 0 && <p className="text-muted-foreground py-8 text-center">No announcements yet. Add one!</p>}
                            {announcements.map(ann => (
                              <div key={ann.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/30 hover:border-primary/30 transition">
                                <Bell className="w-5 h-5 text-primary shrink-0" />
                                <div className="flex-grow min-w-0">
                                  <p className="font-semibold truncate">{ann.title}</p>
                                  <p className="text-xs text-muted-foreground">ID: {ann.id} · Type: {ann.type} · Expires: {ann.expires}</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                  <button onClick={() => setEditingItem(ann)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                                  <button onClick={() => handleDelete('announcements', ann.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ─── SERVICES ─── */}
                    {activeTab === 'services' && (
                      <div>
                        {editingItem ? (
                          <form onSubmit={handleSaveService} className="space-y-4 max-w-xl">
                            <Field label="Title">
                              <input name="title" defaultValue={editingItem.title} required className={inputCls} placeholder="e.g. University Admissions" />
                            </Field>
                            <Field label="Icon Name">
                              <input name="icon" defaultValue={editingItem.icon} className={inputCls} placeholder="e.g. GraduationCap" />
                            </Field>
                            <Field label="Description">
                              <textarea name="description" defaultValue={editingItem.description} required rows={3} className={inputCls} placeholder="Brief description of this service..." />
                            </Field>
                            <Field label="Features (one per line)" hint="Enter each feature on a new line.">
                              <textarea name="features" defaultValue={Array.isArray(editingItem.features) ? editingItem.features.join('\n') : editingItem.features} rows={5} className={inputCls} placeholder={"Course Selection\nApplication Strategy\nEssay Review"} />
                            </Field>
                            <div className="flex gap-2 pt-2">
                              <button type="submit" disabled={saving} className={btnPrimary}>
                                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><CheckCircle className="w-4 h-4" /> Save Service</>}
                              </button>
                              <button type="button" onClick={() => setEditingItem(null)} disabled={saving} className={btnOutline}><X className="w-4 h-4" /> Cancel</button>
                            </div>
                          </form>
                        ) : (
                          <div className="space-y-3">
                            {services.length === 0 && <p className="text-muted-foreground py-8 text-center">No services yet. Add one!</p>}
                            {services.map(srv => (
                              <div key={srv.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/30 hover:border-primary/30 transition">
                                <Settings className="w-5 h-5 text-primary shrink-0" />
                                <div className="flex-grow min-w-0">
                                  <p className="font-semibold truncate">{srv.title}</p>
                                  <p className="text-sm text-muted-foreground truncate">{srv.description}</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                  <button onClick={() => setEditingItem(srv)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                                  <button onClick={() => handleDelete('services', srv.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ─── JOBS ─── */}
                    {activeTab === 'jobs' && (
                      <div>
                        {editingItem ? (
                          <form onSubmit={handleSaveJob} className="space-y-4 max-w-xl">
                            <Field label="Job Title">
                              <input name="title" defaultValue={editingItem.title} required className={inputCls} placeholder="e.g. Educational Counselor" />
                            </Field>
                            <div className="grid grid-cols-2 gap-4">
                              <Field label="Department">
                                <input name="department" defaultValue={editingItem.department} required className={inputCls} placeholder="e.g. Consulting" />
                              </Field>
                              <Field label="Type">
                                <input name="type" defaultValue={editingItem.type || 'Full-time'} required className={inputCls} placeholder="Full-time / Part-time" />
                              </Field>
                            </div>
                            <Field label="Location">
                              <input name="location" defaultValue={editingItem.location} required className={inputCls} placeholder="e.g. London, UK (Remote available)" />
                            </Field>
                            <Field label="Description">
                              <textarea name="description" defaultValue={editingItem.description} required rows={4} className={inputCls} placeholder="Describe the role and responsibilities..." />
                            </Field>
                            <div className="grid grid-cols-2 gap-4">
                              <Field label="Application Deadline">
                                <input name="deadline" type="date" defaultValue={editingItem.deadline} required className={inputCls} />
                              </Field>
                              <Field label="Apply Link">
                                <input name="apply_link" defaultValue={editingItem.apply_link || '/contact'} className={inputCls} placeholder="/contact" />
                              </Field>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <button type="submit" disabled={saving} className={btnPrimary}>
                                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><CheckCircle className="w-4 h-4" /> Save Job</>}
                              </button>
                              <button type="button" onClick={() => setEditingItem(null)} disabled={saving} className={btnOutline}><X className="w-4 h-4" /> Cancel</button>
                            </div>
                          </form>
                        ) : (
                          <div className="space-y-3">
                            {jobs.length === 0 && <p className="text-muted-foreground py-8 text-center">No job postings yet. Add one!</p>}
                            {jobs.map(job => (
                              <div key={job.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/30 hover:border-primary/30 transition">
                                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                                  <Briefcase className="w-5 h-5" />
                                </div>
                                <div className="flex-grow min-w-0">
                                  <p className="font-semibold truncate">{job.title}</p>
                                  <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap mt-0.5">
                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Deadline: {job.deadline}</span>
                                  </p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                  <button onClick={() => setEditingItem(job)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                                  <button onClick={() => handleDelete('jobs', job.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ─── GALLERY ─── */}
                    {activeTab === 'gallery' && (
                      <div className="space-y-6">
                        {/* Upload Section */}
                        <div className="bg-muted/30 rounded-2xl p-6 border border-border">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex-1 w-full">
                              <label className="block text-sm font-semibold mb-2 text-foreground">
                                Upload New Image
                              </label>
                              <div className="relative">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => setGalleryFile(e.target.files[0])}
                                  className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-border bg-background/50 text-foreground focus:outline-none focus:border-primary/50 transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                                />
                                {galleryFile && (
                                  <div className="mt-2 text-sm text-muted-foreground">
                                    Selected: <span className="font-medium text-foreground">{galleryFile.name}</span>
                                    <span className="ml-2">({(galleryFile.size / 1024).toFixed(1)} KB)</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={handleGalleryUpload}
                              disabled={galleryLoading || !galleryFile}
                              className="btn-primary whitespace-nowrap min-w-[120px]"
                            >
                              {galleryLoading ? (
                                <>
                                  <Loader2 className="animate-spin w-4 h-4" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Plus className="w-4 h-4" />
                                  Upload Image
                                </>
                              )}
                            </button>
                          </div>
                          
                          {/* Upload Tips */}
                          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
                              Max size: 10MB
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
                              Supported: JPG, PNG, WebP
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
                              {gallery.length} images in gallery
                            </span>
                          </div>
                        </div>

                        {/* Gallery Grid */}
                        {gallery.length === 0 ? (
                          <div className="text-center py-16 bg-muted/20 rounded-2xl border border-border">
                            <Image className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />
                            <p className="text-muted-foreground font-medium">No images uploaded yet</p>
                            <p className="text-sm text-muted-foreground/70 mt-1">Upload your first image to start the gallery</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {gallery.map((img) => (
                              <div
                                key={img.id}
                                className="group relative rounded-xl overflow-hidden border border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                              >
                                {/* Image */}
                                <div className="aspect-square overflow-hidden bg-muted/20">
                                  <img
                                    src={img.image_url}
                                    alt="Gallery"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                  />
                                </div>

                                {/* Overlay on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <div className="absolute bottom-3 left-3 right-3">
                                    <p className="text-white text-xs font-medium truncate">
                                      {new Date(img.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                </div>

                                {/* Delete Button */}
                                <button
                                  onClick={() => handleDeleteGallery(img.id)}
                                  className="absolute top-2 right-2 p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                                  title="Delete image"
                                >
                                  <Trash2 size={16} />
                                </button>

                                {/* Image Counter Badge */}
                                <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
                                  #{gallery.indexOf(img) + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Gallery Stats */}
                        {gallery.length > 0 && (
                          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                              <span className="flex items-center gap-2">
                                <span className="font-medium text-foreground">{gallery.length}</span> images
                              </span>
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span>Storage: {(gallery.length * 0.5).toFixed(1)} MB used</span>
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                if (window.confirm('Delete all gallery images? This cannot be undone.')) {
                                  gallery.forEach(img => handleDeleteGallery(img.id));
                                }
                              }}
                              className="text-xs text-red-500 hover:text-red-600 font-medium transition hover:underline"
                            >
                              Delete All
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ─── ACCOUNT SETTINGS ─── */}
                    {activeTab === 'settings' && (
                      <div className="max-w-xl">
                        <h4 className="text-lg font-bold mb-2">Change Admin Credentials</h4>
                        <p className="text-sm text-muted-foreground mb-6">
                          Update your admin username, email, or password stored in Supabase.
                        </p>
                        <form onSubmit={handleUpdateAdminSettings} className="space-y-4">
                          <Field label="Username">
                            <input name="username" defaultValue={admin?.username || 'Gradlink.Admin'} required className={inputCls} />
                          </Field>
                          <Field label="Email Address">
                            <input name="email" type="email" defaultValue={admin?.email || 'gardlink.admin@email.com'} required className={inputCls} />
                          </Field>
                          <Field label="New Password" hint="Leave blank if you do not want to change your password.">
                            <input name="new_password" type="password" className={inputCls} placeholder="••••••••••••" />
                          </Field>
                          <div className="pt-2">
                            <button type="submit" disabled={authLoading} className={btnPrimary}>
                              {authLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : <><CheckCircle className="w-4 h-4" /> Save Account Settings</>}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;