import { createSlice } from '@reduxjs/toolkit';

// Helper function to get initial state from localStorage
const getInitialState = () => {
  const storedAuth = localStorage.getItem('auth');
  return storedAuth 
    ? JSON.parse(storedAuth)
    : { token: null, role: null, userId: null };
};

const userSlice = createSlice({
  name: 'user',
  initialState: getInitialState(),
  reducers: {
    setAuthData: (state, action) => {
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.userId = action.payload.userId;
      localStorage.setItem('auth', JSON.stringify(action.payload));
    },
    clearAuthData: (state) => {
      state.token = null;
      state.role = null;
      state.userId = null;
      localStorage.removeItem('auth');
    }
  }
});

export const { setAuthData, clearAuthData } = userSlice.actions;
export default userSlice.reducer;