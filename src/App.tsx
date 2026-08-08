import { useState } from 'react'
import { CodeEditor } from './editor/CodeEditor'

const STRUCTURES = ['Stack', 'Queue', 'Array'] as const
type StructureName = (typeof STRUCTURES)[number]

const DEFAULT_CODE: Record<StructureName, string> = {
  Stack: `// Stack operations
push(3)
push(7)
push(1)
pop()
peek()`,
  Queue: `// Queue operations
enqueue(3)
enqueue(7)
dequeue()`,
  Array: `// Array operations
append(10)
append(20)
insert(1, 15)
remove(0)`,
}

function App() {
  const [structure, setStructure] = useState<StructureName>('Stack')
  const [code, setCode] = useState(DEFAULT_CODE.Stack)
  const [status, setStatus] = useState('Ready — scaffold only. Engine comes next.')

  function handleStructureChange(next: StructureName) {
    setStructure(next)
    setCode(DEFAULT_CODE[next])
    setStatus(`Switched to ${next}`)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-panel)] px-4 py-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-lg font-semibold tracking-tight text-[var(--text-h)]">
            DSVisualizer
          </h1>
          <span className="text-sm text-[var(--muted)]">
            Data Structure Visualizer
          </span>
        </div>
        <nav className="flex gap-1" aria-label="Data structure">
          {STRUCTURES.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => handleStructureChange(name)}
              className={`rounded px-3 py-1.5 text-sm transition-colors ${
                structure === name
                  ? 'bg-[var(--accent)] text-[var(--bg)]'
                  : 'text-[var(--text)] hover:bg-[var(--bg-elevated)]'
              }`}
            >
              {name}
            </button>
          ))}
        </nav>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2">
        <section className="flex min-h-0 flex-col border-b border-[var(--border)] md:border-b-0 md:border-r">
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2">
            <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              Editor
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded bg-[var(--accent)] px-3 py-1 text-sm font-medium text-[var(--bg)] hover:bg-[var(--accent-hover)]"
                onClick={() => setStatus('Run — not wired yet (step 2)')}
              >
                Run
              </button>
              <button
                type="button"
                className="rounded border border-[var(--border)] px-3 py-1 text-sm text-[var(--text)] hover:bg-[var(--bg-elevated)]"
                onClick={() => setStatus('Step — not wired yet (step 2)')}
              >
                Step
              </button>
              <button
                type="button"
                className="rounded border border-[var(--border)] px-3 py-1 text-sm text-[var(--text)] hover:bg-[var(--bg-elevated)]"
                onClick={() => {
                  setCode(DEFAULT_CODE[structure])
                  setStatus('Reset code')
                }}
              >
                Reset
              </button>
            </div>
          </div>
          <div className="min-h-[240px] flex-1 md:min-h-0">
            <CodeEditor value={code} onChange={setCode} />
          </div>
        </section>

        <section className="flex min-h-0 flex-col">
          <div className="border-b border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2">
            <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              Visualization — {structure}
            </h2>
          </div>
          <div className="flex flex-1 items-center justify-center bg-[var(--bg)] p-6">
            <p className="max-w-sm text-center text-sm text-[var(--muted)]">
              Canvas placeholder. {structure} view lands in a later step.
            </p>
          </div>
        </section>
      </div>

      <footer className="border-t border-[var(--border)] bg-[var(--bg-panel)] px-4 py-2 text-sm text-[var(--muted)]">
        {status}
      </footer>
    </div>
  )
}

export default App
