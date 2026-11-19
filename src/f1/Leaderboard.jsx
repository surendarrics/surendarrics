import React, { useEffect, useRef, useState } from 'react'
import { fmt } from './format'

// Fastest laps from every visitor. Stays hidden until the API answers, so the
// site works the same before the database is connected.
export default function Leaderboard({ lastLap }) {
  const [laps, setLaps] = useState(null)
  const [name, setName] = useState('')
  const [mine, setMine] = useState(null)
  const [rank, setRank] = useState(null)
  const [status, setStatus] = useState('')
  const [sentFor, setSentFor] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    let alive = true
    fetch('/api/laps')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => {
        if (alive && d && Array.isArray(d.laps)) setLaps(d.laps)
      })
      .catch(() => {
        /* no leaderboard yet: stay hidden */
      })
    return () => {
      alive = false
    }
  }, [])

  if (!laps) return null

  const canSubmit = lastLap != null && sentFor !== lastLap
  const submit = async (e) => {
    e.preventDefault()
    const n = name.toUpperCase().replace(/[^A-Z]/g, '')
    if (n.length !== 3) {
      setStatus('Use exactly 3 letters, like an F1 driver code.')
      if (inputRef.current) inputRef.current.focus()
      return
    }
    setStatus('Sending…')
    try {
      const r = await fetch('/api/laps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: n, ms: Math.round(lastLap) }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) {
        setStatus(d.error || 'Could not save your lap. Try again.')
        return
      }
      setLaps(d.laps || laps)
      setMine(d.id || null)
      setRank(d.rank || null)
      setSentFor(lastLap)
      setStatus('')
    } catch (err) {
      setStatus('Could not save your lap. Try again.')
    }
  }

  return (
    <div className="board-lb rv in">
      <div className="lb-head">
        <span className="tw-flag" aria-hidden="true" />
        Fastest laps
      </div>
      {laps.length ? (
        <ol className="lb-list">
          {laps.map((l, i) => (
            <li key={l.id} className={`${i === 0 ? 'p1' : ''} ${l.id === mine ? 'mine' : ''}`}>
              <span className="lb-pos">{i + 1}</span>
              <span className="lb-name">{l.name}</span>
              <span className="lb-time">{fmt(l.ms)}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="lb-empty">No laps yet. Set the first one.</p>
      )}
      {mine && rank ? <p className="lb-rank">You're P{rank}. Can you go faster?</p> : null}
      {canSubmit ? (
        <form className="lb-form" onSubmit={submit}>
          <label htmlFor="lb-name">Put {fmt(lastLap)} on the board</label>
          <div className="lb-row">
            <input
              id="lb-name"
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase().replace(/[^A-Za-z]/g, '').slice(0, 3))}
              placeholder="ABC"
              maxLength={3}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck="false"
              aria-describedby="lb-status"
            />
            <button type="submit" className="btn btn-y sm">
              Submit
            </button>
          </div>
        </form>
      ) : null}
      <p className="lb-status" id="lb-status" role="status">
        {status}
      </p>
    </div>
  )
}
