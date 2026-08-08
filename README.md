# DSVisualizer

Interactive web app for learning data structures. You write simple operations in an editor, then **Run** or **Step** through them while an animated visualization updates for **stack**, **queue**, **array**, or **binary search tree**.

## What it does

- Parse a small command DSL (`push(3)`, `enqueue(7)`, `insert(1, 5)`, …)
- Execute operations into a frame timeline
- Play or step through frames with line highlighting and status messages
- Animate structure state (cells, tree nodes, highlights, errors)

## Stack

| Layer | Tech |
| --- | --- |
| UI | React 19, React Router, Framer Motion |
| Styling | Tailwind CSS v4, CSS variables |
| Editor | CodeMirror 6 (`@uiw/react-codemirror`) |
| Tooling | Vite, TypeScript, Vitest, oxlint |

Core logic lives under `src/structures/` (pure models) and `src/engine/` (parse + run). Visualizations are in `src/viz/`.

## Local build

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production bundle → dist/
npm test         # unit tests
npm run lint
```

Preview a production build with `npm run preview`.

Deploy by hosting `dist/` as a static site. For client routes like `/app`, configure an SPA fallback to `index.html` (Vercel rewrites, Netlify/`_redirects`, etc.).

## AI usage

This project was built with AI assistance (Cursor) plus substantial human direction and edits.

**AI helped with**

- Feature scaffolding (structures, parser/runner, visualizer UI, animations)
- Matrix-themed homepage (falling glyphs) and visualizer chrome restyles
- Editor theming, layout tweaks, and small UX fixes (e.g. queue Front/Back alignment)
- README drafts and deploy notes

**Human work included**

- Product direction and iteration
- Manual CSS / theme token edits and visual polish in the browser
- Reviewing, editing, and rejecting AI output
- Running and validating behavior locally (dev server, interactions, tests)
- Commit decisions and final ownership of the code

All shipped code was reviewed and adjusted by me.

## Author

**[Dolev Peleg](https://github.com/dolevpeleg1)** 
