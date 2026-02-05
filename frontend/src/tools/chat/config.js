/**
 * Quick Chat Tool - Configuration
 */
export default {
  id: 'chat',
  name: 'Quick Chat',
  description: 'Create instant, private chat rooms',
  category: 'Communication',
  tags: ['chat', 'room', 'messaging', 'realtime'],
  clientSide: false,
  
  // Tool-specific settings
  settings: {
    roomIdLength: 6,
    maxMessageLength: 2000,
    maxRoomDurationHours: 6,
    maxParticipants: 50,
    wsEndpoint: import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws/chat',
    apiEndpoint: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  }
}
