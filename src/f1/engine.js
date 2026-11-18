// A small synthesised engine note (no audio files). Off until the visitor
// switches it on, because browsers only allow sound after a tap or click.

export function createEngine() {
  let ctx = null
  let master = null
  let oscA = null
  let oscB = null
  let filter = null
  let on = false

  const ensure = () => {
    if (ctx) return
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)
    filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 900
    filter.Q.value = 4
    filter.connect(master)
    oscA = ctx.createOscillator()
    oscA.type = 'sawtooth'
    oscB = ctx.createOscillator()
    oscB.type = 'square'
    const gB = ctx.createGain()
    gB.gain.value = 0.35
    oscA.connect(filter)
    oscB.connect(gB)
    gB.connect(filter)
    oscA.frequency.value = 70
    oscB.frequency.value = 35
    oscA.start()
    oscB.start()
  }

  return {
    get on() {
      return on
    },
    toggle() {
      ensure()
      if (!ctx) return false
      if (ctx.state === 'suspended') ctx.resume()
      on = !on
      master.gain.setTargetAtTime(on ? 0.05 : 0, ctx.currentTime, 0.08)
      return on
    },
    // rpm 0..1 inside the current gear, speed in km/h
    update(rpm, speed) {
      if (!ctx || !on) return
      const f = 62 + rpm * 190 + speed * 0.35
      oscA.frequency.setTargetAtTime(f, ctx.currentTime, 0.05)
      oscB.frequency.setTargetAtTime(f / 2, ctx.currentTime, 0.05)
      filter.frequency.setTargetAtTime(600 + rpm * 1600, ctx.currentTime, 0.05)
    },
    beep(high) {
      if (!ctx || !on) return
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = high ? 1320 : 880
      g.gain.value = 0.0001
      g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (high ? 0.5 : 0.18))
      o.connect(g)
      g.connect(ctx.destination)
      o.start()
      o.stop(ctx.currentTime + 0.6)
    },
  }
}
