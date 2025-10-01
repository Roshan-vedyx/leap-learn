// src/components/worksheets/WorksheetPreview.tsx
// HTML preview that EXACTLY matches the PDF output

import React from 'react'

interface WorksheetData {
  mood: string
  phonicsType: string
  activityType: string
  constraints: any
  words: Array<{ word: string }>
  distractors: Array<{ word: string }>
}

interface PreviewProps {
  data: WorksheetData
}

const MOOD_COLORS = {
  overwhelmed: { 
    bg: '#E8F4F8', 
    accent: '#5BA3BF',
    textGray: '#666666',
    traceGray: '#CCCCCC'
  },
  highEnergy: { 
    bg: '#FFF4E6', 
    accent: '#FF8C42',
    textGray: '#666666',
    traceGray: '#CCCCCC'
  },
  lowEnergy: { 
    bg: '#F3F0FF', 
    accent: '#9B7EBD',
    textGray: '#666666',
    traceGray: '#CCCCCC'
  },
}

export default function WorksheetPreview({ data }: PreviewProps) {
  const colors = MOOD_COLORS[data.mood as keyof typeof MOOD_COLORS]
  
  // Route to appropriate template
  const renderTemplate = () => {
    switch (data.activityType) {
      case 'trace3':
        return <Trace3WordsPreview data={data} colors={colors} />
      case 'breatheCircle':
        return <BreatheCirclePreview data={data} colors={colors} />
      case 'soundHunt':
        return <SoundHuntPreview data={data} colors={colors} />
      case 'bodyLetter':
        return <BodyLetterPreview data={data} colors={colors} />
      case 'pointRest':
        return <PointRestPreview data={data} colors={colors} />
      case 'traceOne':
        return <TraceOnePreview data={data} colors={colors} />
      default:
        return <Trace3WordsPreview data={data} colors={colors} />
    }
  }
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div 
        className="relative bg-white shadow-2xl rounded-lg overflow-hidden"
        style={{
          aspectRatio: '210 / 297', // A4 ratio
          backgroundColor: colors.bg,
        }}
      >
        {renderTemplate()}
      </div>
    </div>
  )
}

// ============================================================================
// Template Components - Each matches PDF exactly
// ============================================================================

function Trace3WordsPreview({ data, colors }: { data: WorksheetData; colors: any }) {
  const words = data.words.slice(0, 3)
  
  return (
    <div 
      className="w-full h-full flex flex-col"
      style={{ backgroundColor: colors.bg, padding: '8% 10%' }}
    >
      {/* Title */}
      <div className="text-center mb-2">
        <h1 
          className="font-normal"
          style={{ 
            fontSize: 'clamp(24px, 5vw, 36px)',
            lineHeight: '1.2',
            marginBottom: '0.3em'
          }}
        >
          Just 3 Words
        </h1>
        <h2 
          className="font-normal"
          style={{ 
            fontSize: 'clamp(14px, 3vw, 20px)',
            color: '#333'
          }}
        >
          Today
        </h2>
      </div>
      
      {/* Decorative line */}
      <div 
        className="w-4/5 mx-auto mb-6"
        style={{
          height: '1.5px',
          backgroundColor: colors.accent,
          opacity: 0.8
        }}
      />
      
      {/* Instructions */}
      <p 
        className="text-center mb-10 font-normal"
        style={{ 
          fontSize: 'clamp(13px, 2.5vw, 16px)',
          color: '#333'
        }}
      >
        Trace these 3 words.
      </p>
      
      {/* Words - MASSIVE spacing */}
      <div className="flex-1 flex flex-col justify-around items-center py-4">
        {words.map((wordObj, index) => (
          <div key={index} className="text-center w-full">
            <div 
              className="font-normal"
              style={{
                fontSize: 'clamp(40px, 8vw, 60px)',
                color: colors.traceGray,
                letterSpacing: '0.05em',
                marginBottom: '0.2em'
              }}
            >
              {wordObj.word}
            </div>
            {/* Tracing line */}
            <div 
              className="w-2/3 mx-auto"
              style={{
                height: '1px',
                borderBottom: `2px dotted ${colors.traceGray}`,
                opacity: 0.6
              }}
            />
          </div>
        ))}
      </div>
      
      {/* Completion message - integrated naturally */}
      <p 
        className="text-center mt-8 font-normal"
        style={{ 
          fontSize: 'clamp(12px, 2.2vw, 15px)',
          color: colors.textGray
        }}
      >
        You traced 3 words today. That's the goal.
      </p>
    </div>
  )
}

function BreatheCirclePreview({ data, colors }: { data: WorksheetData; colors: any }) {
  const words = data.words.slice(0, 3)
  const allLetters = 'abcdefghijklmnopqrstuvwxyz'.split('')
  const targetLetters = words.map(w => w.word[0].toLowerCase())
  
  // Create letter grid
  const displayLetters: string[] = []
  targetLetters.forEach(t => displayLetters.push(t))
  while (displayLetters.length < 21) {
    const random = allLetters[Math.floor(Math.random() * allLetters.length)]
    displayLetters.push(random)
  }
  displayLetters.sort(() => Math.random() - 0.5)
  
  return (
    <div 
      className="w-full h-full flex flex-col"
      style={{ backgroundColor: colors.bg, padding: '8% 10%' }}
    >
      {/* Title */}
      <div className="text-center mb-2">
        <h1 
          className="font-normal"
          style={{ fontSize: 'clamp(24px, 5vw, 36px)', lineHeight: '1.2' }}
        >
          Breathe & Circle
        </h1>
        <h2 
          className="font-normal"
          style={{ fontSize: 'clamp(14px, 3vw, 20px)', color: '#333', marginTop: '0.3em' }}
        >
          Today
        </h2>
      </div>
      
      {/* Decorative line */}
      <div 
        className="w-4/5 mx-auto mb-6"
        style={{ height: '1.5px', backgroundColor: colors.accent, opacity: 0.8 }}
      />
      
      {/* Breathing guide box */}
      <div 
        className="mx-auto mb-8 p-3 rounded-lg"
        style={{ 
          border: `1px solid ${colors.accent}`,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          maxWidth: '70%'
        }}
      >
        <p 
          className="text-center font-normal"
          style={{ fontSize: 'clamp(11px, 2vw, 14px)', color: colors.textGray, marginBottom: '0.3em' }}
        >
          Breathing Guide:
        </p>
        <p 
          className="text-center font-normal"
          style={{ fontSize: 'clamp(11px, 2vw, 14px)', color: colors.textGray }}
        >
          In: 1-2-3 • Out: 1-2-3
        </p>
        <p 
          className="text-center font-normal"
          style={{ fontSize: 'clamp(11px, 2vw, 14px)', color: colors.textGray, marginTop: '0.3em' }}
        >
          Now circle!
        </p>
      </div>
      
      {/* Letter grid - lots of space */}
      <div 
        className="grid grid-cols-7 gap-3 mb-6"
        style={{ fontSize: 'clamp(16px, 3vw, 24px)' }}
      >
        {displayLetters.map((letter, i) => (
          <div key={i} className="text-center font-normal">
            {letter}
          </div>
        ))}
      </div>
      
      {/* Target words hint */}
      <p 
        className="text-center mb-4 font-normal"
        style={{ fontSize: 'clamp(11px, 2vw, 14px)', color: colors.textGray }}
      >
        Find: {words.map(w => w.word).join(', ')}
      </p>
      
      {/* Completion message */}
      <p 
        className="text-center mt-auto font-normal"
        style={{ fontSize: 'clamp(12px, 2.2vw, 15px)', color: colors.textGray }}
      >
        Good breathing = good learning 💙
      </p>
    </div>
  )
}

function SoundHuntPreview({ data, colors }: { data: WorksheetData; colors: any }) {
  const words = data.words.slice(0, 4)
  
  return (
    <div 
      className="w-full h-full flex flex-col"
      style={{ backgroundColor: colors.bg, padding: '8% 10%' }}
    >
      {/* Title */}
      <div className="text-center mb-4">
        <h1 
          className="font-normal"
          style={{ fontSize: 'clamp(22px, 4.5vw, 34px)', lineHeight: '1.2' }}
        >
          Sound Hunt Around You
        </h1>
      </div>
      
      {/* Decorative line */}
      <div 
        className="w-4/5 mx-auto mb-6"
        style={{ height: '1.5px', backgroundColor: colors.accent, opacity: 0.8 }}
      />
      
      {/* Instructions */}
      <div className="text-center mb-8">
        <p 
          className="font-normal"
          style={{ fontSize: 'clamp(13px, 2.5vw, 16px)', color: '#333' }}
        >
          Find things that start with these sounds.
        </p>
        <p 
          className="font-normal"
          style={{ fontSize: 'clamp(13px, 2.5vw, 16px)', color: '#333', marginTop: '0.3em' }}
        >
          Draw or write what you find.
        </p>
      </div>
      
      {/* Sound boxes - 2 columns */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {words.map((wordObj, i) => (
          <div key={i} className="text-center">
            <p 
              className="font-normal mb-2"
              style={{ fontSize: 'clamp(12px, 2.3vw, 14px)', color: '#333' }}
            >
              Things that start with
            </p>
            <p 
              className="font-normal mb-3"
              style={{ fontSize: 'clamp(12px, 2.3vw, 14px)', color: '#333' }}
            >
              /{wordObj.word[0]}/
            </p>
            <div 
              className="border mx-auto"
              style={{ 
                borderColor: '#999',
                borderWidth: '1px',
                height: 'clamp(60px, 12vw, 90px)',
                width: '90%'
              }}
            />
          </div>
        ))}
      </div>
      
      {/* Hints */}
      <p 
        className="text-center font-normal"
        style={{ fontSize: 'clamp(10px, 2vw, 12px)', color: colors.textGray }}
      >
        Hints: {data.words.slice(0, 8).map(w => w.word).join(', ')}
      </p>
      
      {/* Completion message */}
      <p 
        className="text-center mt-auto font-normal"
        style={{ fontSize: 'clamp(12px, 2.2vw, 15px)', color: colors.textGray }}
      >
        Found even one? You're a sound detective!
      </p>
    </div>
  )
}

function BodyLetterPreview({ data, colors }: { data: WorksheetData; colors: any }) {
  const words = data.words.slice(0, 6)
  
  return (
    <div 
      className="w-full h-full flex flex-col"
      style={{ backgroundColor: colors.bg, padding: '8% 10%' }}
    >
      {/* Title */}
      <div className="text-center mb-4">
        <h1 
          className="font-normal"
          style={{ fontSize: 'clamp(24px, 5vw, 36px)', lineHeight: '1.2' }}
        >
          Body Letter Fun
        </h1>
      </div>
      
      {/* Decorative line */}
      <div 
        className="w-4/5 mx-auto mb-6"
        style={{ height: '1.5px', backgroundColor: colors.accent, opacity: 0.8 }}
      />
      
      {/* Instructions */}
      <p 
        className="text-center mb-10 font-normal"
        style={{ fontSize: 'clamp(13px, 2.5vw, 16px)', color: '#333' }}
      >
        Make each letter with your body. Then say the word!
      </p>
      
      {/* Words with checkboxes */}
      <div className="flex-1 flex flex-col justify-around">
        {words.map((wordObj, i) => (
          <div key={i} className="flex items-center">
            <div 
              className="border-2 mr-3"
              style={{ 
                width: 'clamp(16px, 3vw, 20px)',
                height: 'clamp(16px, 3vw, 20px)',
                borderColor: '#999'
              }}
            />
            <span 
              className="font-semibold"
              style={{ fontSize: 'clamp(18px, 4vw, 26px)' }}
            >
              {wordObj.word}
            </span>
          </div>
        ))}
      </div>
      
      {/* Movement hint */}
      <p 
        className="text-center mb-4 font-normal"
        style={{ fontSize: 'clamp(11px, 2vw, 13px)', color: colors.textGray }}
      >
        💃 Take a wiggle break anytime!
      </p>
      
      {/* Completion message */}
      <p 
        className="text-center font-normal"
        style={{ fontSize: 'clamp(12px, 2.2vw, 15px)', color: colors.textGray }}
      >
        You moved through {words.length} words. Great energy!
      </p>
    </div>
  )
}

function PointRestPreview({ data, colors }: { data: WorksheetData; colors: any }) {
  const words = data.words.slice(0, 5)
  
  return (
    <div 
      className="w-full h-full flex flex-col"
      style={{ backgroundColor: colors.bg, padding: '8% 10%' }}
    >
      {/* Title */}
      <div className="text-center mb-2">
        <h1 
          className="font-normal"
          style={{ fontSize: 'clamp(24px, 5vw, 36px)', lineHeight: '1.2' }}
        >
          Point & Rest
        </h1>
        <h2 
          className="font-normal"
          style={{ fontSize: 'clamp(14px, 3vw, 20px)', color: '#333', marginTop: '0.3em' }}
        >
          Today
        </h2>
      </div>
      
      {/* Decorative line */}
      <div 
        className="w-4/5 mx-auto mb-6"
        style={{ height: '1.5px', backgroundColor: colors.accent, opacity: 0.8 }}
      />
      
      {/* Instructions */}
      <p 
        className="text-center mb-12 font-normal"
        style={{ fontSize: 'clamp(13px, 2.5vw, 16px)', color: '#333' }}
      >
        Just point to the words. No writing needed.
      </p>
      
      {/* HUGE words with MASSIVE spacing */}
      <div className="flex-1 flex flex-col justify-around items-center">
        {words.map((wordObj, i) => (
          <div 
            key={i}
            className="text-center font-normal"
            style={{ 
              fontSize: 'clamp(28px, 6vw, 44px)',
              color: '#000'
            }}
          >
            {wordObj.word}
          </div>
        ))}
      </div>
      
      {/* Completion message */}
      <p 
        className="text-center mt-8 font-normal"
        style={{ fontSize: 'clamp(12px, 2.2vw, 15px)', color: colors.textGray }}
      >
        Slow and steady. You pointed to some words.
      </p>
    </div>
  )
}

function TraceOnePreview({ data, colors }: { data: WorksheetData; colors: any }) {
  const word = data.words[0].word
  const sentence = `I can ${word}.`
  
  return (
    <div 
      className="w-full h-full flex flex-col"
      style={{ backgroundColor: colors.bg, padding: '8% 10%' }}
    >
      {/* Title */}
      <div className="text-center mb-2">
        <h1 
          className="font-normal"
          style={{ fontSize: 'clamp(24px, 5vw, 36px)', lineHeight: '1.2' }}
        >
          Trace One Sentence
        </h1>
        <h2 
          className="font-normal"
          style={{ fontSize: 'clamp(14px, 3vw, 20px)', color: '#333', marginTop: '0.3em' }}
        >
          Today
        </h2>
      </div>
      
      {/* Decorative line */}
      <div 
        className="w-4/5 mx-auto mb-6"
        style={{ height: '1.5px', backgroundColor: colors.accent, opacity: 0.8 }}
      />
      
      {/* Instructions */}
      <p 
        className="text-center mb-12 font-normal"
        style={{ fontSize: 'clamp(13px, 2.5vw, 16px)', color: '#333' }}
      >
        Trace this sentence one time. Take your time.
      </p>
      
      {/* Centered sentence for tracing */}
      <div className="flex-1 flex flex-col justify-center items-center">
        <div 
          className="font-normal text-center mb-2"
          style={{ 
            fontSize: 'clamp(32px, 7vw, 56px)',
            color: colors.traceGray,
            letterSpacing: '0.03em'
          }}
        >
          {sentence}
        </div>
        {/* Tracing line */}
        <div 
          className="w-3/4"
          style={{
            height: '2px',
            borderBottom: `2px dotted ${colors.traceGray}`,
            opacity: 0.6
          }}
        />
      </div>
      
      {/* Completion message */}
      <p 
        className="text-center mt-8 font-normal"
        style={{ fontSize: 'clamp(12px, 2.2vw, 15px)', color: colors.textGray }}
      >
        One sentence traced. You did it.
      </p>
    </div>
  )
}