import React, { useEffect, useState } from 'react'
import Loader from 'react-loaders'
import Animated from '../AnimatedLetters/Animated'
import Layout from '../layout/Layout'
import { WorkData } from './WorkData'
import './work.scss'

const Work = () => {
  const [letterClass, setLetterClass] = useState('text-animate')

  useEffect(() => {
    const t = setTimeout(() => {
      setLetterClass('text-animate-hover')
    }, 3000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="app">
      <Layout />
      <div className="container work-page">
        <div className="text-zone">
          <h1>
            <Animated
              letterClass={letterClass}
              strArray={'Client work'.split('')}
              idx={15}
            />
          </h1>
          <p className="intro">
            Apps I built for real businesses, both live on the App Store and Google Play.
          </p>
          <div className="work-grid">
            {WorkData.map((w) => (
              <article className="work-card" key={w.name}>
                <span className="kind">{w.kind}</span>
                <h3>{w.name}</h3>
                <p className="meta">{w.meta}</p>
                <p>{w.summary}</p>
                <ul>
                  {w.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
                <a className="flat-button" href={w.link} target="_blank" rel="noreferrer">
                  {w.linkText}
                </a>
              </article>
            ))}
          </div>
          <p className="more">
            Also built: a wedding invitation app and a business management app.
          </p>
        </div>
      </div>
      <Loader type="pacman" />
    </div>
  )
}

export default Work
