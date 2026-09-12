import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { motion } from "framer-motion"
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import sam_img_1 from '../assets/sam_img_1.png'
import sam_img_2 from '../assets/sam_img_2.png'
import sam_img_3 from '../assets/sam_img_3.png'
import sam_img_4 from '../assets/sam_img_4.png'
import sam_img_5 from '../assets/sam_img_5.png'
import sam_img_6 from '../assets/sam_img_6.png'


const Header = () => {

  const {user, setShowLogin}= useContext(AppContext)
  const navigate = useNavigate()

  const onClickHandler = ()=>{
    if(user){
      navigate('/result')
    }
    else{
      setShowLogin(true)
    }
  }

  const generatedImages = [
  sam_img_1, 
  sam_img_2, 
  sam_img_3, 
  sam_img_4, 
  sam_img_5,
  sam_img_6
];

  return (
    <motion.div className='flex flex-col justify-center items-center text-center my-20'
    initial={{opacity:0.2, y:100}}
    transition={{duration:1}}
    whileInView={{opacity:1, y:0}}
    viewport={{once:true}}
    >
      <motion.div className='text-stone-500 inline-flex text-center gap-2 bg-white px-6 py-1 rounded-full border border-neutral-500'
      initial={{opacity:0, y:-20}}
      animate={{opacity:1, y:0}}
      transition={{delay:0.3, duration:0.8}}
      >
        <p>Best Text To Image Generator</p>
        <img src={assets.star_icon} alt="" />
      </motion.div>

      <motion.h1 className='text-4xl max-w-[300px] sm:text-7xl sm:max-w-[590px] mx-auto mt-10 text-center'>Turn <span className='text-gray-500'>TEXT</span> To <span className='text-blue-500'
      initial={{opacity:0}}
      animate={{opacity:1}}
      transition={{delay:0.4, duration:2}}
      >IMAGE</span> In Seconds</motion.h1>

      <motion.p className='text-center max-w-xl mx-auto mt-5 '
      initial={{opacity:0, y:20}}
      animate={{opacity:1, y:0}}
      transition={{delay:0.6, duration:0.8}}
      >Unleash your creativity with AI. Turn your imagination into visual art in seconds - just type and watch the magic happens.</motion.p>

      <motion.button onClick={onClickHandler} className='sm:text-lg text-white bg-black w-auto mt-8 px-12 py-2.5 flex items-center gap-2 rounded-full'
      whileHover={{scale:1.05}}
      whileTap={{scale:0.95}}
      initial={{opacity:0}}
      animate={{opacity:1}}
      transition={{default:{duration:0.5}, opacity:{delay:0.8, duration:1}}}
      >Generate Images
        <img className='h-6' src={assets.star_group} alt="" />
      </motion.button>

      <motion.div 
      initial={{opacity:0}}
      animate={{opacity:1}}
      transition={{delay:1, duration:1}}
      className='flex flex-wrap justify-center mt-16 gap-3'>
        {Array(6).fill('').map((item, index)=>(
            <motion.img 
            whileHover={{scale:1.05, duration:0.1}}
            className='rounded-xl hover:scale-105 transition-all duration-300 cursor-pointer max-sm:w-10' src={generatedImages[index % 6]} alt="sry" key={index} width={100} />
        ))}
      </motion.div>

      <motion.p 
      initial={{opacity:0}}
      animate={{opacity:1}}
      transition={{delay:1.2, duration:0.8}}
      className='mt-2 text-neutral-600'>Generated Images From IMAGIFY</motion.p>

    </motion.div>
  )
}

export default Header
