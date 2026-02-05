import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Sparkles, Zap, Shield, Lock } from 'lucide-react'
import { ToolCard, Input } from '@/components'
import { getAllTools, getAllCategories, getActiveTools } from '@/tool-registry'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  
  const allTools = getAllTools()
  const categories = ['All', ...getAllCategories()]
  const activeCount = getActiveTools().length

  // Filter tools based on search and category
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
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12 pt-8"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-6 
                     bg-primary-500/10 border border-primary-500/20 
                     rounded-full text-primary-400 text-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span>{activeCount} tools available • More coming soon</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold mb-4"
        >
          <span className="gradient-text">Instant Micro-Tools</span>
          <br />
          <span className="text-dark-100">for Quick Tasks</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-dark-400 text-lg md:text-xl max-w-2xl mx-auto mb-8"
        >
          Fast, private, and beautiful tools that work instantly in your browser.
          No sign-ups, no tracking, no hassle.
        </motion.p>

        {/* Feature badges */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-10"
        >
          <FeatureBadge icon={Zap} text="Instant Results" color="yellow" />
          <FeatureBadge icon={Shield} text="Privacy First" color="green" />
          <FeatureBadge icon={Lock} text="No Account Needed" color="purple" />
        </motion.div>
      </motion.section>

      {/* Search and Filter */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search Input */}
          <div className="w-full md:w-96">
            <Input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${selectedCategory === category
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                    : 'bg-dark-800 text-dark-400 hover:bg-dark-700 hover:text-dark-200'
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
        transition={{ delay: 0.6 }}
      >
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredTools.map((tool, index) => (
              <ToolCard key={tool.id} tool={tool} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-dark-300 mb-2">
              No tools found
            </h3>
            <p className="text-dark-500">
              Try a different search term or category
            </p>
          </motion.div>
        )}
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-16 glass-card p-8"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <StatItem value={activeCount} label="Active Tools" />
          <StatItem value="100%" label="Client-Side" />
          <StatItem value="0" label="Data Stored" />
          <StatItem value="∞" label="Free Forever" />
        </div>
      </motion.section>
    </div>
  )
}

function FeatureBadge({ icon: Icon, text, color }) {
  const colors = {
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  }

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${colors[color]}`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  )
}

function StatItem({ value, label }) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">
        {value}
      </div>
      <div className="text-dark-500 text-sm">{label}</div>
    </div>
  )
}
