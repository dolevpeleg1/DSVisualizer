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
      <div className="flex max-w-xl items-center gap-3">
        <span className="shrink-0 text-xs uppercase tracking-wider text-[var(--text)] opacity-70">
          Front
        </span>
        <div className="flex min-h-16 flex-wrap items-center justify-center gap-2">
          <AnimatePresence initial={false} mode="popLayout">
            {items.map((item, index) => (
              <Cell
                key={item.id}
                layoutId={item.id}
                value={item.value}
                active={highlight.includes(index)}
                error={Boolean(error) && index === 0}
              />
            ))}
          </AnimatePresence>
          {items.length === 0 ? (
            <p className="px-2 text-sm text-[var(--text)] opacity-70">Empty queue</p>
          ) : null}
        </div>
        <span className="shrink-0 text-xs uppercase tracking-wider text-[var(--text)] opacity-70">
          Back
        </span>
      </div>
    </div>
  )
}
