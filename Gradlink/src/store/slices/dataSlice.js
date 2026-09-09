import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy,
} from 'firebase/firestore';
import {
  ref, uploadBytes, getDownloadURL,
} from 'firebase/storage';
import { db, storage } from '../../utils/firebaseClient';
import toast from 'react-hot-toast';

// ─── Helper: safe Firestore fetch with orderBy fallback ──────────────────────
const safeFetch = async (col, field, dir = 'asc') => {
  try {
    const snap = await getDocs(query(collection(db, col), orderBy(field, dir)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    // Index not yet built — fall back to unordered fetch
    const snap = await getDocs(collection(db, col));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
};

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
    const [team, announcements, services, jobs] = await Promise.all([
      safeFetch('team',          'created_at', 'asc'),
      safeFetch('announcements', 'created_at', 'desc'),
      safeFetch('services',      'created_at', 'asc'),
      safeFetch('jobs',          'created_at', 'desc'),
    ]);
    return { team, announcements, services, jobs };
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
      const ext        = imageFile.name.split('.').pop();
      const path       = `team-images/${Date.now()}.${ext}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }

    const payload = { ...data, image: imageUrl };

    if (editingId) {
      await updateDoc(doc(db, 'team', editingId), payload);
    } else {
      if (!imageUrl) throw new Error('Please provide an image for the new member.');
      await addDoc(collection(db, 'team'), { ...payload, created_at: new Date().toISOString() });
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
    await deleteDoc(doc(db, table, id));
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
    if (editingId) {
      await updateDoc(doc(db, 'announcements', editingId), data);
    } else {
      await addDoc(collection(db, 'announcements'), {
        ...data,
        custom_id:  generateId(),
        created_at: new Date().toISOString(),
      });
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
    const payload = {
      ...data,
      features: data.features.split('\n').map(f => f.trim()).filter(Boolean),
    };

    if (editingId) {
      await updateDoc(doc(db, 'services', editingId), payload);
    } else {
      await addDoc(collection(db, 'services'), { ...payload, created_at: new Date().toISOString() });
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
      await updateDoc(doc(db, 'jobs', editingId), data);
    } else {
      await addDoc(collection(db, 'jobs'), { ...data, created_at: new Date().toISOString() });
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
    team:          [],
    announcements: [],
    services:      [],
    jobs:          [],
    loading:       false,
    saving:        false,
    error:         null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchAllData.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAllData.fulfilled, (state, action) => {
        state.loading       = false;
        state.team          = action.payload.team;
        state.announcements = action.payload.announcements;
        state.services      = action.payload.services;
        state.jobs          = action.payload.jobs;
      })
      .addCase(fetchAllData.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
        toast.error('Failed to load data from Firebase. Check your Firestore rules.');
      })
      // Delete
      .addCase(deleteItem.fulfilled, (state, action) => {
        const { table, id } = action.payload;
        if (table === 'team')          state.team          = state.team.filter(i          => i.id !== id);
        if (table === 'announcements') state.announcements = state.announcements.filter(i => i.id !== id);
        if (table === 'services')      state.services      = state.services.filter(i      => i.id !== id);
        if (table === 'jobs')          state.jobs          = state.jobs.filter(i          => i.id !== id);
      })
      // Saving states
      .addMatcher(
        (action) => [saveTeamMember.pending, saveAnnouncement.pending, saveService.pending, saveJob.pending].some(a => action.type === a.type),
        (state) => { state.saving = true; }
      )
      .addMatcher(
        (action) => [
          saveTeamMember.fulfilled, saveTeamMember.rejected,
          saveAnnouncement.fulfilled, saveAnnouncement.rejected,
          saveService.fulfilled, saveService.rejected,
          saveJob.fulfilled, saveJob.rejected,
        ].some(a => action.type === a.type),
        (state) => { state.saving = false; }
      );
  },
});

export default dataSlice.reducer;
