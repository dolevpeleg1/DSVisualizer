import { AnimatePresence } from 'framer-motion'
import type { Snapshot } from '../structures/types'
import { Cell } from './Cell'

type StackViewProps = {
  snapshot: Snapshot
}

export function StackView({ snapshot }: StackViewProps) {
  const { items, highlight = [], error } = snapshot
  const top = items.length - 1

  return (
    <div className="flex h-full w-full flex-col items-center justify-end gap-3">
      <div className="text-xs uppercase tracking-wider text-[var(--muted)]">Top</div>
      <div className="flex flex-col-reverse items-center gap-2">
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((value, index) => (
            <Cell
              key={`${index}-${value}-${items.length}`}
              layoutId={`stack-${index}-${value}`}
              value={value}
              active={highlight.includes(index)}
              error={Boolean(error) && index === top}
            />
          ))}
        </AnimatePresence>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Empty stack</p>
      ) : (
        <div className="text-xs uppercase tracking-wider text-[var(--muted)]">Bottom</div>
      )}
    </div>
  )
}
