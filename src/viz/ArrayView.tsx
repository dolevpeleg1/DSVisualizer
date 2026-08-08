import { AnimatePresence } from 'framer-motion'
import type { Snapshot } from '../structures/types'
import { Cell } from './Cell'

type ArrayViewProps = {
  snapshot: Snapshot
}

export function ArrayView({ snapshot }: ArrayViewProps) {
  const { items, highlight = [], error } = snapshot
  const errorIndexes = resolveErrorIndexes(items.length, highlight, Boolean(error))

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <div className="text-xs uppercase tracking-wider text-[var(--muted)]">
        Indexed array
      </div>
      <div className="flex max-w-xl flex-wrap items-end justify-center gap-2">
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((item, index) => (
            <Cell
              key={item.id}
              layoutId={item.id}
              value={item.value}
              index={index}
              active={highlight.includes(index) || errorIndexes.includes(index)}
              error={errorIndexes.includes(index)}
            />
          ))}
        </AnimatePresence>
        {items.length === 0 ? (
          <p
            className={`text-sm ${
              error ? 'text-[var(--danger)]' : 'text-[var(--muted)]'
            }`}
          >
            Empty array
          </p>
        ) : null}
      </div>
    </div>
  )
}

/** Map error highlights onto existing cells (clamp OOB indexes). */
function resolveErrorIndexes(
  length: number,
  highlight: number[],
  hasError: boolean,
): number[] {
  if (!hasError || length === 0) return []

  const inRange = highlight.filter((index) => index >= 0 && index < length)
  if (inRange.length > 0) return inRange

  if (highlight.length === 0) return []

  const target = highlight[0] as number
  if (target < 0) return [0]
  return [length - 1]
}
