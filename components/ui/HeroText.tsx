'use client'
import { motion } from 'framer-motion'

interface Props {
  visible: boolean
}

export default function HeroText({ visible }: Props) {
  return (
    <motion.div
      className="hero-center"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -20 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="hero-headline">
        Your Business Is Already<br />
        Producing <em>Intelligence.</em><br />
        Most Of It Goes Unused.
      </div>
      <div className="hero-sub">
        Vnnovate turns disconnected workflows into autonomous AI systems.
      </div>
    </motion.div>
  )
}
