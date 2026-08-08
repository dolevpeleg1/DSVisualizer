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
    ? 'border-[var(--danger)] bg-[color-mix(in_srgb,var(--danger)_16%,var(--bg))] shadow-[0_0_14px_color-mix(in_srgb,var(--danger)_30%,transparent)]'
    : active
      ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_14%,var(--bg))] shadow-[0_0_14px_color-mix(in_srgb,var(--accent)_28%,transparent)]'
      : 'border-[var(--border)] bg-[var(--bg-elevated)]'

  return (
    <motion.div
      layout
      layoutId={layoutId}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 160, damping: 24, mass: 1.1 }}
      className={`flex min-w-14 flex-col items-center justify-center rounded-sm border px-3 py-2 font-[family-name:var(--mono)] text-[var(--text)] ${tone}`}
    >
      {typeof index === 'number' ? (
        <span className="text-[10px] uppercase tracking-wider text-[var(--text)] opacity-50">
          [{index}]
        </span>
      ) : null}
      <span className="text-base font-medium text-[var(--text)]">{value}</span>
    </motion.div>
  )
}
