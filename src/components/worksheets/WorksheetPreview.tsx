// src/components/worksheets/WorksheetPreview.tsx
// HTML preview matching PDF exactly - white backgrounds with colored accents

import React from 'react'

interface WorksheetData {
  mood: string
  phonicsType: string
  activityType: string
  constraints: any
  words: Array<{ word: string; icon?: string }>
  distractors: Array<{ word: string; icon?: string }>
  familyRows?: string[][]
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
  
  const renderTemplate = () => {
    switch (data.activityType) {
      case 'trace3':
        return <Trace3WordsPreview data={data} colors={colors} />
      case 'breatheCircle':
        return <BreatheCirclePreview data={data} colors={colors} />
      case 'circleKnown':  
        return <CircleKnownPreview data={data} colors={colors} />
      case 'soundHunt':
        return <SoundHuntPreview data={data} colors={colors} />
      case 'bodyLetter':
        return <BodyLetterPreview data={data} colors={colors} />
      case 'pointRest':
        return <PointRestPreview data={data} colors={colors} />
      case 'traceOne':
        return <TraceOnePreview data={data} colors={colors} />
      case 'bigLetterCircle':  
        return <BigLetterCirclePreview data={data} colors={colors} />
      default:
        return <Trace3WordsPreview data={data} colors={colors} />
    }
  }
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div 
        className="relative bg-white shadow-2xl rounded-lg overflow-hidden border border-gray-200"
        style={{
          aspectRatio: '210 / 297', // A4 ratio
        }}
      >
        {renderTemplate()}
        
        {/* Colored footer bar - like Canva PDF */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-4"
          style={{ backgroundColor: colors.accent }}
        />
      </div>
    </div>
  )
}

// ============================================================================
// ICON COMPONENT
// ============================================================================

function WordIcon({ word, icon }: { word: string; icon?: string }) {
  // If icon path exists, show as img, otherwise show placeholder
  if (icon) {
    return (
      <img 
        src={icon} 
        alt={word}
        className="w-12 h-12 object-contain"
        onError={(e) => {
          // Fallback if SVG doesn't exist
          e.currentTarget.style.display = 'none'
        }}
      />
    )
  }
  
  // Placeholder circle with first letter
  return (
    <div className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center">
      <span className="text-xl font-bold text-gray-500">
        {word[0].toUpperCase()}
      </span>
    </div>
  )
}

// ============================================================================
// TEMPLATE: TRACE 3 WORDS
// ============================================================================

function Trace3WordsPreview({ data, colors }: { data: WorksheetData; colors: any }) {
  const words = data.words.slice(0, 3)
  
  return (
    <div className="w-full h-full flex flex-col" style={{ padding: '8% 10%' }}>
      {/* Title */}
      <div className="text-center mb-2">
        <h1 className="font-normal text-4xl">Just 3 Words</h1>
        <h2 className="font-normal text-xl text-gray-700 mt-1">Today</h2>
      </div>
      
      {/* Colored accent line */}
      <div 
        className="w-4/5 mx-auto mb-6"
        style={{ height: '2px', backgroundColor: colors.accent }}
      />
      
      {/* Instructions */}
      <p className="text-center mb-8 text-base">Trace these 3 words.</p>
      
      {/* Words with icons */}
      <div className="flex-1 flex flex-col justify-center space-y-8">
        {words.map((wordObj, i) => (
          <div key={i} className="flex items-center justify-center gap-8">
            {/* Icon */}
            <WordIcon word={wordObj.word} icon={wordObj.icon} />
            
            {/* Word for tracing */}
            <div className="flex flex-col items-center">
              <span 
                className="text-5xl font-normal tracking-wide"
                style={{ color: colors.traceGray }}
              >
                {wordObj.word}
              </span>
              <div 
                className="w-48 mt-1"
                style={{
                  borderBottom: `2px dotted ${colors.traceGray}`,
                  opacity: 0.6
                }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Completion message */}
      <p 
        className="text-center mt-8 text-sm"
        style={{ color: colors.textGray }}
      >
        You traced 3 words today. That's the goal.
      </p>
    </div>
  )
}

// ============================================================================
// TEMPLATE: BREATHE & CIRCLE
// ============================================================================

function BreatheCirclePreview({ data, colors }: { data: WorksheetData; colors: any }) {
    return (
      <div className="w-full h-full flex flex-col" style={{ padding: '8% 10%' }}>
        {/* Title */}
        <div className="text-center mb-2">
          <h1 className="font-normal text-4xl">Breathe & Circle</h1>
          <h2 className="font-normal text-xl text-gray-700 mt-1">Today</h2>
        </div>
        
        <div 
          className="w-4/5 mx-auto mb-4"
          style={{ height: '2px', backgroundColor: colors.accent }}
        />
        
        {/* Instructions */}
        <p className="text-center text-base mb-3">
          Take a slow breath. Then circle the letter.
        </p>
        
        {/* Breathing guide */}
        <div className="text-center mb-6" style={{ color: colors.textGray }}>
          <p className="text-sm">
            Breathing Guide: In: 1-2-3  *  Out: 1-2-3  Now circle!
          </p>
        </div>
        
        {/* Letter finding rows */}
        <div className="flex-1 space-y-6">
          {data.letterRows && data.letterRows.map((row, index) => {
            const targetLetter = row[0]
            const letterArray = row.slice(1)
            
            return (
              <div key={index} className="text-center">
                <p className="text-base font-semibold mb-2">
                  Find the letter {targetLetter}:
                </p>
                <p className="text-2xl tracking-widest font-normal">
                  {letterArray.join('   ')}
                </p>
              </div>
            )
          })}
        </div>
        
        {/* Completion message */}
        <p 
          className="text-center mt-6 text-sm"
          style={{ color: colors.textGray }}
        >
          Good breathing = good learning 💙
        </p>
      </div>
    )
}

// ============================================================================
// TEMPLATE: SOUND HUNT
// ============================================================================

function SoundHuntPreview({ data, colors }: { data: WorksheetData; colors: any }) {
  const words = data.words.slice(0, 9)
  
  return (
    <div className="w-full h-full flex flex-col" style={{ padding: '8% 10%' }}>
      <div className="text-center mb-2">
        <h1 className="font-normal text-3xl">Sound Hunt Around You</h1>
      </div>
      
      <div 
        className="w-4/5 mx-auto mb-4"
        style={{ height: '2px', backgroundColor: colors.accent }}
      />
      
      <div className="text-center mb-6">
        <p className="text-sm">Find things that start with these sounds.</p>
        <p className="text-sm">Draw or write what you find.</p>
      </div>
      
      {/* Grid of sound boxes */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {words.map((wordObj, i) => (
          <div 
            key={i}
            className="border-2 border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center aspect-square"
          >
            <WordIcon word={wordObj.word} icon={wordObj.icon} />
            <span className="text-lg font-bold mt-2">
              {wordObj.word[0].toUpperCase()}
            </span>
          </div>
        ))}
      </div>
      
      <p 
        className="text-center mt-auto text-sm"
        style={{ color: colors.textGray }}
      >
        You moved through {words.length} words. Great energy!
      </p>
    </div>
  )
}

// ============================================================================
// TEMPLATE: BODY LETTER
// ============================================================================

function BodyLetterPreview({ data, colors }: { data: WorksheetData; colors: any }) {
  const words = data.words.slice(0, 6)
  
  return (
    <div className="w-full h-full flex flex-col" style={{ padding: '8% 10%' }}>
      <div className="text-center mb-2">
        <h1 className="font-normal text-3xl">Body Letter Fun</h1>
      </div>
      
      <div 
        className="w-4/5 mx-auto mb-4"
        style={{ height: '2px', backgroundColor: colors.accent }}
      />
      
      <div className="text-center mb-6">
        <p className="text-sm">Make these letters with your body!</p>
        <p className="text-sm">Stand up, move around, have fun!</p>
      </div>
      
      <div className="flex-1 space-y-6">
        {words.map((wordObj, i) => (
          <div key={i} className="text-center">
            <span className="text-5xl font-bold">
              {wordObj.word[0].toUpperCase()}
            </span>
            <p className="text-sm mt-1" style={{ color: colors.textGray }}>
              ({wordObj.word})
            </p>
          </div>
        ))}
      </div>
      
      <p 
        className="text-center text-sm"
        style={{ color: colors.textGray }}
      >
        You moved! That helps your brain learn.
      </p>
    </div>
  )
}

// ============================================================================
// TEMPLATE: POINT & REST
// ============================================================================

function PointRestPreview({ data, colors }: { data: WorksheetData; colors: any }) {
  const words = data.words.slice(0, 5)
  
  return (
    <div className="w-full h-full flex flex-col" style={{ padding: '8% 10%' }}>
      <div className="text-center mb-2">
        <h1 className="font-normal text-4xl">Point & Rest</h1>
        <h2 className="font-normal text-xl text-gray-700 mt-1">Today</h2>
      </div>
      
      <div 
        className="w-4/5 mx-auto mb-6"
        style={{ height: '2px', backgroundColor: colors.accent }}
      />
      
      <p className="text-center mb-8 text-base">
        Just point to the words. No writing needed.
      </p>
      
      <div className="flex-1 flex flex-col justify-center space-y-6">
        {words.map((wordObj, i) => (
          <div key={i} className="flex items-center justify-center gap-8">
            <WordIcon word={wordObj.word} icon={wordObj.icon} />
            <span className="text-4xl font-normal">{wordObj.word}</span>
          </div>
        ))}
      </div>
      
      <p 
        className="text-center mt-8 text-sm"
        style={{ color: colors.textGray }}
      >
        Slow and steady. You pointed to some words.
      </p>
    </div>
  )
}

// ============================================================================
// TEMPLATE: TRACE ONE
// ============================================================================

function TraceOnePreview({ data, colors }: { data: WorksheetData; colors: any }) {
  const word = data.words[0].word
  const sentence = `I can ${word}.`
  
  return (
    <div className="w-full h-full flex flex-col" style={{ padding: '8% 10%' }}>
      <div className="text-center mb-2">
        <h1 className="font-normal text-4xl">Trace One Sentence</h1>
        <h2 className="font-normal text-xl text-gray-700 mt-1">Today</h2>
      </div>
      
      <div 
        className="w-4/5 mx-auto mb-6"
        style={{ height: '2px', backgroundColor: colors.accent }}
      />
      
      <p className="text-center mb-12 text-base">
        Trace this sentence one time. Take your time.
      </p>
      
      <div className="flex-1 flex flex-col justify-center items-center">
        <WordIcon word={word} icon={data.words[0].icon} />
        
        <div className="mt-8 flex flex-col items-center">
          <span 
            className="text-4xl font-normal tracking-wide"
            style={{ color: colors.traceGray }}
          >
            {sentence}
          </span>
          <div 
            className="w-96 mt-2"
            style={{
              borderBottom: `2px dotted ${colors.traceGray}`,
              opacity: 0.6
            }}
          />
        </div>
      </div>
      
      <p 
        className="text-center mt-8 text-sm"
        style={{ color: colors.textGray }}
      >
        One sentence traced. You did it.
      </p>
    </div>
  )
}

interface CircleKnownPreviewProps {
    data: WorksheetData
    colors: any
  }
  
  function CircleKnownPreview({ data, colors }: CircleKnownPreviewProps) {
    const words = data.words.slice(0, 15) // 5 rows × 3 words
    
    return (
      <div className="relative p-8 bg-white h-full flex flex-col">
        {/* Title */}
        <div className="text-center mb-2">
          <h1 className="text-4xl font-normal text-black">
            Circle the Word You Know
          </h1>
        </div>
        
        {/* Subtitle */}
        <div className="text-center mb-3">
          <p className="text-lg font-normal text-black">Today</p>
        </div>
        
        {/* Decorative line */}
        <div 
          className="h-0.5 mx-auto mb-6 w-full max-w-2xl"
          style={{ backgroundColor: colors.accent }}
        />
        
        {/* Instructions */}
        <div className="text-center mb-8">
          <p className="text-base text-black leading-relaxed">
            Look at each line. Circle any word you can read. Even one is<br />
            great.
          </p>
        </div>
        
        {/* Word rows - 5 rows × 3 words */}
        <div className="flex-1 flex flex-col justify-center space-y-6">
          {[0, 1, 2, 3, 4].map((rowIndex) => {
            const rowWords = words.slice(rowIndex * 3, rowIndex * 3 + 3)
            
            return (
              <div 
                key={rowIndex}
                className="flex justify-around items-center"
              >
                {rowWords.map((wordObj, idx) => (
                  <div key={idx} className="flex-1 text-center">
                    <span className="text-5xl font-normal text-black">
                      {wordObj.word}
                    </span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
        
        {/* Completion message */}
        <div className="text-center mt-8 mb-4">
          <p 
            className="text-sm"
            style={{ color: colors.textGray }}
          >
            You read some words today. Good.
          </p>
        </div>
      </div>
    )
}

interface BigLetterCirclePreviewProps {
    data: WorksheetData
    colors: any
  }
  
  function BigLetterCirclePreview({ data, colors }: BigLetterCirclePreviewProps) {
    const letterRows = data.letterRows || []
    
    return (
      <div className="relative p-8 bg-white h-full flex flex-col">
        {/* Title */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-normal text-black">
            Big Letter Circle
          </h1>
        </div>
        
        {/* Decorative line */}
        <div 
          className="h-0.5 mx-auto mb-6 w-full max-w-2xl"
          style={{ backgroundColor: colors.accent }}
        />
        
        {/* Instructions */}
        <div className="text-center mb-10">
          <p className="text-base text-black">
            Circle the letter shown. Take your time.
          </p>
        </div>
        
        {/* Letter finding tasks - 4 rows */}
        <div className="flex-1 flex flex-col justify-center space-y-10">
          {letterRows.slice(0, 4).map((row, rowIndex) => {
            const targetLetter = row[0]
            const shuffledLetters = row.slice(1)
            
            return (
              <div key={rowIndex} className="space-y-2">
                {/* Instruction line */}
                <p 
                  className="text-xl font-normal mb-3"
                  style={{ color: colors.accent }}
                >
                  Circle the {targetLetter}:
                </p>
                
                {/* 4 letters with huge spacing */}
                <div className="flex items-center gap-8 ml-4">
                  {shuffledLetters.slice(0, 4).map((letter, idx) => (
                    <span 
                      key={idx}
                      className="text-6xl font-normal text-black"
                    >
                      {letter}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Completion message */}
        <div className="text-center mt-8 mb-4">
          <p 
            className="text-sm"
            style={{ color: colors.textGray }}
          >
            4 letters found. That's all we needed.
          </p>
        </div>
      </div>
    )
}