import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from "./pages/Home"
import Auth from './pages/Auth'
import InterviewPage from './pages/InterviewPage'
import Pricing from './pages/Pricing'
import InterviewReport from './pages/InterviewReport'
import InterviewHistory from './pages/InterviewHistory'
import ProtectedRoute from './components/ProtectedRoute'
import { useDispatch } from 'react-redux'
import { setUserData, setToken } from '../redux/userSlice'
import axiosClient, { ServerUrl } from './utils/axiosClient'

export { ServerUrl }

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await axiosClient.get('/api/user/current-user')
        const data = result.data

        // If server returned a fresh token in the body, persist it
        if (data?._token) {
          dispatch(setToken(data._token))
        }

        dispatch(setUserData(data))
      } catch (error) {
        console.log('[App] Auth check failed:', error?.response?.status)
        // Resolves loading state even on unauthenticated error
        dispatch(setUserData(null))
      }
    }

    getUser()
  }, [dispatch])

  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/auth' element={<Auth />} />
      <Route path='/pricing' element={<Pricing />} />

      {/* Protected routes — require authentication */}
      <Route
        path='/interview'
        element={
          <ProtectedRoute featureName="Practice Mode">
            <InterviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/history'
        element={
          <ProtectedRoute featureName="Interview History">
            <InterviewHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path='/report/:id'
        element={
          <ProtectedRoute featureName="Interview Report">
            <InterviewReport />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
