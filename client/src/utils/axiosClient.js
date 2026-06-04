/**
 * axiosClient.js
 * ─────────────────────────────────────────────────────────────────
 * Centralised Axios instance with:
 *
 *  1. Automatic Bearer-token injection from localStorage
 *     → Fixes auth failures on mobile where cross-origin cookies are
 *       blocked on Android Chrome / in-app browsers (Instagram, WhatsApp)
 *
 *  2. withCredentials: true kept for cookie-based auth on desktop
 *
 *  3. 401/403 interceptor:
 *     → Clears stale token from localStorage AND Redux state
 *     → Prevents the "logged in UI but all API calls fail" desync
 *
 * Usage: import axiosClient from '../utils/axiosClient'
 *        axiosClient.post('/api/interview/resume', formdata)
 *
 * All relative paths are resolved against VITE_SERVER_URL.
 * ─────────────────────────────────────────────────────────────────
 */
import axios from 'axios'
import { loadToken, clearToken } from '../../redux/userSlice'

const ServerUrl =
  import.meta.env.VITE_SERVER_URL ||
  'https://nexthire-ai-pqlg.onrender.com'

const axiosClient = axios.create({
  baseURL: ServerUrl,
  withCredentials: true,   // keep for cookie-based desktop sessions
  timeout: 60000,          // 60-second timeout (mobile networks can be slow)
})

/* ── Request interceptor: attach Bearer token ─────────────────── */
axiosClient.interceptors.request.use(
  (config) => {
    const token = loadToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    console.debug('[API]', config.method?.toUpperCase(), config.url,
      token ? '(Bearer ✓)' : '(no token)')
    return config
  },
  (error) => Promise.reject(error)
)

/* ── Response interceptor: handle auth errors ────────────────────
   On 401/403 we clear the stale token from both localStorage and
   Redux. Without the Redux clear the UI stays "logged in" but every
   API call silently fails — very confusing on mobile.              */
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status

    if (status === 401 || status === 403) {
      console.warn('[Auth] Token invalid/expired — clearing session')
      clearToken()

      // Dynamically import the store to avoid circular dependency
      // (axiosClient → store → axiosClient chain).
      // Using dynamic import means we don't need to import store at
      // module-load time.
      import('../../redux/store').then((module) => {
        const store = module.default
        // clearAuth sets userData=null, token=null, loading=false
        import('../../redux/userSlice').then(({ clearAuth }) => {
          store.dispatch(clearAuth())
        })
      }).catch(() => {
        // Fallback: just clear localStorage (Redux will catch up on next render)
        clearToken()
      })
    }

    return Promise.reject(error)
  }
)

export default axiosClient
export { ServerUrl }
