import { createSlice } from '@reduxjs/toolkit'

// ─── Token helpers ─────────────────────────────────────────────────────────
// Store the JWT in localStorage so it survives page reloads on mobile.
// Cookies with SameSite=None are unreliable on some Android Chrome versions
// and are completely blocked in many in-app browsers (Instagram, WhatsApp).
const TOKEN_KEY = 'nh_token'

export function saveToken(token) {
  if (token) {
    try { localStorage.setItem(TOKEN_KEY, token) } catch {}
  }
}

export function loadToken() {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}

export function clearToken() {
  try { localStorage.removeItem(TOKEN_KEY) } catch {}
}

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    userData: null,
    token: loadToken(),  // hydrate from localStorage on boot
    // loading=true until the first /current-user call completes,
    // so ProtectedRoute can avoid flashing the login modal on refresh.
    loading: true,
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload
      state.loading = false
    },
    setToken: (state, action) => {
      state.token = action.payload
      saveToken(action.payload)
    },
    clearAuth: (state) => {
      state.userData = null
      state.token = null
      state.loading = false
      clearToken()
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload
    },
  },
})

export const { setUserData, setToken, clearAuth, setAuthLoading } = userSlice.actions
export default userSlice.reducer