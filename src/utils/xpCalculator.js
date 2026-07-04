export function xpForLevel(level) {
  return (level - 1) * 100
}

export function levelFromXP(xp) {
  return Math.max(1, Math.floor(xp / 100) + 1)
}

export function xpProgressWithinLevel(xp) {
  const level = levelFromXP(xp)
  const levelStart = xpForLevel(level)
  const levelEnd = xpForLevel(level + 1)
  const span = levelEnd - levelStart
  const progressed = xp - levelStart
  return {
    level,
    current: progressed,
    total: span,
    percent: Math.min(100, Math.round((progressed / span) * 100)),
  }
}
