import { createItemId } from './ids'
import type { ApplyResult, CellItem, Snapshot, StackOp } from './types'

/** Items are bottom → top (last index is the top). */
export function createEmpty(): Snapshot {
  return { items: [] }
}

export function apply(state: Snapshot, op: StackOp): ApplyResult {
  const items = state.items

  switch (op.type) {
    case 'push': {
      const nextItems = [...items, { id: createItemId(), value: op.value }]
      const highlight = [nextItems.length - 1]
      return {
        next: { items: nextItems, highlight, message: `push(${op.value})` },
        event: {
          kind: 'ok',
          message: `Pushed ${op.value}`,
          highlight,
        },
      }
    }
    case 'pop': {
      if (items.length === 0) {
        return errorResult(items, 'Cannot pop from an empty stack')
      }
      const top = items[items.length - 1] as CellItem
      const highlight = [items.length - 1]
      const nextItems = items.slice(0, -1)
      return {
        next: { items: nextItems, message: `pop() → ${top.value}` },
        event: {
          kind: 'ok',
          message: `Popped ${top.value}`,
          returnValue: top.value,
          highlight,
        },
      }
    }
    case 'peek': {
      if (items.length === 0) {
        return errorResult(items, 'Cannot peek an empty stack')
      }
      const top = items[items.length - 1] as CellItem
      const highlight = [items.length - 1]
      return {
        next: {
          items: [...items],
          highlight,
          message: `peek() → ${top.value}`,
        },
        event: {
          kind: 'ok',
          message: `Peeked ${top.value}`,
          returnValue: top.value,
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
