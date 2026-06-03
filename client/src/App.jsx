import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from "./pages/Home"
import Auth from './pages/Auth'
import InterviewPage from './pages/InterviewPage'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'
import Pricing from './pages/Pricing'
import InterviewReport from './pages/InterviewReport'
import InterviewHistory from './pages/InterviewHistory'
import ProtectedRoute from './components/ProtectedRoute'

export const ServerUrl = import.meta.env.VITE_SERVER_URL || "https://nexthire-ai-pqlg.onrender.com"

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await axios.get(ServerUrl + "/api/user/current-user", {
          withCredentials: true
        })
        dispatch(setUserData(result.data))
      } catch (error) {
        console.log(error)
        // Resolves loading even on error (unauthenticated)
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
