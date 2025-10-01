// src/components/worksheets/WorksheetPreview.tsx

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
  mood: string
  activityType: string
}

const MOOD_STYLES = {
  overwhelmed: {
    bg: 'bg-[#E8F4F8]',
    accent: 'text-[#5BA3BF]',
    bar: 'bg-[#B8D8E8]',
    border: 'border-[#5BA3BF]',
  },
  highEnergy: {
    bg: 'bg-[#FFF4E6]',
    accent: 'text-[#FF8C42]',
    bar: 'bg-[#FFD4A3]',
    border: 'border-[#FF8C42]',
  },
  lowEnergy: {
    bg: 'bg-[#F3F0FF]',
    accent: 'text-[#9B7EBD]',
    bar: 'bg-[#D4C5F9]',
    border: 'border-[#9B7EBD]',
  },
}

export default function WorksheetPreview({ data, mood, activityType }: PreviewProps) {
  const styles = MOOD_STYLES[mood as keyof typeof MOOD_STYLES]

  // Route to appropriate template preview
  const renderPreview = () => {
    switch (activityType) {
      case 'trace3':
        return <Trace3Preview data={data} styles={styles} />
      case 'breatheCircle':
        return <BreatheCirclePreview data={data} styles={styles} />
      case 'soundHunt':
        return <SoundHuntPreview data={data} styles={styles} />
      case 'bodyLetter':
        return <BodyLetterPreview data={data} styles={styles} />
      case 'pointRest':
        return <PointRestPreview data={data} styles={styles} />
      case 'traceOne':
        return <TraceOnePreview data={data} styles={styles} />
      default:
        return <Trace3Preview data={data} styles={styles} />
    }
  }

  return (
    <div className={`${styles.bg} rounded-lg shadow-inner p-6 aspect-[8.5/11] overflow-auto`}>
      {renderPreview()}
    </div>
  )
}

// OVERWHELMED TEMPLATES

function Trace3Preview({ data, styles }: any) {
  const words = data.words.slice(0, 3)

  return (
    <div className="h-full flex flex-col">
      {/* Title bar */}
      <div className={`${styles.bar} -mx-6 -mt-6 px-6 py-3 rounded-t-lg`}>
        <h1 className="text-xl font-bold text-center text-gray-800">Trace 3 Words</h1>
      </div>

      {/* Decorative line */}
      <div className={`border-t-2 ${styles.border} mt-3 mb-4`}></div>

      {/* Instructions */}
      <p className="text-center text-sm text-gray-700 mb-6">
        Trace each word one time. Just 3 is perfect.
      </p>

      {/* Words */}
      <div className="flex-1 flex flex-col justify-around py-4">
        {words.map((wordObj: any, index: number) => (
          <div key={index} className="text-center">
            <div className="text-4xl font-light text-gray-300 tracking-wider">
              {wordObj.word}
            </div>
            <div className="border-b-2 border-dashed border-gray-300 mt-1 mx-8"></div>
          </div>
        ))}
      </div>

      {/* Completion message */}
      <div className={`${styles.bar} -mx-6 -mb-6 px-6 py-4 rounded-b-lg mt-auto`}>
        <p className="text-center text-sm text-gray-700">
          You traced 3 words today. That's the goal.
        </p>
      </div>
    </div>
  )
}

function BreatheCirclePreview({ data, styles }: any) {
  const words = data.words.slice(0, 3)

  const getMatchingOptions = (word: string) => {
    const distractors = data.distractors
      .filter((d: any) => d.word.length === word.length)
      .slice(0, 2)
      .map((d: any) => d.word)
    return [word, ...distractors].sort(() => Math.random() - 0.5).slice(0, 3)
  }

  return (
    <div className="h-full flex flex-col">
      <div className={`${styles.bar} -mx-6 -mt-6 px-6 py-3 rounded-t-lg`}>
        <h1 className="text-xl font-bold text-center text-gray-800">Breathe and Circle</h1>
      </div>

      <div className={`border-t-2 ${styles.border} mt-3 mb-4`}></div>

      <p className="text-center text-sm text-gray-700 mb-2">
        Take a breath. Find the word. Circle it.
      </p>
      <p className="text-center text-xs text-gray-500 mb-6">
        💙 Breathe in... breathe out... then look
      </p>

      <div className="flex-1 space-y-6 py-4">
        {words.map((wordObj: any, index: number) => (
          <div key={index} className="flex items-center justify-between">
            <div className={`text-2xl font-bold ${styles.accent}`}>
              {wordObj.word}
            </div>
            <div className="flex gap-4">
              {getMatchingOptions(wordObj.word).map((opt, i) => (
                <div key={i} className="text-lg text-gray-800">
                  {opt}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={`${styles.bar} -mx-6 -mb-6 px-6 py-4 rounded-b-lg mt-auto`}>
        <p className="text-center text-sm text-gray-700">
          3 matches found. That's enough for today.
        </p>
      </div>
    </div>
  )
}

// HIGH ENERGY TEMPLATES

function SoundHuntPreview({ data, styles }: any) {
  const words = data.words.slice(0, 9)

  return (
    <div className="h-full flex flex-col">
      <div className={`${styles.bar} -mx-6 -mt-6 px-6 py-3 rounded-t-lg`}>
        <h1 className="text-xl font-bold text-center text-gray-800">Sound Hunt</h1>
      </div>

      <div className={`border-t-2 ${styles.border} mt-3 mb-4`}></div>

      <p className="text-center text-sm text-gray-700 mb-6">
        Circle all the words you can find. Go fast!
      </p>

      <div className="flex-1 grid grid-cols-3 gap-4 py-4">
        {words.map((wordObj: any, index: number) => (
          <div key={index} className="text-center text-lg font-medium text-gray-800">
            {wordObj.word}
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-500 mb-4">
        🏃 Take a wiggle break halfway through!
      </p>

      <div className={`${styles.bar} -mx-6 -mb-6 px-6 py-4 rounded-b-lg mt-auto`}>
        <p className="text-center text-sm text-gray-700">
          You found {words.length} words. Good focus today.
        </p>
      </div>
    </div>
  )
}

function BodyLetterPreview({ data, styles }: any) {
  const words = data.words.slice(0, 5)

  return (
    <div className="h-full flex flex-col">
      <div className={`${styles.bar} -mx-6 -mt-6 px-6 py-3 rounded-t-lg`}>
        <h1 className="text-xl font-bold text-center text-gray-800">Body Letter Fun</h1>
      </div>

      <div className={`border-t-2 ${styles.border} mt-3 mb-4`}></div>

      <p className="text-center text-sm text-gray-700 mb-6">
        Make each letter with your body. Then say the word!
      </p>

      <div className="flex-1 space-y-4 py-4">
        {words.map((wordObj: any, index: number) => (
          <div key={index}>
            <div className="text-2xl font-bold text-gray-800">
              {index + 1}. {wordObj.word}
            </div>
            <div className="text-xs text-gray-500 ml-6">
              (make letters, say word, jump!)
            </div>
          </div>
        ))}
      </div>

      <div className={`${styles.bar} -mx-6 -mb-6 px-6 py-4 rounded-b-lg mt-auto`}>
        <p className="text-center text-sm text-gray-700">
          You moved through {words.length} words. Great energy!
        </p>
      </div>
    </div>
  )
}

// LOW ENERGY TEMPLATES

function PointRestPreview({ data, styles }: any) {
  const words = data.words.slice(0, 5)

  return (
    <div className="h-full flex flex-col">
      <div className={`${styles.bar} -mx-6 -mt-6 px-6 py-3 rounded-t-lg`}>
        <h1 className="text-xl font-bold text-center text-gray-800">Point & Rest</h1>
      </div>

      <div className={`border-t-2 ${styles.border} mt-3 mb-4`}></div>

      <p className="text-center text-sm text-gray-700 mb-6">
        Just point to the words. No writing needed.
      </p>

      <div className="flex-1 flex flex-col justify-around py-4">
        {words.map((wordObj: any, index: number) => (
          <div key={index} className="text-center text-3xl font-medium text-gray-800">
            {wordObj.word}
          </div>
        ))}
      </div>

      <div className={`${styles.bar} -mx-6 -mb-6 px-6 py-4 rounded-b-lg mt-auto`}>
        <p className="text-center text-sm text-gray-700">
          Slow and steady. You pointed to some words.
        </p>
      </div>
    </div>
  )
}

function TraceOnePreview({ data, styles }: any) {
  const word = data.words[0].word

  return (
    <div className="h-full flex flex-col">
      <div className={`${styles.bar} -mx-6 -mt-6 px-6 py-3 rounded-t-lg`}>
        <h1 className="text-xl font-bold text-center text-gray-800">Trace Just One</h1>
      </div>

      <div className={`border-t-2 ${styles.border} mt-3 mb-4`}></div>

      <p className="text-center text-sm text-gray-700 mb-6">
        Trace this word one time. Take your time.
      </p>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl font-light text-gray-300 tracking-wider">
            {word}
          </div>
          <div className="border-b-2 border-dashed border-gray-300 mt-2 mx-12"></div>
        </div>
      </div>

      <div className={`${styles.bar} -mx-6 -mb-6 px-6 py-4 rounded-b-lg mt-auto`}>
        <p className="text-center text-sm text-gray-700">
          One word traced. You did it.
        </p>
      </div>
    </div>
  )
}