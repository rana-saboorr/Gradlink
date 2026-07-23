import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../utils/supabaseClient';
import toast from 'react-hot-toast';

// ─── ID Generator: 3 random letters + unique number ─────────────────────────
const USED_NUMBERS = new Set();
const generateId = () => {
  const letters = Array.from({ length: 3 }, () =>
    String.fromCharCode(97 + Math.floor(Math.random() * 26))
  ).join('');
  let num;
  do { num = Math.floor(Math.random() * 99) + 1; } while (USED_NUMBERS.has(num));
  USED_NUMBERS.add(num);
  return `${letters}${num}`;
};

// ─── Fetch All Data ──────────────────────────────────────────────────────────
export const fetchAllData = createAsyncThunk('data/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const [teamRes, annRes, srvRes, jobsRes] = await Promise.all([
      supabase.from('team').select('*').order('id', { ascending: true }),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }),
      supabase.from('services').select('*').order('created_at', { ascending: true }),
      supabase.from('jobs').select('*').order('created_at', { ascending: false }),
    ]);
    if (teamRes.error) throw teamRes.error;
    if (annRes.error) throw annRes.error;
    if (srvRes.error) throw srvRes.error;
    if (jobsRes.error) throw jobsRes.error;
    return {
      team: teamRes.data || [],
      announcements: annRes.data || [],
      services: srvRes.data || [],
      jobs: jobsRes.data || [],
    };
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

// ─── Team Thunks ─────────────────────────────────────────────────────────────
export const saveTeamMember = createAsyncThunk('data/saveTeam', async ({ data, imageFile, editingId }, { rejectWithValue }) => {
  try {
    let imageUrl = data.image || '';
    if (imageFile && imageFile.size > 0) {
      if (imageFile.size > 2 * 1024 * 1024) throw new Error('Image must be less than 2MB');
      const ext = imageFile.name.split('.').pop();
      const path = `${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('team-images').upload(path, imageFile);
      if (uploadErr) throw uploadErr;
      const { data: { publicUrl } } = supabase.storage.from('team-images').getPublicUrl(path);
      imageUrl = publicUrl;
    }
    const payload = { ...data, image: imageUrl };
    if (editingId) {
      const { error } = await supabase.from('team').update(payload).match({ id: editingId });
      if (error) throw error;
    } else {
      if (!imageUrl) throw new Error('Please provide an image for the new member.');
      const { error } = await supabase.from('team').insert([payload]);
      if (error) throw error;
    }
    toast.success('Team member saved!');
    return true;
  } catch (err) {
    toast.error(err.message || 'Failed to save team member.');
    return rejectWithValue(err.message);
  }
});

export const deleteItem = createAsyncThunk('data/deleteItem', async ({ table, id }, { rejectWithValue }) => {
  try {
    const { error } = await supabase.from(table).delete().match({ id });
    if (error) throw error;
    toast.success('Deleted successfully!');
    return { table, id };
  } catch (err) {
    toast.error('Failed to delete.');
    return rejectWithValue(err.message);
  }
});

// ─── Announcement Thunks ─────────────────────────────────────────────────────
export const saveAnnouncement = createAsyncThunk('data/saveAnn', async ({ data, editingId }, { rejectWithValue }) => {
  try {
    const payload = editingId ? data : { ...data, id: generateId() };
    if (editingId) {
      const { error } = await supabase.from('announcements').update(payload).match({ id: editingId });
      if (error) throw error;
    } else {
      const { error } = await supabase.from('announcements').insert([payload]);
      if (error) throw error;
    }
    toast.success('Announcement saved!');
    return true;
  } catch (err) {
    toast.error(err.message || 'Failed to save announcement.');
    return rejectWithValue(err.message);
  }
});

// ─── Service Thunks ──────────────────────────────────────────────────────────
export const saveService = createAsyncThunk('data/saveSrv', async ({ data, editingId }, { rejectWithValue }) => {
  try {
    const payload = { ...data, features: data.features.split('\n').map(f => f.trim()).filter(Boolean) };
    if (editingId) {
      const { error } = await supabase.from('services').update(payload).match({ id: editingId });
      if (error) throw error;
    } else {
      const { error } = await supabase.from('services').insert([payload]);
      if (error) throw error;
    }
    toast.success('Service saved!');
    return true;
  } catch (err) {
    toast.error(err.message || 'Failed to save service.');
    return rejectWithValue(err.message);
  }
});

// ─── Job Thunks ──────────────────────────────────────────────────────────────
export const saveJob = createAsyncThunk('data/saveJob', async ({ data, editingId }, { rejectWithValue }) => {
  try {
    if (editingId) {
      const { error } = await supabase.from('jobs').update(data).match({ id: editingId });
      if (error) throw error;
    } else {
      const { error } = await supabase.from('jobs').insert([data]);
      if (error) throw error;
    }
    toast.success('Job posting saved!');
    return true;
  } catch (err) {
    toast.error(err.message || 'Failed to save job.');
    return rejectWithValue(err.message);
  }
});

// ─── Slice ───────────────────────────────────────────────────────────────────
const dataSlice = createSlice({
  name: 'data',
  initialState: {
    team: [],
    announcements: [],
    services: [],
    jobs: [],
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchAllData.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAllData.fulfilled, (state, action) => {
        state.loading = false;
        state.team = action.payload.team;
        state.announcements = action.payload.announcements;
        state.services = action.payload.services;
        state.jobs = action.payload.jobs;
      })
      .addCase(fetchAllData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error('Failed to load data from Supabase. Check your .env keys.');
      })
      // Delete
      .addCase(deleteItem.fulfilled, (state, action) => {
        const { table, id } = action.payload;
        if (table === 'team') state.team = state.team.filter(i => i.id !== id);
        if (table === 'announcements') state.announcements = state.announcements.filter(i => i.id !== id);
        if (table === 'services') state.services = state.services.filter(i => i.id !== id);
        if (table === 'jobs') state.jobs = state.jobs.filter(i => i.id !== id);
      })
      // Saving states (refetch after)
      .addMatcher(
        (action) => [saveTeamMember.pending, saveAnnouncement.pending, saveService.pending, saveJob.pending].some(a => action.type === a.type),
        (state) => { state.saving = true; }
      )
      .addMatcher(
        (action) => [saveTeamMember.fulfilled, saveTeamMember.rejected, saveAnnouncement.fulfilled, saveAnnouncement.rejected, saveService.fulfilled, saveService.rejected, saveJob.fulfilled, saveJob.rejected].some(a => action.type === a.type),
        (state) => { state.saving = false; }
      );
  },
});

export default dataSlice.reducer;
