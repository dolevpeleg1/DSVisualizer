import type { StructureId } from '../structures/types'

type Command = {
  signature: string
  description: string
}

const COMMANDS: Record<StructureId, Command[]> = {
  stack: [
    { signature: 'push(value)', description: 'Add value to the top' },
    { signature: 'pop()', description: 'Remove and return the top' },
    { signature: 'peek()', description: 'Return the top without removing' },
  ],
  queue: [
    { signature: 'enqueue(value)', description: 'Add value to the back' },
    { signature: 'dequeue()', description: 'Remove and return the front' },
    { signature: 'front()', description: 'Return the front without removing' },
  ],
  array: [
    { signature: 'append(value)', description: 'Add value at the end' },
    { signature: 'insert(index, value)', description: 'Insert value at index' },
    { signature: 'remove(index)', description: 'Remove and return value at index' },
    { signature: 'set(index, value)', description: 'Replace value at index' },
    { signature: 'get(index)', description: 'Return value at index' },
  ],
  tree: [
    { signature: 'insert(value)', description: 'Insert value into the BST' },
    { signature: 'delete(value)', description: 'Remove value from the BST' },
    { signature: 'find(value)', description: 'Search for value and highlight the path' },
  ],
}

type CommandsPanelProps = {
  structureId: StructureId
}

export function CommandsPanel({ structureId }: CommandsPanelProps) {
  const commands = COMMANDS[structureId]

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--bg-panel)]">
      <div className="border-b border-[var(--border)] px-3 py-2">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--text)]">
          Commands
        </h2>
      </div>
      <ul className="min-h-0 flex-1 space-y-3 overflow-auto p-3">
        {commands.map((command) => (
          <li key={command.signature}>
            <code className="block font-[family-name:var(--mono)] text-sm text-[var(--accent)]">
              {command.signature}
            </code>
            <p className="mt-0.5 text-xs text-[var(--text)]">{command.description}</p>
          </li>
        ))}
      </ul>
      <p className="border-t border-[var(--border)] px-3 py-2 text-[11px] text-[var(--text)]">
        Arguments are numbers. Use <code className="text-[var(--text)]">//</code> for
        comments.
      </p>
    </div>
  )
}
