/**
 * JSON Formatter Tool - Configuration
 */
export default {
  id: 'json',
  name: 'JSON Formatter',
  description: 'Format, validate, and beautify JSON instantly',
  category: 'Developer',
  tags: ['json', 'format', 'validate', 'beautify', 'minify'],
  clientSide: true,
  
  // Tool-specific settings
  settings: {
    defaultIndent: 2,
    indentOptions: [2, 4, 'tab'],
    maxInputSize: 5 * 1024 * 1024, // 5MB
  }
}
