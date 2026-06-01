import React, { useEffect } from 'react'
import { Route , Routes } from 'react-router-dom'
import Home from "./pages/Home"
import Auth from './pages/Auth'
import InterviewPage from './pages/InterviewPage'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'

export const ServerUrl = "http://localhost:8000"
function App() {
  const dispatch = useDispatch()


  useEffect(()=>{
    const getUser = async ()=>{
      try {
        const result = await axios.get(ServerUrl+ "/api/user/current-user", {
          withCredentials: true
        })
        dispatch(setUserData(result.data))
      } catch (error) {
        console.log(error)
        dispatch(setUserData(null))
      }
    }

    getUser()
  },[dispatch])
 

  return (
    <Routes>
      <Route path='/' element={<Home />}/>
      <Route path='/auth' element={<Auth />}/>
      <Route path='/interview' element={<InterviewPage />}/>



    </Routes>
  )
}

export default App
