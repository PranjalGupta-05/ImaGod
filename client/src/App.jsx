import React, { useContext } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Home from './pages/Home'
import Result from './pages/Result'
import BuyCredit from './pages/BuyCredit'
import RemoveBg from './pages/RemoveBg'
import Enhance from './pages/Enhance'
import Unblur from './pages/Unblur'
import AiEditor from './pages/AiEditor'
import GenFill from './pages/GenFill'
import Usage from './pages/Usage'
import History from './pages/History'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Login from './components/Login'
import { AppContext } from './context/AppContext'

const App = () => {
  const { showLogin } = useContext(AppContext)
  const location = useLocation()
  const hideFooterRoutes = ['/result', '/remove-bg', '/enhance', '/unblur', '/ai-editor', '/gen-fill', '/buycredit', '/usage', '/history']
  const showFooter = !hideFooterRoutes.includes(location.pathname)

  return (
    <div className='min-h-screen bg-canvas text-ink flex flex-col antialiased selection:bg-primary selection:text-white'>
      <ToastContainer
        position='bottom-right'
        toastClassName={() =>
          'relative flex p-4 min-h-12 rounded-[14px] justify-between overflow-hidden cursor-pointer bg-white text-[#1d1d1f] border border-[#e0e0e0] font-caption'
        }
      />
      <Navbar />
      {showLogin && <Login />}
      <main className='flex-1 w-full bg-canvas flex flex-col'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/result' element={<Result />} />
          <Route path='/buycredit' element={<BuyCredit />} />
          <Route path='/usage' element={<Usage />} />
          <Route path='/remove-bg' element={<RemoveBg />} />
          <Route path='/enhance' element={<Enhance />} />
          <Route path='/unblur' element={<Unblur />} />
          <Route path='/ai-editor' element={<AiEditor />} />
          <Route path='/gen-fill' element={<GenFill />} />
          <Route path='/history' element={<History />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
    </div>
  )
}

export default App
