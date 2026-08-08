export type StructureId = 'stack' | 'queue' | 'array'

/** MVP values are numbers (matches sample scripts). */
export type Value = number

export type StackOp =
  | { type: 'push'; value: Value }
  | { type: 'pop' }
  | { type: 'peek' }

export type QueueOp =
  | { type: 'enqueue'; value: Value }
  | { type: 'dequeue' }
  | { type: 'front' }

export type ArrayOp =
  | { type: 'append'; value: Value }
  | { type: 'insert'; index: number; value: Value }
  | { type: 'remove'; index: number }
  | { type: 'set'; index: number; value: Value }
  | { type: 'get'; index: number }

export type Op = StackOp | QueueOp | ArrayOp

export type Snapshot = {
  items: Value[]
  highlight?: number[]
  message?: string
  error?: string
}

export type ApplyEvent = {
  kind: 'ok' | 'error'
  message: string
  returnValue?: Value
  highlight?: number[]
}

export type ApplyResult = {
  next: Snapshot
  event: ApplyEvent
}

export type Frame = {
  line: number
  op: Op
  before: Snapshot
  after: Snapshot
  event: ApplyEvent
}
