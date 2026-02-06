/**
 * Collaborative Canvas Tool - Configuration
 */
export default {
  id: 'canvas',
  name: 'Collab Canvas',
  description: 'Real-time collaborative whiteboard',
  category: 'Collaboration',
  tags: ['canvas', 'whiteboard', 'draw', 'collaborate', 'realtime'],
  clientSide: false,
  
  // Tool-specific settings
  settings: {
    maxCanvasDurationHours: 24,
    maxParticipants: 20,
    wsEndpoint: import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws/canvas',
    apiEndpoint: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  }
}
