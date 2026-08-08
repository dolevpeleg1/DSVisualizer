import { AnimatePresence } from 'framer-motion'
import type { Snapshot } from '../structures/types'
import { Cell } from './Cell'

type QueueViewProps = {
  snapshot: Snapshot
}

export function QueueView({ snapshot }: QueueViewProps) {
  const { items, highlight = [], error } = snapshot

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <div className="flex w-full max-w-xl items-center justify-between text-xs uppercase tracking-wider text-[var(--muted)]">
        <span>Front</span>
        <span>Back</span>
      </div>
      <div className="flex min-h-16 w-full max-w-xl flex-wrap items-center justify-center gap-2">
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((value, index) => (
            <Cell
              key={`${index}-${value}-${items.length}`}
              layoutId={`queue-${index}-${value}`}
              value={value}
              active={highlight.includes(index)}
              error={Boolean(error) && index === 0}
            />
          ))}
        </AnimatePresence>
        {items.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Empty queue</p>
        ) : null}
      </div>
    </div>
  )
}
