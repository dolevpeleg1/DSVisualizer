import type { ApplyResult, Snapshot, StackOp, Value } from './types'

/** Items are bottom → top (last index is the top). */
export function createEmpty(): Snapshot {
  return { items: [] }
}

export function apply(state: Snapshot, op: StackOp): ApplyResult {
  const items = state.items

  switch (op.type) {
    case 'push': {
      const nextItems = [...items, op.value]
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
      const value = items[items.length - 1] as Value
      const highlight = [items.length - 1]
      const nextItems = items.slice(0, -1)
      return {
        next: { items: nextItems, message: `pop() → ${value}` },
        event: {
          kind: 'ok',
          message: `Popped ${value}`,
          returnValue: value,
          highlight,
        },
      }
    }
    case 'peek': {
      if (items.length === 0) {
        return errorResult(items, 'Cannot peek an empty stack')
      }
      const value = items[items.length - 1] as Value
      const highlight = [items.length - 1]
      return {
        next: { items: [...items], highlight, message: `peek() → ${value}` },
        event: {
          kind: 'ok',
          message: `Peeked ${value}`,
          returnValue: value,
          highlight,
        },
      }
    }
  }
}

function errorResult(items: Value[], message: string): ApplyResult {
  return {
    next: { items: [...items], error: message },
    event: { kind: 'error', message },
  }
}
