// 83412 -> "1:23.412"
export const fmt = (ms) => {
  if (ms == null || !isFinite(ms)) return '--:--.---'
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  const r = Math.floor(ms % 1000)
  return `${m}:${String(s).padStart(2, '0')}.${String(r).padStart(3, '0')}`
}
