// src/lib/worksheetGenerator.ts
// Curated, tier-based word selection matching Canva PDF quality

type MoodType = 'overwhelmed' | 'highEnergy' | 'lowEnergy'
type PhonicsType = 'cvc' | 'blends' | 'digraphs' | 'sight'

interface MoodConstraints {
  maxItems: number
  fontSize: 'large' | 'medium'
  includeBreathing?: boolean
  includeMovement?: boolean
  allowNoWriting?: boolean
  completionMessage: string
}

interface WordData {
  word: string
  phonics_pattern?: string
  chunks?: string[]
  alternative_chunks?: string[]
  icon?: string // Path to SVG icon
}

interface ActivitySection {
    activityId: string
    words: WordData[]
    letterRows?: string[][]
    wordPairs?: { left: string[], right: string[] }
    pictureSoundSections?: Array<{
      sound: string
      displaySound: string
      words: Array<{ word: string; icon?: string; startsWithSound: boolean }>
    }>
}
  
interface WorksheetData {
mood: MoodType
phonicsType: PhonicsType
constraints: MoodConstraints
activities: ActivitySection[]  // NEW: Array of activities
distractors: WordData[]
}

// ============================================================================
// TIER 1: Easiest wins - concrete, high-frequency, imageable
// ============================================================================
const TIER_1_WORDS = {
    common: ['cat', 'dog', 'sun', 'hat', 'bed', 'run', 'sit', 'top', 'bat', 'red', 'mom', 'dad', 'pig', 'fox', 'hen', 'bus', 'cup', 'map', 'sad', 'six', 'sock', 'bag', 'box', 'big', 'bee', 'ball', 'bell'],
    animals: ['cat', 'dog', 'pig', 'fox', 'hen', 'bug', 'bat', 'rat', 'bee', 'bird', 'seal', 'sheep'],
    objects: ['sun', 'hat', 'bed', 'map', 'cup', 'bus', 'box', 'pen', 'pot', 'sock', 'star', 'spoon', 'bag', 'ball', 'bell', 'book', 'bed'],
    actions: ['run', 'sit', 'hop', 'dig', 'hit', 'nap', 'swim', 'sing', 'skip', 'bite', 'blow']
}

// Word families for pattern-based activities (rhyming words)
const WORD_FAMILIES = {
  'at': ['cat', 'bat', 'hat', 'mat', 'rat', 'sat', 'fat'],
  'og': ['dog', 'log', 'fog', 'hog', 'jog'],
  'un': ['sun', 'run', 'fun', 'bun', 'gun'],
  'ig': ['pig', 'big', 'dig', 'fig', 'jig', 'wig'],
  'ed': ['bed', 'red', 'fed', 'led', 'wed'],
  'op': ['top', 'mop', 'hop', 'pop', 'cop'],
  'ug': ['bug', 'hug', 'mug', 'rug', 'jug'],
  'en': ['hen', 'pen', 'ten', 'den', 'men'],
  'ox': ['fox', 'box', 'sox'],
  'us': ['bus', 'pus'],
  'ap': ['map', 'cap', 'gap', 'nap', 'tap', 'lap'],
  'ot': ['pot', 'hot', 'dot', 'got', 'cot', 'lot']
}

// Icon mapping (will reference SVG files in /public/icons/words/)
const WORD_ICONS: Record<string, string> = {
  'cat': '/icons/words/cat.png',
  'dog': '/icons/words/dog.png',
  'sun': '/icons/words/sun.png',
  'hat': '/icons/words/hat.png',
  'bed': '/icons/words/bed.png',
  'run': '/icons/words/run.png',
  'sit': '/icons/words/sit.png',
  'top': '/icons/words/top.png',
  'bat': '/icons/words/bat.png',
  'red': '/icons/words/red.png',
  'mom': '/icons/words/mom.png',
  'dad': '/icons/words/dad.png',
  'pig': '/icons/words/pig.png',
  'fox': '/icons/words/fox.png',
  'hen': '/icons/words/hen.png',
  'bus': '/icons/words/bus.png',
  'cup': '/icons/words/cup.png',
  'map': '/icons/words/map.png',
  'bug': '/icons/words/bug.png',
  'box': '/icons/words/box.png',
  'pen': '/icons/words/pen.png',
  'pot': '/icons/words/pot.png',
  'hop': '/icons/words/hop.png',
  'dig': '/icons/words/dig.png',
  'mop': '/icons/words/mop.png',
  'log': '/icons/words/log.png',
  'fog': '/icons/words/fog.png',
  'fun': '/icons/words/fun.png',
  'mat': '/icons/words/mat.png',
  'cap': '/icons/words/cap.png',
  'nap': '/icons/words/nap.png',
  'hug': '/icons/words/hug.png',
  'mug': '/icons/words/mug.png',
  'sad': '/icons/words/sad.png',
'six': '/icons/words/six.png',
'sock': '/icons/words/sock.png',
'star': '/icons/words/star.png',
'spoon': '/icons/words/spoon.png',
'seal': '/icons/words/seal.png',
'sheep': '/icons/words/sheep.png',
'swim': '/icons/words/swim.png',
'sing': '/icons/words/sing.png',
'skip': '/icons/words/skip.png',
'bag': '/icons/words/bag.png',
'ball': '/icons/words/ball.png',
'bell': '/icons/words/bell.png',
'book': '/icons/words/book.png',
'bee': '/icons/words/bee.png',
'bird': '/icons/words/bird.png',
'big': '/icons/words/big.png',
'bite': '/icons/words/bite.png',
'blow': '/icons/words/blow.png',
'rug': '/icons/words/rug.png'
}

const MOOD_CONSTRAINTS: Record<MoodType, MoodConstraints> = {
  overwhelmed: {
    maxItems: 3,
    fontSize: 'large',
    includeBreathing: true,
    completionMessage: 'You [action] 3 [items] today. That\'s the goal.',
  },
  highEnergy: {
    maxItems: 9,
    fontSize: 'medium',
    includeMovement: true,
    completionMessage: 'You [action] [count] [items]. Good focus today.',
  },
  lowEnergy: {
    maxItems: 5,
    fontSize: 'large',
    allowNoWriting: true,
    completionMessage: 'Slow and steady. You [action] some [items].',
  },
}

// Activity pools for each mood
const MOOD_ACTIVITY_POOLS = {
    overwhelmed: ['trace3', 'breatheCircle', 'circleKnown', 'pictureSound'],
    highEnergy: ['soundHunt', 'bodyLetter'],
    lowEnergy: ['pointRest', 'traceOne', 'bigLetterCircle', 'connectPairs']
}

// ============================================================================
// HELPERS
// ============================================================================

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

// ============================================================================
// CORE WORD SELECTION LOGIC
// ============================================================================

/**
 * Select curated words based on mood and activity type
 * CRITICAL: Overwhelmed mood ONLY uses tier 1 easiest words
 * NOTE: phonicsType is hardcoded to 'cvc' internally
 */
function selectWordsForActivity(
    mood: MoodType,
    activityType: string,
    count: number
  ): WordData[] {
    
    // For overwhelmed mood, ALWAYS use tier 1 easiest words
    if (mood === 'overwhelmed') {
      const easyWords = shuffle([...TIER_1_WORDS.common])
      return easyWords.slice(0, count).map(word => ({
        word,
        icon: WORD_ICONS[word]
      }))
    }
    
    // NEW: For circleKnown activity - needs 15 words (5 rows × 3 words)
    if (activityType === 'circleKnown') {
      const easyWords = shuffle([...TIER_1_WORDS.common])
      return easyWords.slice(0, 15).map(word => ({
        word,
        icon: WORD_ICONS[word]
      }))
    }
    
    // NEW: For bigLetterCircle - needs 4 target letters
    if (activityType === 'bigLetterCircle') {
        // Just return 4 words - we'll use their first letters
        const easyWords = shuffle([...TIER_1_WORDS.common])
        return easyWords.slice(0, 2).map(word => ({
        word,
        icon: WORD_ICONS[word]
        }))
    }
    
    // NEW: For connectPairs - needs 5 words
    if (activityType === 'connectPairs') {
        const easyWords = shuffle([...TIER_1_WORDS.common])
        return easyWords.slice(0, 5).map(word => ({
        word,
        icon: WORD_ICONS[word]
        }))
    }

    if (activityType === 'pictureSound') {
        // We need words for two target sounds: /s/ and /b/
        // Get 4 words starting with 's' and 4 starting with 'b'
        const allWords = [...TIER_1_WORDS.common, ...TIER_1_WORDS.animals, ...TIER_1_WORDS.objects]
        
        const sWords = shuffle(allWords.filter(w => w.toLowerCase().startsWith('s'))).slice(0, 4)
        const bWords = shuffle(allWords.filter(w => w.toLowerCase().startsWith('b'))).slice(0, 4)
        
        return [...sWords, ...bWords].map(word => ({
          word,
          icon: WORD_ICONS[word]
        }))
    }
    
    // For activities requiring word families (like "Breathe & Circle")
    if (activityType === 'breatheCircle' || activityType === 'findWord') {
      const familyKey = randomChoice(Object.keys(WORD_FAMILIES))
      const family = WORD_FAMILIES[familyKey as keyof typeof WORD_FAMILIES]
      return shuffle([...family]).slice(0, count).map(word => ({
        word,
        icon: WORD_ICONS[word]
      }))
    }
    
    // For high energy and low energy, mix tier 1 words with some variety
    const words = shuffle([
      ...TIER_1_WORDS.common,
      ...TIER_1_WORDS.animals,
      ...TIER_1_WORDS.objects
    ])
    
    return words.slice(0, count).map(word => ({
      word,
      icon: WORD_ICONS[word]
    }))
}

/**
 * Generate word family rows for "Breathe & Circle" activity
 */
function generateLetterRows(targetWords: WordData[]): string[][] {
    const targetLetter = targetWords[0]?.word[0].toUpperCase() || 'H'
    const distractorLetters = ['B', 'D', 'F', 'G', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'T', 'V', 'W', 'Z']
    
    // Get 4 random distractors
    const shuffled = shuffle(distractorLetters.filter(l => l !== targetLetter))
    const distractors = shuffled.slice(0, 4)
    
    // Combine and shuffle to get 5 letters with target included
    const allLetters = [targetLetter, ...distractors]
    const singleRow = shuffle(allLetters)
    
    return [singleRow] // Return single row only
}

function generateBigLetterRows(targetWords: WordData[]): string[][] {
    const letterRows: string[][] = []
    const distractorLetters = ['M', 'R', 'T', 'P', 'K', 'N', 'H', 'L', 'S', 'B', 'C', 'D', 'F', 'G']
    
    // Take first 4 words and get their first letters
    const targetLetters = targetWords.slice(0, 4).map(w => w.word[0].toUpperCase())
    
    targetLetters.forEach(letter => {
      // Create array with target letter appearing ONCE
      const row = [letter]
      
      // Add 3 distractor letters (different from target)
      const availableDistractors = distractorLetters.filter(d => d !== letter)
      const shuffledDistractors = shuffle([...availableDistractors])
      row.push(...shuffledDistractors.slice(0, 3))
      
      // Shuffle the row so target isn't always first
      const shuffledRow = shuffle(row)
      
      // Store as [targetLetter, ...shuffledLetters]
      letterRows.push([letter, ...shuffledRow])
    })
    
    return letterRows
}

function generateWordPairs(targetWords: WordData[]): { left: string[], right: string[] } {
    // Take first 5 words
    const words = targetWords.slice(0, 5).map(w => w.word)
    
    // Left column stays in order
    const leftColumn = [...words]
    
    // Right column is shuffled (different order)
    const rightColumn = shuffle([...words])
    
    return { left: leftColumn, right: rightColumn }
}

function generatePictureSoundData(targetWords: WordData[]): {
    sections: Array<{
      sound: string
      displaySound: string
      words: Array<{ word: string; icon?: string; startsWithSound: boolean }>
    }>
  } {
    // Split words: first 4 should be 's' words, next 4 should be 'b' words
    const sWords = targetWords.slice(0, 4)
    const bWords = targetWords.slice(4, 8)
    
    // DEBUG: Log to verify data
    console.log('PictureSound Data:', {
      totalWords: targetWords.length,
      sWords: sWords.map(w => w.word),
      bWords: bWords.map(w => w.word)
    })
    
    return {
      sections: [
        {
          sound: 's',
          displaySound: '/s/',
          words: sWords.map(w => ({
            word: w.word,
            icon: w.icon,
            startsWithSound: w.word.toLowerCase().startsWith('s')
          }))
        },
        {
          sound: 'b',
          displaySound: '/b/',
          words: bWords.map(w => ({
            word: w.word,
            icon: w.icon,
            startsWithSound: w.word.toLowerCase().startsWith('b')
          }))
        }
      ]
    }
}

/**
 * Generate distractors (currently unused, keeping for future activities)
 */
function generateDistractors(
  targetWords: WordData[]
): WordData[] {
  const allWords = [...TIER_1_WORDS.common, ...TIER_1_WORDS.animals, ...TIER_1_WORDS.objects]
  const available = allWords.filter(
    w => !targetWords.find(t => t.word === w)
  )
  
  const shuffled = shuffle(available)
  return shuffled.slice(0, targetWords.length * 2).map(word => ({
    word,
    icon: WORD_ICONS[word]
  }))
}

// ============================================================================
// MAIN GENERATION FUNCTION
// ============================================================================

/**
 * Generate mood-based worksheet with curated word selection
 * NOTE: phonicsType parameter removed - now hardcoded to 'cvc' internally
 */
export function generateMoodBasedWorksheet(
    mood: MoodType
  ): WorksheetData {
    const constraints = MOOD_CONSTRAINTS[mood]
    const phonicsType: PhonicsType = 'cvc'
    
    // Get activity pool for this mood
    const activityPool = MOOD_ACTIVITY_POOLS[mood]
    
    // Shuffle and select 2 random activities
    const shuffled = shuffle([...activityPool])
    const selectedActivities = shuffled.slice(0, 2)
    
    // Generate data for each activity
    const activities: ActivitySection[] = selectedActivities.map(activityId => {
      const words = selectWordsForActivity(mood, activityId, constraints.maxItems)
      const section: ActivitySection = {
        activityId,
        words
      }
      
      // Add activity-specific data
      if (activityId === 'breatheCircle') {
        section.letterRows = generateLetterRows(words)
      }
      if (activityId === 'bigLetterCircle') {
        section.letterRows = generateBigLetterRows(words)
      }
      if (activityId === 'connectPairs') {
        section.wordPairs = generateWordPairs(words)
      }
      if (activityId === 'pictureSound') {
        const pictureSoundData = generatePictureSoundData(words)
        section.pictureSoundSections = pictureSoundData.sections
      }
      
      return section
    })
    
    // Generate distractors (for potential future use)
    const allWords = activities.flatMap(a => a.words)
    const distractors = generateDistractors(allWords)
    
    return {
      mood,
      phonicsType,
      constraints,
      activities,
      distractors
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

// Export types and constraints
export { MOOD_CONSTRAINTS, WORD_FAMILIES, WORD_ICONS }
export type { MoodType, PhonicsType, WordData, WorksheetData, MoodConstraints, ActivitySection }