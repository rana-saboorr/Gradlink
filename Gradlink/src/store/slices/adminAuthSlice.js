import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  collection, getDocs, updateDoc, doc, query, where, limit,
} from 'firebase/firestore';
import { db } from '../../utils/firebaseClient';
import toast from 'react-hot-toast';

// ─── Async Thunk: Login ───────────────────────────────────────────────────────
export const loginAdmin = createAsyncThunk(
  'adminAuth/login',
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      // Query Firestore admins collection for matching credentials
      const q = query(
        collection(db, 'admins'),
        where('username', '==', username),
        where('email',    '==', email),
        where('password', '==', password),
        limit(1)
      );
      const snap = await getDocs(q);

      if (snap.empty) return rejectWithValue('Invalid credentials');

      const adminDoc  = snap.docs[0];
      const adminData = { id: adminDoc.id, ...adminDoc.data() };

      // Strip password before storing in session
      const { password: _pw, ...safeData } = adminData;

      sessionStorage.setItem('gradlink_admin_auth', 'true');
      sessionStorage.setItem('gradlink_admin_user', JSON.stringify(safeData));
      return safeData;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── Async Thunk: Update Credentials ─────────────────────────────────────────
export const updateAdminCredentials = createAsyncThunk(
  'adminAuth/updateCredentials',
  async ({ id, username, email, newPassword }, { rejectWithValue }) => {
    try {
      const updatePayload = { username, email };
      if (newPassword && newPassword.trim() !== '') {
        updatePayload.password = newPassword;
      }

      await updateDoc(doc(db, 'admins', id), updatePayload);

      const updatedData = { id, username, email };
      sessionStorage.setItem('gradlink_admin_user', JSON.stringify(updatedData));
      return updatedData;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState: {
    isAdmin:  false,
    admin:    null,
    loading:  false,
    error:    null,
    attempts: 0,
  },
  reducers: {
    restoreSession(state) {
      const stored = sessionStorage.getItem('gradlink_admin_auth');
      const user   = sessionStorage.getItem('gradlink_admin_user');
      if (stored === 'true' && user) {
        state.isAdmin = true;
        state.admin   = JSON.parse(user);
      }
    },
    logout(state) {
      state.isAdmin  = false;
      state.admin    = null;
      state.error    = null;
      state.attempts = 0;
      sessionStorage.removeItem('gradlink_admin_auth');
      sessionStorage.removeItem('gradlink_admin_user');
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAdmin.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading   = false;
        state.isAdmin   = true;
        state.admin     = action.payload;
        state.attempts  = 0;
        state.error     = null;
        toast.success(`Welcome back, ${action.payload.username}!`);
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.attempts += 1;
        state.error   = action.payload;
        const left = 5 - state.attempts;
        if (left <= 0) {
          toast.error('Too many failed attempts. Please try again later.');
        } else {
          toast.error(`${action.payload}. ${left} attempt(s) left.`);
        }
      })
      // Update Credentials
      .addCase(updateAdminCredentials.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(updateAdminCredentials.fulfilled, (state, action) => {
        state.loading = false;
        state.admin   = action.payload;
        toast.success('Admin settings updated successfully!');
      })
      .addCase(updateAdminCredentials.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
        toast.error(action.payload || 'Failed to update credentials.');
      });
  },
});

export const { restoreSession, logout, clearError } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
