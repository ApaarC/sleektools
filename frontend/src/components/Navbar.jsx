import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Github,
  Zap
} from 'lucide-react'
import { useThemeStore, useUIStore } from '@/store'

export default function Navbar() {
  const { theme, toggleTheme } = useThemeStore()
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore()
  const location = useLocation()
  
  const isHome = location.pathname === '/'

  return (
    <>
      <nav className="sticky top-0 z-50 bg-surface-900/80 backdrop-blur-xl border-b border-surface-700/40">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-3 group"
              onClick={closeMobileMenu}
            >
              <div className="w-8 h-8 rounded-lg bg-surface-50 
                            flex items-center justify-center
                            group-hover:shadow-glow-sm transition-shadow duration-200">
                <Zap className="w-4 h-4 text-surface-900" />
              </div>
              <span className="font-semibold text-surface-50 tracking-tight">
                SleekTools
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {!isHome && (
                <Link to="/" className="btn-ghost">
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
              )}
              
              <a 
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
              
              <button
                onClick={toggleTheme}
                className="btn-ghost"
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait">
                  {theme === 'dark' ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Sun className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Moon className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-xl text-surface-400 
                       hover:text-surface-100 hover:bg-surface-800
                       transition-colors duration-150"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-surface-850 border-b border-surface-700/40 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
              {!isHome && (
                <Link 
                  to="/"
                  className="btn-ghost justify-start"
                  onClick={closeMobileMenu}
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
              )}
              
              <a 
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost justify-start"
                onClick={closeMobileMenu}
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
              
              <button
                onClick={() => {
                  toggleTheme()
                  closeMobileMenu()
                }}
                className="btn-ghost justify-start"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
