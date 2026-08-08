import { describe, expect, it } from 'vitest'
import { parse, run } from './engine'
import { apply as applyArray, createEmpty as emptyArray } from './structures/array'
import { apply as applyQueue, createEmpty as emptyQueue } from './structures/queue'
import { apply as applyStack, createEmpty as emptyStack } from './structures/stack'

describe('test setup', () => {
  it('runs vitest', () => {
    expect(1 + 1).toBe(2)
  })
})

describe('stack', () => {
  it('starts empty', () => {
    expect(emptyStack()).toEqual({ items: [] })
  })

  it('push/pop follow LIFO order', () => {
    let state = emptyStack()

    state = applyStack(state, { type: 'push', value: 3 }).next
    state = applyStack(state, { type: 'push', value: 7 }).next
    state = applyStack(state, { type: 'push', value: 1 }).next
    expect(state.items).toEqual([3, 7, 1])

    const popped = applyStack(state, { type: 'pop' })
    expect(popped.event.kind).toBe('ok')
    expect(popped.event.returnValue).toBe(1)
    expect(popped.next.items).toEqual([3, 7])

    const next = applyStack(popped.next, { type: 'pop' })
    expect(next.event.returnValue).toBe(7)
    expect(next.next.items).toEqual([3])
  })

  it('peek returns the top without mutating items', () => {
    let state = emptyStack()
    state = applyStack(state, { type: 'push', value: 10 }).next
    state = applyStack(state, { type: 'push', value: 20 }).next

    const peeked = applyStack(state, { type: 'peek' })
    expect(peeked.event.kind).toBe('ok')
    expect(peeked.event.returnValue).toBe(20)
    expect(peeked.next.items).toEqual([10, 20])
  })

  it('errors on pop and peek when empty', () => {
    const empty = emptyStack()

    const pop = applyStack(empty, { type: 'pop' })
    expect(pop.event.kind).toBe('error')
    expect(pop.next.items).toEqual([])
    expect(pop.next.error).toMatch(/empty stack/i)

    const peek = applyStack(empty, { type: 'peek' })
    expect(peek.event.kind).toBe('error')
    expect(peek.next.error).toMatch(/empty stack/i)
  })
})

describe('queue', () => {
  it('starts empty', () => {
    expect(emptyQueue()).toEqual({ items: [] })
  })

  it('enqueue/dequeue follow FIFO order', () => {
    let state = emptyQueue()

    state = applyQueue(state, { type: 'enqueue', value: 3 }).next
    state = applyQueue(state, { type: 'enqueue', value: 7 }).next
    expect(state.items).toEqual([3, 7])

    const first = applyQueue(state, { type: 'dequeue' })
    expect(first.event.kind).toBe('ok')
    expect(first.event.returnValue).toBe(3)
    expect(first.next.items).toEqual([7])

    const second = applyQueue(first.next, { type: 'dequeue' })
    expect(second.event.returnValue).toBe(7)
    expect(second.next.items).toEqual([])
  })

  it('front returns the head without mutating items', () => {
    let state = emptyQueue()
    state = applyQueue(state, { type: 'enqueue', value: 5 }).next
    state = applyQueue(state, { type: 'enqueue', value: 9 }).next

    const front = applyQueue(state, { type: 'front' })
    expect(front.event.kind).toBe('ok')
    expect(front.event.returnValue).toBe(5)
    expect(front.next.items).toEqual([5, 9])
  })

  it('errors on dequeue and front when empty', () => {
    const empty = emptyQueue()

    const dequeue = applyQueue(empty, { type: 'dequeue' })
    expect(dequeue.event.kind).toBe('error')
    expect(dequeue.next.items).toEqual([])
    expect(dequeue.next.error).toMatch(/empty queue/i)

    const front = applyQueue(empty, { type: 'front' })
    expect(front.event.kind).toBe('error')
    expect(front.next.error).toMatch(/empty queue/i)
  })
})

describe('array', () => {
  it('starts empty', () => {
    expect(emptyArray()).toEqual({ items: [] })
  })

  it('append grows the array', () => {
    let state = emptyArray()
    state = applyArray(state, { type: 'append', value: 10 }).next
    state = applyArray(state, { type: 'append', value: 20 }).next
    expect(state.items).toEqual([10, 20])
  })

  it('insert places a value at an index', () => {
    let state = emptyArray()
    state = applyArray(state, { type: 'append', value: 10 }).next
    state = applyArray(state, { type: 'append', value: 20 }).next

    const inserted = applyArray(state, { type: 'insert', index: 1, value: 15 })
    expect(inserted.event.kind).toBe('ok')
    expect(inserted.next.items).toEqual([10, 15, 20])
  })

  it('insert at length appends at the end', () => {
    let state = emptyArray()
    state = applyArray(state, { type: 'append', value: 1 }).next

    const inserted = applyArray(state, { type: 'insert', index: 1, value: 2 })
    expect(inserted.event.kind).toBe('ok')
    expect(inserted.next.items).toEqual([1, 2])
  })

  it('remove deletes by index and returns the value', () => {
    let state = emptyArray()
    state = applyArray(state, { type: 'append', value: 10 }).next
    state = applyArray(state, { type: 'append', value: 20 }).next
    state = applyArray(state, { type: 'append', value: 30 }).next

    const removed = applyArray(state, { type: 'remove', index: 0 })
    expect(removed.event.kind).toBe('ok')
    expect(removed.event.returnValue).toBe(10)
    expect(removed.next.items).toEqual([20, 30])
  })

  it('set and get work for valid indices', () => {
    let state = emptyArray()
    state = applyArray(state, { type: 'append', value: 10 }).next
    state = applyArray(state, { type: 'append', value: 20 }).next

    const set = applyArray(state, { type: 'set', index: 1, value: 99 })
    expect(set.event.kind).toBe('ok')
    expect(set.next.items).toEqual([10, 99])

    const get = applyArray(set.next, { type: 'get', index: 1 })
    expect(get.event.kind).toBe('ok')
    expect(get.event.returnValue).toBe(99)
    expect(get.next.items).toEqual([10, 99])
  })

  it('errors on out-of-bounds insert/remove/set/get', () => {
    let state = emptyArray()
    state = applyArray(state, { type: 'append', value: 1 }).next

    const insert = applyArray(state, { type: 'insert', index: 2, value: 9 })
    expect(insert.event.kind).toBe('error')
    expect(insert.next.highlight).toEqual([2])
    expect(insert.event.highlight).toEqual([2])

    const remove = applyArray(state, { type: 'remove', index: 1 })
    expect(remove.event.kind).toBe('error')
    expect(remove.next.highlight).toEqual([1])

    const set = applyArray(state, { type: 'set', index: -1, value: 9 })
    expect(set.event.kind).toBe('error')
    expect(set.next.highlight).toEqual([-1])

    const get = applyArray(state, { type: 'get', index: 5 })
    expect(get.event.kind).toBe('error')
    expect(get.next.highlight).toEqual([5])
    expect(get.next.error).toBeTruthy()
  })
})

describe('parse', () => {
  it('parses stack sample scripts', () => {
    const result = parse(
      `// Stack operations
push(3)
push(7)
push(1)
pop()
peek()`,
      'stack',
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.ops).toEqual([
      { line: 2, op: { type: 'push', value: 3 } },
      { line: 3, op: { type: 'push', value: 7 } },
      { line: 4, op: { type: 'push', value: 1 } },
      { line: 5, op: { type: 'pop' } },
      { line: 6, op: { type: 'peek' } },
    ])
  })

  it('parses queue and array sample scripts', () => {
    const queue = parse(
      `// Queue operations
enqueue(3)
enqueue(7)
dequeue()`,
      'queue',
    )
    expect(queue.ok).toBe(true)
    if (!queue.ok) return
    expect(queue.ops.map((op) => op.op)).toEqual([
      { type: 'enqueue', value: 3 },
      { type: 'enqueue', value: 7 },
      { type: 'dequeue' },
    ])

    const array = parse(
      `append(10)
append(20)
insert(1, 15)
remove(0)`,
      'array',
    )
    expect(array.ok).toBe(true)
    if (!array.ok) return
    expect(array.ops.map((op) => op.op)).toEqual([
      { type: 'append', value: 10 },
      { type: 'append', value: 20 },
      { type: 'insert', index: 1, value: 15 },
      { type: 'remove', index: 0 },
    ])
  })

  it('ignores blank lines and comments', () => {
    const result = parse(
      `
// comment
push(1)

push(2) // trailing comment
`,
      'stack',
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.ops).toHaveLength(2)
    expect(result.ops[0]?.line).toBe(3)
    expect(result.ops[1]?.line).toBe(5)
  })

  it('reports bad syntax, wrong arity, and disallowed ops', () => {
    const result = parse(
      `push
pop(1)
enqueue(3)
push(x)`,
      'stack',
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.map((error) => error.line)).toEqual([1, 2, 3, 4])
    expect(result.errors[0]?.message).toMatch(/syntax/i)
    expect(result.errors[1]?.message).toMatch(/expects 0/i)
    expect(result.errors[2]?.message).toMatch(/Unknown operation "enqueue"/i)
    expect(result.errors[3]?.message).toMatch(/numbers/i)
  })
})

describe('run', () => {
  it('builds a full frame timeline for a short stack script', () => {
    const parsed = parse(
      `push(3)
push(7)
pop()`,
      'stack',
    )
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return

    const frames = run(parsed.ops, 'stack')
    expect(frames).toHaveLength(3)
    expect(frames.map((frame) => frame.line)).toEqual([1, 2, 3])
    expect(frames[0]?.after.items).toEqual([3])
    expect(frames[1]?.after.items).toEqual([3, 7])
    expect(frames[2]?.event.returnValue).toBe(7)
    expect(frames[2]?.after.items).toEqual([3])
  })

  it('stops after the first runtime error frame', () => {
    const parsed = parse(
      `pop()
push(1)`,
      'stack',
    )
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return

    const frames = run(parsed.ops, 'stack')
    expect(frames).toHaveLength(1)
    expect(frames[0]?.event.kind).toBe('error')
    expect(frames[0]?.line).toBe(1)
  })

  it('preserves source line numbers through queue execution', () => {
    const parsed = parse(
      `// skip
enqueue(3)

dequeue()`,
      'queue',
    )
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return

    const frames = run(parsed.ops, 'queue')
    expect(frames.map((frame) => frame.line)).toEqual([2, 4])
    expect(frames[1]?.event.returnValue).toBe(3)
  })
})
