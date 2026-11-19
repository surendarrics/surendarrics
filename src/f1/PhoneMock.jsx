import React from 'react'

// Small, generic phone screens drawn with CSS. Shapes stand in for content on
// purpose: these illustrate concepts, they are not screenshots of real apps.

const Bar = ({ w = 60, h = 5, c, r = 3 }) => (
  <i className="pm-bar" style={{ width: `${w}%`, height: h, background: c, borderRadius: r }} />
)

function Clinic() {
  return (
    <>
      <div className="pm-row pm-dates">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={i === 1 ? 'on' : ''}>
            <Bar w={60} h={3} />
            <b />
          </span>
        ))}
      </div>
      <div className="pm-label">
        <Bar w={45} />
      </div>
      <div className="pm-slots">
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className={i === 4 ? 'on' : i === 2 || i === 7 ? 'off' : ''} />
        ))}
      </div>
      <div className="pm-card pm-doc">
        <span className="pm-avatar" />
        <div>
          <Bar w={70} />
          <Bar w={45} h={4} />
        </div>
      </div>
      <div className="pm-cta">Book</div>
    </>
  )
}

function Restaurant() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div className="pm-card pm-item" key={i}>
          <span className="pm-thumb" />
          <div>
            <Bar w={75} />
            <Bar w={40} h={4} />
          </div>
          <span className="pm-add">+</span>
        </div>
      ))}
      <div className="pm-label">
        <Bar w={50} />
      </div>
      <div className="pm-track">
        <i className="done" />
        <i className="done" />
        <i className="now" />
        <i />
      </div>
      <div className="pm-cta">Order</div>
    </>
  )
}

function Studio() {
  return (
    <>
      <div className="pm-week">
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} className={i === 3 ? 'on' : ''} />
        ))}
      </div>
      {[0, 1, 2].map((i) => (
        <div className={`pm-card pm-class ${i === 0 ? 'on' : ''}`} key={i}>
          <div>
            <Bar w={65} />
            <Bar w={35} h={4} />
          </div>
          <span className="pm-pill" />
        </div>
      ))}
      <div className="pm-card pm-member">
        <Bar w={55} />
        <Bar w={80} h={4} />
      </div>
    </>
  )
}

function Property() {
  return (
    <>
      <div className="pm-card pm-rent">
        <Bar w={40} h={4} />
        <Bar w={70} h={10} />
        <div className="pm-cta sm">Pay rent</div>
      </div>
      <div className="pm-label">
        <Bar w={55} />
      </div>
      {['open', 'done'].map((st) => (
        <div className="pm-card pm-req" key={st}>
          <span className="pm-thumb sq" />
          <div>
            <Bar w={70} />
            <Bar w={40} h={4} />
          </div>
          <span className={`pm-st ${st}`} />
        </div>
      ))}
      <div className="pm-chat">
        <span className="pm-ai">AI</span>
        <Bar w={70} h={4} />
      </div>
    </>
  )
}

const SCREENS = { clinic: Clinic, restaurant: Restaurant, studio: Studio, property: Property }

export default function PhoneMock({ kind }) {
  const Screen = SCREENS[kind] || Clinic
  return (
    <div className={`phone pm-${kind}`} aria-hidden="true">
      <div className="pm-notch" />
      <div className="pm-screen">
        <div className="pm-status">
          <i />
          <i />
        </div>
        <div className="pm-head">
          <span className="pm-logo" />
          <Bar w={50} h={6} c="currentColor" />
        </div>
        <Screen />
      </div>
    </div>
  )
}
