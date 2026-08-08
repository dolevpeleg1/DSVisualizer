import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'

type CodeEditorProps = {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
}

export function CodeEditor({ value, onChange, readOnly = false }: CodeEditorProps) {
  return (
    <CodeMirror
      value={value}
      height="100%"
      theme={oneDark}
      extensions={[javascript()]}
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
