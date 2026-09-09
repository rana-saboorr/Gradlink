import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Users, Settings, Briefcase, Bell, Eye, EyeOff, Shield,
  Trash2, Edit2, Plus, X, CheckCircle, MapPin, Clock, Loader2, Key, Image,
  Newspaper, FileText
} from 'lucide-react';
import { loginAdmin, logout, restoreSession, updateAdminCredentials } from '../store/slices/adminAuthSlice';
import {
  fetchAllData, saveTeamMember, saveAnnouncement,
  saveService, saveJob, deleteItem
} from '../store/slices/dataSlice';
import { db, storage } from '../utils/firebaseClient';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import toast from 'react-hot-toast';

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const adminTabs = [
  { id: 'dashboard',     name: 'Dashboard',        icon: Settings },
  { id: 'team',          name: 'Team Members',     icon: Users },
  { id: 'announcements', name: 'Announcements',    icon: Bell },
  { id: 'services',      name: 'Services',         icon: Briefcase },
  { id: 'jobs',          name: 'Job Postings',     icon: Briefcase },
  { id: 'news',          name: 'News',             icon: Newspaper },
  { id: 'blogs',         name: 'Blog Posts',       icon: FileText },
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

const inputCls = 'w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition text-sm sm:text-base';
const btnPrimary = 'inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto';
const btnOutline = 'inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 border border-border rounded-xl font-semibold hover:bg-muted transition disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto';

// ─── Main Component ────────────────────────────────────────────────────────────
const Admin = () => {
  const dispatch  = useDispatch();
  const { isAdmin, admin, loading: authLoading, attempts } = useSelector(s => s.adminAuth);
  const { team, announcements, services, jobs, loading, saving } = useSelector(s => s.data);

  const [activeTab,       setActiveTab]       = useState('dashboard');
  const [editingItem,     setEditingItem]     = useState(null);
  const [showPassword,    setShowPassword]    = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const imageFileRef = useRef(null);

  // Gallery state
  const [gallery, setGallery] = useState([]);
  const [galleryFile, setGalleryFile] = useState(null);
  const [galleryLoading, setGalleryLoading] = useState(false);

  // News state
  const [newsItems, setNewsItems]   = useState([]);
  const [newsSaving, setNewsSaving] = useState(false);

  // Blogs state
  const [blogPosts, setBlogPosts]   = useState([]);
  const [blogSaving, setBlogSaving] = useState(false);

  // Restore session & fetch on mount
  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchAllData());
      fetchGallery();
      fetchNews();
      fetchBlogs();
    }
  }, [isAdmin, dispatch]);

  // ─── Fetch News ─────────────────────────────────────────────────────
  const fetchNews = async () => {
    try {
      const q    = query(collection(db, 'news'), orderBy('created_at', 'desc'));
      const snap = await getDocs(q);
      setNewsItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      const snap = await getDocs(collection(db, 'news'));
      setNewsItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
  };

  // ─── Fetch Blogs ─────────────────────────────────────────────────────
  const fetchBlogs = async () => {
    try {
      const q    = query(collection(db, 'blogs'), orderBy('created_at', 'desc'));
      const snap = await getDocs(q);
      setBlogPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      const snap = await getDocs(collection(db, 'blogs'));
      setBlogPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
  };

  // ─── Save / Delete News ─────────────────────────────────────────────
  const handleSaveNews = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      title:    fd.get('title'),
      summary:  fd.get('summary'),
      content:  fd.get('content'),
      category: fd.get('category'),
      image:    fd.get('image'),
    };
    try {
      setNewsSaving(true);
      if (editingItem?.id) {
        await updateDoc(doc(db, 'news', editingItem.id), data);
      } else {
        await addDoc(collection(db, 'news'), { ...data, created_at: new Date().toISOString() });
      }
      toast.success('News article saved!');
      setEditingItem(null);
      fetchNews();
    } catch (err) {
      toast.error(err.message || 'Failed to save news.');
    } finally {
      setNewsSaving(false);
    }
  };

  const handleDeleteNews = (id) => {
    toast((t) => (
      <span className="flex items-center gap-3">
        <span className="text-sm">Delete this article?</span>
        <button onClick={async () => { await deleteDoc(doc(db, 'news', id)); fetchNews(); toast.dismiss(t.id); toast.success('Deleted.'); }}
          className="px-2 py-1 bg-red-500 text-white text-xs rounded-lg font-semibold hover:bg-red-600">Delete</button>
        <button onClick={() => toast.dismiss(t.id)}
          className="px-2 py-1 bg-muted text-foreground text-xs rounded-lg font-semibold">Cancel</button>
      </span>
    ), { duration: 6000 });
  };

  // ─── Save / Delete Blogs ─────────────────────────────────────────────
  const handleSaveBlog = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const tagsRaw = fd.get('tags') || '';
    const data = {
      title:        fd.get('title'),
      excerpt:      fd.get('excerpt'),
      content:      fd.get('content'),
      author:       fd.get('author'),
      cover_image:  fd.get('cover_image'),
      tags:         tagsRaw.split(',').map(t => t.trim()).filter(Boolean),
    };
    try {
      setBlogSaving(true);
      if (editingItem?.id) {
        await updateDoc(doc(db, 'blogs', editingItem.id), data);
      } else {
        await addDoc(collection(db, 'blogs'), { ...data, created_at: new Date().toISOString() });
      }
      toast.success('Blog post saved!');
      setEditingItem(null);
      fetchBlogs();
    } catch (err) {
      toast.error(err.message || 'Failed to save blog post.');
    } finally {
      setBlogSaving(false);
    }
  };

  const handleDeleteBlog = (id) => {
    toast((t) => (
      <span className="flex items-center gap-3">
        <span className="text-sm">Delete this blog post?</span>
        <button onClick={async () => { await deleteDoc(doc(db, 'blogs', id)); fetchBlogs(); toast.dismiss(t.id); toast.success('Deleted.'); }}
          className="px-2 py-1 bg-red-500 text-white text-xs rounded-lg font-semibold hover:bg-red-600">Delete</button>
        <button onClick={() => toast.dismiss(t.id)}
          className="px-2 py-1 bg-muted text-foreground text-xs rounded-lg font-semibold">Cancel</button>
      </span>
    ), { duration: 6000 });
  };

  // ─── Fetch Gallery Images ──────────────────────────────────────────────────
  const fetchGallery = async () => {
    try {
      const q    = query(collection(db, 'gallery'), orderBy('created_at', 'desc'));
      const snap = await getDocs(q);
      setGallery(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      // Fallback without ordering if index not ready
      const snap = await getDocs(collection(db, 'gallery'));
      setGallery(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
  };

  // ─── Upload Gallery Image ──────────────────────────────────────────────────
  const handleGalleryUpload = async () => {
    if (!galleryFile) {
      toast.error('Select an image first');
      return;
    }

    try {
      setGalleryLoading(true);

      const fileName    = `gallery-images/${Date.now()}-${galleryFile.name}`;
      const storageRef  = ref(storage, fileName);
      await uploadBytes(storageRef, galleryFile);
      const imageUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'gallery'), {
        image_url:   imageUrl,
        storage_path: fileName,
        created_at:  new Date().toISOString(),
      });

      setGalleryFile(null);
      fetchGallery();
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Upload failed');
    } finally {
      setGalleryLoading(false);
    }
  };

  // ─── Delete Gallery Image ──────────────────────────────────────────────────
  const handleDeleteGallery = async (id) => {
    try {
      setGalleryLoading(true);

      // Find the document to get storage_path
      const snap      = await getDocs(collection(db, 'gallery'));
      const imageDoc  = snap.docs.find(d => d.id === id);

      if (imageDoc) {
        const { storage_path, image_url } = imageDoc.data();
        // Try to delete from Storage (best effort — won't block if path missing)
        try {
          const storagePath = storage_path || (
            // fallback: parse path from URL for old records
            decodeURIComponent(image_url.split('/o/')[1]?.split('?')[0] || '')
          );
          if (storagePath) await deleteObject(ref(storage, storagePath));
        } catch { /* ignore storage errors — file may not exist */ }
      }

      await deleteDoc(doc(db, 'gallery', id));
      toast.success('Image deleted.');
      fetchGallery();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete image');
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
    toast((t) => (
      <span className="flex items-center gap-3">
        <span className="text-sm">Delete this item?</span>
        <button
          onClick={() => { dispatch(deleteItem({ table, id })); toast.dismiss(t.id); }}
          className="px-2 py-1 bg-red-500 text-white text-xs rounded-lg font-semibold hover:bg-red-600"
        >Delete</button>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="px-2 py-1 bg-muted text-foreground text-xs rounded-lg font-semibold"
        >Cancel</button>
      </span>
    ), { duration: 6000 });
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
      <div className="min-h-screen flex items-center justify-center py-12 sm:py-20 px-3 sm:px-4 bg-muted/30">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="glass-card p-6 sm:p-8 rounded-2xl">
            <div className="text-center mb-6 sm:mb-8">
              <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-primary border border-primary/20">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold mb-1">Admin Portal</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Enter your admin credentials to access the dashboard</p>
            </div>

            <form onSubmit={handleSubmit(onSubmitLogin)} className="space-y-4 sm:space-y-5">
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
                <p className="text-xs sm:text-sm text-red-500 text-center font-medium">
                  Too many failed attempts. Please verify your credentials.
                </p>
              )}

              <button type="submit" disabled={authLoading || isSubmitting || attempts >= 5} className={`w-full ${btnPrimary} py-2.5 sm:py-3 mt-1 sm:mt-2`}>
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
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 min-h-screen bg-muted/20">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-6 md:gap-8 relative">

          {/* Sidebar - Fixed z-index issue */}
          <div className="w-full md:w-56 lg:w-64 shrink-0 relative z-10">
            <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 md:sticky md:top-20 sm:top-24">
              <h2 className="text-base sm:text-lg font-bold px-2 sm:px-4 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-border">Admin Panel</h2>
              <nav className="space-y-0.5 sm:space-y-1">
                {adminTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setEditingItem(null); }}
                    className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all text-xs sm:text-sm ${activeTab === tab.id ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted'}`}
                  >
                    <tab.icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    <span className="truncate">{tab.name}</span>
                  </button>
                ))}
              </nav>
              <button onClick={() => dispatch(logout())} className="w-full mt-4 sm:mt-6 lg:mt-8 px-2 sm:px-4 py-2 sm:py-2.5 text-red-500 hover:bg-red-500/10 rounded-lg sm:rounded-xl font-medium text-left text-xs sm:text-sm transition">
                Logout
              </button>
            </div>
          </div>

          {/* Content - Higher z-index to prevent overlap */}
          <div className="flex-grow w-full min-w-0 relative z-20">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 min-h-[400px] sm:min-h-[500px]">

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 pb-3 sm:pb-4 border-b border-border">
                  <h3 className="text-xl sm:text-2xl font-bold capitalize">{activeTab.replace('-', ' ')}</h3>
                  {activeTab !== 'dashboard' && activeTab !== 'settings' && !editingItem && (
                    <button onClick={() => setEditingItem({})} className={`${btnPrimary} w-full sm:w-auto`}>
                      <Plus className="w-4 h-4" /> Add New
                    </button>
                  )}
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12 sm:py-20 gap-3 text-muted-foreground">
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> Loading data from Firebase...
                  </div>
                ) : (
                  <>
                    {/* ─── DASHBOARD ─── */}
                    {activeTab === 'dashboard' && (
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {[
                          { label: 'Team Members',  count: team.length,          icon: Users },
                          { label: 'Announcements', count: announcements.length, icon: Bell },
                          { label: 'Services',      count: services.length,      icon: Settings },
                          { label: 'Job Postings',  count: jobs.length,          icon: Briefcase },
                          { label: 'News Articles', count: newsItems.length,     icon: Newspaper },
                          { label: 'Blog Posts',    count: blogPosts.length,     icon: FileText },
                          { label: 'Gallery Images',count: gallery.length,       icon: Image },
                        ].map(({ label, count, icon: Icon }) => (
                          <div key={label} className="p-3 sm:p-4 md:p-6 bg-muted/50 rounded-lg sm:rounded-xl border border-border text-center">
                            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-1.5 sm:mb-2" />
                            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-0.5 sm:mb-1">{count}</p>
                            <p className="text-[8px] sm:text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
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
                              {editingItem?.image && <img src={editingItem.image} alt="" className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover mb-3 border-2 border-primary/20" />}
                              <input ref={imageFileRef} type="file" accept="image/*" className="w-full text-xs sm:text-sm text-muted-foreground file:mr-3 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                            </Field>
                            <Field label="LinkedIn URL">
                              <input name="linkedin_url" defaultValue={editingItem.linkedin_url} className={inputCls} placeholder="https://linkedin.com/in/..." />
                            </Field>
                            <Field label="Twitter URL">
                              <input name="twitter_url" defaultValue={editingItem.twitter_url} className={inputCls} placeholder="https://twitter.com/..." />
                            </Field>
                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
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
                              <div key={member.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 sm:p-4 rounded-xl border border-border bg-muted/30 hover:border-primary/30 transition">
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                  <img src={member.image} alt={member.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0 border border-border" />
                                  <div className="flex-grow min-w-0">
                                    <p className="font-semibold text-sm sm:text-base truncate">{member.name}</p>
                                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{member.role}</p>
                                  </div>
                                </div>
                                <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-end sm:justify-start">
                                  <button onClick={() => setEditingItem(member)} className="p-1.5 sm:p-2 text-primary hover:bg-primary/10 rounded-lg transition"><Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                                  <button onClick={() => handleDelete('team', member.id)} className="p-1.5 sm:p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"><Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
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
                              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-primary">
                                🔑 A unique ID (e.g. <strong>glk5</strong>, <strong>ann19</strong>) will be automatically generated for this announcement.
                              </div>
                            )}
                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
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
                              <div key={ann.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 sm:p-4 rounded-xl border border-border bg-muted/30 hover:border-primary/30 transition">
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                                  <div className="flex-grow min-w-0">
                                    <p className="font-semibold text-sm sm:text-base truncate">{ann.title}</p>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground">ID: {ann.id} · Type: {ann.type} · Expires: {ann.expires}</p>
                                  </div>
                                </div>
                                <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-end sm:justify-start">
                                  <button onClick={() => setEditingItem(ann)} className="p-1.5 sm:p-2 text-primary hover:bg-primary/10 rounded-lg transition"><Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                                  <button onClick={() => handleDelete('announcements', ann.id)} className="p-1.5 sm:p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"><Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
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
                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
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
                              <div key={srv.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 sm:p-4 rounded-xl border border-border bg-muted/30 hover:border-primary/30 transition">
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                                  <div className="flex-grow min-w-0">
                                    <p className="font-semibold text-sm sm:text-base truncate">{srv.title}</p>
                                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{srv.description}</p>
                                  </div>
                                </div>
                                <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-end sm:justify-start">
                                  <button onClick={() => setEditingItem(srv)} className="p-1.5 sm:p-2 text-primary hover:bg-primary/10 rounded-lg transition"><Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                                  <button onClick={() => handleDelete('services', srv.id)} className="p-1.5 sm:p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"><Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <Field label="Application Deadline">
                                <input name="deadline" type="date" defaultValue={editingItem.deadline} required className={inputCls} />
                              </Field>
                              <Field label="Apply Link">
                                <input name="apply_link" defaultValue={editingItem.apply_link || '/contact'} className={inputCls} placeholder="/contact" />
                              </Field>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
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
                              <div key={job.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 sm:p-4 rounded-xl border border-border bg-muted/30 hover:border-primary/30 transition">
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                                    <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                                  </div>
                                  <div className="flex-grow min-w-0">
                                    <p className="font-semibold text-sm sm:text-base truncate">{job.title}</p>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground flex flex-wrap items-center gap-1 sm:gap-2 mt-0.5">
                                      <span className="flex items-center gap-0.5 sm:gap-1"><MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />{job.location}</span>
                                      <span className="flex items-center gap-0.5 sm:gap-1"><Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />Deadline: {job.deadline}</span>
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-end sm:justify-start">
                                  <button onClick={() => setEditingItem(job)} className="p-1.5 sm:p-2 text-primary hover:bg-primary/10 rounded-lg transition"><Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                                  <button onClick={() => handleDelete('jobs', job.id)} className="p-1.5 sm:p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"><Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ─── NEWS ─── */}
                    {activeTab === 'news' && (
                      <div>
                        {editingItem ? (
                          <form onSubmit={handleSaveNews} className="space-y-4 max-w-xl">
                            <Field label="Title">
                              <input name="title" defaultValue={editingItem.title} required className={inputCls} placeholder="e.g. New Scholarship Opportunities for 2027" />
                            </Field>
                            <Field label="Category" hint="e.g. admissions, scholarship, visa, event, announcement">
                              <input name="category" defaultValue={editingItem.category || 'announcement'} className={inputCls} placeholder="announcement" />
                            </Field>
                            <Field label="Summary" hint="A brief one-line summary shown on the news card.">
                              <input name="summary" defaultValue={editingItem.summary} className={inputCls} placeholder="Short summary for the card..." />
                            </Field>
                            <Field label="Full Content">
                              <textarea name="content" defaultValue={editingItem.content} required rows={6} className={inputCls} placeholder="Full article content..." />
                            </Field>
                            <Field label="Cover Image URL" hint="Optional. Paste a direct image URL.">
                              <input name="image" defaultValue={editingItem.image} className={inputCls} placeholder="https://..." />
                            </Field>
                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                              <button type="submit" disabled={newsSaving} className={btnPrimary}>
                                {newsSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><CheckCircle className="w-4 h-4" /> Save Article</>}
                              </button>
                              <button type="button" onClick={() => setEditingItem(null)} disabled={newsSaving} className={btnOutline}><X className="w-4 h-4" /> Cancel</button>
                            </div>
                          </form>
                        ) : (
                          <div className="space-y-3">
                            {newsItems.length === 0 && <p className="text-muted-foreground py-8 text-center">No news articles yet. Add one!</p>}
                            {newsItems.map(article => (
                              <div key={article.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 sm:p-4 rounded-xl border border-border bg-muted/30 hover:border-primary/30 transition">
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                  <Newspaper className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                                  <div className="flex-grow min-w-0">
                                    <p className="font-semibold text-sm sm:text-base truncate">{article.title}</p>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground">Category: {article.category} · {new Date(article.created_at).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-end sm:justify-start">
                                  <button onClick={() => setEditingItem(article)} className="p-1.5 sm:p-2 text-primary hover:bg-primary/10 rounded-lg transition"><Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                                  <button onClick={() => handleDeleteNews(article.id)} className="p-1.5 sm:p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"><Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ─── BLOGS ─── */}
                    {activeTab === 'blogs' && (
                      <div>
                        {editingItem ? (
                          <form onSubmit={handleSaveBlog} className="space-y-4 max-w-xl">
                            <Field label="Blog Title">
                              <input name="title" defaultValue={editingItem.title} required className={inputCls} placeholder="e.g. How to Choose the Right University Abroad" />
                            </Field>
                            <Field label="Author">
                              <input name="author" defaultValue={editingItem.author} className={inputCls} placeholder="e.g. Sarah Johnson" />
                            </Field>
                            <Field label="Excerpt" hint="A brief hook shown on the blog card.">
                              <input name="excerpt" defaultValue={editingItem.excerpt} className={inputCls} placeholder="What makes this post compelling..." />
                            </Field>
                            <Field label="Full Content">
                              <textarea name="content" defaultValue={editingItem.content} required rows={8} className={inputCls} placeholder="Full blog post content..." />
                            </Field>
                            <Field label="Tags" hint="Comma-separated. e.g. tips, visa, scholarships">
                              <input name="tags" defaultValue={Array.isArray(editingItem.tags) ? editingItem.tags.join(', ') : editingItem.tags} className={inputCls} placeholder="tips, admissions, study-abroad" />
                            </Field>
                            <Field label="Cover Image URL" hint="Optional. Paste a direct image URL.">
                              <input name="cover_image" defaultValue={editingItem.cover_image} className={inputCls} placeholder="https://..." />
                            </Field>
                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                              <button type="submit" disabled={blogSaving} className={btnPrimary}>
                                {blogSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><CheckCircle className="w-4 h-4" /> Save Post</>}
                              </button>
                              <button type="button" onClick={() => setEditingItem(null)} disabled={blogSaving} className={btnOutline}><X className="w-4 h-4" /> Cancel</button>
                            </div>
                          </form>
                        ) : (
                          <div className="space-y-3">
                            {blogPosts.length === 0 && <p className="text-muted-foreground py-8 text-center">No blog posts yet. Add one!</p>}
                            {blogPosts.map(post => (
                              <div key={post.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 sm:p-4 rounded-xl border border-border bg-muted/30 hover:border-primary/30 transition">
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-secondary shrink-0" />
                                  <div className="flex-grow min-w-0">
                                    <p className="font-semibold text-sm sm:text-base truncate">{post.title}</p>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                                      By {post.author || 'Unknown'} · {post.tags?.join(', ')} · {new Date(post.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-end sm:justify-start">
                                  <button onClick={() => setEditingItem(post)} className="p-1.5 sm:p-2 text-primary hover:bg-primary/10 rounded-lg transition"><Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                                  <button onClick={() => handleDeleteBlog(post.id)} className="p-1.5 sm:p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"><Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ─── GALLERY ─── */}
                    {activeTab === 'gallery' && (
                      <div className="space-y-4 sm:space-y-6">
                        {/* Upload Section */}
                        <div className="bg-muted/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                            <div className="flex-1 w-full">
                              <label className="block text-sm font-semibold mb-2 text-foreground">
                                Upload New Image
                              </label>
                              <div className="relative">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => setGalleryFile(e.target.files[0])}
                                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border-2 border-dashed border-border bg-background/50 text-foreground focus:outline-none focus:border-primary/50 transition file:mr-3 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer text-xs sm:text-sm"
                                />
                                {galleryFile && (
                                  <div className="mt-2 text-xs sm:text-sm text-muted-foreground">
                                    Selected: <span className="font-medium text-foreground">{galleryFile.name}</span>
                                    <span className="ml-2">({(galleryFile.size / 1024).toFixed(1)} KB)</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={handleGalleryUpload}
                              disabled={galleryLoading || !galleryFile}
                              className={`${btnPrimary} w-full sm:w-auto min-w-[120px]`}
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
                          <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
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
                          <div className="text-center py-12 sm:py-16 bg-muted/20 rounded-xl sm:rounded-2xl border border-border">
                            <Image className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground/40 mb-3 sm:mb-4" />
                            <p className="text-muted-foreground font-medium">No images uploaded yet</p>
                            <p className="text-xs sm:text-sm text-muted-foreground/70 mt-1">Upload your first image to start the gallery</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
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
                                  <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 right-1.5 sm:right-2">
                                    <p className="text-white text-[8px] sm:text-[10px] font-medium truncate">
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
                                  className="absolute top-1 sm:top-2 right-1 sm:right-2 p-1 sm:p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                                  title="Delete image"
                                >
                                  <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                                </button>

                                {/* Image Counter Badge */}
                                <div className="absolute top-1 sm:top-2 left-1 sm:left-2 px-1 sm:px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded-lg text-white text-[8px] font-medium">
                                  #{gallery.indexOf(img) + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Gallery Stats */}
                        {gallery.length > 0 && (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-border">
                            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                              <span className="flex items-center gap-2">
                                <span className="font-medium text-foreground">{gallery.length}</span> images
                              </span>
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span>Storage: {(gallery.length * 0.5).toFixed(1)} MB used</span>
                              </span>
                            </div>
                            {confirmDeleteAll ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-red-500 font-medium">Are you sure?</span>
                                <button
                                  onClick={() => { gallery.forEach(img => handleDeleteGallery(img.id)); setConfirmDeleteAll(false); }}
                                  className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg font-semibold hover:bg-red-600 transition"
                                >Yes, delete all</button>
                                <button
                                  onClick={() => setConfirmDeleteAll(false)}
                                  className="px-3 py-1 bg-muted text-foreground text-xs rounded-lg font-semibold transition"
                                >Cancel</button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteAll(true)}
                                className="text-xs sm:text-sm text-red-500 hover:text-red-600 font-medium transition hover:underline"
                              >
                                Delete All
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ─── ACCOUNT SETTINGS ─── */}
                    {activeTab === 'settings' && (
                      <div className="max-w-xl">
                        <h4 className="text-base sm:text-lg font-bold mb-2">Change Admin Credentials</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                          Update your admin username, email, or password stored in Firebase.
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