import React from 'react'
import Header from '../components/Header'
import Description from '../components/Description'
import Testimonials from '../components/Testimonials'
import GenerateBtn from '../components/GenerateBtn'

const Home = () => {
  return (
    <div className='w-full'>
      <Header />
      <Description />
      <Testimonials />
      <GenerateBtn />
    </div>
  )
}

export default Home