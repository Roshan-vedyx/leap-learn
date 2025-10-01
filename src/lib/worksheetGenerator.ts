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

interface WorksheetData {
  mood: MoodType
  phonicsType: PhonicsType
  activityType: string
  constraints: MoodConstraints
  words: WordData[]
  distractors: WordData[]
  familyRows?: string[][] // For breatheCircle activity
}

// ============================================================================
// TIER 1: Easiest wins - concrete, high-frequency, imageable
// ============================================================================
const TIER_1_WORDS = {
  common: ['cat', 'dog', 'sun', 'hat', 'bed', 'run', 'sit', 'top', 'bat', 'red', 'mom', 'dad', 'pig', 'fox', 'hen', 'bus', 'cup', 'map'],
  animals: ['cat', 'dog', 'pig', 'fox', 'hen', 'bug', 'bat', 'rat'],
  objects: ['sun', 'hat', 'bed', 'map', 'cup', 'bus', 'box', 'pen', 'pot'],
  actions: ['run', 'sit', 'hop', 'dig', 'hit', 'nap']
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
 */
function selectWordsForActivity(
  mood: MoodType,
  phonicsType: PhonicsType,
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
function generateFamilyRows(targetWords: WordData[]): string[][] {
    const familyRows: string[][] = []

    targetWords.forEach(wordData => {
        const word = wordData.word
        
        // Find which family this word belongs to
        for (const [family, words] of Object.entries(WORD_FAMILIES)) {
        if (words.includes(word)) {
            // Add a row with this word PLUS 2 others from same family
            const familyWords = words.filter(w => w !== word) // exclude target
            const shuffled = shuffle([...familyWords])
            familyRows.push([word, ...shuffled.slice(0, 2)]) // Include target word in row
            break
        }
        }
    })

    return familyRows
}

/**
 * Generate distractors (currently unused, keeping for future activities)
 */
function generateDistractors(
  targetWords: WordData[],
  phonicsType: PhonicsType
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
 */
export function generateMoodBasedWorksheet(
  mood: MoodType,
  phonicsType: PhonicsType,
  activityType: string
): WorksheetData {
  const constraints = MOOD_CONSTRAINTS[mood]
  
  // Select curated words
  const words = selectWordsForActivity(mood, phonicsType, activityType, constraints.maxItems)
  const distractors = generateDistractors(words, phonicsType)
  
  // Base worksheet data
  const worksheetData: WorksheetData = {
    mood,
    phonicsType,
    activityType,
    constraints,
    words,
    distractors,
  }
  
  // Special handling for breatheCircle activity
  if (activityType === 'breatheCircle') {
    worksheetData.familyRows = generateFamilyRows(words)
  }
  
  return worksheetData
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
export type { MoodType, PhonicsType, WordData, WorksheetData, MoodConstraints }