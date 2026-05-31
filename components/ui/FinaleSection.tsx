'use client'
import { motion } from 'framer-motion'

interface Props {
  visible: boolean
}

export default function FinaleSection({ visible }: Props) {
  return (
    <motion.div
      className="finale-cta"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.95 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      style={{ pointerEvents: visible ? 'all' : 'none' }}
    >
      <div style={{
        fontSize: '0.72rem',
        fontWeight: 700,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: '#6366F1',
        marginBottom: '1rem',
      }}>
        12 Years of Trust · Infinite AI
      </div>

      <div className="finale-headline">
        One Intelligence Layer.<br />
        <span style={{
          background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Across Your Entire Business.
        </span>
      </div>

      <div className="finale-sub">
        From quick AI apps to full agentic systems — built and deployed in days.
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <a className="finale-btn" href="#">
          Book a Free Strategy Call
        </a>
        <a href="#" style={{
          padding: '1rem 2rem',
          borderRadius: '999px',
          fontSize: '1rem',
          fontWeight: 600,
          color: '#6366F1',
          border: '2px solid #6366F1',
          textDecoration: 'none',
          transition: 'all 0.2s',
        }}>
          See Our Work →
        </a>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'flex',
        gap: '3rem',
        justifyContent: 'center',
        marginTop: '3rem',
        flexWrap: 'wrap',
      }}>
        {[
          { num: '12+', label: 'Years delivering tech' },
          { num: '200+', label: 'Projects shipped' },
          { num: '48h', label: 'AI MVP turnaround' },
          { num: '∞', label: 'Automation potential' },
        ].map(stat => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em' }}>
              {stat.num}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.25rem' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
