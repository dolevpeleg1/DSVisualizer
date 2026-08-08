import * as arrayModel from '../structures/array'
import * as queueModel from '../structures/queue'
import * as stackModel from '../structures/stack'
import type {
  ArrayOp,
  Frame,
  QueueOp,
  Snapshot,
  StackOp,
  StructureId,
} from '../structures/types'
import type { ParsedOp } from './parse'

/**
 * Execute parsed ops from an empty structure and emit a frame timeline.
 * Stops after the first runtime error frame (that frame is included).
 */
export function run(ops: ParsedOp[], structureId: StructureId): Frame[] {
  const frames: Frame[] = []
  let state = createEmpty(structureId)

  for (const { line, op } of ops) {
    const before = state
    const { next, event } = applyOp(structureId, state, op)
    frames.push({ line, op, before, after: next, event })
    state = next

    if (event.kind === 'error') {
      break
    }
  }

  return frames
}

function createEmpty(structureId: StructureId): Snapshot {
  switch (structureId) {
    case 'stack':
      return stackModel.createEmpty()
    case 'queue':
      return queueModel.createEmpty()
    case 'array':
      return arrayModel.createEmpty()
  }
}

function applyOp(
  structureId: StructureId,
  state: Snapshot,
  op: ParsedOp['op'],
): { next: Snapshot; event: Frame['event'] } {
  switch (structureId) {
    case 'stack':
      return stackModel.apply(state, op as StackOp)
    case 'queue':
      return queueModel.apply(state, op as QueueOp)
    case 'array':
      return arrayModel.apply(state, op as ArrayOp)
  }
}
