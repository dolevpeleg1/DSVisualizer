import type { ApplyResult, ArrayOp, Snapshot, Value } from './types'

export function createEmpty(): Snapshot {
  return { items: [] }
}

export function apply(state: Snapshot, op: ArrayOp): ApplyResult {
  const items = state.items

  switch (op.type) {
    case 'append': {
      const nextItems = [...items, op.value]
      const highlight = [nextItems.length - 1]
      return {
        next: {
          items: nextItems,
          highlight,
          message: `append(${op.value})`,
        },
        event: {
          kind: 'ok',
          message: `Appended ${op.value}`,
          highlight,
        },
      }
    }
    case 'insert': {
      if (!isValidInsertIndex(op.index, items.length)) {
        return errorResult(
          items,
          `Index ${op.index} out of bounds for insert (length ${items.length})`,
          [op.index],
        )
      }
      const nextItems = [
        ...items.slice(0, op.index),
        op.value,
        ...items.slice(op.index),
      ]
      const highlight = [op.index]
      return {
        next: {
          items: nextItems,
          highlight,
          message: `insert(${op.index}, ${op.value})`,
        },
        event: {
          kind: 'ok',
          message: `Inserted ${op.value} at index ${op.index}`,
          highlight,
        },
      }
    }
    case 'remove': {
      if (!isValidIndex(op.index, items.length)) {
        return errorResult(
          items,
          `Index ${op.index} out of bounds for remove (length ${items.length})`,
          [op.index],
        )
      }
      const value = items[op.index] as Value
      const nextItems = [
        ...items.slice(0, op.index),
        ...items.slice(op.index + 1),
      ]
      return {
        next: {
          items: nextItems,
          message: `remove(${op.index}) → ${value}`,
        },
        event: {
          kind: 'ok',
          message: `Removed ${value} at index ${op.index}`,
          returnValue: value,
          highlight: [op.index],
        },
      }
    }
    case 'set': {
      if (!isValidIndex(op.index, items.length)) {
        return errorResult(
          items,
          `Index ${op.index} out of bounds for set (length ${items.length})`,
          [op.index],
        )
      }
      const nextItems = [...items]
      nextItems[op.index] = op.value
      const highlight = [op.index]
      return {
        next: {
          items: nextItems,
          highlight,
          message: `set(${op.index}, ${op.value})`,
        },
        event: {
          kind: 'ok',
          message: `Set index ${op.index} to ${op.value}`,
          highlight,
        },
      }
    }
    case 'get': {
      if (!isValidIndex(op.index, items.length)) {
        return errorResult(
          items,
          `Index ${op.index} out of bounds for get (length ${items.length})`,
          [op.index],
        )
      }
      const value = items[op.index] as Value
      const highlight = [op.index]
      return {
        next: {
          items: [...items],
          highlight,
          message: `get(${op.index}) → ${value}`,
        },
        event: {
          kind: 'ok',
          message: `Got ${value} at index ${op.index}`,
          returnValue: value,
          highlight,
        },
      }
    }
  }
}

function isValidIndex(index: number, length: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < length
}

/** Insert allows index === length (append-at-end). */
function isValidInsertIndex(index: number, length: number): boolean {
  return Number.isInteger(index) && index >= 0 && index <= length
}

function errorResult(
  items: Value[],
  message: string,
  highlight?: number[],
): ApplyResult {
  return {
    next: { items: [...items], error: message, highlight },
    event: { kind: 'error', message, highlight },
  }
}
