import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Theme Store - Manages dark/light mode
 */
export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark',
      
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark'
        set({ theme: newTheme })
        
        // Update document class
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
      
      setTheme: (theme) => {
        set({ theme })
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
      
      initTheme: () => {
        const theme = get().theme
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }),
    {
      name: 'sleektools-theme',
    }
  )
)

/**
 * Chat Store - Manages chat room state
 */
export const useChatStore = create((set, get) => ({
  // Room state
  currentRoom: null,
  userName: '',
  messages: [],
  participants: [],
  isConnected: false,
  isConnecting: false,
  error: null,
  
  // WebSocket connection
  ws: null,
  
  // Actions
  setUserName: (name) => set({ userName: name }),
  
  setRoom: (room) => set({ currentRoom: room }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  setMessages: (messages) => set({ messages }),
  
  setParticipants: (participants) => set({ participants }),
  
  setConnectionStatus: (isConnected, isConnecting = false) => 
    set({ isConnected, isConnecting }),
  
  setError: (error) => set({ error }),
  
  setWebSocket: (ws) => set({ ws }),
  
  clearChat: () => set({
    currentRoom: null,
    messages: [],
    participants: [],
    isConnected: false,
    isConnecting: false,
    error: null,
    ws: null,
  }),
  
  disconnect: () => {
    const { ws } = get()
    if (ws) {
      ws.close()
    }
    set({
      isConnected: false,
      isConnecting: false,
      ws: null,
    })
  }
}))

/**
 * UI Store - General UI state
 */
export const useUIStore = create((set) => ({
  // Mobile menu state
  isMobileMenuOpen: false,
  toggleMobileMenu: () => set((state) => ({ 
    isMobileMenuOpen: !state.isMobileMenuOpen 
  })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  
  // Search state
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  // Toast notifications
  toasts: [],
  addToast: (toast) => set((state) => ({
    toasts: [...state.toasts, { id: Date.now(), ...toast }]
  })),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  })),
}))

/**
 * Tool-specific stores can be added here or in individual tool modules
 */

// JSON Formatter Store
export const useJsonStore = create((set) => ({
  input: '',
  output: '',
  error: null,
  indentSize: 2,
  
  setInput: (input) => set({ input }),
  setOutput: (output) => set({ output }),
  setError: (error) => set({ error }),
  setIndentSize: (size) => set({ indentSize: size }),
  
  clear: () => set({ input: '', output: '', error: null }),
}))

// Image Crop Store
export const useImageStore = create((set) => ({
  originalImage: null,
  croppedImage: null,
  cropData: null,
  aspectRatio: NaN, // Free aspect ratio by default
  quality: 0.8,
  
  setOriginalImage: (image) => set({ originalImage: image, croppedImage: null }),
  setCroppedImage: (image) => set({ croppedImage: image }),
  setCropData: (data) => set({ cropData: data }),
  setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
  setQuality: (quality) => set({ quality }),
  
  clear: () => set({ 
    originalImage: null, 
    croppedImage: null, 
    cropData: null,
    aspectRatio: NaN,
  }),
}))
