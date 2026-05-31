export const CHAPTERS = [
  {
    id: 0,
    key: 'hero',
    label: null,
    headline: null,
    body: null,
    color: '#6366F1',
    scrollStart: 0,
    scrollEnd: 0.12,
    magnetAt: null as number | null,
  },
  {
    id: 1,
    key: 'warp',
    label: null,
    headline: null,
    body: null,
    color: '#06B6D4',
    scrollStart: 0.12,
    scrollEnd: 0.15,
    magnetAt: null,
  },
  {
    id: 2,
    key: 'logistics',
    label: 'Logistics AI',
    headline: 'Your supply chain is drowning in signals.',
    body: 'Dispatch emails, inventory sheets, delayed ETAs — all fragmented. Vnnovate wires it into one autonomous system.',
    link: 'Explore Logistics AI',
    color: '#F59E0B',
    scrollStart: 0.15,
    scrollEnd: 0.32,
    magnetAt: 0.22,
  },
  {
    id: 3,
    key: 'support',
    label: 'Conversational AI',
    headline: '68% of customers leave before a human reads their message.',
    body: 'Ticket floods, missed chats, slow resolutions. Our AI resolves — not just triages — in seconds.',
    link: 'Explore Support AI',
    color: '#EC4899',
    scrollStart: 0.35,
    scrollEnd: 0.52,
    magnetAt: 0.43,
  },
  {
    id: 4,
    key: 'sales',
    label: 'Sales Intelligence',
    headline: 'Your best leads go cold while your team updates spreadsheets.',
    body: 'Scattered CRM data, missed follow-ups, no pipeline visibility. AI that scores, sequences, and closes.',
    link: 'Explore Sales AI',
    color: '#6366F1',
    scrollStart: 0.55,
    scrollEnd: 0.72,
    magnetAt: 0.63,
  },
  {
    id: 5,
    key: 'ops',
    label: 'Workflow Automation',
    headline: 'Every manager spends 11 hours a week on work AI can do in 4 minutes.',
    body: 'Approvals, reports, scheduling, data entry. One AI layer automates your entire operation.',
    link: 'Explore Automation',
    color: '#10B981',
    scrollStart: 0.75,
    scrollEnd: 0.90,
    magnetAt: 0.82,
  },
  {
    id: 6,
    key: 'finale',
    label: null,
    headline: null,
    body: null,
    color: '#6366F1',
    scrollStart: 0.92,
    scrollEnd: 1.0,
    magnetAt: null,
  },
]

export const CHAPTER_COLORS: Record<string, string> = {
  logistics: '#F59E0B',
  support: '#EC4899',
  sales: '#6366F1',
  ops: '#10B981',
  hero: '#06B6D4',
  warp: '#06B6D4',
  finale: '#6366F1',
}

/** Industry chapters only (for progress rail) */
export const INDUSTRY_CHAPTER_KEYS = ['logistics', 'support', 'sales', 'ops'] as const

export function getChapterAtProgress(progress: number) {
  for (const ch of [...CHAPTERS].reverse()) {
    if (progress >= ch.scrollStart) return ch
  }
  return CHAPTERS[0]
}

/**
 * Magnet strength 0–1 from scroll progress within a chapter.
 * Peaks at chapter.magnetAt, then holds organized state.
 */
export function getMagnetStrength(progress: number, chapterKey: string): number {
  const ch = CHAPTERS.find((c) => c.key === chapterKey)
  if (!ch?.magnetAt || !ch.label) return 0

  const span = ch.scrollEnd - ch.scrollStart
  if (span <= 0) return 0

  const magnetLocal = (ch.magnetAt - ch.scrollStart) / span
  const within = (progress - ch.scrollStart) / span

  if (within < magnetLocal * 0.5) return 0
  if (within < magnetLocal) {
    return ((within - magnetLocal * 0.5) / (magnetLocal * 0.5)) * 0.5
  }
  return Math.min(0.5 + (within - magnetLocal) * 2, 1)
}
