

import Layout from './components/layout/Layout.jsx'
import './App.scss'
import {Routes, Route} from 'react-router-dom'
import Home from './components/home/Home.jsx';
import About from './components/about/About.jsx';
import Contact from './components/contact/Contact.jsx';
import Skills from './components/skills/Skills.jsx';
import Work from './components/work/Work.jsx';

function App() {
  return (
   <>
   <Routes>
    <Route path='/'   element={<Layout />} />
    <Route index element={<Home/>}/>
    <Route path='/about' element={<About/>} />
    <Route path='/contact' element={<Contact/>} />
    <Route path='/skills' element={<Skills/>} />
    <Route path='/work' element={<Work/>} />
   </Routes>
   </>
  );
}

export default App;
