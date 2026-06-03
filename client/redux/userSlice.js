import { createSlice } from '@reduxjs/toolkit'

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    userData: null,
    // loading=true until the first /current-user call completes,
    // so ProtectedRoute can avoid flashing the login modal for
    // already-authenticated users on page refresh.
    loading: true,
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload
      state.loading = false
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload
    },
  },
})

// Action creators
export const { setUserData, setAuthLoading } = userSlice.actions

export default userSlice.reducer