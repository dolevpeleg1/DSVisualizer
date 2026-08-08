import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CodeEditor } from '../editor/CodeEditor'
import { CommandsPanel } from '../editor/CommandsPanel'
import { parse, run } from '../engine'
import type { Frame, StructureId } from '../structures/types'
import { StructureCanvas } from '../viz/StructureCanvas'

const STRUCTURES = ['Stack', 'Queue', 'Array', 'Tree'] as const
type StructureName = (typeof STRUCTURES)[number]

const STRUCTURE_IDS: Record<StructureName, StructureId> = {
  Stack: 'stack',
  Queue: 'queue',
  Array: 'array',
  Tree: 'tree',
}

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
  Tree: `// Binary search tree
insert(8)
insert(3)
insert(10)
insert(1)
insert(6)
find(6)
delete(3)`,
}

const PLAY_INTERVAL_MS = 1100

type Mode = 'idle' | 'playing' | 'paused' | 'done' | 'error'

export function VisualizerPage() {
  const [structure, setStructure] = useState<StructureName>('Stack')
  const [code, setCode] = useState(DEFAULT_CODE.Stack)
  const [frames, setFrames] = useState<Frame[]>([])
  const [index, setIndex] = useState(-1)
  const [mode, setMode] = useState<Mode>('idle')
  const [status, setStatus] = useState('Ready — write ops, then Run or Step.')
  const [errorLines, setErrorLines] = useState<number[]>([])
  const playTimerRef = useRef<number | null>(null)

  const structureId = STRUCTURE_IDS[structure]
  const currentFrame = index >= 0 ? frames[index] : undefined
  const snapshot = currentFrame?.after ?? null
  const activeLine = currentFrame?.line ?? null
  const busy = mode === 'playing'

  const statusTone = useMemo(() => {
    if (mode === 'error' || currentFrame?.event.kind === 'error') {
      return 'text-[var(--danger)]'
    }
    return 'text-[var(--muted)]'
  }, [mode, currentFrame])

  function clearPlaybackTimer() {
    if (playTimerRef.current != null) {
      window.clearInterval(playTimerRef.current)
      playTimerRef.current = null
    }
  }

  function resetPlaybackState(nextStatus: string) {
    clearPlaybackTimer()
    setFrames([])
    setIndex(-1)
    setMode('idle')
    setErrorLines([])
    setStatus(nextStatus)
  }

  function prepareFrames(): Frame[] | null {
    const parsed = parse(code, structureId)
    if (!parsed.ok) {
      clearPlaybackTimer()
      setFrames([])
      setIndex(-1)
      setMode('error')
      setErrorLines(parsed.errors.map((error) => error.line))
      const first = parsed.errors[0]
      setStatus(
        first
          ? `Parse error on line ${first.line}: ${first.message}`
          : 'Parse error',
      )
      return null
    }

    const nextFrames = run(parsed.ops, structureId)
    setErrorLines([])
    setFrames(nextFrames)
    return nextFrames
  }

  function handleStructureChange(next: StructureName) {
    setStructure(next)
    setCode(DEFAULT_CODE[next])
    resetPlaybackState(`Switched to ${next}`)
  }

  function handleCodeChange(next: string) {
    setCode(next)
    if (mode !== 'idle') {
      resetPlaybackState('Code changed — Run or Step again.')
    }
  }

  function handleReset() {
    setCode(DEFAULT_CODE[structure])
    resetPlaybackState('Reset code')
  }

  function handleStep() {
    if (busy) return

    let nextFrames = frames
    let nextIndex = index

    if (frames.length === 0 || mode === 'error' || mode === 'idle') {
      const prepared = prepareFrames()
      if (!prepared) return
      if (prepared.length === 0) {
        setIndex(-1)
        setMode('done')
        setStatus('No operations to run')
        return
      }
      nextFrames = prepared
      nextIndex = 0
    } else if (index >= frames.length - 1) {
      setMode('done')
      setStatus('Done')
      return
    } else {
      nextIndex = index + 1
    }

    const frame = nextFrames[nextIndex]
    if (!frame) return

    setIndex(nextIndex)
    if (frame.event.kind === 'error') {
      setMode('error')
      setErrorLines([frame.line])
      setStatus(`Runtime error on line ${frame.line}: ${frame.event.message}`)
      return
    }

    setMode(nextIndex >= nextFrames.length - 1 ? 'done' : 'paused')
    setStatus(formatFrameStatus(frame, nextIndex, nextFrames.length))
  }

  function handleRun() {
    if (busy) return

    const prepared = prepareFrames()
    if (!prepared) return
    if (prepared.length === 0) {
      setIndex(-1)
      setMode('done')
      setStatus('No operations to run')
      return
    }

    clearPlaybackTimer()
    setIndex(0)
    setMode('playing')
    const first = prepared[0]
    if (first) {
      setStatus(formatFrameStatus(first, 0, prepared.length))
      if (first.event.kind === 'error') {
        setMode('error')
        setErrorLines([first.line])
        setStatus(`Runtime error on line ${first.line}: ${first.event.message}`)
        return
      }
    }

    let cursor = 0
    playTimerRef.current = window.setInterval(() => {
      cursor += 1
      const frame = prepared[cursor]
      if (!frame) {
        clearPlaybackTimer()
        setMode('done')
        setStatus('Done')
        return
      }

      setIndex(cursor)
      if (frame.event.kind === 'error') {
        clearPlaybackTimer()
        setMode('error')
        setErrorLines([frame.line])
        setStatus(`Runtime error on line ${frame.line}: ${frame.event.message}`)
        return
      }

      setStatus(formatFrameStatus(frame, cursor, prepared.length))
      if (cursor >= prepared.length - 1) {
        clearPlaybackTimer()
        setMode('done')
      }
    }, PLAY_INTERVAL_MS)
  }

  useEffect(() => () => clearPlaybackTimer(), [])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-panel)] px-4 py-3">
        <div className="flex items-baseline gap-3">
          <Link
            to="/"
            className="text-lg font-semibold tracking-tight text-[var(--text-h)] hover:text-[var(--accent)]"
          >
            DSVisualizer
          </Link>
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

      <div className="flex min-h-0 flex-1 flex-col">
        <section className="flex min-h-0 flex-[3] flex-col">
          <div className="border-b border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2">
            <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              Visualization — {structure}
            </h2>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center bg-[var(--bg)] p-6">
            <StructureCanvas
              structureId={structureId}
              snapshot={snapshot}
              hasStarted={index >= 0}
            />
          </div>
        </section>

        <section className="flex min-h-0 flex-[2] flex-col border-t border-[var(--border)] md:flex-row">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2">
              <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                Editor
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  className="rounded bg-[var(--accent)] px-3 py-1 text-sm font-medium text-[var(--bg)] hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={handleRun}
                >
                  Run
                </button>
                <button
                  type="button"
                  disabled={busy}
                  className="rounded border border-[var(--border)] px-3 py-1 text-sm text-[var(--text)] hover:bg-[var(--bg-elevated)] disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={handleStep}
                >
                  Step
                </button>
                <button
                  type="button"
                  className="rounded border border-[var(--border)] px-3 py-1 text-sm text-[var(--text)] hover:bg-[var(--bg-elevated)]"
                  onClick={handleReset}
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <CodeEditor
                value={code}
                onChange={handleCodeChange}
                activeLine={activeLine}
                errorLines={errorLines}
                readOnly={busy}
              />
            </div>
          </div>

          <aside className="min-h-[140px] w-full shrink-0 border-t border-[var(--border)] md:min-h-0 md:w-64 md:border-t-0 md:border-l">
            <CommandsPanel structureId={structureId} />
          </aside>
        </section>
      </div>

      <footer
        className={`border-t border-[var(--border)] bg-[var(--bg-panel)] px-4 py-2 text-sm ${statusTone}`}
      >
        {status}
      </footer>
    </div>
  )
}

function formatFrameStatus(frame: Frame, index: number, total: number): string {
  const step = `Step ${index + 1}/${total}`
  if (frame.event.returnValue !== undefined) {
    return `${step}: ${frame.event.message} (returned ${frame.event.returnValue})`
  }
  return `${step}: ${frame.event.message}`
}

