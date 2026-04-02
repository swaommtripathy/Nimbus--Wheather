import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: true,
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload
        ? {
            uid: action.payload.uid,
            displayName: action.payload.displayName,
            email: action.payload.email,
            photoURL: action.payload.photoURL,
            emailVerified: action.payload.emailVerified,
          }
        : null;
      state.loading = false;
    },
    setAuthLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const { setUser, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;
