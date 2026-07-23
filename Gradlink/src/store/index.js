import { configureStore } from '@reduxjs/toolkit';
import adminAuthReducer from './slices/adminAuthSlice';
import dataReducer from './slices/dataSlice';

const store = configureStore({
  reducer: {
    adminAuth: adminAuthReducer,
    data: dataReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable File objects in actions (for image uploads)
        ignoredActionPaths: ['payload.imageFile', 'meta.arg.imageFile'],
      },
    }),
});

export default store;
