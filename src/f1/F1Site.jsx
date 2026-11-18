import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowDown,
  faArrowRight,
  faBars,
  faEnvelope,
  faFlagCheckered,
  faRotateLeft,
  faVolumeHigh,
  faVolumeXmark,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { faGithub, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons'
import logo from '../assets/images/karuppu thangam.png'
import { computeTrack } from './track'
import { createEngine } from './engine'
import { ALSO, BLOCKS, LINKS, NAV, PROFILE, TOWERS, WEEKEND, WORK } from './content'
import './f1.scss'

const PATHS = { '/about': 'about', '/skills': 'skills', '/work': 'work', '/contact': 'pit', '/finish': 'finish' }
const GEARS = [0, 70, 105, 140, 175, 210, 250, 295, 345]
const LOOKAHEAD = { desktop: 950, mobile: 520 }

const store = {
  get(k) {
    try {
      return window.localStorage.getItem(k)
    } catch (e) {
      return null
    }
  },
  set(k, v) {
    try {
      window.localStorage.setItem(k, v)
    } catch (e) {
      /* storage blocked: lap times just are not remembered */
    }
  },
}

const fmt = (ms) => {
  if (ms == null || !isFinite(ms)) return '--:--.---'
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  const r = Math.floor(ms % 1000)
  return `${m}:${String(s).padStart(2, '0')}.${String(r).padStart(3, '0')}`
}

// Show each chunk of a path up to length `upto`. Chunks that are fully drawn or
// fully hidden are only touched when they change state.
const reveal3 = (g, refs, upto, cache) => {
  g.chunks.forEach((c, i) => {
    const v = Math.max(0, Math.min(c.len, upto - c.from))
    const key = v >= c.len ? -1 : v <= 0 ? 0 : Math.round(v)
    if (cache[i] === key) return
    cache[i] = key
    const el = refs[i]
    if (!el) return
    el.style.strokeDasharray = key === -1 ? 'none' : `${v.toFixed(1)} ${c.len + 100}`
  })
}

const markAt = (g, L) => {
  const p = g.pointAt(L)
  return { x: p.x, y: p.y, a: (Math.atan2(p.ty, p.tx) * 180) / Math.PI + 90 }
}

function Car({ flRef, frRef, drsRef, rainRef }) {
  return (
    <g className="car">
      <ellipse cx="2.5" cy="3.5" rx="17" ry="35" fill="rgba(0,0,0,.45)" />
      <path
        d="M-9 -15 L-3.5 -13 M9 -15 L3.5 -13 M-9 -12 L-4 -8 M9 -12 L4 -8 M-10 19 L-5 17 M10 19 L5 17 M-10 23 L-5 23 M10 23 L5 23"
        stroke="#8a94a3"
        strokeWidth="0.9"
      />
      <rect x="-17.5" y="12" width="8.5" height="16" rx="2.6" fill="#0b0d10" />
      <rect x="9" y="12" width="8.5" height="16" rx="2.6" fill="#0b0d10" />
      <rect x="-16" y="14" width="1.2" height="12" fill="#ffd700" opacity=".55" />
      <rect x="14.8" y="14" width="1.2" height="12" fill="#ffd700" opacity=".55" />
      <g ref={flRef}>
        <rect x="-16.5" y="-21.5" width="7.5" height="13" rx="2.4" fill="#0b0d10" />
        <rect x="-15.2" y="-20" width="1.1" height="10" fill="#ffd700" opacity=".55" />
      </g>
      <g ref={frRef}>
        <rect x="9" y="-21.5" width="7.5" height="13" rx="2.4" fill="#0b0d10" />
        <rect x="14.1" y="-20" width="1.1" height="10" fill="#ffd700" opacity=".55" />
      </g>
      <path
        d="M-4 -15 L4 -15 L5.5 -6 Q11.5 -3 11.5 4 L10.5 17 Q8 22.5 5 25.5 L-5 25.5 Q-8 22.5 -10.5 17 L-11.5 4 Q-11.5 -3 -5.5 -6 Z"
        fill="#ffd700"
      />
      <path d="M-11 3 L-6.5 0.5 L-6.5 14.5 L-10.2 15.5 Z" fill="#0f2a44" />
      <path d="M11 3 L6.5 0.5 L6.5 14.5 L10.2 15.5 Z" fill="#0f2a44" />
      <path d="M-2.3 -31 Q0 -34 2.3 -31 L4 -14.5 L-4 -14.5 Z" fill="#ffd700" />
      <path d="M-1.1 -30.5 L1.1 -30.5 L1.7 -12 L-1.7 -12 Z" fill="#0f2a44" />
      <path d="M-1.3 2 L1.3 2 L1.9 24 L-1.9 24 Z" fill="#0f2a44" />
      <path d="M-17.5 -34 H17.5 V-29.6 H-17.5 Z" fill="#0f2a44" />
      <path d="M-15 -29.2 H15 V-27.6 H-15 Z" fill="#ffd700" />
      <rect x="-18" y="-35" width="2.2" height="8" rx=".6" fill="#0a1a2b" />
      <rect x="15.8" y="-35" width="2.2" height="8" rx=".6" fill="#0a1a2b" />
      <ellipse cx="0" cy="-6" rx="3.6" ry="6" fill="#04080d" />
      <circle cx="0" cy="-5" r="2.5" fill="#f4f6f9" />
      <path d="M-1.6 -6.2 H1.6" stroke="#04080d" strokeWidth="1" />
      <path d="M-4 -0.5 Q-4.4 -11.5 0 -12.6 Q4.4 -11.5 4 -0.5" fill="none" stroke="#1d242d" strokeWidth="1.5" />
      <rect x="-12.5" y="25" width="25" height="3" rx=".7" fill="#0f2a44" />
      <path d="M-11.5 -15 H11.5" stroke="rgba(0,0,0,.18)" strokeWidth="0.6" />
      <rect ref={drsRef} x="-12.5" y="28.3" width="25" height="2.8" rx=".7" fill="#ffd700" className="drs-flap" />
      <rect x="-13.6" y="24.4" width="1.8" height="7.6" fill="#04080d" />
      <rect x="11.8" y="24.4" width="1.8" height="7.6" fill="#04080d" />
      <rect ref={rainRef} x="-1.6" y="31.8" width="3.2" height="1.8" rx=".4" fill="#ff2a2a" opacity=".25" />
    </g>
  )
}

function Head({ chip, s, title, sub }) {
  return (
    <header className="sec-head rv">
      <span className={`chip s${s}`}>{chip}</span>
      <h2>{title}</h2>
      {sub ? <p className="sec-sub">{sub}</p> : null}
    </header>
  )
}

export default function F1Site() {
  const location = useLocation()
  const deepLink = PATHS[location.pathname.replace(/\/+$/, '')] || null

  const reduced = useRef(
    typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  const wrapRef = useRef(null)
  const probeRef = useRef(null)
  const blockRefs = useRef({})
  const geoRef = useRef(null)
  const [geo, setGeo] = useState(null)

  // track + car refs, updated every frame without re-rendering React
  const edgeRefs = useRef([])
  const lineRefs = useRef([])
  const glowRefs = useRef([])
  const carElRef = useRef(null)
  const flRef = useRef(null)
  const frRef = useRef(null)
  const drsRef = useRef(null)
  const rainRef = useRef(null)
  const canvasRef = useRef(null)

  // HUD refs
  const spdRef = useRef(null)
  const gearRef = useRef(null)
  const lapRef = useRef(null)
  const ledsRef = useRef(null)
  const drsPillRef = useRef(null)
  const secRefs = useRef([])
  const toastRef = useRef(null)
  const miniDotRef = useRef(null)
  const miniRef = useRef(null)
  const lapResultRef = useRef(null)
  const lapNoteRef = useRef(null)
  const finishRef = useRef(null)

  const engineRef = useRef(null)
  const [sound, setSound] = useState(false)
  const [menu, setMenu] = useState(false)
  const [active, setActive] = useState('start')

  const skipIntro = () => {
    if (reduced.current || deepLink) return true
    try {
      return window.sessionStorage.getItem('sur-f1-intro') === '1'
    } catch (e) {
      return false
    }
  }
  const [intro, setIntro] = useState(() => (skipIntro() ? 'done' : 'on'))
  const [lights, setLights] = useState(0)
  const introRef = useRef(intro)
  introRef.current = intro
  const launchRef = useRef(0)

  // ---------- geometry ----------
  const build = useCallback(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const W = wrap.clientWidth
    const vh = probeRef.current ? probeRef.current.clientHeight : window.innerHeight
    const blocks = BLOCKS.map((b) => {
      const el = blockRefs.current[b.id]
      return { ...b, top: el.offsetTop, bottom: el.offsetTop + el.offsetHeight }
    })
    const docH = blocks[blocks.length - 1].bottom
    const prev = geoRef.current
    if (prev && prev.W === W && Math.abs(prev.docH - docH) < 2 && prev.vh === vh) return
    const g = computeTrack({ blocks, W, vh, docH, mobile: W < 760 })
    g.vh = vh
    geoRef.current = g
    setGeo(g)
  }, [])

  useEffect(() => {
    build()
    let t = null
    const ro = new ResizeObserver(() => {
      clearTimeout(t)
      t = setTimeout(build, 120)
    })
    ro.observe(wrapRef.current)
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(build)
    return () => {
      ro.disconnect()
      clearTimeout(t)
    }
  }, [build])

  // ---------- intro: five red lights, then lights out ----------
  useEffect(() => {
    if (intro !== 'on') {
      document.documentElement.classList.remove('locked')
      return undefined
    }
    document.documentElement.classList.add('locked')
    window.scrollTo(0, 0)
    const timers = []
    for (let i = 1; i <= 5; i++) {
      timers.push(
        setTimeout(() => {
          setLights(i)
          if (engineRef.current) engineRef.current.beep(false)
        }, 500 + i * 700)
      )
    }
    const hold = 500 + 5 * 700 + 450 + Math.random() * 900
    timers.push(
      setTimeout(() => {
        setLights(-1)
        launchRef.current = performance.now()
        if (engineRef.current) engineRef.current.beep(true)
      }, hold)
    )
    timers.push(setTimeout(() => setIntro('done'), hold + 900))
    return () => timers.forEach(clearTimeout)
  }, [intro])

  useEffect(() => {
    if (intro !== 'done') return
    try {
      window.sessionStorage.setItem('sur-f1-intro', '1')
    } catch (e) {
      /* ignore */
    }
  }, [intro])

  const endIntro = () => {
    launchRef.current = performance.now()
    setLights(-1)
    setIntro('done')
  }

  // deep links like /about or /contact drive straight to that section
  useEffect(() => {
    if (!deepLink || !geo) return
    const el = blockRefs.current[deepLink]
    if (el) window.scrollTo(0, Math.max(0, el.offsetTop - 70))
    // only on first geometry
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deepLink, !!geo])

  // ---------- section reveal + active nav ----------
  useEffect(() => {
    const els = wrapRef.current.querySelectorAll('.rv')
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('in')
        }),
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
    )
    els.forEach((el) => io.observe(el))
    const sec = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.dataset.nav)
        }),
      { rootMargin: '-45% 0px -50% 0px' }
    )
    NAV.concat([{ id: 'finish' }]).forEach((n) => {
      const el = blockRefs.current[n.id]
      if (el) sec.observe(el)
    })
    return () => {
      io.disconnect()
      sec.disconnect()
    }
  }, [])

  // ---------- the race loop ----------
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    let carL = null
    let prevL = 0
    let lastGeo = null
    let spd = 0
    let prevSpd = 0
    let shownSpd = -1
    let shownGear = ''
    let shownLeds = -1
    let shownDrs = null
    let edgeAt = -1000
    let lineAt = -1000
    let edgeCache = []
    let lineCache = []
    let glowCache = []
    let shownSteer = null
    let shownRain = null
    let shownFlap = null
    let toastT = 0
    const leds = ledsRef.current ? Array.from(ledsRef.current.children) : []
    const lap = { state: 'idle', t0: 0, sec: 0, splits: [], fromGrid: false }
    let bestLap = Number(store.get('sur-f1-best')) || null
    let bestSecs = []
    try {
      bestSecs = JSON.parse(store.get('sur-f1-secs') || '[]')
    } catch (e) {
      bestSecs = []
    }

    const parts = []
    let fxDirty = false
    const cv = canvasRef.current
    const ctx = cv ? cv.getContext('2d') : null
    let dpr = 1
    const sizeCanvas = () => {
      if (!cv) return
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      cv.width = window.innerWidth * dpr
      cv.height = window.innerHeight * dpr
    }
    sizeCanvas()
    window.addEventListener('resize', sizeCanvas)

    const showToast = (label, ms, cls) => {
      const el = toastRef.current
      if (!el) return
      el.textContent = `${label}  ${fmt(ms)}`
      el.className = `toast show ${cls}`
      toastT = performance.now()
    }

    const frame = (now) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000))
      last = now
      const g = geoRef.current
      if (g) {
        const doc = document.documentElement
        // a few px of slack: phones often stop scrolling just short of the bottom
        const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight - 6)
        const p = Math.min(1, Math.max(0, window.scrollY / maxScroll))
        const ty = g.y0 + p * (g.yEnd - g.y0)
        let target = Math.min(g.Lf, Math.max(g.L0, g.lengthAtY(ty)))
        if (introRef.current === 'on') target = g.L0
        if (lastGeo !== g || carL === null) {
          carL = target
          prevL = target
          lastGeo = g
          edgeAt = -1000
          lineAt = -1000
          edgeCache = []
          lineCache = []
          glowCache = []
        }
        const k = reduced.current ? 1 : 1 - Math.exp(-dt * 6.5)
        carL += (target - carL) * k
        if (Math.abs(target - carL) < 0.05) carL = target
        const v = Math.abs(carL - prevL) / dt
        prevL = carL

        const inDrs = !!g.drs && carL > g.drs[0] && carL < g.drs[1]
        const tSpd = Math.min(inDrs ? 352 : 338, v * 0.11)
        prevSpd = spd
        spd += (tSpd - spd) * Math.min(1, dt * (tSpd > spd ? 5 : 3.2))
        if (spd < 0.4) spd = 0
        const braking = (prevSpd - spd) / dt > 55

        // car
        const pt = g.pointAt(carL)
        const ang = (Math.atan2(pt.ty, pt.tx) * 180) / Math.PI + 90
        const idle = !reduced.current && spd < 2 && introRef.current === 'done'
        const jx = idle ? (Math.random() - 0.5) * 0.35 : 0
        const launchAge = (now - launchRef.current) / 1000
        const shake = launchAge < 0.6 && !reduced.current ? (Math.random() - 0.5) * 1.6 * (1 - launchAge / 0.6) : 0
        // the car is its own small layer, moved by the GPU (no repaint)
        if (carElRef.current) {
          carElRef.current.style.transform = `translate3d(${(pt.x + jx + shake).toFixed(2)}px, ${pt.y.toFixed(
            2
          )}px, 0) rotate(${ang.toFixed(2)}deg)`
        }
        const steer = Math.round(Math.max(-28, Math.min(28, pt.ahead * 950)))
        if (steer !== shownSteer) {
          shownSteer = steer
          if (flRef.current) flRef.current.setAttribute('transform', `rotate(${steer} -12.7 -15)`)
          if (frRef.current) frRef.current.setAttribute('transform', `rotate(${steer} 12.7 -15)`)
        }
        const rain = braking || (idle && Math.floor(now / 250) % 2 === 1)
        if (rain !== shownRain && rainRef.current) {
          shownRain = rain
          rainRef.current.setAttribute('opacity', rain ? '1' : '.25')
        }
        if (inDrs !== shownFlap && drsRef.current) {
          shownFlap = inDrs
          drsRef.current.setAttribute('class', inDrs ? 'drs-flap open' : 'drs-flap')
        }

        // track drawing
        const look = g.mobile ? LOOKAHEAD.mobile : LOOKAHEAD.desktop
        const reveal = carL + look
        // the edge lines sit in the static layer, so only repaint them in steps
        if (Math.abs(reveal - edgeAt) > 36) {
          edgeAt = reveal
          reveal3(g, edgeRefs.current, reveal, edgeCache)
        }
        // the driven line steps forward a few px at a time; its tip hides under the car
        if (Math.abs(carL - lineAt) > 10) {
          lineAt = carL
          reveal3(g, lineRefs.current, lineAt, lineCache)
          reveal3(g, glowRefs.current, lineAt, glowCache)
        }
        const trailLen = reduced.current ? 0 : Math.min(460, spd * 1.5)

        // gear / rpm / leds
        let gear = 'N'
        let rpm = 0.06
        if (spd >= 3) {
          let gi = 1
          while (gi < 8 && spd >= GEARS[gi]) gi++
          gear = String(gi)
          rpm = Math.min(1, Math.max(0, (spd - GEARS[gi - 1]) / (GEARS[gi] - GEARS[gi - 1])))
          rpm = 0.25 + rpm * 0.75
        }
        const rs = Math.round(spd)
        if (rs !== shownSpd && spdRef.current) {
          spdRef.current.textContent = rs
          shownSpd = rs
        }
        if (gear !== shownGear && gearRef.current) {
          gearRef.current.textContent = gear
          shownGear = gear
        }
        const blink = rpm > 0.96 && Math.floor(now / 70) % 2 === 0
        const lit = blink ? 0 : gear === 'N' ? 0 : Math.round(rpm * 15)
        if (lit !== shownLeds) {
          leds.forEach((el, i) => el.classList.toggle('on', i < lit))
          shownLeds = lit
        }
        if (inDrs !== shownDrs && drsPillRef.current) {
          drsPillRef.current.classList.toggle('on', inDrs)
          shownDrs = inDrs
        }
        if (engineRef.current) engineRef.current.update(gear === 'N' ? 0.05 : rpm, spd)

        // lap timing
        if (introRef.current === 'done') {
          // a lap only counts if the car actually left from the grid
          if (carL <= g.L0 + 24) lap.fromGrid = true
          if (lap.state === 'idle' && lap.fromGrid && carL > g.L0 + 24) {
            lap.fromGrid = false
            lap.state = 'run'
            lap.t0 = now
            lap.sec = 0
            lap.splits = []
            lap.secStart = now
            secRefs.current.forEach((el) => el && (el.className = 'sec-bar'))
          }
          if (lap.state === 'run') {
            const t = now - lap.t0
            if (lapRef.current) lapRef.current.textContent = fmt(t)
            while (lap.sec < 3 && carL >= g.sectorEnds[lap.sec] - (lap.sec === 2 ? 20 : 6)) {
              const split = now - lap.secStart
              lap.secStart = now
              const best = bestSecs[lap.sec]
              const isBest = !best || split < best
              if (isBest) bestSecs[lap.sec] = split
              const el = secRefs.current[lap.sec]
              if (el) el.className = `sec-bar ${isBest ? 'purple' : 'yellow'}`
              showToast(`S${lap.sec + 1}`, split, isBest ? 'purple' : 'yellow')
              lap.splits.push(split)
              lap.sec += 1
            }
            if (lap.sec >= 3) {
              lap.state = 'done'
              const total = now - lap.t0
              const pb = !bestLap || total < bestLap
              if (pb) bestLap = total
              store.set('sur-f1-best', String(Math.round(bestLap)))
              store.set('sur-f1-secs', JSON.stringify(bestSecs.map((x) => Math.round(x))))
              if (lapRef.current) lapRef.current.textContent = fmt(total)
              if (lapResultRef.current) lapResultRef.current.textContent = fmt(total)
              if (lapNoteRef.current) {
                lapNoteRef.current.textContent = pb ? 'Personal best. Purple lap!' : `Personal best: ${fmt(bestLap)}`
                lapNoteRef.current.className = pb ? 'lap-note purple' : 'lap-note'
              }
              if (finishRef.current) finishRef.current.classList.add('flagged')
            }
          }
          if (lap.state === 'done' && carL < g.L0 + 12) {
            lap.state = 'idle'
            if (lapRef.current) lapRef.current.textContent = fmt(null)
            if (finishRef.current) finishRef.current.classList.remove('flagged')
          }
        }
        if (toastT && now - toastT > 2300 && toastRef.current) {
          toastRef.current.className = 'toast'
          toastT = 0
        }

        // minimap
        if (miniDotRef.current) {
          miniDotRef.current.setAttribute('cx', pt.x.toFixed(1))
          miniDotRef.current.setAttribute('cy', pt.y.toFixed(1))
        }

        // sparks and tyre smoke, drawn in screen space
        if (ctx) {
          const sy = window.scrollY
          const rear = 30 * g.carScale
          const rx = pt.x - pt.tx * rear
          const ry = pt.y - pt.ty * rear - sy
          if (!reduced.current) {
            const straight = Math.abs(pt.kappa) < 0.004
            if (spd > 205 && straight) {
              for (let s = 0; s < 3; s++) {
                const sp = 140 + Math.random() * 220
                const side = (Math.random() - 0.5) * 2
                parts.push({
                  t: 'spark',
                  x: rx + -pt.ty * side * 6 * g.carScale,
                  y: ry + pt.tx * side * 6 * g.carScale,
                  vx: -pt.tx * sp + (Math.random() - 0.5) * 80,
                  vy: -pt.ty * sp + (Math.random() - 0.5) * 80,
                  life: 0.18 + Math.random() * 0.28,
                  age: 0,
                })
              }
            }
            if (spd > 80 && Math.abs(pt.kappa) > 0.012 && Math.random() < 0.7) {
              parts.push({
                t: 'smoke',
                x: rx + (Math.random() - 0.5) * 10 * g.carScale,
                y: ry + (Math.random() - 0.5) * 10 * g.carScale,
                vx: (Math.random() - 0.5) * 30,
                vy: (Math.random() - 0.5) * 30,
                life: 0.6 + Math.random() * 0.5,
                age: 0,
                r: 4 * g.carScale + 2,
              })
            }
            if (launchAge < 0.05 && launchAge >= 0) {
              for (let s = 0; s < 34; s++) {
                parts.push({
                  t: 'smoke',
                  x: rx + (Math.random() - 0.5) * 30 * g.carScale,
                  y: ry + (Math.random() - 0.5) * 12,
                  vx: (Math.random() - 0.5) * 90,
                  vy: 20 + Math.random() * 60,
                  life: 0.9 + Math.random() * 0.8,
                  age: 0,
                  r: 6 * g.carScale + 3,
                })
              }
            }
          }
          const drawTrail = trailLen > 6 && Math.abs(ry) < window.innerHeight * 2
          if (!parts.length && !fxDirty && !drawTrail) {
            raf = requestAnimationFrame(frame)
            return
          }
          fxDirty = parts.length > 0 || drawTrail
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
          ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
          if (drawTrail) {
            // speed streak behind the car, fading out towards its tail
            // the canvas sits above the car, so the streak stops at the rear wing
            const tailEnd = Math.max(0, carL - rear)
            const a0 = g.pointAt(Math.max(0, tailEnd - trailLen))
            const e0 = g.pointAt(tailEnd)
            const grad = ctx.createLinearGradient(a0.x, a0.y - sy, e0.x, e0.y - sy)
            const alpha = Math.min(0.7, spd / 380)
            grad.addColorStop(0, 'rgba(255,246,196,0)')
            grad.addColorStop(1, `rgba(255,246,196,${alpha.toFixed(3)})`)
            ctx.strokeStyle = grad
            ctx.lineWidth = g.trackW * 0.34
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
            ctx.beginPath()
            const step = 8
            const from = Math.max(0, tailEnd - trailLen)
            ctx.moveTo(a0.x, a0.y - sy)
            for (let L = from + step; L < tailEnd; L += step) {
              const q = g.pointAt(L)
              ctx.lineTo(q.x, q.y - sy)
            }
            ctx.lineTo(e0.x, e0.y - sy)
            ctx.stroke()
          }
          for (let i = parts.length - 1; i >= 0; i--) {
            const q = parts[i]
            q.age += dt
            if (q.age >= q.life) {
              parts.splice(i, 1)
              continue
            }
            q.x += q.vx * dt
            q.y += q.vy * dt
            const a = 1 - q.age / q.life
            if (q.t === 'spark') {
              ctx.strokeStyle = `rgba(255,${Math.round(150 + 90 * a)},${Math.round(60 * a)},${a})`
              ctx.lineWidth = 1.3
              ctx.beginPath()
              ctx.moveTo(q.x, q.y)
              ctx.lineTo(q.x - q.vx * 0.025, q.y - q.vy * 0.025)
              ctx.stroke()
            } else {
              const rr = q.r * (1 + q.age * 3)
              ctx.fillStyle = `rgba(205,214,226,${0.16 * a})`
              ctx.beginPath()
              ctx.arc(q.x, q.y, rr, 0, Math.PI * 2)
              ctx.fill()
            }
          }
          if (parts.length > 260) parts.splice(0, parts.length - 260)
        }
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', sizeCanvas)
    }
  }, [])

  // ---------- actions ----------
  const goTo = (id) => {
    setMenu(false)
    const behavior = reduced.current ? 'auto' : 'smooth'
    if (id === 'start') {
      window.scrollTo({ top: 0, behavior })
      return
    }
    const el = blockRefs.current[id]
    if (el) window.scrollTo({ top: Math.max(0, el.offsetTop - 70), behavior })
  }

  const toggleSound = () => {
    if (!engineRef.current) engineRef.current = createEngine()
    setSound(engineRef.current.toggle())
  }

  // tap anywhere on the minimap to drive there
  const miniJump = (e) => {
    const g = geoRef.current
    const svg = miniRef.current
    if (!g || !svg || !svg.getScreenCTM()) return
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const p = pt.matrixTransform(svg.getScreenCTM().inverse())
    // the map is rotated -90deg, so the track's y runs along the map's x axis
    const frac = Math.min(1, Math.max(0, (p.x - g.y0) / (g.yEnd - g.y0)))
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({ top: frac * maxScroll, behavior: reduced.current ? 'auto' : 'smooth' })
  }

  const setBlock = (id) => (el) => {
    blockRefs.current[id] = el
  }

  const sectionCls = (b) => `blk sec road-${b.road}`
  const byId = Object.fromEntries(BLOCKS.map((b) => [b.id, b]))
  const zones = BLOCKS.filter((b) => b.kind === 'zone')

  const renderZone = (z) => (
    <div key={z.id} className={`blk zone zone-${z.shape}`} ref={setBlock(z.id)} aria-hidden="true">
      <span className="zone-word">{z.word}</span>
    </div>
  )

  return (
    <div className={`f1 ${intro === 'on' ? 'pre' : 'go'} ${reduced.current ? 'calm' : ''}`}>
      <div ref={probeRef} className="vh-probe" aria-hidden="true" />

      {/* ---------- header ---------- */}
      <header className="hdr">
        <button type="button" className="brand" onClick={() => goTo('start')} aria-label="Back to start">
          <img src={logo} alt="" />
          <span>SURENDAR</span>
        </button>
        <nav className="hdr-nav" aria-label="Sections">
          {NAV.map((n) => (
            <button
              type="button"
              key={n.id}
              className={`nav-btn ${active === n.id ? 'active' : ''}`}
              onClick={() => goTo(n.id)}
            >
              {n.s ? <i className={`dot s${n.s}`} /> : null}
              {n.label}
            </button>
          ))}
        </nav>
        <div className="hdr-right">
          <a className="ico" href={LINKS.email} aria-label="Email">
            <FontAwesomeIcon icon={faEnvelope} />
          </a>
          <a className="ico" href={LINKS.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
            <FontAwesomeIcon icon={faInstagram} />
          </a>
          <a className="ico" href={LINKS.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <FontAwesomeIcon icon={faLinkedin} />
          </a>
          <button type="button" className="hire" onClick={() => goTo('pit')}>
            Hire me
          </button>
          <button
            type="button"
            className="menu-btn"
            aria-label={menu ? 'Close menu' : 'Open menu'}
            aria-expanded={menu}
            onClick={() => setMenu((m) => !m)}
          >
            <FontAwesomeIcon icon={menu ? faXmark : faBars} />
          </button>
        </div>
      </header>

      <div className={`menu ${menu ? 'open' : ''}`} aria-hidden={!menu}>
        <nav aria-label="Sections">
          {NAV.concat([{ id: 'finish', label: 'Finish' }]).map((n, i) => (
            <button type="button" key={n.id} tabIndex={menu ? 0 : -1} onClick={() => goTo(n.id)} style={{ '--i': i }}>
              <small>{n.s ? `S${n.s}` : i === 0 ? 'GRID' : 'FLAG'}</small>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="menu-links">
          <a href={LINKS.email} tabIndex={menu ? 0 : -1}>
            {LINKS.emailText}
          </a>
          <a href={LINKS.instagram} target="_blank" rel="noreferrer" tabIndex={menu ? 0 : -1}>
            Instagram
          </a>
          <a href={LINKS.linkedin} target="_blank" rel="noreferrer" tabIndex={menu ? 0 : -1}>
            LinkedIn
          </a>
        </div>
      </div>

      {/* ---------- the circuit ---------- */}
      <main className="circuit" ref={wrapRef}>
        {geo ? (
          <svg
            className="track"
            width={geo.W}
            height={geo.docH}
            viewBox={`0 0 ${geo.W} ${geo.docH}`}
            aria-hidden="true"
          >
            <defs>
              <pattern id="chk" width="8" height="8" patternUnits="userSpaceOnUse">
                <rect width="8" height="8" fill="#fff" />
                <rect width="4" height="4" fill="#0b0d10" />
                <rect x="4" y="4" width="4" height="4" fill="#0b0d10" />
              </pattern>
            </defs>
            <g className="t-shadow" strokeWidth={geo.trackW + 22}>
              {geo.chunks.map((c, i) => (
                <path key={i} d={c.d} />
              ))}
            </g>
            <g className="t-edge" strokeWidth={geo.trackW + 5}>
              {geo.chunks.map((c, i) => (
                <path key={i} d={c.d} ref={(el) => (edgeRefs.current[i] = el)} />
              ))}
            </g>
            <g className="t-asphalt" strokeWidth={geo.trackW}>
              {geo.chunks.map((c, i) => (
                <path key={i} d={c.d} />
              ))}
            </g>
            <g className="t-ghost">
              {geo.chunks.map((c, i) => (
                <path key={i} d={c.d} />
              ))}
            </g>
            {geo.marks.map((m, i) => (
              <path key={`m${i}`} className="t-mark" data-at={m.at} d={m.d} />
            ))}
            {geo.kerbs.map((k, i) => (
              <g key={`k${i}`} className="kerb" data-at={k.at}>
                <path d={k.d} strokeWidth={geo.kerbW} className="kerb-w" />
                <path d={k.d} strokeWidth={geo.kerbW} className="kerb-r" />
              </g>
            ))}
            {[geo.L0, geo.sectorEnds[0], geo.sectorEnds[1]].map((L, i) => {
              const m = markAt(geo, i === 0 ? L - 34 * geo.carScale : L)
              return (
                <g key={`s${i}`} transform={`translate(${m.x} ${m.y}) rotate(${m.a})`} className="t-sector" data-at={L}>
                  <rect
                    x={-geo.trackW / 2}
                    y={-2}
                    width={geo.trackW}
                    height={i === 0 ? 5 : 3}
                    className={i === 0 ? 'start-line' : `sec-line s${i + 1}`}
                  />
                </g>
              )
            })}
            {(() => {
              const m = markAt(geo, geo.L0 + 38 * geo.carScale)
              return (
                <g transform={`translate(${m.x} ${m.y}) rotate(${m.a})`}>
                  <path
                    d={`M${-geo.trackW * 0.42} 0 h${geo.trackW * 0.3} M${geo.trackW * 0.12} 0 h${geo.trackW * 0.3}`}
                    className="grid-slot"
                  />
                </g>
              )
            })()}
            {geo.drs ? (
              <g className="t-drs" data-at={geo.drs[0]}>
                {(() => {
                  const m = markAt(geo, geo.drs[0])
                  return (
                    <g transform={`translate(${m.x} ${m.y}) rotate(${m.a})`}>
                      <rect x={-geo.trackW / 2} y={-1.5} width={geo.trackW} height={3} />
                      {!geo.mobile ? (
                        <text x={0} y={-10} textAnchor="middle">
                          DRS
                        </text>
                      ) : null}
                    </g>
                  )
                })()}
              </g>
            ) : null}
            {(() => {
              const m = markAt(geo, geo.Lf)
              return (
                <g transform={`translate(${m.x} ${m.y}) rotate(${m.a})`} className="finish-line">
                  <rect x={-geo.trackW / 2 - 3} y={-8} width={geo.trackW + 6} height={16} fill="url(#chk)" />
                </g>
              )
            })()}
            {!geo.mobile
              ? geo.corners.map((c) => {
                  const off = geo.trackW / 2 + 16
                  const lx = c.x + c.out * off
                  const avail = c.out > 0 ? geo.W - lx : lx
                  if (avail < 40) return null
                  return (
                    <g key={`c${c.turn}`} className="t-label" data-at={geo.lengthAtY(c.y) - 200}>
                      <text x={lx} y={c.y - 2} textAnchor={c.out > 0 ? 'start' : 'end'} className="t-num">
                        T{c.turn}
                      </text>
                      {c.name && avail > 150 ? (
                        <text x={lx} y={c.y + 14} textAnchor={c.out > 0 ? 'start' : 'end'} className="t-name">
                          {c.name}
                        </text>
                      ) : null}
                    </g>
                  )
                })
              : null}
          </svg>
        ) : null}
        {geo ? (
          <svg
            className="track track-live"
            width={geo.W}
            height={geo.docH}
            viewBox={`0 0 ${geo.W} ${geo.docH}`}
            aria-hidden="true"
          >
            <g className="t-glow" strokeWidth={geo.trackW * 0.5}>
              {geo.chunks.map((c, i) => (
                <path key={i} d={c.d} ref={(el) => (glowRefs.current[i] = el)} />
              ))}
            </g>
            <g className="t-line">
              {geo.chunks.map((c, i) => (
                <path key={i} d={c.d} ref={(el) => (lineRefs.current[i] = el)} />
              ))}
            </g>
          </svg>
        ) : null}
        {geo ? (
          <div className="car-el" ref={carElRef} aria-hidden="true">
            <svg
              viewBox="-36 -40 72 80"
              width={72 * geo.carScale}
              height={80 * geo.carScale}
              style={{ marginLeft: -36 * geo.carScale, marginTop: -40 * geo.carScale }}
            >
              <Car flRef={flRef} frRef={frRef} drsRef={drsRef} rainRef={rainRef} />
            </svg>
          </div>
        ) : null}

        {/* START / HERO */}
        <section
          id="start"
          data-nav="start"
          className={`${sectionCls(byId.start)} hero`}
          ref={setBlock('start')}
        >
          <div className="sec-in">
            <div className="hero-tag">
              <span className="pos">P1</span>
              <span className="code">SUR</span>
              <span className="where">Chennai, India · building for clients worldwide</span>
            </div>
            <h1 className="hero-title">
              <span className="ht-line">SURENDAR</span>
            </h1>
            <p className="hero-role">App &amp; web developer</p>
            <p className="hero-lede">
              I build mobile apps and websites for startups and small businesses. Fixed price, a working demo every
              week, and the store launch handled.
            </p>
            <div className="hero-cta">
              <button type="button" className="btn btn-y" onClick={() => goTo('pit')}>
                Hire me <FontAwesomeIcon icon={faArrowRight} />
              </button>
              <button type="button" className="btn btn-o" onClick={() => goTo('about')}>
                Start your engine
              </button>
            </div>
            <div className="scroll-hint">
              <span className="mouse" aria-hidden="true">
                <i />
              </span>
              Scroll to drive
              <FontAwesomeIcon icon={faArrowDown} className="bob" />
            </div>
          </div>
        </section>

        {renderZone(zones[0])}

        {/* SECTOR 1: ABOUT */}
        <section id="about" data-nav="about" className={sectionCls(byId.about)} ref={setBlock('about')}>
          <div className="sec-in">
            <Head chip="Sector 1" s={1} title="About" sub="The driver behind the builds." />
            <div className="about-grid">
              <div className="about-text rv">
                <p>
                  I build mobile apps and websites for startups and small businesses at a fixed price, with a working
                  demo every week.
                </p>
                <p>
                  I handle the Play Store and App Store launch, and I teach app building and freelancing on Instagram
                  (@surendarcreates).
                </p>
                <p className="mute">Gym enthusiast, football fanatic and tech-obsessed.</p>
              </div>
              <dl className="driver-card rv">
                <div className="dc-head">
                  <span>Driver profile</span>
                  <span className="dc-code">SUR</span>
                </div>
                {PROFILE.map(([k, v]) => (
                  <div className="dc-row" key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <h3 className="mini-title rv">How a project runs: the race weekend</h3>
            <ol className="weekend">
              {WEEKEND.map((w, i) => (
                <li key={w.tag} className="rv" style={{ '--d': `${i * 120}ms` }}>
                  <span className="wk-tag">{w.tag}</span>
                  <strong>{w.title}</strong>
                  <p>{w.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {renderZone(zones[1])}

        {/* SECTOR 2: SKILLS */}
        <section id="skills" data-nav="skills" className={sectionCls(byId.skills)} ref={setBlock('skills')}>
          <div className="sec-in">
            <Head chip="Sector 2" s={2} title="Skills" sub="The timing tower. Everything I build with." />
            <div className="towers">
              {TOWERS.map((t, ti) => (
                <div className="tower rv" key={t.title} style={{ '--d': `${ti * 110}ms` }}>
                  <div className="tower-head">
                    <span className="tw-flag" />
                    {t.title}
                  </div>
                  <ol>
                    {t.rows.map(([code, name, tag], i) => (
                      <li key={name} style={{ '--r': i }}>
                        <span className="tw-pos">{i + 1}</span>
                        <span className="tw-bar" />
                        <span className="tw-code">{code}</span>
                        <span className="tw-name">{name}</span>
                        {tag ? <span className="tw-tag">{tag}</span> : null}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </section>

        {renderZone(zones[2])}

        {/* SECTOR 2: WORK */}
        <section id="work" data-nav="work" className={sectionCls(byId.work)} ref={setBlock('work')}>
          <div className="sec-in">
            <Head
              chip="Sector 2"
              s={2}
              title="Client work"
              sub="Apps I built for real businesses, both live on the App Store and Google Play."
            />
            <div className="boards">
              {WORK.map((w, i) => (
                <article className="board rv" key={w.name} style={{ '--d': `${i * 140}ms` }}>
                  <div className="board-lights" aria-hidden="true">
                    {Array.from({ length: 12 }).map((_, j) => (
                      <i key={j} style={{ '--j': j }} />
                    ))}
                  </div>
                  <div className="board-body">
                    <span className="board-kind">{w.kind}</span>
                    <h3>{w.name}</h3>
                    <p className="board-meta">{w.meta}</p>
                    <p className="board-sum">{w.summary}</p>
                    <ul>
                      {w.points.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                    <a className="btn btn-o sm" href={w.link} target="_blank" rel="noreferrer">
                      Visit {w.linkText} <FontAwesomeIcon icon={faArrowRight} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
            <div className="also rv">
              <span className="also-label">Also built</span>
              {ALSO.map((a) => (
                <span key={a} className="also-chip">
                  {a}
                </span>
              ))}
            </div>
          </div>
        </section>

        {renderZone(zones[3])}

        {/* SECTOR 3: PIT STOP / CONTACT */}
        <section id="pit" data-nav="pit" className={sectionCls(byId.pit)} ref={setBlock('pit')}>
          <div className="sec-in">
            <Head chip="Sector 3" s={3} title="Pit stop" sub="Box this lap. Let's talk about your app." />
            <div className="radio rv">
              <div className="radio-head">
                <span className="radio-live" />
                Team radio · SUR
                <span className="wave" aria-hidden="true">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <i key={i} style={{ '--w': i }} />
                  ))}
                </span>
              </div>
              <p className="radio-call">“Box, box.”</p>
              <p className="radio-msg">
                Tell me what you want to build, who it is for and when you want it live. I will reply with questions or
                a fixed quote.
              </p>
            </div>
            <div className="crew">
              <a className="crew-btn rv" href={LINKS.email} style={{ '--d': '0ms' }}>
                <span className="tyre" aria-hidden="true" />
                <span className="crew-k">Email</span>
                <span className="crew-v">{LINKS.emailText}</span>
              </a>
              <a
                className="crew-btn rv"
                href={LINKS.instagram}
                target="_blank"
                rel="noreferrer"
                style={{ '--d': '110ms' }}
              >
                <span className="tyre" aria-hidden="true" />
                <span className="crew-k">Instagram</span>
                <span className="crew-v">@surendarcreates</span>
              </a>
              <a
                className="crew-btn rv"
                href={LINKS.linkedin}
                target="_blank"
                rel="noreferrer"
                style={{ '--d': '220ms' }}
              >
                <span className="tyre" aria-hidden="true" />
                <span className="crew-k">LinkedIn</span>
                <span className="crew-v">Surendar A</span>
              </a>
            </div>
          </div>
        </section>

        {renderZone(zones[4])}

        {/* FINISH */}
        <section
          id="finish"
          data-nav="finish"
          className={`${sectionCls(byId.finish)} finish`}
          ref={(el) => {
            blockRefs.current.finish = el
            finishRef.current = el
          }}
        >
          <div className="sec-in">
            <div className="flag rv" aria-hidden="true">
              <FontAwesomeIcon icon={faFlagCheckered} />
            </div>
            <h2 className="finish-title rv">Chequered flag</h2>
            <div className="lap-card rv">
              <span className="lap-k">Your lap</span>
              <span className="lap-v" ref={lapResultRef}>
                --:--.---
              </span>
              <span className="lap-note" ref={lapNoteRef}>
                Drive the whole circuit to set a time.
              </span>
            </div>
            <p className="finish-cta rv">Your app could be the next one across the line.</p>
            <div className="hero-cta rv">
              <a className="btn btn-y" href={LINKS.email}>
                Email me <FontAwesomeIcon icon={faArrowRight} />
              </a>
              <button type="button" className="btn btn-o" onClick={() => goTo('start')}>
                <FontAwesomeIcon icon={faRotateLeft} /> Go again
              </button>
            </div>
            <footer className="foot">
              <span>© {new Date().getFullYear()} Surendar A · Built in Chennai</span>
              <span className="foot-links">
                <a href={LINKS.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                  <FontAwesomeIcon icon={faGithub} />
                </a>
                <a href={LINKS.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
                  <FontAwesomeIcon icon={faInstagram} />
                </a>
                <a href={LINKS.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                  <FontAwesomeIcon icon={faLinkedin} />
                </a>
              </span>
            </footer>
          </div>
        </section>
      </main>

      <canvas ref={canvasRef} className="fx" aria-hidden="true" />

      {/* ---------- HUD: steering wheel display ---------- */}
      <div className="hud">
        <div className="hud-leds" ref={ledsRef} aria-hidden="true">
          {Array.from({ length: 15 }).map((_, i) => (
            <i key={i} className={i < 5 ? 'g' : i < 10 ? 'r' : 'b'} />
          ))}
        </div>
        <div className="hud-main" aria-hidden="true">
          <div className="hud-speed">
            <b ref={spdRef}>0</b>
            <small>KM/H</small>
          </div>
          <div className="hud-gear" ref={gearRef}>
            N
          </div>
          <div className="hud-lap">
            <small>LAP</small>
            <b ref={lapRef}>--:--.---</b>
          </div>
        </div>
        {geo ? (
          <svg
            ref={miniRef}
            className="hud-map"
            viewBox={`${geo.bbox.minY} ${-geo.W} ${geo.bbox.maxY - geo.bbox.minY} ${geo.W}`}
            preserveAspectRatio="xMidYMid meet"
            onClick={miniJump}
            role="img"
            aria-label="Circuit map. Click a point to drive there."
          >
            <title>Circuit map: click to drive there</title>
            <g transform="rotate(-90)">
              <path d={geo.d} className="mini-base" vectorEffect="non-scaling-stroke" />
              {geo.sectors.map((d, i) => (
                <path key={i} d={d} className={`mini-s s${i + 1}`} vectorEffect="non-scaling-stroke" />
              ))}
              <circle ref={miniDotRef} r={geo.W * 0.05} className="mini-dot" />
            </g>
          </svg>
        ) : null}
        <div className="hud-foot">
          <div className="secs" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span key={i} className="sec-bar" ref={(el) => (secRefs.current[i] = el)} />
            ))}
          </div>
          <span className="drs-pill" ref={drsPillRef} aria-hidden="true">
            DRS
          </span>
          <button
            type="button"
            className={`snd ${sound ? 'on' : ''}`}
            onClick={toggleSound}
            aria-pressed={sound}
            aria-label={sound ? 'Turn engine sound off' : 'Turn engine sound on'}
          >
            <FontAwesomeIcon icon={sound ? faVolumeHigh : faVolumeXmark} />
          </button>
        </div>
      </div>
      <div className="toast" ref={toastRef} aria-hidden="true" />

      {/* ---------- lights out intro ---------- */}
      {intro === 'on' ? (
        <div className={`intro ${lights < 0 ? 'out' : ''}`} role="dialog" aria-label="Race start">
          <div className="gantry" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <div className="pod" key={i}>
                <span className={`lamp ${lights > i ? 'red' : ''}`} />
                <span className={`lamp ${lights > i ? 'red' : ''}`} />
              </div>
            ))}
          </div>
          <p className="intro-cap">{lights < 0 ? 'LIGHTS OUT' : 'SURENDAR · PORTFOLIO GRAND PRIX'}</p>
          <div className="intro-actions">
            <button type="button" onClick={toggleSound} aria-pressed={sound}>
              <FontAwesomeIcon icon={sound ? faVolumeHigh : faVolumeXmark} /> Sound {sound ? 'on' : 'off'}
            </button>
            <button type="button" onClick={endIntro}>
              Skip intro
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
