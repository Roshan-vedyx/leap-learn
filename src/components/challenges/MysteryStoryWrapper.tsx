// src/components/challenges/MysteryStoryWrapper.tsx
import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Lightbulb, Sparkles, Target } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface MysteryStoryWrapperProps {
  storyData: {
    theme: string
    title: string
    mysteryText: string
    discoveryPrompt: string
    sequence: (number | string)[]
    contextClues: string[]
  }
  children: React.ReactNode // NumberVisualizer goes here
  onPatternDiscovered?: (pattern: string) => void
}

const MysteryStoryWrapper: React.FC<MysteryStoryWrapperProps> = ({
  storyData,
  children,
  onPatternDiscovered
}) => {
  const [discoveryPhase, setDiscoveryPhase] = useState<'investigating' | 'breakthrough' | 'solved'>('investigating')
  const [cluesRevealed, setCluesRevealed] = useState(0)
  const [explorationTime, setExplorationTime] = useState(0)

  // Track exploration time
  useEffect(() => {
    const timer = setInterval(() => {
      setExplorationTime(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const revealNextClue = () => {
    if (cluesRevealed < storyData.contextClues.length) {
      setCluesRevealed(prev => prev + 1)
    }
  }

  const handleBreakthrough = () => {
    setDiscoveryPhase('breakthrough')
    setTimeout(() => setDiscoveryPhase('solved'), 2000)
    onPatternDiscovered?.('Pattern cracked!')
  }

  const getThemeEmojis = () => {
    const themes = {
      tech: '💻🔐🤖',
      space: '🚀👽🛸',
      mystery: '🕵️🔍🗝️',
      adventure: '🗺️⚡🏴‍☠️'
    }
    return themes[storyData.theme as keyof typeof themes] || '🧩🔮✨'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Mystery Story Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-4xl mb-2">{getThemeEmojis()}</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {storyData.title}
        </h1>
        <div className="text-sm text-gray-600 flex items-center justify-center gap-2">
          <Target className="w-4 h-4" />
          Mission Time: {Math.floor(explorationTime / 60)}:{(explorationTime % 60).toString().padStart(2, '0')}
        </div>
      </motion.div>

      {/* Mystery Narrative */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-400">
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-4">🎭 The Mystery</h2>
            <p className="text-lg text-purple-100 leading-relaxed mb-4">
              {storyData.mysteryText}
            </p>
            
            {/* The Challenge Sequence */}
            <div className="bg-black/30 rounded-lg p-4 mb-4">
              <p className="text-yellow-200 font-medium mb-3">The Pattern Signal:</p>
              <div className="flex items-center justify-center gap-3 text-2xl font-bold">
                {storyData.sequence.map((item, index) => (
                  <motion.span
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.2 }}
                    className={`
                      px-4 py-2 rounded-lg
                      ${typeof item === 'string' 
                        ? 'bg-red-500/30 border-red-400 text-red-200 border-2 border-dashed' 
                        : 'bg-blue-500/30 border-blue-400 text-blue-200 border-2'
                      }
                    `}
                  >
                    {item}
                  </motion.span>
                ))}
              </div>
            </div>

            <div className="text-center">
              <p className="text-purple-200 text-lg font-medium">
                {storyData.discoveryPrompt}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investigation Tools Section */}
      <Card className="bg-white border-4 border-blue-400">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
              🔬 Detective Analysis Tools
            </h3>
            <p className="text-gray-600">
              Use different investigation modes to crack the code
            </p>
          </div>
          
          {/* This is where NumberVisualizer gets embedded */}
          {children}
        </CardContent>
      </Card>

      {/* Context Clues Panel */}
      <Card className="bg-yellow-900/20 border-yellow-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-yellow-400" />
              <div>
                <h4 className="text-white font-medium">Detective Hints</h4>
                <p className="text-yellow-200 text-sm">
                  {cluesRevealed} of {storyData.contextClues.length} clues discovered
                </p>
              </div>
            </div>
            <Button
              onClick={revealNextClue}
              disabled={cluesRevealed >= storyData.contextClues.length}
              className="bg-yellow-600 hover:bg-yellow-500 text-white"
            >
              {cluesRevealed >= storyData.contextClues.length ? 'All Clues Found!' : 'Reveal Clue'}
            </Button>
          </div>

          {/* Revealed Clues */}
          <AnimatePresence>
            {storyData.contextClues.slice(0, cluesRevealed).map((clue, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-yellow-800/30 rounded-lg p-3 mb-2 text-yellow-100"
              >
                💡 <strong>Clue {index + 1}:</strong> {clue}
              </motion.div>
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Discovery Celebration */}
      <AnimatePresence>
        {discoveryPhase === 'breakthrough' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <Card className="bg-gradient-to-r from-green-400 to-blue-500 border-4 border-white">
              <CardContent className="p-8 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Sparkles className="w-16 h-16 text-white mx-auto mb-4" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  🎉 Mystery SOLVED! 🎉
                </h2>
                <p className="text-xl text-white">
                  Outstanding detective work!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Discovery Trigger (for testing) */}
      {discoveryPhase === 'investigating' && (
        <div className="text-center">
          <Button
            onClick={handleBreakthrough}
            className="bg-green-600 hover:bg-green-500 text-white"
          >
            🎯 I Cracked the Pattern!
          </Button>
        </div>
      )}
    </div>
  )
}

export default MysteryStoryWrapper