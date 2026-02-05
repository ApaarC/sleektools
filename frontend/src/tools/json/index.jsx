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
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 
                      flex items-center justify-center">
          <Braces className="w-6 h-6 text-primary-400" />
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
          <span className="text-sm text-dark-400">Indent:</span>
          <div className="flex gap-1">
            {[2, 4].map((size) => (
              <button
                key={size}
                onClick={() => setIndentSize(size)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                  indentSize === size
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="h-6 w-px bg-dark-700 hidden sm:block" />

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
        <label className="btn-secondary cursor-pointer">
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
            <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          </motion.div>
        )}
        {output && !error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="text-green-400 text-sm">
                Valid JSON • {isMinified ? 'Minified' : `Formatted with ${indentSize} spaces`}
              </span>
              <Badge variant="success" className="ml-auto">
                {(output.length / 1024).toFixed(1)} KB
              </Badge>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-dark-300 flex items-center gap-2">
              <FileJson className="w-4 h-4" />
              Input
            </label>
            {input && (
              <span className="text-xs text-dark-500">
                {input.length.toLocaleString()} characters
              </span>
            )}
          </div>
          <Textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setError(null)
            }}
            placeholder='Paste your JSON here...\n\n{\n  "example": "value"\n}'
            className="flex-1 min-h-[300px] lg:min-h-[400px]"
          />
        </div>

        {/* Output */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-dark-300 flex items-center gap-2">
              <Braces className="w-4 h-4" />
              Output
            </label>
            {output && (
              <span className="text-xs text-dark-500">
                {output.length.toLocaleString()} characters
              </span>
            )}
          </div>
          <Textarea
            value={output}
            readOnly
            placeholder="Formatted JSON will appear here..."
            className="flex-1 min-h-[300px] lg:min-h-[400px] bg-dark-900"
          />
        </div>
      </div>

      {/* Tips */}
      <Card className="bg-dark-800/30">
        <h3 className="text-sm font-medium text-dark-300 mb-2">💡 Tips</h3>
        <ul className="text-sm text-dark-500 space-y-1">
          <li>• Paste JSON directly or upload a .json file</li>
          <li>• Format adds indentation for readability</li>
          <li>• Minify removes whitespace to reduce size</li>
          <li>• All processing happens in your browser - no data leaves your device</li>
        </ul>
      </Card>
    </div>
  )
}
