import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from '../Pages/Home'
import Login from '../Pages/Login'
import Register from '../Pages/Register'

export default function AllRoutes() {
  return (
    <div>
        <Routes>
            <Route path="/" element={<Home/>} />
            <Route path='/login' element={<Login/>} />
            <Route path='/register' element={<Register/>} />
        </Routes>
    </div>
  )
}
