# DSVisualizer

Interactive visualizer for data structures (stack, queue, array, tree, and more to come). Write simple operations in the editor, then **Run** or **Step** through them and watch the structure update.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test    # unit tests
npm run build
```

## How to use

1. Open the visualizer from the homepage.
2. Pick **Stack**, **Queue**, **Array**, or **Tree** in the header.
3. Edit the operation script (or keep the sample).
4. Click **Step** to advance one operation, or **Run** to play through all.
5. **Reset** restores the sample script for the current structure.

The footer shows the current step / errors. The editor highlights the active line during playback and error lines on failure.

## Supported operations

Comments (`// ...`) and blank lines are ignored. Arguments are numbers.

### Stack

- `push(value)`
- `pop()`
- `peek()`

### Queue

- `enqueue(value)`
- `dequeue()`
- `front()`

### Array

- `append(value)`
- `insert(index, value)`
- `remove(index)`
- `set(index, value)`
- `get(index)`

### Tree (binary search tree)

- `insert(value)`
- `delete(value)`
- `find(value)`

## Project layout

- `src/structures/` — pure structure models
- `src/engine/` — DSL parser + frame timeline runner
- `src/viz/` — animated visualizations
- `src/editor/` — CodeMirror editor
- `src/pages/` — homepage + visualizer
- `src/dsvisualizer.test.ts` — unit tests
