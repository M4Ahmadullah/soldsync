/**
 * Phase 1: Jaro-Winkler string similarity matching.
 * Phase 2: Replace findBestMatch with findBestMatchHybrid (see docs/05-SCALE-FUTURE.md).
 */

function jaroWinkler(s1: string, s2: string): number {
  if (s1 === s2) return 1

  const len1 = s1.length
  const len2 = s2.length
  if (len1 === 0 || len2 === 0) return 0

  const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1

  const s1Matches = new Array(len1).fill(false)
  const s2Matches = new Array(len2).fill(false)

  let matches = 0
  let transpositions = 0

  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow)
    const end = Math.min(i + matchWindow + 1, len2)
    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue
      s1Matches[i] = true
      s2Matches[j] = true
      matches++
      break
    }
  }

  if (!matches) return 0

  let k = 0
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue
    while (!s2Matches[k]) k++
    if (s1[i] !== s2[k]) transpositions++
    k++
  }

  const jaro =
    (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3

  let prefix = 0
  for (let i = 0; i < Math.min(4, Math.min(len1, len2)); i++) {
    if (s1[i] === s2[i]) prefix++
    else break
  }

  return jaro + prefix * 0.1 * (1 - jaro)
}

export function normalizeTitle(title: string): string {
  return title.toLowerCase().trim().replace(/\s+/g, ' ')
}

export interface Candidate {
  id: string
  title: string
}

export interface MatchResult extends Candidate {
  score: number
}

export function findBestMatch(
  soldTitle: string,
  candidates: Candidate[],
  threshold = 0.9
): MatchResult | null {
  const normalized = normalizeTitle(soldTitle)
  let best: MatchResult | null = null

  for (const candidate of candidates) {
    const score = jaroWinkler(normalized, normalizeTitle(candidate.title))
    if (score >= threshold && (!best || score > best.score)) {
      best = { ...candidate, score }
    }
  }

  return best
}
