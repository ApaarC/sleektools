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
      <nav className="sticky top-0 z-50 glass border-b border-dark-700/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-2 group"
              onClick={closeMobileMenu}
            >
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 
                         flex items-center justify-center shadow-glow"
              >
                <Zap className="w-5 h-5 text-white" />
              </motion.div>
              <span className="font-bold text-lg gradient-text">
                SleekTools
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {!isHome && (
                <Link 
                  to="/"
                  className="btn-ghost"
                >
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
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
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
              className="md:hidden btn-ghost p-2"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
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
            className="md:hidden glass border-b border-dark-700/50 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
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
