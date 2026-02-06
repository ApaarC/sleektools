import { useEffect, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useThemeStore } from '@/store'
import { ToolLayout, LoadingSpinner } from '@/components'
import toolRegistry from './tool-registry'
import { HomePage, NotFoundPage } from './pages'
import ChatRoom from './tools/chat/ChatRoom'
import CanvasRoom from './tools/canvas/CanvasRoom'

function App() {
  const { initTheme } = useThemeStore()

  // Initialize theme on mount
  useEffect(() => {
    initTheme()
  }, [initTheme])

  return (
    <ToolLayout>
      <AnimatePresence mode="wait">
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
              <LoadingSpinner size="lg" />
            </div>
          }
        >
          <Routes>
            {/* Home Page */}
            <Route path="/" element={<HomePage />} />
            
            {/* Dynamic tool routes from registry */}
            {toolRegistry.map((tool) => (
              <Route
                key={tool.id}
                path={tool.path}
                element={<tool.component />}
              />
            ))}
            
            {/* Chat room route with room ID */}
            <Route path="/r/:roomId" element={<ChatRoom />} />
            
            {/* Canvas room route with token */}
            <Route path="/c/:token" element={<CanvasRoom />} />
            
            {/* 404 fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </ToolLayout>
  )
}

export default App
