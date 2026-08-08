import type { Snapshot, StructureId } from '../structures/types'
import { ArrayView } from './ArrayView'
import { QueueView } from './QueueView'
import { StackView } from './StackView'
import { TreeView } from './TreeView'

type StructureCanvasProps = {
  structureId: StructureId
  snapshot: Snapshot | null
  hasStarted: boolean
}

export function StructureCanvas({
  structureId,
  snapshot,
  hasStarted,
}: StructureCanvasProps) {
  if (!hasStarted || !snapshot) {
    return (
      <p className="max-w-sm text-center text-sm text-[var(--muted)]">
        Run or Step to visualize.
      </p>
    )
  }

  switch (structureId) {
    case 'stack':
      return <StackView snapshot={snapshot} />
    case 'queue':
      return <QueueView snapshot={snapshot} />
    case 'array':
      return <ArrayView snapshot={snapshot} />
    case 'tree':
      return <TreeView snapshot={snapshot} />
  }
}
