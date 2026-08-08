import { motion } from 'framer-motion'

type CellProps = {
  value: number
  index?: number
  active?: boolean
  error?: boolean
  layoutId: string
}

export function Cell({ value, index, active = false, error = false, layoutId }: CellProps) {
  const tone = error
    ? 'border-[var(--danger)] bg-[color-mix(in_srgb,var(--danger)_18%,var(--bg-elevated))] text-[var(--text-h)]'
    : active
      ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_22%,var(--bg-elevated))] text-[var(--text-h)]'
      : 'border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text)]'

  return (
    <motion.div
      layout
      layoutId={layoutId}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className={`flex min-w-14 flex-col items-center justify-center rounded-md border px-3 py-2 font-[family-name:var(--mono)] ${tone}`}
    >
      {typeof index === 'number' ? (
        <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
          [{index}]
        </span>
      ) : null}
      <span className="text-base font-medium">{value}</span>
    </motion.div>
  )
}
