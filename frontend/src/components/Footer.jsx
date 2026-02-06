import { Shield, Zap, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-surface-700/40">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Features */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-surface-500">
            <span className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-teal-500/70" />
              No login
            </span>
            <span className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500/70" />
              No tracking
            </span>
            <span className="flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-crimson-400/70" />
              Open source
            </span>
          </div>

          {/* Copyright */}
          <p className="text-sm text-surface-600">
            © {new Date().getFullYear()} SleekTools
          </p>
        </div>
      </div>
    </footer>
  )
}
