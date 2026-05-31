'use client'
import { CHAPTERS } from '@/lib/chapters'

interface Props {
  currentChapter: string
  progress: number
}

const DOTS = CHAPTERS.filter(c => c.label !== null)

export default function ProgressRail({ currentChapter, progress }: Props) {
  return (
    <div className="progress-rail">
      {DOTS.map((chapter) => {
        const isDone = progress > chapter.scrollEnd
        const isActive = currentChapter === chapter.key

        return (
          <div
            key={chapter.key}
            className={`progress-dot ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
            title={chapter.label ?? ''}
            style={isActive ? { background: chapter.color } : {}}
          />
        )
      })}
    </div>
  )
}
