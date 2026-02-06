/**
 * SleekTools - Tool Registry
 * 
 * Central registry for all tools. Each tool is defined with its metadata,
 * routing info, and lazy-loaded component. Adding a new tool only requires
 * adding an entry here and creating the tool module.
 */

import { lazy } from 'react'
import { 
  Braces, 
  Crop, 
  MessageCircle, 
  QrCode, 
  FileText, 
  Calculator,
  Timer,
  Binary,
  Regex,
  GitCompare,
  Palette,
  Link2,
  PenTool
} from 'lucide-react'

/**
 * Tool configuration schema:
 * {
 *   id: string           - Unique identifier (used in routes)
 *   name: string         - Display name
 *   description: string  - Short description
 *   icon: Component      - Lucide icon component
 *   path: string         - Route path
 *   component: lazy()    - Lazy-loaded component
 *   category: string     - Tool category for grouping
 *   tags: string[]       - Search/filter tags
 *   status: string       - 'active' | 'coming-soon' | 'beta'
 *   clientSide: boolean  - Whether tool works entirely client-side
 * }
 */

const toolRegistry = [
  // ===== Phase 1 - MVP Tools =====
  {
    id: 'json',
    name: 'JSON Formatter',
    description: 'Format, validate, and beautify JSON instantly',
    icon: Braces,
    path: '/tools/json',
    component: lazy(() => import('./tools/json')),
    category: 'Developer',
    tags: ['json', 'format', 'validate', 'beautify', 'minify'],
    status: 'active',
    clientSide: true,
  },
  {
    id: 'crop',
    name: 'Image Crop',
    description: 'Crop, resize, and compress images',
    icon: Crop,
    path: '/tools/crop',
    component: lazy(() => import('./tools/crop')),
    category: 'Media',
    tags: ['image', 'crop', 'resize', 'compress', 'photo'],
    status: 'active',
    clientSide: true,
  },
  {
    id: 'chat',
    name: 'Quick Chat',
    description: 'Create instant, private chat rooms',
    icon: MessageCircle,
    path: '/tools/chat',
    component: lazy(() => import('./tools/chat')),
    category: 'Communication',
    tags: ['chat', 'room', 'messaging', 'realtime'],
    status: 'active',
    clientSide: false,
  },
  {
    id: 'canvas',
    name: 'Collab Canvas',
    description: 'Draw together in real-time with shareable links',
    icon: PenTool,
    path: '/tools/canvas',
    component: lazy(() => import('./tools/canvas')),
    category: 'Collaboration',
    tags: ['canvas', 'draw', 'whiteboard', 'collaborate', 'sketch'],
    status: 'active',
    clientSide: false,
  },

  // ===== Phase 2 - Coming Soon =====
  {
    id: 'qr',
    name: 'QR Generator',
    description: 'Generate QR codes for any content',
    icon: QrCode,
    path: '/tools/qr',
    component: lazy(() => import('./tools/coming-soon')),
    category: 'Utilities',
    tags: ['qr', 'code', 'generate', 'barcode'],
    status: 'coming-soon',
    clientSide: true,
  },
  {
    id: 'markdown',
    name: 'Markdown Preview',
    description: 'Write and preview Markdown in real-time',
    icon: FileText,
    path: '/tools/markdown',
    component: lazy(() => import('./tools/coming-soon')),
    category: 'Developer',
    tags: ['markdown', 'preview', 'editor', 'md'],
    status: 'coming-soon',
    clientSide: true,
  },
  {
    id: 'split-bill',
    name: 'Split Bill',
    description: 'Calculate and split bills easily',
    icon: Calculator,
    path: '/tools/split-bill',
    component: lazy(() => import('./tools/coming-soon')),
    category: 'Utilities',
    tags: ['calculator', 'split', 'bill', 'share'],
    status: 'coming-soon',
    clientSide: true,
  },
  {
    id: 'timer',
    name: 'Pomodoro Timer',
    description: 'Focus timer with Pomodoro technique',
    icon: Timer,
    path: '/tools/timer',
    component: lazy(() => import('./tools/coming-soon')),
    category: 'Productivity',
    tags: ['timer', 'pomodoro', 'focus', 'productivity'],
    status: 'coming-soon',
    clientSide: true,
  },
  {
    id: 'base64',
    name: 'Base64 Encoder',
    description: 'Encode and decode Base64 strings',
    icon: Binary,
    path: '/tools/base64',
    component: lazy(() => import('./tools/coming-soon')),
    category: 'Developer',
    tags: ['base64', 'encode', 'decode', 'binary'],
    status: 'coming-soon',
    clientSide: true,
  },
  {
    id: 'regex',
    name: 'Regex Tester',
    description: 'Test and debug regular expressions',
    icon: Regex,
    path: '/tools/regex',
    component: lazy(() => import('./tools/coming-soon')),
    category: 'Developer',
    tags: ['regex', 'regular expression', 'test', 'pattern'],
    status: 'coming-soon',
    clientSide: true,
  },
  {
    id: 'diff',
    name: 'Diff Checker',
    description: 'Compare text and find differences',
    icon: GitCompare,
    path: '/tools/diff',
    component: lazy(() => import('./tools/coming-soon')),
    category: 'Developer',
    tags: ['diff', 'compare', 'text', 'difference'],
    status: 'coming-soon',
    clientSide: true,
  },
  {
    id: 'colors',
    name: 'Color Picker',
    description: 'Pick and convert color formats',
    icon: Palette,
    path: '/tools/colors',
    component: lazy(() => import('./tools/coming-soon')),
    category: 'Design',
    tags: ['color', 'picker', 'hex', 'rgb', 'hsl'],
    status: 'coming-soon',
    clientSide: true,
  },
  {
    id: 'url',
    name: 'URL Encoder',
    description: 'Encode and decode URLs',
    icon: Link2,
    path: '/tools/url',
    component: lazy(() => import('./tools/coming-soon')),
    category: 'Developer',
    tags: ['url', 'encode', 'decode', 'uri'],
    status: 'coming-soon',
    clientSide: true,
  },
]

// ===== Registry Helper Functions =====

/**
 * Get all registered tools
 */
export const getAllTools = () => toolRegistry

/**
 * Get only active tools
 */
export const getActiveTools = () => 
  toolRegistry.filter(tool => tool.status === 'active')

/**
 * Get tools by status
 */
export const getToolsByStatus = (status) => 
  toolRegistry.filter(tool => tool.status === status)

/**
 * Get tools by category
 */
export const getToolsByCategory = (category) => 
  toolRegistry.filter(tool => tool.category === category)

/**
 * Get a specific tool by ID
 */
export const getToolById = (id) => 
  toolRegistry.find(tool => tool.id === id)

/**
 * Get all unique categories
 */
export const getAllCategories = () => 
  [...new Set(toolRegistry.map(tool => tool.category))]

/**
 * Search tools by query
 */
export const searchTools = (query) => {
  const lowerQuery = query.toLowerCase()
  return toolRegistry.filter(tool => 
    tool.name.toLowerCase().includes(lowerQuery) ||
    tool.description.toLowerCase().includes(lowerQuery) ||
    tool.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}

/**
 * Get routes configuration for React Router
 */
export const getToolRoutes = () => 
  toolRegistry.map(tool => ({
    path: tool.path,
    element: tool.component,
    id: tool.id,
  }))

export default toolRegistry
