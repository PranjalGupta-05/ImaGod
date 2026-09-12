import React, { useContext } from 'react'
import {assets} from '../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Navbar = () => {

    const {user,setShowLogin, logout, credit}=useContext(AppContext)

    const navigate=useNavigate();

  return (
    <div className='flex items-center justify-between py-4'>
      <Link to='/'>
      <img src={assets.logo} alt="" className='w-28 sm:w-32 lg:w-40' />
      </Link>

    <div>
        {user ?
        <div className='flex items-center gap-2 sm:gap-3'>
            <button onClick={()=>navigate('/remove-bg')} className='flex items-center gap-1.5 bg-white/70 border border-gray-200 px-4 sm:px-5 py-1.5 transition-all duration-300 rounded-full hover:scale-105 hover:border-emerald-400 hover:bg-emerald-50 text-gray-600 text-xs sm:text-sm font-medium'>
                <svg className='w-3.5 h-3.5 text-emerald-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
                </svg>
                Remove BG
            </button>
            <button onClick={()=>navigate('/buycredit')} className='flex items-center gap-2 bg-blue-100 px-4 sm:px-6 py-1.5 transition-all duration-700 rounded-full hover:scale-105'>
                <img className='w-5' src={assets.credit_star} alt="" />
                <p className='text-xs sm:text-sm font-medium text-gray-600'>Credits left : {credit}</p>
            </button>
            <p className='text-gray-600 max-sm:hidden pl-4'>Hi, {user.name}</p>
            <div className='relative group'>
                <img className='w-10 drop-shadow' src={assets.profile_icon} alt="" />
                <div className='absolute hidden group-hover:block top-0 right-0 z-0 text-black rounded pt-12'>
                    <ul className='list-none m-0 p-2 bg-white rounded-md border text-sm'>
                        <li onClick={logout} className='py-1 px-2 cursor-pointer pr-10'>Logout</li>
                    </ul>
                </div>
            </div>
        </div>
        :
        <div className='flex items-center gap-2 sm:gap-5'>
            <p onClick={()=>navigate('/buycredit')} className='cursor-pointer'>Pricing</p>
            <button onClick={()=>setShowLogin(true)} className='bg-zinc-800 text-white px-7 py-2 sm:px-10 text-sm rounded-full'>Login</button>
        </div>
        }
        
        
    </div>

    </div>
  )
}

export default Navbar
