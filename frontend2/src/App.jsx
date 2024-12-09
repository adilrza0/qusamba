import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Button } from './components/ui/button'
import Homepage from './Pages/Home'
import Homepage2 from './Pages/HOme2'
import ProductListPage from './Pages/ProuductList'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='nanum-myeongjo-regular margin-auto'>
     
    <Homepage2/>
    <ProductListPage/>
    </div> 
  )
}

export default App
