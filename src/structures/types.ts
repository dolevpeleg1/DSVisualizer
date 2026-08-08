export type StructureId = 'stack' | 'queue' | 'array' | 'tree'

/** MVP values are numbers (matches sample scripts). */
export type Value = number

/** Snapshot cell with a stable id for animation identity. */
export type CellItem = {
  id: string
  value: Value
}

/** Binary tree node with stable id for animation identity. */
export type TreeNode = {
  id: string
  value: Value
  left: TreeNode | null
  right: TreeNode | null
}

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

export type TreeOp =
  | { type: 'insert'; value: Value }
  | { type: 'delete'; value: Value }
  | { type: 'find'; value: Value }

export type Op = StackOp | QueueOp | ArrayOp | TreeOp

export type Snapshot = {
  items: CellItem[]
  /** Present for tree structure (null = empty tree). */
  root?: TreeNode | null
  highlight?: number[]
  /** Node ids to emphasize (trees). */
  highlightIds?: string[]
  message?: string
  error?: string
}

export type ApplyEvent = {
  kind: 'ok' | 'error'
  message: string
  returnValue?: Value
  highlight?: number[]
  highlightIds?: string[]
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
