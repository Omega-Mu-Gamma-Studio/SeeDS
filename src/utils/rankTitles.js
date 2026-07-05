// Cosmetic rank ladder shown on the Passport's Student Record page.
// Purely derived from `level` (see xpCalculator.js) — no separate state to
// keep in sync. Titles are Academy-flavored, not "Level N" — this is meant
// to read as an in-world rank, not a UI stat.
const RANKS = [
  { min: 1, title: 'Freshman Wanderer' },
  { min: 3, title: 'Chainworks Apprentice' },
  { min: 5, title: 'Grove Pathfinder' },
  { min: 8, title: 'Observatory Fellow' },
  { min: 11, title: 'Bridgewright' },
  { min: 15, title: 'Market Adjudicator' },
  { min: 20, title: 'Stadium Record-Holder' },
  { min: 26, title: 'Academy Scholar' },
]

export function rankTitleForLevel(level) {
  let current = RANKS[0].title
  for (const rank of RANKS) {
    if (level >= rank.min) current = rank.title
    else break
  }
  return current
}

export function nextRankAt(level) {
  const next = RANKS.find((rank) => rank.min > level)
  return next ? next.min : null
}
