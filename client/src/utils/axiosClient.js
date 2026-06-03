/**
 * axiosClient.js
 * ─────────────────────────────────────────────────────────────────
 * Centralised Axios instance with:
 *
 *  1. Automatic Bearer-token injection from localStorage
 *     → Fixes the "user does not have a token" error on mobile
 *       because cross-origin cookies are blocked on Android Chrome /
 *       in-app browsers (Instagram, WhatsApp, etc.)
 *
 *  2. withCredentials: true kept for cookie-based auth on desktop
 *
 *  3. 401/403 interceptor:
 *     → Clears stale token + dispatches clearAuth
 *     → Redirects to login page cleanly
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
  timeout: 30000,          // 30-second timeout for slow mobile networks
})

/* ── Request interceptor: attach Bearer token ─────────────────── */
axiosClient.interceptors.request.use(
  (config) => {
    const token = loadToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    console.debug('[API]', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => Promise.reject(error)
)

/* ── Response interceptor: handle auth errors ────────────────────
   On 401/403 we clear the stale token and redirect to home.
   The user will be prompted to log in again by ProtectedRoute.   */
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const message = error?.response?.data?.message || ''

    if (
      status === 401 ||
      status === 403 ||
      message.includes('does not have a token') ||
      message.includes('VerifyToken')
    ) {
      console.warn('[Auth] Token invalid/expired — clearing session')
      clearToken()
      // Soft redirect: let the app's ProtectedRoute handle the UI
      // (don't do window.location.href here — it causes a full reload
      //  that loses React state and looks broken on mobile)
    }

    return Promise.reject(error)
  }
)

export default axiosClient
export { ServerUrl }
