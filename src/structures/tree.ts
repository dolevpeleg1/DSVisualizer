import { createItemId } from './ids'
import type { ApplyResult, Snapshot, TreeNode, TreeOp, Value } from './types'

export function createEmpty(): Snapshot {
  return { items: [], root: null }
}

export function apply(state: Snapshot, op: TreeOp): ApplyResult {
  const root = state.root ?? null

  switch (op.type) {
    case 'insert': {
      const result = insertNode(root, op.value)
      if (!result.ok) {
        return {
          next: {
            items: [],
            root,
            error: result.message,
            highlightIds: result.path,
          },
          event: {
            kind: 'error',
            message: result.message,
            highlightIds: result.path,
          },
        }
      }
      return {
        next: {
          items: [],
          root: result.root,
          highlightIds: result.path,
          message: `insert(${op.value})`,
        },
        event: {
          kind: 'ok',
          message: `Inserted ${op.value}`,
          highlightIds: result.path,
        },
      }
    }
    case 'delete': {
      const found = findNode(root, op.value)
      if (!found.node) {
        return {
          next: {
            items: [],
            root,
            error: `Value ${op.value} not found`,
            highlightIds: found.path,
          },
          event: {
            kind: 'error',
            message: `Value ${op.value} not found`,
            highlightIds: found.path,
          },
        }
      }
      const nextRoot = deleteNode(root, op.value)
      return {
        next: {
          items: [],
          root: nextRoot,
          message: `delete(${op.value})`,
        },
        event: {
          kind: 'ok',
          message: `Deleted ${op.value}`,
          returnValue: op.value,
          highlightIds: found.path.slice(0, -1),
        },
      }
    }
    case 'find': {
      const found = findNode(root, op.value)
      if (!found.node) {
        return {
          next: {
            items: [],
            root,
            error: `Value ${op.value} not found`,
            highlightIds: found.path,
          },
          event: {
            kind: 'error',
            message: `Value ${op.value} not found`,
            highlightIds: found.path,
          },
        }
      }
      return {
        next: {
          items: [],
          root,
          highlightIds: found.path,
          message: `find(${op.value}) → ${op.value}`,
        },
        event: {
          kind: 'ok',
          message: `Found ${op.value}`,
          returnValue: op.value,
          highlightIds: found.path,
        },
      }
    }
  }
}

function insertNode(
  root: TreeNode | null,
  value: Value,
):
  | { ok: true; root: TreeNode; path: string[] }
  | { ok: false; message: string; path: string[] } {
  if (!root) {
    const node: TreeNode = { id: createItemId(), value, left: null, right: null }
    return { ok: true, root: node, path: [node.id] }
  }

  if (value === root.value) {
    return {
      ok: false,
      message: `Value ${value} already exists in the tree`,
      path: [root.id],
    }
  }

  if (value < root.value) {
    const child = insertNode(root.left, value)
    if (!child.ok) {
      return { ok: false, message: child.message, path: [root.id, ...child.path] }
    }
    return {
      ok: true,
      root: { ...root, left: child.root },
      path: [root.id, ...child.path],
    }
  }

  const child = insertNode(root.right, value)
  if (!child.ok) {
    return { ok: false, message: child.message, path: [root.id, ...child.path] }
  }
  return {
    ok: true,
    root: { ...root, right: child.root },
    path: [root.id, ...child.path],
  }
}

function findNode(
  root: TreeNode | null,
  value: Value,
): { node: TreeNode | null; path: string[] } {
  if (!root) return { node: null, path: [] }
  if (value === root.value) return { node: root, path: [root.id] }
  if (value < root.value) {
    const child = findNode(root.left, value)
    return { node: child.node, path: [root.id, ...child.path] }
  }
  const child = findNode(root.right, value)
  return { node: child.node, path: [root.id, ...child.path] }
}

function deleteNode(root: TreeNode | null, value: Value): TreeNode | null {
  if (!root) return null

  if (value < root.value) {
    return { ...root, left: deleteNode(root.left, value) }
  }
  if (value > root.value) {
    return { ...root, right: deleteNode(root.right, value) }
  }

  // Found node to delete
  if (!root.left) return root.right
  if (!root.right) return root.left

  const successor = minNode(root.right)
  return {
    ...root,
    value: successor.value,
    // keep this node's id so the UI slot is stable; value becomes successor
    right: deleteNode(root.right, successor.value),
  }
}

function minNode(root: TreeNode): TreeNode {
  let current = root
  while (current.left) current = current.left
  return current
}
