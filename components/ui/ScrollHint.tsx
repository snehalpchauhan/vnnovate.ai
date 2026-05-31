'use client'
import { motion } from 'framer-motion'

interface Props {
  visible: boolean
}

export default function ScrollHint({ visible }: Props) {
  return (
    <motion.div
      className="scroll-hint"
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="scroll-hint-line" />
      Scroll to explore
    </motion.div>
  )
}
