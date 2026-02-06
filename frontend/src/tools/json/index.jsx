import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Braces, 
  Copy, 
  Check, 
  Trash2, 
  Download, 
  Upload,
  Minimize2,
  Maximize2,
  AlertCircle,
  CheckCircle2,
  FileJson
} from 'lucide-react'
import { Button, Textarea, Card, Badge } from '@/components'
import { useJsonStore } from '@/store'

export default function JsonFormatter() {
  const { 
    input, 
    output, 
    error, 
    indentSize,
    setInput, 
    setOutput, 
    setError,
    setIndentSize,
    clear 
  } = useJsonStore()
  
  const [copied, setCopied] = useState(false)
  const [isMinified, setIsMinified] = useState(false)

  // Format JSON
  const formatJson = useCallback(() => {
    if (!input.trim()) {
      setError('Please enter some JSON to format')
      setOutput('')
      return
    }

    try {
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, indentSize)
      setOutput(formatted)
      setError(null)
      setIsMinified(false)
    } catch (e) {
      setError(`Invalid JSON: ${e.message}`)
      setOutput('')
    }
  }, [input, indentSize, setOutput, setError])

  // Minify JSON
  const minifyJson = useCallback(() => {
    if (!input.trim()) {
      setError('Please enter some JSON to minify')
      setOutput('')
      return
    }

    try {
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      setOutput(minified)
      setError(null)
      setIsMinified(true)
    } catch (e) {
      setError(`Invalid JSON: ${e.message}`)
      setOutput('')
    }
  }, [input, setOutput, setError])

  // Copy to clipboard
  const copyToClipboard = useCallback(async () => {
    const textToCopy = output || input
    if (!textToCopy) return

    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('Failed to copy:', e)
    }
  }, [output, input])

  // Download JSON
  const downloadJson = useCallback(() => {
    const textToDownload = output || input
    if (!textToDownload) return

    const blob = new Blob([textToDownload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [output, input])

  // Handle file upload
  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result
      if (typeof content === 'string') {
        setInput(content)
        setError(null)
        setOutput('')
      }
    }
    reader.onerror = () => {
      setError('Failed to read file')
    }
    reader.readAsText(file)
  }, [setInput, setError, setOutput])

  // Handle clear
  const handleClear = useCallback(() => {
    clear()
    setIsMinified(false)
  }, [clear])

  return (
    <div className="tool-page">
      {/* Header */}
      <div className="tool-header">
        <div className="w-11 h-11 rounded-xl bg-surface-800 border border-surface-700/50
                      flex items-center justify-center">
          <Braces className="w-5 h-5 text-surface-300" />
        </div>
        <div>
          <h1 className="tool-title">JSON Formatter</h1>
          <p className="tool-description">Format, validate, and beautify JSON instantly</p>
        </div>
      </div>

      {/* Controls */}
      <Card className="flex flex-wrap items-center gap-3">
        {/* Indent Size */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-surface-400">Indent:</span>
          <div className="flex gap-1">
            {[2, 4].map((size) => (
              <button
                key={size}
                onClick={() => setIndentSize(size)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-150 ${
                  indentSize === size
                    ? 'bg-surface-50 text-surface-900'
                    : 'bg-surface-750 text-surface-400 hover:text-surface-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="h-5 w-px bg-surface-700 hidden sm:block" />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={formatJson} icon={Maximize2}>
            Format
          </Button>
          <Button onClick={minifyJson} variant="secondary" icon={Minimize2}>
            Minify
          </Button>
          <Button 
            onClick={copyToClipboard} 
            variant="secondary" 
            icon={copied ? Check : Copy}
            disabled={!input && !output}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button 
            onClick={downloadJson} 
            variant="secondary" 
            icon={Download}
            disabled={!input && !output}
          >
            Download
          </Button>
        </div>

        <div className="flex-1" />

        {/* File Upload */}
        <label className="btn btn-md bg-surface-750 text-surface-100 
                         border border-surface-600/50 hover:bg-surface-700 
                         cursor-pointer transition-all duration-150">
          <Upload className="w-4 h-4" />
          <span>Upload</span>
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        <Button onClick={handleClear} variant="ghost" icon={Trash2}>
          Clear
        </Button>
      </Card>

      {/* Status */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center gap-3 p-4 bg-crimson-500/10 
                          border border-crimson-500/20 rounded-xl">
              <AlertCircle className="w-4 h-4 text-crimson-400 flex-shrink-0" />
              <span className="text-crimson-400 text-sm">{error}</span>
            </div>
          </motion.div>
        )}
        {output && !error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center gap-3 p-4 bg-teal-500/10 
                          border border-teal-500/20 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <span className="text-teal-400 text-sm">
                Valid JSON • {isMinified ? 'Minified' : `Formatted with ${indentSize} spaces`}
              </span>
              <span className="ml-auto text-xs text-surface-400">
                {(output.length / 1024).toFixed(1)} KB
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-surface-300 flex items-center gap-2">
              <FileJson className="w-4 h-4 text-surface-500" />
              Input
            </label>
            {input && (
              <span className="text-xs text-surface-500">
                {input.length.toLocaleString()} chars
              </span>
            )}
          </div>
          <Textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setError(null)
            }}
            placeholder='Paste your JSON here...'
            className="flex-1 min-h-[300px] lg:min-h-[400px]"
          />
        </div>

        {/* Output */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-surface-300 flex items-center gap-2">
              <Braces className="w-4 h-4 text-surface-500" />
              Output
            </label>
            {output && (
              <span className="text-xs text-surface-500">
                {output.length.toLocaleString()} chars
              </span>
            )}
          </div>
          <Textarea
            value={output}
            readOnly
            placeholder="Formatted JSON will appear here..."
            className="flex-1 min-h-[300px] lg:min-h-[400px] bg-surface-850"
          />
        </div>
      </div>

      {/* Tips */}
      <div className="p-4 bg-surface-850 border border-surface-700/30 rounded-xl">
        <h3 className="text-sm font-medium text-surface-300 mb-2">Tips</h3>
        <ul className="text-sm text-surface-500 space-y-1">
          <li>• Paste JSON directly or upload a .json file</li>
          <li>• Format adds indentation for readability</li>
          <li>• All processing happens in your browser — no data leaves your device</li>
        </ul>
      </div>
    </div>
  )
}
