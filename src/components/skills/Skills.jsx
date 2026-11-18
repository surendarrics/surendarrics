import React, { useEffect, useState } from 'react'
import Loader from 'react-loaders'
import Animated from '../AnimatedLetters/Animated'
import Layout from '../layout/Layout'
import './skills.scss'

const SKILL_GROUPS = [
  {
    title: 'Mobile',
    items: 'Flutter, Dart, Android and iOS from one codebase, Play Store and App Store launch.',
  },
  {
    title: 'Front-end',
    items: 'HTML, CSS, Javascript, React, BootStrap, StyledComponents, TailwindCss, MaterialUI, NPM, SASS.',
  },
  {
    title: 'Back-End',
    items: 'Supabase (database, auth, storage), Nodejs, ExpressJS, MongoDb, REST APIs.',
  },
  {
    title: 'Languages',
    items: 'Javascript, Dart, Python.',
  },
  {
    title: 'Design',
    items: 'UI design, responsive layouts, animation with GSAP.',
  },
  {
    title: 'Tools',
    items: 'Git, GitHub, Vercel, VS Code.',
  },
]

const Skills = () => {
  const [letterClass, setLetterClass] = useState('text-animate')

  useEffect(() => {
    const t = setTimeout(() => {
      setLetterClass('text-animate-hover')
    }, 3000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div>
      <Layout />
      <div className="container skills-page">
        <div className="text-zone">
          <div className="skills-grid">
            {SKILL_GROUPS.map((g, i) => (
              <div className="skill-block" key={g.title} style={{ animationDelay: `${1 + i * 0.25}s` }}>
                <h1>
                  <Animated letterClass={letterClass} strArray={g.title.split('')} idx={15} />
                </h1>
                <p>{g.items}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Loader type="pacman" />
    </div>
  )
}

export default Skills
