import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const PREVIEW_VALUES = [3, 7, 1]

export function HomePage() {
  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 75% 50%, color-mix(in srgb, var(--accent) 20%, transparent), transparent 55%), linear-gradient(155deg, #0b1016 0%, var(--bg) 42%, #121a22 100%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage:
            'radial-gradient(ellipse 75% 65% at 60% 50%, black, transparent)',
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 flex w-full max-w-xl items-center justify-center pr-6 opacity-40 md:opacity-70 lg:pr-20"
      >
        <div className="absolute h-72 w-72 rounded-full bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] blur-3xl" />
        <div className="relative flex flex-col-reverse items-center gap-3">
          {PREVIEW_VALUES.map((value, index) => (
            <motion.div
              key={value}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.25 + index * 0.14,
                type: 'spring',
                stiffness: 140,
                damping: 22,
              }}
              className="flex min-w-24 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-6 py-4 font-[family-name:var(--mono)] text-2xl text-[var(--text-h)]"
              style={
                index === PREVIEW_VALUES.length - 1
                  ? {
                      borderColor: 'var(--accent)',
                      background:
                        'color-mix(in srgb, var(--accent) 24%, var(--bg-elevated))',
                    }
                  : undefined
              }
            >
              {value}
            </motion.div>
          ))}
        </div>
      </div>

      <main className="relative z-10 flex min-h-0 flex-1 flex-col justify-center px-6 py-16 md:px-12 lg:px-20">
        <div className="max-w-xl">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="text-5xl font-semibold tracking-tight text-[var(--text-h)] md:text-6xl lg:text-7xl"
          >
            DSVisualizer
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
            className="mt-5 max-w-md text-lg leading-relaxed text-[var(--muted)]"
          >
            Write operations for data structures, then watch them update step by step.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: 'easeOut' }}
            className="mt-8"
          >
            <Link
              to="/app"
              className="inline-flex rounded bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--bg)] transition-colors hover:bg-[var(--accent-hover)]"
            >
              Open visualizer
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
