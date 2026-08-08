import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Snapshot, TreeNode } from '../structures/types'

type TreeViewProps = {
  snapshot: Snapshot
}

type LaidOutNode = {
  id: string
  value: number
  x: number
  y: number
}

type Edge = {
  key: string
  parentId: string
  childId: string
  x1: number
  y1: number
  x2: number
  y2: number
}

const NODE_SIZE = 48
const X_GAP = 64
const Y_GAP = 72
/** Wait for the edge to finish drawing before revealing the new node. */
const NEW_NODE_DELAY_MS = 320
const NODE_ENTER = { type: 'spring' as const, stiffness: 220, damping: 22 }
const EDGE_DRAW = { duration: 0.28, ease: 'easeOut' as const }

export function TreeView({ snapshot }: TreeViewProps) {
  const root = snapshot.root ?? null
  const highlightIds = new Set(snapshot.highlightIds ?? [])
  const hasError = Boolean(snapshot.error)

  const knownNodeIdsRef = useRef<Set<string>>(new Set())
  const revealedNodesRef = useRef<Set<string>>(new Set())
  const pendingTimersRef = useRef<Map<string, number>>(new Map())

  const [enteringNodeIds, setEnteringNodeIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [visibleNodeIds, setVisibleNodeIds] = useState<Set<string>>(
    () => new Set(),
  )

  const layout = useMemo(() => (root ? layoutTree(root) : null), [root])
  const nodes = layout?.nodes ?? []
  const edges = layout?.edges ?? []

  const childIdsWithParent = useMemo(() => {
    const ids = new Set<string>()
    for (const edge of edges) ids.add(edge.childId)
    return ids
  }, [edges])

  useLayoutEffect(() => {
    const entering = new Set<string>()
    for (const node of nodes) {
      if (!knownNodeIdsRef.current.has(node.id)) entering.add(node.id)
    }
    setEnteringNodeIds(entering)

    const currentNodeIds = new Set(nodes.map((node) => node.id))

    for (const [id, timer] of pendingTimersRef.current) {
      if (!currentNodeIds.has(id)) {
        window.clearTimeout(timer)
        pendingTimersRef.current.delete(id)
      }
    }

    for (const id of [...revealedNodesRef.current]) {
      if (!currentNodeIds.has(id)) revealedNodesRef.current.delete(id)
    }

    for (const node of nodes) {
      if (revealedNodesRef.current.has(node.id)) continue
      if (pendingTimersRef.current.has(node.id)) continue

      const isNew = entering.has(node.id)
      const hasIncomingEdge = childIdsWithParent.has(node.id)

      // Root (or already-known node): show immediately.
      // New child: wait for its edge to draw first.
      if (!isNew || !hasIncomingEdge) {
        revealedNodesRef.current.add(node.id)
        continue
      }

      const timer = window.setTimeout(() => {
        pendingTimersRef.current.delete(node.id)
        revealedNodesRef.current.add(node.id)
        setVisibleNodeIds(new Set(revealedNodesRef.current))
      }, NEW_NODE_DELAY_MS)
      pendingTimersRef.current.set(node.id, timer)
    }

    knownNodeIdsRef.current = new Set(currentNodeIds)
    setVisibleNodeIds(new Set(revealedNodesRef.current))
  }, [nodes, childIdsWithParent])

  useLayoutEffect(() => {
    return () => {
      for (const timer of pendingTimersRef.current.values()) {
        window.clearTimeout(timer)
      }
      pendingTimersRef.current.clear()
    }
  }, [])

  if (!root || !layout) {
    return (
      <p
        className={`text-sm ${
          hasError ? 'text-[var(--danger)]' : 'text-[var(--muted)]'
        }`}
      >
        Empty tree
      </p>
    )
  }

  const { width, height } = layout

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 overflow-auto p-2">
      <div className="text-xs uppercase tracking-wider text-[var(--muted)]">
        Binary search tree
      </div>
      <div
        className="relative"
        style={{ width, height: height + NODE_SIZE }}
      >
        <svg
          className="absolute inset-0 overflow-visible"
          width={width}
          height={height + NODE_SIZE}
          aria-hidden
        >
          <AnimatePresence initial={false}>
            {edges.map((edge) => {
              // Line grows as soon as the parent is on screen; child may still be hidden.
              if (!visibleNodeIds.has(edge.parentId)) return null
              return (
                <TreeEdge
                  key={edge.key}
                  edge={edge}
                  drawIn={!visibleNodeIds.has(edge.childId)}
                />
              )
            })}
          </AnimatePresence>
        </svg>

        <AnimatePresence initial={false}>
          {nodes.map((node) => {
            if (!visibleNodeIds.has(node.id)) return null

            const active = highlightIds.has(node.id)
            const error = hasError && active
            const isNew = enteringNodeIds.has(node.id)
            const left = node.x - NODE_SIZE / 2
            const top = node.y - NODE_SIZE / 2

            return (
              <motion.div
                key={node.id}
                initial={isNew ? { opacity: 0, scale: 0.55 } : false}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.55 }}
                transition={NODE_ENTER}
                className={`absolute flex items-center justify-center rounded-full border font-[family-name:var(--mono)] text-sm font-medium ${
                  error
                    ? 'border-[var(--danger)] bg-[color-mix(in_srgb,var(--danger)_18%,var(--bg-elevated))] text-[var(--text-h)]'
                    : active
                      ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_22%,var(--bg-elevated))] text-[var(--text-h)]'
                      : 'border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text)]'
                }`}
                style={{
                  width: NODE_SIZE,
                  height: NODE_SIZE,
                  left,
                  top,
                }}
              >
                {node.value}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

function TreeEdge({ edge, drawIn }: { edge: Edge; drawIn: boolean }) {
  // Capture on mount: grow parent → child when the node isn't visible yet.
  const [settled, setSettled] = useState(!drawIn)

  return (
    <motion.line
      initial={
        drawIn
          ? {
              x1: edge.x1,
              y1: edge.y1,
              x2: edge.x1,
              y2: edge.y1,
              opacity: 1,
            }
          : false
      }
      animate={{
        x1: edge.x1,
        y1: edge.y1,
        x2: edge.x2,
        y2: edge.y2,
        opacity: 1,
      }}
      exit={{ opacity: 0 }}
      transition={settled ? { duration: 0 } : EDGE_DRAW}
      onAnimationComplete={() => setSettled(true)}
      stroke="var(--border)"
      strokeWidth="2"
    />
  )
}

function layoutTree(root: TreeNode): {
  nodes: LaidOutNode[]
  edges: Edge[]
  width: number
  height: number
} {
  const nodes: LaidOutNode[] = []
  const edges: Edge[] = []
  let nextX = 0
  let maxY = 0

  function walk(node: TreeNode, depth: number): LaidOutNode {
    const left = node.left ? walk(node.left, depth + 1) : null
    const x = nextX * X_GAP + NODE_SIZE
    nextX += 1
    const y = depth * Y_GAP + NODE_SIZE
    maxY = Math.max(maxY, y)

    const right = node.right ? walk(node.right, depth + 1) : null
    const laid: LaidOutNode = { id: node.id, value: node.value, x, y }
    nodes.push(laid)

    if (left) {
      edges.push({
        key: `${node.id}-${left.id}`,
        parentId: node.id,
        childId: left.id,
        x1: x,
        y1: y,
        x2: left.x,
        y2: left.y,
      })
    }
    if (right) {
      edges.push({
        key: `${node.id}-${right.id}`,
        parentId: node.id,
        childId: right.id,
        x1: x,
        y1: y,
        x2: right.x,
        y2: right.y,
      })
    }

    return laid
  }

  walk(root, 0)

  return {
    nodes,
    edges,
    width: Math.max(nextX * X_GAP + NODE_SIZE, NODE_SIZE * 2),
    height: maxY,
  }
}
