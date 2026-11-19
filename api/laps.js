// Global lap leaderboard.
// Storage: an Upstash Redis database connected to this Vercel project
// (Vercel → Storage → Upstash for Redis). Until one is connected, this returns
// 503 and the site simply hides the leaderboard.

const crypto = require('crypto')

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
const KEY = 'f1:laps'
const KEEP = 100
const MIN_MS = 2500 // faster than any honest scroll through the whole circuit
const MAX_MS = 30 * 60 * 1000
const BLOCKED = new Set(['ASS', 'FUK', 'FCK', 'FUC', 'SEX', 'KKK', 'NIG', 'FAG', 'CUM', 'DIK', 'TIT', 'XXX', 'POO', 'PEE', 'GAY', 'NAZ', 'SUK', 'COK', 'DIE', 'KYS'])

async function redis(commands) {
  const r = await fetch(`${URL_}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  })
  if (!r.ok) throw new Error(`redis ${r.status}`)
  return r.json()
}

async function top() {
  const [res] = await redis([['ZRANGE', KEY, '0', '9', 'WITHSCORES']])
  const flat = res.result || []
  const laps = []
  for (let i = 0; i < flat.length; i += 2) {
    laps.push({ id: flat[i], name: String(flat[i]).split(':')[0], ms: Number(flat[i + 1]) })
  }
  return laps
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store')
  if (!URL_ || !TOKEN) return res.status(503).json({ error: 'Leaderboard is not set up yet.' })

  try {
    if (req.method === 'GET') {
      return res.status(200).json({ laps: await top() })
    }

    if (req.method === 'POST') {
      let body = req.body
      if (typeof body === 'string') body = JSON.parse(body || '{}')
      body = body || {}
      const name = String(body.name || '')
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .slice(0, 3)
      const ms = Math.round(Number(body.ms))
      if (name.length !== 3) return res.status(400).json({ error: 'Use exactly 3 letters.' })
      if (BLOCKED.has(name)) return res.status(400).json({ error: 'Pick different initials.' })
      if (!(ms >= MIN_MS && ms <= MAX_MS)) return res.status(400).json({ error: 'That lap time looks off.' })

      // one submission per visitor every 20 seconds (the IP is hashed, never stored as-is)
      const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
      const who = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16)
      const [rl] = await redis([['SET', `f1:rl:${who}`, '1', 'EX', '20', 'NX']])
      if (rl.result !== 'OK') return res.status(429).json({ error: 'Slow down! Try again in a few seconds.' })

      const member = `${name}:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
      await redis([
        ['ZADD', KEY, String(ms), member],
        ['ZREMRANGEBYRANK', KEY, String(KEEP), '-1'],
      ])
      const [rank] = await redis([['ZRANK', KEY, member]])
      return res.status(200).json({
        laps: await top(),
        id: member,
        rank: rank.result == null ? null : Number(rank.result) + 1,
      })
    }

    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: 'Leaderboard is unavailable right now.' })
  }
}
