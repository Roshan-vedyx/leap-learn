// src/lib/worksheetGenerator.ts

type MoodType = 'overwhelmed' | 'highEnergy' | 'lowEnergy'
type PhonicsType = 'cvc' | 'blends' | 'digraphs' | 'sight'

interface MoodConstraints {
  maxItems: number
  fontSize: 'large' | 'medium'
  includeBreathing?: boolean
  includeMovement?: boolean
  allowNoWriting?: boolean
  backgroundColor: string
  completionMessage: string
}

interface WordData {
  word: string
  phonics_pattern?: string
  chunks?: string[]
  alternative_chunks?: string[]
}

interface WorksheetData {
  mood: MoodType
  phonicsType: PhonicsType
  activityType: string
  constraints: MoodConstraints
  words: WordData[]
  distractors: WordData[]
}

const MOOD_CONSTRAINTS: Record<MoodType, MoodConstraints> = {
  overwhelmed: {
    maxItems: 3,
    fontSize: 'large',
    includeBreathing: true,
    backgroundColor: '#E8F4F8',
    completionMessage: 'You [action] 3 [items] today. That\'s the goal.',
  },
  highEnergy: {
    maxItems: 9,
    fontSize: 'medium',
    includeMovement: true,
    backgroundColor: '#FFF4E6',
    completionMessage: 'You [action] [count] [items]. Good focus today.',
  },
  lowEnergy: {
    maxItems: 5,
    fontSize: 'large',
    allowNoWriting: true,
    backgroundColor: '#F3F0FF',
    completionMessage: 'Slow and steady. You [action] some [items].',
  },
}

// Cache for loaded words
let wordsCache: any = null

/**
 * Load words from /public/words.json
 */
async function loadWordsFromJSON(): Promise<any> {
  if (wordsCache) return wordsCache
  
  try {
    const response = await fetch('/words.json')
    if (!response.ok) {
      console.warn('Failed to load words.json, using fallback')
      return null
    }
    wordsCache = await response.json()
    return wordsCache
  } catch (error) {
    console.error('Error loading words.json:', error)
    return null
  }
}

/**
 * Filter words by phonics pattern from JSON data
 */
function filterWordsByPattern(wordsData: any, phonicsType: PhonicsType): WordData[] {
  if (!wordsData || !wordsData.words) return []
  
  // Map phonics types to pattern names in JSON
  const patternMap: Record<PhonicsType, string[]> = {
    cvc: ['cvc'],
    blends: ['consonant_blend'],
    digraphs: ['consonant_digraph'],
    sight: ['sight_word'],
  }
  
  const patterns = patternMap[phonicsType] || []
  
  // Flatten all complexity levels
  const allWords: any[] = [
    ...(wordsData.words.easy || []),
    ...(wordsData.words.regular || []),
    ...(wordsData.words.challenge || []),
  ]
  
  // Filter by phonics pattern
  const filtered = allWords.filter((w: any) => 
    patterns.includes(w.phonics_pattern)
  )
  
  return filtered.map(w => ({
    word: w.word,
    phonics_pattern: w.phonics_pattern,
    chunks: w.chunks,
    alternative_chunks: w.alternative_chunks
  }))
}

/**
 * Fallback word bank when JSON fails to load
 */
function getFallbackWords(phonicsType: PhonicsType): WordData[] {
  const fallbackBank: Record<PhonicsType, WordData[]> = {
    cvc: [
      { word: 'cat' }, { word: 'dog' }, { word: 'sun' },
      { word: 'hat' }, { word: 'bed' }, { word: 'run' },
      { word: 'pig' }, { word: 'bat' }, { word: 'cup' },
      { word: 'log' }, { word: 'mat' }, { word: 'rat' },
      { word: 'hop' }, { word: 'pen' }, { word: 'jet' },
    ],
    blends: [
      { word: 'stop' }, { word: 'tree' }, { word: 'swim' },
      { word: 'skip' }, { word: 'flag' }, { word: 'snap' },
      { word: 'spin' }, { word: 'glad' }, { word: 'step' },
      { word: 'play' }, { word: 'frog' }, { word: 'slip' },
    ],
    digraphs: [
      { word: 'shop' }, { word: 'fish' }, { word: 'that' },
      { word: 'chip' }, { word: 'when' }, { word: 'ship' },
      { word: 'path' }, { word: 'wish' }, { word: 'this' },
      { word: 'thin' }, { word: 'dash' }, { word: 'mesh' },
    ],
    sight: [
      { word: 'the' }, { word: 'said' }, { word: 'was' },
      { word: 'are' }, { word: 'you' }, { word: 'they' },
      { word: 'have' }, { word: 'like' }, { word: 'come' },
      { word: 'some' }, { word: 'were' }, { word: 'what' },
    ],
  }
  
  return fallbackBank[phonicsType] || []
}

/**
 * Select words for worksheet (async - tries JSON first, falls back)
 */
export async function selectWords(
  phonicsType: PhonicsType,
  count: number
): Promise<WordData[]> {
  // Try loading from JSON
  const wordsData = await loadWordsFromJSON()
  let availableWords: WordData[] = []
  
  if (wordsData) {
    availableWords = filterWordsByPattern(wordsData, phonicsType)
  }
  
  // Fallback if no words found
  if (availableWords.length === 0) {
    console.log('Using fallback words for', phonicsType)
    availableWords = getFallbackWords(phonicsType)
  }
  
  // Shuffle and return requested count
  const shuffled = [...availableWords].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, availableWords.length))
}

/**
 * Select words synchronously (for immediate preview)
 */
function selectWordsSync(phonicsType: PhonicsType, count: number): WordData[] {
  const words = getFallbackWords(phonicsType)
  const shuffled = [...words].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, words.length))
}

/**
 * Generate distractors for matching activities
 */
function generateDistractors(
  targetWords: WordData[],
  phonicsType: PhonicsType
): WordData[] {
  const allWords = getFallbackWords(phonicsType)
  
  // Get words that aren't in the target list
  const available = allWords.filter(
    w => !targetWords.find(t => t.word === w.word)
  )
  
  // Return 2 distractors per target word
  const shuffled = [...available].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, targetWords.length * 2)
}

/**
 * Main worksheet generation function
 */
export function generateMoodBasedWorksheet(
  mood: MoodType,
  phonicsType: PhonicsType,
  activityType: string
): WorksheetData {
  const constraints = MOOD_CONSTRAINTS[mood]
  
  // Use synchronous selection for immediate preview
  const words = selectWordsSync(phonicsType, constraints.maxItems)
  const distractors = generateDistractors(words, phonicsType)
  
  // Async load better words in background (for future improvements)
  selectWords(phonicsType, constraints.maxItems).then(realWords => {
    if (realWords.length > 0) {
      // Could update cache or trigger re-render here
      console.log('Better words loaded from JSON:', realWords.length)
    }
  }).catch(err => {
    console.warn('Could not load words from JSON:', err)
  })
  
  return {
    mood,
    phonicsType,
    activityType,
    constraints,
    words,
    distractors,
  }
}

/**
 * Helper to format completion messages
 */
export function formatCompletionMessage(
  template: string,
  action: string,
  items: string,
  count?: number
): string {
  let message = template
    .replace('[action]', action)
    .replace('[items]', items)
  
  if (count !== undefined) {
    message = message.replace('[count]', count.toString())
  }
  
  return message
}

/**
 * Export constraints for external use
 */
export { MOOD_CONSTRAINTS }
export type { MoodType, PhonicsType, WordData, WorksheetData, MoodConstraints }