import { describe, expect, it } from 'vitest'
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

    expect(applyArray(state, { type: 'insert', index: 2, value: 9 }).event.kind).toBe(
      'error',
    )
    expect(applyArray(state, { type: 'remove', index: 1 }).event.kind).toBe('error')
    expect(applyArray(state, { type: 'set', index: -1, value: 9 }).event.kind).toBe(
      'error',
    )
    expect(applyArray(state, { type: 'get', index: 5 }).event.kind).toBe('error')
  })
})
