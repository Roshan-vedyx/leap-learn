// src/components/worksheets/WorksheetPreview.tsx
// HTML preview matching PDF exactly - multi-activity support

import React from 'react'

interface ActivitySection {
  activityId: string
  words: Array<{ word: string; icon?: string }>
  letterRows?: string[][]
  wordPairs?: { left: string[], right: string[] }
  pictureSoundSections?: Array<{
    sound: string
    displaySound: string
    words: Array<{ word: string; icon?: string; startsWithSound: boolean }>
  }>
}

interface WorksheetData {
  mood: string
  phonicsType: string
  constraints: any
  activities: ActivitySection[]  // NEW: Multiple activities
  distractors: Array<{ word: string; icon?: string }>
}

interface PreviewProps {
  data: WorksheetData
}

const MOOD_COLORS = {
  overwhelmed: { 
    accent: '#5BA3BF',
    textGray: '#666666',
    traceGray: '#CCCCCC'
  },
  highEnergy: { 
    accent: '#FF8C42',
    textGray: '#666666',
    traceGray: '#CCCCCC'
  },
  lowEnergy: { 
    accent: '#9B7EBD',
    textGray: '#666666',
    traceGray: '#CCCCCC'
  },
}

export default function WorksheetPreview({ data }: PreviewProps) {
  const colors = MOOD_COLORS[data.mood as keyof typeof MOOD_COLORS]
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div 
        className="relative bg-white shadow-2xl rounded-lg overflow-hidden border border-gray-200"
        style={{
          aspectRatio: '210 / 297', // A4 ratio
        }}
      >
        {/* Render all activities */}
        <div className="w-full h-full overflow-y-auto">
          {data.activities.map((activity, index) => (
            <div key={index}>
              {/* Separator between activities (not before first) */}
              {index > 0 && (
                <div 
                  className="my-6 mx-auto w-4/5"
                  style={{
                    height: '2px',
                    backgroundColor: colors.accent,
                    opacity: 0.4
                  }}
                />
              )}
              
              {/* Render activity template */}
              <ActivityRenderer 
                activity={activity} 
                colors={colors}
                isFirst={index === 0}
              />
            </div>
          ))}
          
          {/* Combined completion message */}
          <div className="text-center mt-8 mb-6">
            <p className="text-sm" style={{ color: colors.textGray }}>
              You did {data.activities.length} activities today. That's the goal.
            </p>
          </div>
        </div>
        
        {/* Colored footer bar */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-4"
          style={{ backgroundColor: colors.accent }}
        />
      </div>
    </div>
  )
}

// ============================================================================
// ACTIVITY RENDERER
// ============================================================================

function ActivityRenderer({ 
  activity, 
  colors,
  isFirst 
}: { 
  activity: ActivitySection
  colors: any
  isFirst: boolean
}) {
  switch (activity.activityId) {
    case 'trace3':
      return <Trace3WordsPreview activity={activity} colors={colors} />
    case 'breatheCircle':
      return <BreatheCirclePreview activity={activity} colors={colors} />
    case 'circleKnown':
      return <CircleKnownPreview activity={activity} colors={colors} />
    case 'soundHunt':
      return <SoundHuntPreview activity={activity} colors={colors} />
    case 'bodyLetter':
      return <BodyLetterPreview activity={activity} colors={colors} />
    case 'pointRest':
      return <PointRestPreview activity={activity} colors={colors} />
    case 'traceOne':
      return <TraceOnePreview activity={activity} colors={colors} />
    case 'bigLetterCircle':
      return <BigLetterCirclePreview activity={activity} colors={colors} />
    case 'connectPairs':
      return <ConnectPairsPreview activity={activity} colors={colors} />
    case 'pictureSound':
      return <PictureSoundPreview activity={activity} colors={colors} />
    default:
      return <Trace3WordsPreview activity={activity} colors={colors} />
  }
}

// ============================================================================
// ICON COMPONENT
// ============================================================================

function WordIcon({ word, icon }: { word: string; icon?: string }) {
  if (!icon) return null
  
  return (
    <img 
      src={icon} 
      alt={word}
      className="inline-block w-8 h-8 ml-2 align-middle"
      onError={(e) => {
        e.currentTarget.style.display = 'none'
      }}
    />
  )
}

// ============================================================================
// ACTIVITY TEMPLATES
// ============================================================================

function Trace3WordsPreview({ activity, colors }: { activity: ActivitySection; colors: any }) {
  return (
    <div className="w-full h-auto flex flex-col" style={{ padding: '6% 10%' }}>
      <div className="text-center mb-2">
        <h1 className="font-normal text-3xl">Trace 3 Words</h1>
        <h2 className="font-normal text-lg text-gray-700 mt-1">Today</h2>
      </div>
      
      <div 
        className="w-4/5 mx-auto mb-3"
        style={{ height: '2px', backgroundColor: colors.accent }}
      />
      
      <p className="text-center text-sm mb-4">
        Trace these 3 words. Take your time.
      </p>
      
      <div className="space-y-8">
        {activity.words.slice(0, 3).map((word, idx) => (
          <div key={idx} className="text-center">
            <p 
              className="text-5xl font-normal tracking-wide"
              style={{ color: colors.traceGray }}
            >
              {word.word}
            </p>
            <div 
              className="w-2/3 mx-auto mt-2"
              style={{ 
                borderBottom: `1px solid ${colors.traceGray}`,
                opacity: 0.5 
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function BreatheCirclePreview({ activity, colors }: { activity: ActivitySection; colors: any }) {
  return (
    <div className="w-full h-auto flex flex-col" style={{ padding: '6% 10%' }}>
      <div className="text-center mb-2">
        <h1 className="font-normal text-3xl">Breathe & Circle</h1>
        <h2 className="font-normal text-lg text-gray-700 mt-1">Today</h2>
      </div>
      
      <div 
        className="w-4/5 mx-auto mb-3"
        style={{ height: '2px', backgroundColor: colors.accent }}
      />
      
      <p className="text-center text-sm mb-2">
        Take a slow breath. Then circle the letter: {activity.words[0]?.word[0].toUpperCase() || 'H'}
      </p>
      
      <div className="text-center mb-4" style={{ color: colors.textGray }}>
        <p className="text-xs">
          Breathing Guide: In: 1-2-3  *  Out: 1-2-3  Now circle!
        </p>
      </div>
      
      {activity.letterRows && activity.letterRows.length > 0 && (
        <div className="text-center">
            <div className="flex justify-center items-center gap-4">
            {activity.letterRows[0].map((letter, idx) => {
                const isTarget = letter === activity.words[0]?.word[0].toUpperCase()
                return (
                <span 
                    key={idx} 
                    className={isTarget ? 'text-4xl font-bold' : 'text-2xl font-normal'}
                >
                    {letter}
                </span>
                )
            })}
            </div>
        </div>
      )}
    </div>
  )
}

function CircleKnownPreview({ activity, colors }: { activity: ActivitySection; colors: any }) {
  return (
    <div className="w-full h-auto flex flex-col" style={{ padding: '6% 10%' }}>
      <div className="text-center mb-2">
        <h1 className="font-normal text-3xl">Circle Any Word You Know</h1>
        <h2 className="font-normal text-lg text-gray-700 mt-1">Today</h2>
      </div>
      
      <div 
        className="w-4/5 mx-auto mb-3"
        style={{ height: '2px', backgroundColor: colors.accent }}
      />
      
      <p className="text-center text-sm mb-4">
        Read what you can. Even one counts.
      </p>
      
      <div className="grid grid-cols-3 gap-6 text-center">
        {activity.words.slice(0, 6).map((word, idx) => (
          <div key={idx} className="text-2xl font-normal">
            {word.word}
            <WordIcon word={word.word} icon={word.icon} />
          </div>
        ))}
      </div>
    </div>
  )
}

function SoundHuntPreview({ activity, colors }: { activity: ActivitySection; colors: any }) {
  return (
    <div className="w-full h-auto flex flex-col" style={{ padding: '6% 10%' }}>
      <div className="text-center mb-2">
        <h1 className="font-normal text-3xl">Sound Hunt</h1>
        <h2 className="font-normal text-lg text-gray-700 mt-1">Today</h2>
      </div>
      
      <div 
        className="w-4/5 mx-auto mb-3"
        style={{ height: '2px', backgroundColor: colors.accent }}
      />
      
      <p className="text-center text-sm mb-4">
        Circle letters you hear in these words.
      </p>
      
      <div className="grid grid-cols-2 gap-6">
        {activity.words.slice(0, 6).map((word, idx) => (
          <div key={idx} className="text-3xl font-normal text-center">
            {word.word}
            <WordIcon word={word.word} icon={word.icon} />
          </div>
        ))}
      </div>
    </div>
  )
}

function BodyLetterPreview({ activity, colors }: { activity: ActivitySection; colors: any }) {
  return (
    <div className="w-full h-auto flex flex-col" style={{ padding: '6% 10%' }}>
      <div className="text-center mb-2">
        <h1 className="font-normal text-3xl">Body Letters</h1>
        <h2 className="font-normal text-lg text-gray-700 mt-1">Today</h2>
      </div>
      
      <div 
        className="w-4/5 mx-auto mb-3"
        style={{ height: '2px', backgroundColor: colors.accent }}
      />
      
      <p className="text-center text-sm mb-4">
        Make letters with arms & legs - no writing!
      </p>
      
      <div className="space-y-6 text-center">
        {activity.words.slice(0, 3).map((word, idx) => (
          <div key={idx} className="text-5xl font-normal">
            {word.word}
            <WordIcon word={word.word} icon={word.icon} />
          </div>
        ))}
      </div>
    </div>
  )
}

function PointRestPreview({ activity, colors }: { activity: ActivitySection; colors: any }) {
  return (
    <div className="w-full h-auto flex flex-col" style={{ padding: '6% 10%' }}>
      <div className="text-center mb-2">
        <h1 className="font-normal text-3xl">Point & Rest</h1>
        <h2 className="font-normal text-lg text-gray-700 mt-1">Today</h2>
      </div>
      
      <div 
        className="w-4/5 mx-auto mb-3"
        style={{ height: '2px', backgroundColor: colors.accent }}
      />
      
      <p className="text-center text-sm mb-4">
        Just point. No writing needed.
      </p>
      
      <div className="space-y-4 text-center">
        {activity.words.slice(0, 5).map((word, idx) => (
          <div key={idx} className="text-4xl font-normal">
            {word.word}
            <WordIcon word={word.word} icon={word.icon} />
          </div>
        ))}
      </div>
    </div>
  )
}

function TraceOnePreview({ activity, colors }: { activity: ActivitySection; colors: any }) {
  const sentence = `I read ${activity.words[0]?.word || 'word'}`
  
  return (
    <div className="w-full h-auto flex flex-col" style={{ padding: '6% 10%' }}>
      <div className="text-center mb-2">
        <h1 className="font-normal text-3xl">Trace Just One</h1>
        <h2 className="font-normal text-lg text-gray-700 mt-1">Today</h2>
      </div>
      
      <div 
        className="w-4/5 mx-auto mb-3"
        style={{ height: '2px', backgroundColor: colors.accent }}
      />
      
      <p className="text-center text-sm mb-6">
        Trace this sentence one time. Take your time.
      </p>
      
      <div className="text-center">
        <p 
          className="text-4xl font-normal tracking-wide"
          style={{ color: colors.traceGray }}
        >
          {sentence}
        </p>
        <div 
          className="w-3/4 mx-auto mt-2"
          style={{ 
            borderBottom: `1px solid ${colors.traceGray}`,
            opacity: 0.5 
          }}
        />
      </div>
    </div>
  )
}

function BigLetterCirclePreview({ activity, colors }: { activity: ActivitySection; colors: any }) {
  return (
    <div className="w-full h-auto flex flex-col" style={{ padding: '6% 10%' }}>
      <div className="text-center mb-2">
        <h1 className="font-normal text-3xl">Big Letter Circle</h1>
        <h2 className="font-normal text-lg text-gray-700 mt-1">Today</h2>
      </div>
      
      <div 
        className="w-4/5 mx-auto mb-3"
        style={{ height: '2px', backgroundColor: colors.accent }}
      />
      
      <p className="text-center text-sm mb-4">
        Find 4 letters. Easy and calm.
      </p>
      
      {activity.letterRows && activity.letterRows.length > 0 && (
        <div className="space-y-5 text-center">
          {activity.letterRows.map((row, idx) => (
            <div key={idx} className="text-4xl tracking-widest font-normal">
              {row.join('   ')}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ConnectPairsPreview({ activity, colors }: { activity: ActivitySection; colors: any }) {
  return (
    <div className="w-full h-auto flex flex-col" style={{ padding: '6% 10%' }}>
      <div className="text-center mb-2">
        <h1 className="font-normal text-3xl">Connect the Pairs</h1>
        <h2 className="font-normal text-lg text-gray-700 mt-1">Today</h2>
      </div>
      
      <div 
        className="w-4/5 mx-auto mb-3"
        style={{ height: '2px', backgroundColor: colors.accent }}
      />
      
      <p className="text-center text-sm mb-4">
        Draw a line to connect words that are exactly the same.
      </p>
      
      {activity.wordPairs && (
        <div className="space-y-4">
          {activity.wordPairs.left.slice(0, 5).map((leftWord, idx) => (
            <div key={idx} className="flex justify-between items-center px-8">
              <div className="text-3xl font-normal">{leftWord}</div>
              <div className="text-3xl font-normal">{activity.wordPairs!.right[idx]}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PictureSoundPreview({ activity, colors }: { activity: ActivitySection; colors: any }) {
  return (
    <div className="w-full h-auto flex flex-col" style={{ padding: '6% 10%' }}>
      <div className="text-center mb-2">
        <h1 className="font-normal text-3xl">Picture & Sound Match</h1>
        <h2 className="font-normal text-lg text-gray-700 mt-1">Today</h2>
      </div>
      
      <div 
        className="w-4/5 mx-auto mb-3"
        style={{ height: '2px', backgroundColor: colors.accent }}
      />
      
      <p className="text-center text-sm mb-4">
        Look and circle Yes or No.
      </p>
      
      {activity.pictureSoundSections && activity.pictureSoundSections.map((section, sectionIdx) => (
        <div key={sectionIdx} className="mb-6">
          <p className="text-center font-semibold text-lg mb-3">
            Does it start with {section.displaySound}?
          </p>
          
          <div className="space-y-3">
            {section.words.map((item, wordIdx) => (
              <div className="flex justify-between items-center px-8">
                <div className="flex items-center gap-2">
                    <WordIcon word={item.word} icon={item.icon} />
                    <span className="text-2xl font-normal">{item.word}</span>
                </div>
                <div className="text-base">Yes   No</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}