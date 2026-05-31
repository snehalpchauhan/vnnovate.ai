import * as THREE from 'three'
import {
  getButterflyFlightCurve,
  getButterflyTangentAtProgress,
} from './butterflyScrollPath'

export type MilestoneObjectKind = 'orb' | 'prism' | 'helix' | 'beacon'

export type PathMilestone = {
  id: string
  progress: number
  span: number
  eyebrow: string
  title: string
  titleAccent?: string
  sub: string
  body: string
  icon: string          // emoji icon shown at card top
  services: string[]    // service/skill chips
  contactCta: string    // tailored contact button label
  stat?: string
  statLabel?: string
  caseStudyHref?: string
  objectKind: MilestoneObjectKind
  objectColor: string
  focusSide: number
  focusBehind: number
  focusHeight: number
}

export const MILESTONE_REVEAL_LEAD = 0.01
export const MILESTONE_HIDE_TRAIL = 0.014

const MILESTONE_SPAN = 0.014
const KINDS: MilestoneObjectKind[] = ['orb', 'prism', 'helix', 'beacon']

type MilestoneDef = Omit<
  PathMilestone,
  'progress' | 'span' | 'objectKind' | 'focusSide' | 'focusBehind' | 'focusHeight'
>



const MILESTONE_DEFS: MilestoneDef[] = [
  {
    id: 'intro',
    eyebrow: 'Intelligent systems, engineered',
    title: 'Vnnovate',
    titleAccent: '.ai',
    sub: 'Where AI meets ambition.',
    body: 'We design and ship AI products that move with you — from first spark to production scale. Every system we build is grounded in real business outcomes, not theoretical demos.',
    icon: '🦋',
    services: ['AI Strategy', 'Product Engineering', 'End-to-End Delivery'],
    contactCta: 'Start your AI journey',
    stat: '50+',
    statLabel: 'AI systems shipped',
    objectColor: '#6366F1',
  },
  {
    id: 'problem',
    eyebrow: 'The reality',
    title: 'Data everywhere',
    titleAccent: ' · chaos',
    sub: 'Your teams are drowning in disconnected signals.',
    body: 'CRM data lives in one silo, support tickets in another, and operations in spreadsheets nobody agrees on. The cost is not just inefficiency — it is the decisions you never made because the insight arrived too late.',
    icon: '🌪️',
    services: ['Data Unification', 'AI Analytics', 'Smart Dashboards'],
    contactCta: 'Untangle your data',
    stat: '73%',
    statLabel: 'of teams cite data fragmentation as top blocker',
    objectColor: '#F59E0B',
  },
  {
    id: 'build',
    eyebrow: 'What we do',
    title: 'Build',
    titleAccent: ' · Ship · Scale',
    sub: 'Production-ready AI from day one.',
    body: 'Autonomous agents, smart workflows, and custom platforms — built to work the moment they ship. We do not deliver slide decks or POCs that gather dust. We stay until the system is live, adopted, and measurable.',
    icon: '🚀',
    services: ['Custom AI Build', 'Autonomous Agents', 'Platform Engineering'],
    contactCta: 'Get a build estimate',
    stat: '4–8 wks',
    statLabel: 'from kickoff to production',
    objectColor: '#22D3EE',
  },
  {
    id: 'logistics',
    eyebrow: 'Industry · Logistics',
    title: 'Supply chain',
    titleAccent: ' AI',
    sub: 'Your entire logistics layer, automated.',
    body: 'Dispatch emails, inventory sheets, delayed ETAs, and carrier updates — wired into one autonomous logistics layer that flags exceptions before they become fires. Less chasing, more shipping.',
    icon: '🚛',
    services: ['Dispatch Automation', 'ETA Intelligence', 'Carrier API Integration'],
    contactCta: 'Automate my logistics',
    stat: '62%',
    statLabel: 'reduction in manual dispatch work',
    caseStudyHref: '#logistics-case-study',
    objectColor: '#F97316',
  },
  {
    id: 'support',
    eyebrow: 'Industry · Support',
    title: 'Conversational',
    titleAccent: ' AI',
    sub: 'Resolve in seconds, not shifts.',
    body: 'An AI layer that reads context, pulls from your knowledge base, and resolves tickets without human handoff — for the 80% of issues that are repetitive. Your team handles the edge cases that actually need them.',
    icon: '💬',
    services: ['AI Chat & Ticketing', 'Knowledge Base AI', 'Escalation Routing'],
    contactCta: 'Cut my support backlog',
    stat: '3 min',
    statLabel: 'average resolution time (was 4 hrs)',
    caseStudyHref: '#support-case-study',
    objectColor: '#EC4899',
  },
  {
    id: 'sales',
    eyebrow: 'Industry · Sales',
    title: 'Sales',
    titleAccent: ' intelligence',
    sub: 'Stop guessing which deals will close.',
    body: 'Score leads with real signals, sequence follow-ups automatically, and surface pipeline risk days before it becomes revenue lost. Your reps spend time on conversations that matter, not CRM updates.',
    icon: '🎯',
    services: ['Lead Scoring AI', 'CRM Automation', 'Pipeline Risk Alerts'],
    contactCta: 'Supercharge my pipeline',
    stat: '2.4×',
    statLabel: 'pipeline conversion improvement',
    caseStudyHref: '#sales-case-study',
    objectColor: '#818CF8',
  },
  {
    id: 'ops',
    eyebrow: 'Industry · Operations',
    title: 'Workflow',
    titleAccent: ' automation',
    sub: 'One AI layer across your entire operation.',
    body: 'Approvals routed intelligently. Reports that write themselves. Scheduling that adapts to demand. Data entry that never requires a human. We map your highest-friction workflows and systematically eliminate them.',
    icon: '⚙️',
    services: ['Workflow AI', 'Smart Scheduling', 'Automated Reporting'],
    contactCta: 'Eliminate my bottlenecks',
    stat: '18 hrs',
    statLabel: 'per employee saved weekly',
    objectColor: '#10B981',
  },
  {
    id: 'trust',
    eyebrow: '12 years of excellence',
    title: 'Trusted',
    titleAccent: ' by builders',
    sub: 'A track record built on shipped systems, not promises.',
    body: 'Over a decade of delivering enterprise-ready technology across logistics, finance, healthcare, and retail. We have seen what breaks in production and built our process around avoiding it.',
    icon: '🏆',
    services: ['Enterprise Delivery', 'Multi-industry Expertise', 'Post-launch Support'],
    contactCta: 'See our track record',
    stat: '12 yrs',
    statLabel: 'building enterprise systems',
    objectColor: '#FACC15',
  },
  {
    id: 'process',
    eyebrow: 'How we work',
    title: 'Discover',
    titleAccent: ' to deploy',
    sub: 'Weeks, not quarters.',
    body: 'Week 1: discovery and pain mapping. Week 2–3: prototype with real data. Week 4–8: production build with your team embedded. Clear milestones, no ambiguous sprints, and a live system at the end.',
    icon: '🗺️',
    services: ['Discovery Sprint', 'Rapid Prototyping', 'Embedded Engineering'],
    contactCta: 'Plan my first sprint',
    stat: '6 wks',
    statLabel: 'median time to first production deploy',
    objectColor: '#06B6D4',
  },
  {
    id: 'agents',
    eyebrow: 'Capability',
    title: 'Autonomous',
    titleAccent: ' agents',
    sub: 'AI that acts, not just answers.',
    body: 'Multi-step agents that research the web, query your databases, trigger API calls, and report results — without a human in the loop for every action. Built with guardrails to operate safely at scale.',
    icon: '🤖',
    services: ['Agentic AI', 'Tool-use LLMs', 'Guardrail Engineering'],
    contactCta: 'Build me an agent',
    stat: '10–40×',
    statLabel: 'task throughput vs manual',
    objectColor: '#6366F1',
  },
  {
    id: 'integrations',
    eyebrow: 'Capability',
    title: 'Deep',
    titleAccent: ' integrations',
    sub: 'AI that lives where your team already works.',
    body: 'Salesforce, HubSpot, SAP, Slack, Gmail, Jira, your internal APIs — connected into a unified intelligence layer. No ripping and replacing your stack. AI plugs in as a new layer on top.',
    icon: '🔗',
    services: ['API Integration', 'CRM / ERP Connectors', 'Unified Data Layer'],
    contactCta: 'Connect my stack',
    stat: '200+',
    statLabel: 'pre-built integration connectors',
    objectColor: '#14B8A6',
  },
  {
    id: 'security',
    eyebrow: 'Enterprise',
    title: 'Secure',
    titleAccent: ' by design',
    sub: 'Enterprise-grade from the ground up.',
    body: 'Privacy-first architecture with data residency options, role-based access controls, full audit trails, and deployment choices — cloud, hybrid, or on-prem. We work with your compliance teams from day one.',
    icon: '🛡️',
    services: ['SOC 2 Architecture', 'RBAC & Audit Trails', 'On-prem Deployment'],
    contactCta: 'Review my security needs',
    stat: 'SOC 2',
    statLabel: 'ready architecture and audit support',
    objectColor: '#64748B',
  },
  {
    id: 'custom-models',
    eyebrow: 'Capability',
    title: 'Custom',
    titleAccent: ' models',
    sub: 'AI that speaks your business language.',
    body: 'Generic models understand general language. Custom fine-tuned models understand your terminology, your data patterns, and your domain-specific edge cases — and outperform off-the-shelf on your exact tasks.',
    icon: '🧠',
    services: ['Fine-tuning & RLHF', 'Domain-specific LLMs', 'Model Evaluation'],
    contactCta: 'Train a model on my data',
    stat: '40–70%',
    statLabel: 'accuracy improvement over base models',
    objectColor: '#A855F7',
  },
  {
    id: 'analytics',
    eyebrow: 'Outcomes',
    title: 'Measurable',
    titleAccent: ' ROI',
    sub: 'If you cannot measure it, we did not ship it.',
    body: 'Every engagement includes a baseline, a measurement framework, and dashboards tracking adoption, time saved, cost reduced, and revenue influenced. We tie AI impact to the metrics your board cares about.',
    icon: '📊',
    services: ['ROI Dashboards', 'Adoption Analytics', 'Executive Reporting'],
    contactCta: 'Show me the numbers',
    stat: '3–8×',
    statLabel: 'average ROI within 90 days',
    objectColor: '#0EA5E9',
  },
  {
    id: 'team',
    eyebrow: 'Who we are',
    title: 'Engineers',
    titleAccent: ' and builders',
    sub: 'No consultants. Just people who ship.',
    body: 'A hands-on team of AI engineers, product designers, and domain specialists who have worked at scale. We embed with your team, write real code, and stay until the system works — not until the contract ends.',
    icon: '👥',
    services: ['Embedded Teams', 'AI Product Design', 'Technical Leadership'],
    contactCta: 'Meet the team',
    stat: '35+',
    statLabel: 'engineers, researchers and product leads',
    objectColor: '#E879F9',
  },
  {
    id: 'case-study',
    eyebrow: 'Proof',
    title: 'Real',
    titleAccent: ' results',
    sub: 'Not pilots. Production systems.',
    body: 'A logistics client cut dispatch time by 62%. A support team went from 4-hour resolution to 3 minutes. A sales org doubled pipeline conversion. These are measured outcomes from live deployments.',
    icon: '🏅',
    services: ['Logistics AI', 'Support AI', 'Sales AI'],
    contactCta: 'Read case studies',
    stat: '15+',
    statLabel: 'case studies across industries',
    caseStudyHref: '#case-studies',
    objectColor: '#FB923C',
  },
  {
    id: 'engagement',
    eyebrow: 'Get started',
    title: 'Flexible',
    titleAccent: ' engagement',
    sub: 'Structured to match your pace and budget.',
    body: 'Start with a focused 2-week AI pilot to prove value fast. Scale into a full product build. Or bring us in as your long-term AI engineering partner — fixed scope, clear deliverables, no surprise overruns.',
    icon: '🤝',
    services: ['2-week AI Pilot', 'Full Product Build', 'Long-term Partnership'],
    contactCta: 'Design my engagement',
    objectColor: '#34D399',
  },
  {
    id: 'finale',
    eyebrow: 'Ready when you are',
    title: "Let's",
    titleAccent: ' innovate',
    sub: 'One conversation is all it takes to start.',
    body: 'Book a 30-minute discovery call. We will map your highest-value AI opportunity, share relevant case studies, and outline what a first engagement could look like — no pitch deck, just a real conversation.',
    icon: '✨',
    services: ['Free Discovery Call', 'AI Opportunity Map', 'Custom Proposal'],
    contactCta: 'Book a discovery call',
    objectColor: '#F472B6',
  },
]

function milestoneProgress(index: number, total: number): number {
  if (total <= 1) return MILESTONE_PROGRESS_START
  return (
    MILESTONE_PROGRESS_START +
    (index / (total - 1)) * (MILESTONE_PROGRESS_END - MILESTONE_PROGRESS_START)
  )
}

/** Normalized scroll distance between consecutive milestone centers. */
export const MILESTONE_PROGRESS_START = 0.055
export const MILESTONE_PROGRESS_END = 0.982

export function getMilestoneProgressGap(): number {
  const total = MILESTONE_DEFS.length
  if (total <= 1) return 1
  return (MILESTONE_PROGRESS_END - MILESTONE_PROGRESS_START) / (total - 1)
}

/** Target wing beats while flying from one milestone to the next. */
export const WING_FLAPS_PER_MILESTONE = 2

export const PATH_MILESTONES: PathMilestone[] = MILESTONE_DEFS.map((def, i) => ({
  ...def,
  progress: milestoneProgress(i, MILESTONE_DEFS.length),
  span: MILESTONE_SPAN,
  objectKind: KINDS[i % KINDS.length],
  focusSide: 1.5,
  focusBehind: 1.45,
  focusHeight: 1.05,
}))

const up = new THREE.Vector3(0, 1, 0)
const _pathPos = new THREE.Vector3()
const _tan = new THREE.Vector3()
const _side = new THREE.Vector3()

function smoothstep(x: number) {
  const t = Math.min(1, Math.max(0, x))
  return t * t * (3 - 2 * t)
}

function smoothBell(progress: number, center: number, span: number): number {
  const d = Math.abs(progress - center) / span
  if (d >= 1) return 0
  const t = 1 - d
  return t * t * (3 - 2 * t)
}

export type MilestoneState = {
  milestone: PathMilestone | null
  blend: number
}

export function getMilestoneState(progress: number): MilestoneState {
  let best: MilestoneState = { milestone: null, blend: 0 }

  for (const m of PATH_MILESTONES) {
    const blend = smoothBell(progress, m.progress, m.span)
    if (blend > best.blend) {
      best = { milestone: m, blend }
    }
  }

  return best
}

/** Text only when the user slows near a milestone — not while actively flying. */
export const TEXT_VELOCITY_MAX = 0.11
export const TEXT_BLEND_MIN = 0.62

// Separate smoothBell for text — wider span so copy lingers as you scroll past.
const TEXT_SPAN_MULT = 3.2

export function getMilestoneTextState(
  progress: number,
  scrollVelocity: number,
  options?: { ignoreVelocity?: boolean }
): MilestoneState {
  if (!options?.ignoreVelocity && scrollVelocity > TEXT_VELOCITY_MAX) {
    return { milestone: null, blend: 0 }
  }
  // Use a wider bell so text stays visible for a longer scroll distance.
  let best: MilestoneState = { milestone: null, blend: 0 }
  for (const m of PATH_MILESTONES) {
    const blend = smoothBell(progress, m.progress, m.span * TEXT_SPAN_MULT)
    if (blend > best.blend) best = { milestone: m, blend }
  }
  if (!best.milestone || best.blend < TEXT_BLEND_MIN) {
    return { milestone: null, blend: 0 }
  }
  return best
}

export function getMilestoneReveal(
  progress: number,
  milestone: PathMilestone
): number {
  const center = milestone.progress
  const gap = getMilestoneProgressGap()
  // Reveal starts from ~72% before the milestone — object appears far ahead on
  // the path and grows as the butterfly closes in.
  const approach = gap * 0.72
  const trail = gap * 0.18

  const startReveal = center - approach
  const endHide = center + trail

  if (progress <= startReveal || progress >= endHide) return 0

  if (progress < center) {
    return smoothstep((progress - startReveal) / approach)
  }

  return 1 - smoothstep((progress - center) / trail)
}

export function getMilestoneWorldPosition(milestone: PathMilestone): THREE.Vector3 {
  return getButterflyFlightCurve().getPointAt(
    Math.max(0, Math.min(1, milestone.progress)),
    _pathPos
  )
}

/** Small lift so the object sits on the dotted path, not floating above it. */
export const MILESTONE_PATH_LIFT = 0.04

export function getMilestoneObjectPosition(milestone: PathMilestone): THREE.Vector3 {
  const pathPos = getMilestoneWorldPosition(milestone)
  return pathPos.clone().add(new THREE.Vector3(0, MILESTONE_PATH_LIFT, 0))
}

export type MilestoneApproachPose = {
  position: THREE.Vector3
  yaw: number
  approachScale: number
  reveal: number
}

/** Pose on the flight path — slides along the route and grows as you fly toward it. */
export function getMilestoneApproachPose(
  milestone: PathMilestone,
  scrollProgress: number
): MilestoneApproachPose | null {
  const reveal = getMilestoneReveal(scrollProgress, milestone)
  if (reveal <= 0.01) return null

  const center = milestone.progress
  const gap = getMilestoneProgressGap()
  const approach = gap * 0.72
  const startReveal = center - approach

  let pathT = center
  let approachScale = 1

  if (scrollProgress < center && scrollProgress >= startReveal) {
    const t = smoothstep((scrollProgress - startReveal) / approach)
    // When first revealed, the object sits ~55% of a gap ahead on the path
    // (right around where the user circled). It slides along the dotted line
    // and grows steadily as the butterfly closes in.
    pathT = center + gap * 0.55 * (1 - t)
    // Start very small — perspective makes it look like a distant dot — and
    // grow to full size on arrival.
    approachScale = 0.04 + t * 0.96
  }

  pathT = Math.max(0, Math.min(1, pathT))
  getButterflyFlightCurve().getPointAt(pathT, _pathPos)
  _pathPos.y += MILESTONE_PATH_LIFT

  _tan.copy(getButterflyTangentAtProgress(pathT))
  const yaw = Math.atan2(_tan.x, _tan.z)

  return {
    position: _pathPos.clone(),
    yaw,
    approachScale,
    reveal,
  }
}

const COMPOSE_LIFT = 0.9
const COMPOSE_RIGHT = 1.25
const _viewDir = new THREE.Vector3()
const _screenRight = new THREE.Vector3()

export function getMilestoneFocusFrame(
  milestone: PathMilestone,
  outCam: THREE.Vector3,
  outLook: THREE.Vector3
) {
  const path = getMilestoneWorldPosition(milestone).clone()
  const obj = getMilestoneObjectPosition(milestone)
  _tan.copy(getButterflyTangentAtProgress(milestone.progress))
  const fwd = _tan
  _side.crossVectors(fwd, up).normalize()

  outCam
    .copy(obj)
    .addScaledVector(_side, milestone.focusSide)
    .addScaledVector(fwd, -milestone.focusBehind)
  outCam.y += milestone.focusHeight

  _viewDir.subVectors(obj, outCam).normalize()
  _screenRight.crossVectors(_viewDir, up).normalize()

  outLook
    .copy(path)
    .addScaledVector(up, COMPOSE_LIFT)
    .addScaledVector(_screenRight, COMPOSE_RIGHT)
}
