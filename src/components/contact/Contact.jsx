import React, { useEffect, useState } from 'react'
import Loader from 'react-loaders'
import Animated from '../AnimatedLetters/Animated'
import Layout from '../layout/Layout'
import './contact.scss'
const Contact = () => {
    const [letterClass, setLetterClass] = useState('text-animate')
    
   useEffect(()=>{
     setTimeout(() => {
         setLetterClass('text-animate-hover')
    }, 3000);
}, [])

  return (
    <>
    <div className="app">
        <Layout/>
    <div className='container contact-page'>
      <div className="text-zone">
        <h1>
           
            <Animated strArray={("Get in Touch").split("")} letterClass={letterClass}  idx={15}/>
        </h1>

        <p>
  Tell me what you want to build, who it is for and when you
  <br/>want it live. I will reply with questions or a fixed quote.<br/> 
  You can also message me on Instagram or LinkedIn.
        </p>
        <ul className="contact-links">
          <li>
            <a className="flat-button" href="mailto:surendarrix@gmail.com">Email</a>
            <span>surendarrix@gmail.com</span>
          </li>
          <li>
            <a className="flat-button" href="https://www.instagram.com/surendarcreates" target="_blank" rel="noreferrer">Instagram</a>
            <span>@surendarcreates</span>
          </li>
          <li>
            <a className="flat-button" href="https://www.linkedin.com/in/surendar-a-1b4199218/" target="_blank" rel="noreferrer">LinkedIn</a>
            <span>Surendar A</span>
          </li>
        </ul>
      </div>
    </div>
    <Loader type='pacman'/>
    
    </div>
    </>
  )
}

export default Contact