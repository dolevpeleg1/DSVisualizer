import type { Op, StructureId } from '../structures/types'

export type ParsedOp = {
  line: number
  op: Op
}

export type ParseError = {
  line: number
  message: string
}

export type ParseSuccess = {
  ok: true
  ops: ParsedOp[]
}

export type ParseFailure = {
  ok: false
  errors: ParseError[]
}

export type ParseResult = ParseSuccess | ParseFailure

type OpSpec = {
  arity: number
  build: (args: number[]) => Op
}

const OP_SPECS: Record<StructureId, Record<string, OpSpec>> = {
  stack: {
    push: {
      arity: 1,
      build: ([value]) => ({ type: 'push', value: value as number }),
    },
    pop: { arity: 0, build: () => ({ type: 'pop' }) },
    peek: { arity: 0, build: () => ({ type: 'peek' }) },
  },
  queue: {
    enqueue: {
      arity: 1,
      build: ([value]) => ({ type: 'enqueue', value: value as number }),
    },
    dequeue: { arity: 0, build: () => ({ type: 'dequeue' }) },
    front: { arity: 0, build: () => ({ type: 'front' }) },
  },
  array: {
    append: {
      arity: 1,
      build: ([value]) => ({ type: 'append', value: value as number }),
    },
    insert: {
      arity: 2,
      build: ([index, value]) => ({
        type: 'insert',
        index: index as number,
        value: value as number,
      }),
    },
    remove: {
      arity: 1,
      build: ([index]) => ({ type: 'remove', index: index as number }),
    },
    set: {
      arity: 2,
      build: ([index, value]) => ({
        type: 'set',
        index: index as number,
        value: value as number,
      }),
    },
    get: {
      arity: 1,
      build: ([index]) => ({ type: 'get', index: index as number }),
    },
  },
  tree: {
    insert: {
      arity: 1,
      build: ([value]) => ({ type: 'insert', value: value as number }),
    },
    delete: {
      arity: 1,
      build: ([value]) => ({ type: 'delete', value: value as number }),
    },
    find: {
      arity: 1,
      build: ([value]) => ({ type: 'find', value: value as number }),
    },
  },
}

const CALL_RE = /^([A-Za-z_]\w*)\s*\((.*)\)\s*$/

/**
 * Parse a line-based operation DSL for the given structure.
 * Blank lines and `//` comments are ignored.
 */
export function parse(source: string, structureId: StructureId): ParseResult {
  const ops: ParsedOp[] = []
  const errors: ParseError[] = []
  const specs = OP_SPECS[structureId]
  const lines = source.split(/\r?\n/)

  for (let i = 0; i < lines.length; i++) {
    const lineNumber = i + 1
    const raw = lines[i] ?? ''
    const withoutComment = stripComment(raw).trim()
    if (withoutComment.length === 0) continue

    const match = CALL_RE.exec(withoutComment)
    if (!match) {
      errors.push({
        line: lineNumber,
        message: `Invalid syntax: expected name(args), got "${withoutComment}"`,
      })
      continue
    }

    const name = match[1] as string
    const argsText = match[2] as string
    const spec = specs[name]

    if (!spec) {
      const allowed = Object.keys(specs).join(', ')
      errors.push({
        line: lineNumber,
        message: `Unknown operation "${name}" for ${structureId}. Allowed: ${allowed}`,
      })
      continue
    }

    const parsedArgs = parseArgs(argsText)
    if (!parsedArgs.ok) {
      errors.push({ line: lineNumber, message: parsedArgs.message })
      continue
    }

    if (parsedArgs.args.length !== spec.arity) {
      errors.push({
        line: lineNumber,
        message: `"${name}" expects ${spec.arity} argument(s), got ${parsedArgs.args.length}`,
      })
      continue
    }

    ops.push({ line: lineNumber, op: spec.build(parsedArgs.args) })
  }

  if (errors.length > 0) {
    return { ok: false, errors }
  }

  return { ok: true, ops }
}

function stripComment(line: string): string {
  const index = line.indexOf('//')
  return index === -1 ? line : line.slice(0, index)
}

function parseArgs(
  argsText: string,
): { ok: true; args: number[] } | { ok: false; message: string } {
  const trimmed = argsText.trim()
  if (trimmed.length === 0) {
    return { ok: true, args: [] }
  }

  const parts = trimmed.split(',')
  const args: number[] = []

  for (const part of parts) {
    const token = part.trim()
    if (token.length === 0) {
      return { ok: false, message: 'Invalid empty argument' }
    }
    if (!/^-?\d+(\.\d+)?$/.test(token)) {
      return {
        ok: false,
        message: `Arguments must be numbers, got "${token}"`,
      }
    }
    args.push(Number(token))
  }

  return { ok: true, args }
}
