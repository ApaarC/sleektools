import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Zap, Shield, Lock } from 'lucide-react'
import { ToolCard } from '@/components'
import { getAllTools, getAllCategories, getActiveTools } from '@/tool-registry'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  
  const allTools = getAllTools()
  const categories = ['All', ...getAllCategories()]
  const activeCount = getActiveTools().length

  // Filter tools
  const filteredTools = useMemo(() => {
    return allTools.filter(tool => {
      const matchesSearch = searchQuery === '' || 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = selectedCategory === 'All' || 
        tool.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [allTools, searchQuery, selectedCategory])

  return (
    <div className="page-content">
      {/* Hero Section - Left aligned with balanced layout */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="pt-8 pb-12 md:pt-12 md:pb-16"
      >
        <div className="max-w-3xl">
          {/* Status pill */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 mb-6
                       bg-surface-800/80 border border-surface-700/50 
                       rounded-full text-surface-300 text-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span>{activeCount} tools ready</span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-5"
          >
            <span className="text-surface-50">Instant tools for</span>
            <br />
            <span className="gradient-text">everyday tasks</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-surface-400 text-lg md:text-xl max-w-xl mb-8 leading-relaxed"
          >
            Fast, private utilities that work instantly in your browser. 
            No accounts, no tracking, no complexity.
          </motion.p>

          {/* Feature indicators */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-wrap items-center gap-6 text-sm text-surface-400"
          >
            <FeatureItem icon={Zap} text="Instant results" />
            <FeatureItem icon={Shield} text="Privacy first" />
            <FeatureItem icon={Lock} text="No account needed" />
          </motion.div>
        </div>
      </motion.section>

      {/* Search and Filter */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search */}
          <div className="w-full lg:w-80">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-11"
              />
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl text-sm font-medium 
                          transition-all duration-150
                  ${selectedCategory === category
                    ? 'bg-surface-50 text-surface-900'
                    : 'bg-surface-800 text-surface-400 hover:text-surface-200 hover:bg-surface-750'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Tools Grid */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool, index) => (
              <ToolCard key={tool.id} tool={tool} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="mt-16"
      >
        <div className="card p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem value={activeCount} label="Active Tools" />
            <StatItem value="100%" label="Client-Side" />
            <StatItem value="0" label="Data Stored" />
            <StatItem value="∞" label="Free Forever" />
          </div>
        </div>
      </motion.section>
    </div>
  )
}

function FeatureItem({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-surface-500" />
      <span>{text}</span>
    </div>
  )
}

function StatItem({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-semibold text-surface-50 mb-1">
        {value}
      </div>
      <div className="text-surface-500 text-sm">{label}</div>
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-20"
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-800 
                    flex items-center justify-center">
        <Search className="w-7 h-7 text-surface-500" />
      </div>
      <h3 className="text-lg font-medium text-surface-200 mb-2">
        No tools found
      </h3>
      <p className="text-surface-500 text-sm">
        Try a different search term or category
      </p>
    </motion.div>
  )
}
