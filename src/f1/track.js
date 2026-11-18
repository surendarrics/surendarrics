// Builds the race circuit from the page layout.
// Every piece of road starts and ends heading straight down, so pieces can be
// chained in any order and the road stays smooth. y never goes backwards, which
// lets us map "how far down the page" to "how far along the track".

const DS = 4 // spacing of the resampled track, in px

const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1])

// Centripetal Catmull-Rom: smooth curve through every waypoint, no loops or cusps.
function catmullRom(points) {
  const P = []
  points.forEach((p) => {
    const last = P[P.length - 1]
    if (!last || dist(last, p) > 0.5) P.push(p)
  })
  if (P.length < 2) return P
  const n = P.length
  const ext = [
    [2 * P[0][0] - P[1][0], 2 * P[0][1] - P[1][1]],
    ...P,
    [2 * P[n - 1][0] - P[n - 2][0], 2 * P[n - 1][1] - P[n - 2][1]],
  ]
  const out = []
  for (let i = 1; i < ext.length - 2; i++) {
    const p0 = ext[i - 1]
    const p1 = ext[i]
    const p2 = ext[i + 1]
    const p3 = ext[i + 2]
    const t0 = 0
    const t1 = t0 + Math.sqrt(Math.max(dist(p0, p1), 0.01))
    const t2 = t1 + Math.sqrt(Math.max(dist(p1, p2), 0.01))
    const t3 = t2 + Math.sqrt(Math.max(dist(p2, p3), 0.01))
    const steps = Math.max(4, Math.ceil(dist(p1, p2) / 3))
    for (let s = 0; s < steps; s++) {
      const t = t1 + ((t2 - t1) * s) / steps
      const lerp = (a, b, ta, tb) => {
        const k = (t - ta) / (tb - ta)
        return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]
      }
      const A1 = lerp(p0, p1, t0, t1)
      const A2 = lerp(p1, p2, t1, t2)
      const A3 = lerp(p2, p3, t2, t3)
      const B1 = lerp(A1, A2, t0, t2)
      const B2 = lerp(A2, A3, t1, t3)
      out.push(lerp(B1, B2, t1, t2))
    }
  }
  out.push(P[n - 1])
  return out
}

// Even spacing along the curve makes length lookups trivial.
function resample(poly) {
  const xs = [poly[0][0]]
  const ys = [poly[0][1]]
  let carry = 0
  for (let i = 1; i < poly.length; i++) {
    const a = poly[i - 1]
    const b = poly[i]
    const seg = dist(a, b)
    if (seg === 0) continue
    let d = DS - carry
    while (d <= seg) {
      const k = d / seg
      xs.push(a[0] + (b[0] - a[0]) * k)
      ys.push(a[1] + (b[1] - a[1]) * k)
      d += DS
    }
    carry = seg - (d - DS)
  }
  return { xs: Float32Array.from(xs), ys: Float32Array.from(ys) }
}

const f1 = (n) => Math.round(n * 10) / 10

function polyD(px, py) {
  let d = `M${f1(px[0])} ${f1(py[0])}`
  for (let i = 1; i < px.length; i++) d += `L${f1(px[i])} ${f1(py[i])}`
  return d
}

export function computeTrack({ blocks, W, vh, docH, mobile }) {
  const trackW = mobile ? 22 : W < 1100 ? 40 : 50
  const gutter = mobile ? 56 : Math.min(W * 0.3, 440)
  const laneX = (side) => (side === 'left' ? gutter / 2 : W - gutter / 2)
  const r = mobile ? 24 : W < 1100 ? 62 : 74
  const wig = mobile ? 0 : 30
  const y0 = vh * 0.55
  const yEnd = docH - vh * 0.45
  const carScale = mobile ? 0.5 : W < 1100 ? 0.66 : 0.78

  const pts = []
  const corners = [] // apex points that get a name/turn number
  const drsYs = []
  const push = (x, y) => pts.push([x, y])

  let x = laneX(blocks[0].road)
  push(x, Math.max(80, y0 - vh * 0.34))
  push(x, y0 - vh * 0.12)
  push(x, y0)

  blocks.forEach((b, bi) => {
    const top = b.top
    const bottom = bi === blocks.length - 1 ? b.bottom - 30 : b.bottom
    const h = bottom - top
    if (b.kind === 'section') {
      const lane = laneX(b.road)
      const cy = bi === 0 ? y0 : top
      const n = Math.max(2, Math.round((bottom - cy) / 230))
      for (let i = 1; i <= n; i++) {
        const y = cy + ((bottom - cy) * i) / n
        const off = i < n ? wig * (i % 2 ? 1 : -1) : 0
        push(lane + off, y)
      }
      x = lane
      return
    }

    // A zone: open track between two sections.
    const next = blocks[bi + 1]
    const xe = laneX(next.road)
    const L = laneX('left')
    const R = laneX('right')

    if (b.shape === 'hairpins') {
      const differ = Math.abs(xe - x) > 2
      const n = differ ? 3 : 2
      let d = differ ? (xe > x ? 1 : -1) : x < W / 2 ? 1 : -1
      const dy = (h - 2 * r - 2 * r * (n - 1)) / n
      let cy = top
      push(x + d * r, cy + r)
      cy += r
      for (let k = 0; k < n; k++) {
        const target = d > 0 ? R : L
        cy += dy
        push(target - d * r, cy)
        push(target, cy + r)
        if (k < n - 1) {
          corners.push({ x: target, y: cy + r, out: d, name: k === 0 ? b.name : null })
          push(target - d * r, cy + 2 * r)
          cy += 2 * r
          d = -d
        } else {
          cy += r
        }
      }
      if (cy < bottom - 1) push(xe, bottom)
    } else if (b.shape === 'esses') {
      const mid = W / 2
      const A = mobile ? W * 0.24 : W * 0.2
      const s = x > mid ? 1 : -1
      const p1 = [mid + A * s, top + h * 0.24]
      const p2 = [mid - A * s, top + h * 0.48]
      const p3 = [mid + A * s, top + h * 0.72]
      // each swing gets a rounded U-turn instead of a sharp point
      const rr = Math.min(r, h * 0.1)
      ;[
        [p1, s],
        [p2, -s],
        [p3, s],
      ].forEach(([q, side]) => {
        push(q[0] - side * rr, q[1] - rr)
        push(q[0], q[1])
        push(q[0] - side * rr, q[1] + rr)
      })
      push(xe, top + h * 0.93)
      push(xe, bottom)
      corners.push({ x: p1[0], y: p1[1], out: s, name: b.name })
      corners.push({ x: p2[0], y: p2[1], out: -s, name: null })
      corners.push({ x: p3[0], y: p3[1], out: s, name: null })
    } else if (b.shape === 'straight') {
      const a = [x + (xe - x) * 0.05, top + h * 0.14]
      const z = [x + (xe - x) * 0.95, top + h * 0.8]
      push(...a)
      for (let t = 0.25; t < 0.8; t += 0.25) {
        push(a[0] + (z[0] - a[0]) * t, a[1] + (z[1] - a[1]) * t)
      }
      push(...z)
      push(xe, top + h * 0.93)
      push(xe, bottom)
      drsYs.push(top + h * 0.2, top + h * 0.74)
      corners.push({
        x: a[0] + (z[0] - a[0]) * 0.22,
        y: a[1] + (z[1] - a[1]) * 0.22 + (mobile ? 0 : 40),
        out: xe > x ? -1 : 1,
        name: b.name,
      })
    }
    x = xe
  })

  const { xs, ys } = resample(catmullRom(pts))
  const N = xs.length
  const total = (N - 1) * DS

  // running max of y so lookups by height never step backwards
  const ymax = new Float32Array(N)
  let m = -Infinity
  for (let i = 0; i < N; i++) {
    m = Math.max(m, ys[i])
    ymax[i] = m
  }
  const lengthAtY = (y) => {
    let lo = 0
    let hi = N - 1
    if (y <= ymax[0]) return 0
    if (y >= ymax[hi]) return total
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1
      if (ymax[mid] < y) lo = mid
      else hi = mid
    }
    const span = ymax[hi] - ymax[lo]
    const k = span > 0 ? (y - ymax[lo]) / span : 0
    return (lo + k) * DS
  }

  // curvature (turning per px), smoothed
  const kap = new Float32Array(N)
  for (let i = 1; i < N - 1; i++) {
    const ax = xs[i] - xs[i - 1]
    const ay = ys[i] - ys[i - 1]
    const bx = xs[i + 1] - xs[i]
    const by = ys[i + 1] - ys[i]
    const cross = ax * by - ay * bx
    const dot = ax * bx + ay * by
    kap[i] = Math.atan2(cross, dot) / DS
  }
  const kapS = new Float32Array(N)
  const win = 4
  for (let i = 0; i < N; i++) {
    let s = 0
    let c = 0
    for (let j = Math.max(0, i - win); j <= Math.min(N - 1, i + win); j++) {
      s += kap[j]
      c++
    }
    kapS[i] = s / c
  }

  const tangentAt = (i) => {
    const a = Math.max(0, i - 3)
    const b = Math.min(N - 1, i + 3)
    const tx = xs[b] - xs[a]
    const ty = ys[b] - ys[a]
    const l = Math.hypot(tx, ty) || 1
    return [tx / l, ty / l]
  }

  const pointAt = (len) => {
    const f = Math.min(Math.max(len / DS, 0), N - 1)
    const i = Math.floor(f)
    const j = Math.min(i + 1, N - 1)
    const k = f - i
    const [tx, ty] = tangentAt(i)
    return {
      x: xs[i] + (xs[j] - xs[i]) * k,
      y: ys[i] + (ys[j] - ys[i]) * k,
      tx,
      ty,
      kappa: kapS[i],
      // curvature a little further ahead, used to steer the front wheels
      ahead: kapS[Math.min(N - 1, i + 6)],
    }
  }

  // Kerbs on the outside of every real corner, rubber marks on the inside.
  const kerbs = []
  const marks = []
  const kerbW = mobile ? 4 : 7
  const thr = 1 / (r * 2.4)
  let i = 0
  while (i < N) {
    if (Math.abs(kapS[i]) < thr) {
      i++
      continue
    }
    let j = i
    while (j < N && Math.abs(kapS[j]) >= thr * 0.8) j++
    const a = Math.max(0, i - 3)
    const b = Math.min(N - 1, j + 3)
    if (b - a > 8) {
      let sum = 0
      for (let q = a; q <= b; q++) sum += kapS[q]
      const sign = sum > 0 ? 1 : -1
      const outPx = []
      const outPy = []
      const inPx = []
      const inPy = []
      const m1x = []
      const m1y = []
      const m2x = []
      const m2y = []
      const len = b - a
      for (let q = a; q <= b; q++) {
        const [tx, ty] = tangentAt(q)
        const nx = -ty
        const ny = tx
        const o = -sign
        const off = trackW / 2 + kerbW / 2
        outPx.push(xs[q] + nx * o * off)
        outPy.push(ys[q] + ny * o * off)
        const pos = (q - a) / len
        if (pos > 0.25 && pos < 0.75) {
          inPx.push(xs[q] - nx * o * off)
          inPy.push(ys[q] - ny * o * off)
        }
        if (pos > 0.12 && pos < 0.88) {
          const c = trackW * 0.18
          const half = 12 * carScale
          m1x.push(xs[q] - nx * o * (c - half))
          m1y.push(ys[q] - ny * o * (c - half))
          m2x.push(xs[q] - nx * o * (c + half))
          m2y.push(ys[q] - ny * o * (c + half))
        }
      }
      const at = a * DS
      kerbs.push({ d: polyD(outPx, outPy), at })
      // inside kerbs only on corners wide enough to show them properly
      const avgK = Math.abs(sum) / (b - a + 1)
      if (inPx.length > 4 && avgK < 1 / (trackW * 1.7)) kerbs.push({ d: polyD(inPx, inPy), at })
      if (m1x.length > 4) marks.push({ d: polyD(m1x, m1y) + polyD(m2x, m2y), at })
    }
    i = j + 1
  }

  // a lighter path for drawing (every 2nd sample)
  let d = `M${f1(xs[0])} ${f1(ys[0])}`
  for (let q = 2; q < N; q += 2) d += `L${f1(xs[q])} ${f1(ys[q])}`
  d += `L${f1(xs[N - 1])} ${f1(ys[N - 1])}`

  // Short chunks: the browser only has to draw the bits of road near each
  // screen tile, and only the chunk under the car repaints as it moves.
  const CH = 100
  const chunks = []
  for (let s0 = 0; s0 < N - 1; s0 += CH) {
    const e = Math.min(N - 1, s0 + CH)
    // run 3 samples past the join so neighbouring chunks overlap: no hairline seams
    const eo = Math.min(N - 1, e + 3)
    let cd = `M${f1(xs[s0])} ${f1(ys[s0])}`
    for (let q = s0 + 2; q < eo; q += 2) cd += `L${f1(xs[q])} ${f1(ys[q])}`
    cd += `L${f1(xs[eo])} ${f1(ys[eo])}`
    chunks.push({ d: cd, from: s0 * DS, len: (e - s0) * DS })
  }

  const L0 = lengthAtY(y0)
  const Lf = lengthAtY(yEnd)
  const byId = Object.fromEntries(blocks.map((b) => [b.id, b]))
  const sectorEnds = [lengthAtY(byId.about.bottom), lengthAtY(byId.work.bottom), Lf]

  // sub-paths for the minimap, one per sector
  const sub = (from, to) => {
    const s = Math.max(0, Math.floor(from / DS))
    const e = Math.min(N - 1, Math.ceil(to / DS))
    let out = `M${f1(xs[s])} ${f1(ys[s])}`
    for (let q = s + 3; q < e; q += 3) out += `L${f1(xs[q])} ${f1(ys[q])}`
    return out + `L${f1(xs[e])} ${f1(ys[e])}`
  }
  const sectors = [
    sub(L0, sectorEnds[0]),
    sub(sectorEnds[0], sectorEnds[1]),
    sub(sectorEnds[1], Lf),
  ]

  let turn = 0
  const named = corners.map((c) => {
    turn += 1
    return { ...c, turn }
  })

  return {
    W,
    docH,
    d,
    chunks,
    total,
    trackW,
    kerbW,
    carScale,
    mobile,
    kerbs,
    marks,
    corners: named,
    L0,
    Lf,
    y0,
    yEnd,
    sectorEnds,
    sectors,
    drs: drsYs.length ? [lengthAtY(drsYs[0]), lengthAtY(drsYs[1])] : null,
    bbox: { minY: Math.max(0, ys[0] - 40), maxY: ys[N - 1] + 40 },
    pointAt,
    lengthAtY,
  }
}
