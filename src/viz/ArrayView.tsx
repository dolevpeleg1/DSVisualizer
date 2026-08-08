import { AnimatePresence } from 'framer-motion'
import type { Snapshot } from '../structures/types'
import { Cell } from './Cell'

type ArrayViewProps = {
  snapshot: Snapshot
}

export function ArrayView({ snapshot }: ArrayViewProps) {
  const { items, highlight = [], error } = snapshot

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <div className="text-xs uppercase tracking-wider text-[var(--muted)]">
        Indexed array
      </div>
      <div className="flex max-w-xl flex-wrap items-end justify-center gap-2">
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((value, index) => (
            <Cell
              key={`${index}-${value}-${items.length}`}
              layoutId={`array-${index}-${value}`}
              value={value}
              index={index}
              active={highlight.includes(index)}
              error={Boolean(error) && highlight.includes(index)}
            />
          ))}
        </AnimatePresence>
        {items.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Empty array</p>
        ) : null}
      </div>
    </div>
  )
}
