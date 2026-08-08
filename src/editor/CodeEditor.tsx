import { useEffect, useMemo, useRef } from "react"
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror"
import { javascript } from "@codemirror/lang-javascript"
import { oneDark } from "@codemirror/theme-one-dark"
import { Decoration, EditorView, type DecorationSet } from "@codemirror/view"
import { StateEffect, StateField } from "@codemirror/state"

type CodeEditorProps = {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  /** 1-based line to highlight during playback */
  activeLine?: number | null
  /** 1-based lines with parse/runtime errors */
  errorLines?: number[]
}

const setHighlights = StateEffect.define<{
  activeLine: number | null
  errorLines: number[]
}>()

const highlightField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none
  },
  update(decorations, transaction) {
    for (const effect of transaction.effects) {
      if (effect.is(setHighlights)) {
        const { activeLine, errorLines } = effect.value
        const doc = transaction.state.doc
        const ranges = []

        if (activeLine != null && activeLine >= 1 && activeLine <= doc.lines) {
          const line = doc.line(activeLine)
          ranges.push(activeLineMark.range(line.from, line.from))
        }

        for (const lineNumber of errorLines) {
          if (lineNumber >= 1 && lineNumber <= doc.lines) {
            const line = doc.line(lineNumber)
            ranges.push(errorLineMark.range(line.from, line.from))
          }
        }

        return Decoration.set(ranges, true)
      }
    }

    if (transaction.docChanged) {
      return decorations.map(transaction.changes)
    }

    return decorations
  },
  provide: (field) => EditorView.decorations.from(field),
})

const activeLineMark = Decoration.line({ class: "cm-ds-active-line" })
const errorLineMark = Decoration.line({ class: "cm-ds-error-line" })

const highlightTheme = EditorView.baseTheme({
  ".cm-ds-active-line": {
    backgroundColor: "color-mix(in srgb, var(--accent) 22%, transparent)",
  },
  ".cm-ds-error-line": {
    backgroundColor: "color-mix(in srgb, var(--danger) 18%, transparent)",
  },
})

export function CodeEditor({
  value,
  onChange,
  readOnly = false,
  activeLine = null,
  errorLines = [],
}: CodeEditorProps) {
  const editorRef = useRef<ReactCodeMirrorRef>(null)
  const extensions = useMemo(
    () => [javascript(), highlightField, highlightTheme],
    [],
  )

  useEffect(() => {
    const view = editorRef.current?.view
    if (!view) return
    view.dispatch({
      effects: setHighlights.of({ activeLine, errorLines }),
    })
  }, [activeLine, errorLines, value])

  return (
    <CodeMirror
      ref={editorRef}
      value={value}
      height="100%"
      theme={oneDark}
      extensions={extensions}
      onChange={onChange}
      editable={!readOnly}
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        highlightActiveLine: true,
      }}
      className="h-full overflow-hidden text-[14px]"
    />
  )
}
