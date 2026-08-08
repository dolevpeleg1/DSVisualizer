let nextId = 1

/** Stable identity for animated cells across inserts/removes. */
export function createItemId(): string {
  return `c${nextId++}`
}

/** Test helper — reset between suites if needed. */
export function resetItemIds(): void {
  nextId = 1
}
