import React from 'react'
import Header from '../components/Header'
import Description from '../components/Description.jsx'
import Testimonials from '../components/Testimonials'

const Home = () => {
  return (
    <div className='w-full'>
      <Header />
      <Description />
      <Testimonials />
    </div>
  )
}

export default Home