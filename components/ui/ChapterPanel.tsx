'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { CHAPTERS } from '@/lib/chapters'

interface Props {
  currentChapter: string
  progress: number
}

export default function ChapterPanel({ currentChapter }: Props) {
  const chapter = CHAPTERS.find(c => c.key === currentChapter)
  const isVisible = chapter && chapter.label !== null

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={currentChapter}
          className="chapter-panel"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Colored tag */}
          <div className="chapter-label" style={{ color: chapter.color }}>
            {chapter.label}
          </div>

          {/* Accent bar */}
          <motion.div
            style={{
              width: 40,
              height: 3,
              background: chapter.color,
              borderRadius: 2,
              marginBottom: '1rem',
            }}
            initial={{ width: 0 }}
            animate={{ width: 40 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          />

          <div className="chapter-headline">{chapter.headline}</div>
          <div className="chapter-body">{chapter.body}</div>

          <a
            className="chapter-link"
            href="#"
            style={{ color: chapter.color }}
          >
            {chapter.link}
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
