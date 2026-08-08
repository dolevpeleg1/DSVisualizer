# DSVisualizer

Interactive visualizer for data structures (stack, queue, array, and more to come). Write simple operations in the editor, then **Run** or **Step** through them and watch the structure update.

## Quick start

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm test    # unit tests
npm run build
```

## How to use

1. Pick **Stack**, **Queue**, or **Array** in the header.
2. Edit the operation script (or keep the sample).
3. Click **Step** to advance one operation, or **Run** to play through all.
4. **Reset** restores the sample script for the current structure.

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

## Project layout

- `src/structures/` — pure structure models
- `src/engine/` — DSL parser + frame timeline runner
- `src/viz/` — animated visualizations
- `src/editor/` — CodeMirror editor
- `src/dsvisualizer.test.ts` — unit tests
