import { useEffect, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useThemeStore } from '@/store'
import { ToolLayout, LoadingSpinner } from '@/components'
import toolRegistry from './tool-registry'
import HomePage from './pages/HomePage'
import ChatRoom from './tools/chat/ChatRoom'

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
            
            {/* 404 fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </ToolLayout>
  )
}

function NotFound() {
  return (
    <div className="page-content flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
      <p className="text-dark-400 text-lg mb-8">
        This tool doesn't exist yet... but maybe it should!
      </p>
      <a href="/" className="btn-primary">
        Back to Home
      </a>
    </div>
  )
}

export default App
