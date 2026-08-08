import { createItemId } from './ids'
import type { ApplyResult, CellItem, QueueOp, Snapshot } from './types'

/** Items are front → back (index 0 is the front). */
export function createEmpty(): Snapshot {
  return { items: [] }
}

export function apply(state: Snapshot, op: QueueOp): ApplyResult {
  const items = state.items

  switch (op.type) {
    case 'enqueue': {
      const nextItems = [...items, { id: createItemId(), value: op.value }]
      const highlight = [nextItems.length - 1]
      return {
        next: {
          items: nextItems,
          highlight,
          message: `enqueue(${op.value})`,
        },
        event: {
          kind: 'ok',
          message: `Enqueued ${op.value}`,
          highlight,
        },
      }
    }
    case 'dequeue': {
      if (items.length === 0) {
        return errorResult(items, 'Cannot dequeue from an empty queue')
      }
      const front = items[0] as CellItem
      const highlight = [0]
      const nextItems = items.slice(1)
      return {
        next: { items: nextItems, message: `dequeue() → ${front.value}` },
        event: {
          kind: 'ok',
          message: `Dequeued ${front.value}`,
          returnValue: front.value,
          highlight,
        },
      }
    }
    case 'front': {
      if (items.length === 0) {
        return errorResult(items, 'Cannot read front of an empty queue')
      }
      const front = items[0] as CellItem
      const highlight = [0]
      return {
        next: {
          items: [...items],
          highlight,
          message: `front() → ${front.value}`,
        },
        event: {
          kind: 'ok',
          message: `Front is ${front.value}`,
          returnValue: front.value,
          highlight,
        },
      }
    }
  }
}

function errorResult(items: CellItem[], message: string): ApplyResult {
  return {
    next: { items: [...items], error: message },
    event: { kind: 'error', message },
  }
}
