import { useEffect, useMemo, useRef } from 'react'
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import { Decoration, EditorView, type DecorationSet } from '@codemirror/view'
import { StateEffect, StateField } from '@codemirror/state'

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

const activeLineMark = Decoration.line({ class: 'cm-ds-active-line' })
const errorLineMark = Decoration.line({ class: 'cm-ds-error-line' })

const matrixEditorTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: 'var(--bg)',
      color: '#ffffff',
      height: '100%',
    },
    '.cm-scroller': {
      fontFamily: 'var(--mono)',
    },
    '.cm-content': {
      caretColor: '#ffffff',
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: '#ffffff',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
      {
        backgroundColor: 'color-mix(in srgb, var(--accent) 28%, transparent)',
      },
    '.cm-gutters': {
      backgroundColor: 'var(--bg-panel)',
      color: 'rgba(255, 255, 255, 0.35)',
      border: 'none',
      borderRight: '1px solid var(--border)',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'var(--bg-elevated)',
      color: '#ffffff',
    },
    '.cm-activeLine': {
      backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)',
    },
    '.cm-ds-active-line': {
      backgroundColor: 'color-mix(in srgb, var(--accent) 22%, transparent) !important',
    },
    '.cm-ds-error-line': {
      backgroundColor: 'color-mix(in srgb, var(--danger) 22%, transparent) !important',
    },
  },
  { dark: true },
)

/** White-first syntax coloring — green is reserved for UI accents, not text. */
const matrixHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: '#ffffff', fontWeight: '600' },
  { tag: t.controlKeyword, color: '#ffffff', fontWeight: '600' },
  { tag: t.operator, color: 'rgba(255, 255, 255, 0.75)' },
  { tag: t.string, color: '#ffffff' },
  { tag: t.number, color: '#ffffff' },
  { tag: t.bool, color: '#ffffff' },
  { tag: t.null, color: '#ffffff' },
  { tag: t.comment, color: 'rgba(255, 255, 255, 0.4)' },
  { tag: t.variableName, color: '#ffffff' },
  { tag: t.function(t.variableName), color: '#ffffff' },
  { tag: t.propertyName, color: '#ffffff' },
  { tag: t.punctuation, color: 'rgba(255, 255, 255, 0.65)' },
  { tag: t.bracket, color: 'rgba(255, 255, 255, 0.65)' },
  { tag: t.meta, color: 'rgba(255, 255, 255, 0.5)' },
  { tag: t.invalid, color: 'var(--danger)' },
])

export function CodeEditor({
  value,
  onChange,
  readOnly = false,
  activeLine = null,
  errorLines = [],
}: CodeEditorProps) {
  const editorRef = useRef<ReactCodeMirrorRef>(null)
  const extensions = useMemo(
    () => [
      javascript(),
      highlightField,
      matrixEditorTheme,
      syntaxHighlighting(matrixHighlightStyle),
    ],
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
      theme="none"
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
