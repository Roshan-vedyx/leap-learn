// src/data/wordBank.ts - FIXED VERSION
// Enhanced word database with proper theme filtering and JSON loading

export interface PerformanceMetrics {
  timePerWord: number
  hintsUsed: number
  resets: number
  completed: boolean
  difficulty: 'easy' | 'regular' | 'challenge'
  timestamp: number
}

export interface AdaptiveSession {
  userId: string
  age: number
  currentDifficulty: 'easy' | 'regular' | 'challenge'
  sessionMetrics: PerformanceMetrics[]
  adaptationTriggers: {
    strugglesInRow: number
    successesInRow: number
    lastAdaptation: number
  }
}

// KEEP EXISTING INTERFACES
export interface WordBankEntry {
  easy: string[]
  regular: string[]
  challenge: string[]
}

export interface WordBank {
  [theme: string]: WordBankEntry
}

// FIXED: Updated word bank with proper theme words
export const wordBank: WordBank = {
  animals: {
    easy: ["cat", "dog", "pig", "cow", "hen", "fish", "duck", "frog", "bird", "bee"],
    regular: ["tiger", "horse", "sheep", "snake", "shark", "whale", "turtle", "rabbit"],
    challenge: ["elephant", "giraffe", "penguin", "dolphin", "cheetah", "kangaroo"]
  },
  space: {
    easy: ["sun", "moon", "star", "sky", "rock", "ship", "mars", "earth"],
    regular: ["planet", "rocket", "comet", "orbit", "solar", "lunar", "galaxy", "alien"],
    challenge: ["astronaut", "telescope", "satellite", "universe", "spacecraft", "nebula"]
  },
  food: {
    easy: ["pie", "cake", "milk", "egg", "jam", "nuts", "corn", "rice", "bread", "soup"],
    regular: ["pizza", "apple", "grape", "orange", "carrot", "banana", "cookie", "pasta"],
    challenge: ["spaghetti", "hamburger", "strawberry", "sandwich", "broccoli", "spaghetti"]
  },
  vehicles: {
    easy: ["car", "bus", "bike", "boat", "train", "truck", "van", "taxi"],
    regular: ["airplane", "scooter", "rocket", "ferry", "subway", "tractor", "jeep"],
    challenge: ["helicopter", "motorcycle", "submarine", "ambulance", "bulldozer", "limousine"]
  }
}

// JSON word bank structure
interface WordEntry {
  word: string
  chunks: string[]
  alternative_chunks: string[]
  phonics_pattern: string
  syllables: number
  themes: string[]
  teaching_notes: string
}

interface EnhancedWordBankData {
  metadata: {
    total_words: number
    easy_count: number
    regular_count: number
    challenge_count: number
    version: string
    description: string
  }
  words: {
    easy: WordEntry[]
    regular: WordEntry[]
    challenge: WordEntry[]
  }
}

// FIXED: Adaptive system with proper theme filtering
export class AdaptiveWordBank {
  private enhancedWordBank: EnhancedWordBankData | null = null
  private session: AdaptiveSession
  private readonly STRUGGLE_THRESHOLD = 2
  private readonly SUCCESS_THRESHOLD = 3
  private readonly STRUGGLE_TIME_THRESHOLD = 30000
  private readonly HINT_STRUGGLE_THRESHOLD = 2
  private isJsonLoaded = false

  constructor(age: number = 10) {
    this.session = this.initializeSession(age)
    this.loadEnhancedWordBank()
  }

  private initializeSession(age: number): AdaptiveSession {
    return {
      userId: 'mock-user-' + Date.now(),
      age,
      currentDifficulty: this.getStartingDifficulty(age),
      sessionMetrics: [],
      adaptationTriggers: {
        strugglesInRow: 0,
        successesInRow: 0,
        lastAdaptation: Date.now()
      }
    }
  }

  private getStartingDifficulty(age: number): 'easy' | 'regular' | 'challenge' {
    if (age <= 8) return 'easy'
    if (age <= 11) return 'regular'
    return 'challenge'
  }

  private async loadEnhancedWordBank(): Promise<void> {
    try {
      console.log('🔍 Attempting to load wordBank.json...')
      const response = await fetch('/wordBank.json')
      
      if (response.ok) {
        this.enhancedWordBank = await response.json()
        this.isJsonLoaded = true
        console.log(`✅ Enhanced WordBank loaded: ${this.enhancedWordBank?.metadata.total_words} total words (v${this.enhancedWordBank?.metadata.version})`)
      } else {
        throw new Error(`HTTP ${response.status}: Enhanced WordBank file not found`)
      }
    } catch (error) {
      console.log('⚠️ JSON wordBank.json not found, using hardcoded fallback words')
      console.log('Error details:', error)
      this.isJsonLoaded = false
    }
  }

  // FIXED: Get words with proper theme filtering
  getWordsForTheme(theme: string): string[] {
    console.log(`🎯 Getting words for theme: ${theme}, difficulty: ${this.session.currentDifficulty}`)
    
    // If we have enhanced word bank and it's loaded, use it with filtering
    if (this.enhancedWordBank && this.isJsonLoaded) {
      const difficultyWords = this.enhancedWordBank.words[this.session.currentDifficulty]
      
      // FIXED: Proper theme filtering
      const filteredWords = difficultyWords.filter(wordEntry => {
        // Check if any of the word's themes match the requested theme
        const matchesTheme = wordEntry.themes.includes(theme) || 
                           wordEntry.themes.includes('universal') ||
                           (theme === 'all')
        
        return matchesTheme
      })
      
      const wordStrings = filteredWords.map(entry => entry.word.toUpperCase())
      console.log(`✅ Found ${wordStrings.length} ${this.session.currentDifficulty} words for theme: ${theme} (from JSON)`)
      console.log('Words:', wordStrings)
      return wordStrings
    }

    // FIXED: Fallback to properly filtered hardcoded word bank
    const themeWords = wordBank[theme]
    if (!themeWords) {
      console.log(`⚠️ Theme '${theme}' not found in hardcoded wordBank, using animals as fallback`)
      const fallbackWords = wordBank['animals'][this.session.currentDifficulty]
      return fallbackWords.map(w => w.toUpperCase())
    }
    
    const words = themeWords[this.session.currentDifficulty] || []
    console.log(`✅ Found ${words.length} ${this.session.currentDifficulty} words for theme: ${theme} (from hardcoded)`)
    console.log('Words:', words)
    return words.map(w => w.toUpperCase())
  }

  // FIXED: Get chunks with enhanced or fallback chunking
  getWordChunks(word: string): string[] {
    if (this.enhancedWordBank && this.isJsonLoaded) {
      const currentWords = this.enhancedWordBank.words[this.session.currentDifficulty]
      const wordEntry = currentWords.find(entry => 
        entry.word.toUpperCase() === word.toUpperCase()
      )

      if (wordEntry) {
        console.log(`📝 Using JSON chunks for ${word}:`, wordEntry.chunks)
        return wordEntry.chunks.map(chunk => chunk.toUpperCase())
      }
    }

    // Fallback to existing phonemic chunking
    console.log(`📝 Using fallback chunking for ${word}`)
    return breakWordIntoChunks(word)
  }

  // Get current difficulty
  getCurrentDifficulty(): 'easy' | 'regular' | 'challenge' {
    return this.session.currentDifficulty
  }

  // Performance tracking
  recordWordPerformance(metrics: Omit<PerformanceMetrics, 'difficulty' | 'timestamp'>): void {
    const fullMetrics: PerformanceMetrics = {
      ...metrics,
      difficulty: this.session.currentDifficulty,
      timestamp: Date.now()
    }

    this.session.sessionMetrics.push(fullMetrics)
    
    const struggledWithWord = this.didStruggle(fullMetrics)
    this.updateAdaptationTriggers(struggledWithWord, fullMetrics.completed)
    this.checkForAdaptation()
    
    this.logPerformanceInsights(fullMetrics, struggledWithWord)
  }

  private didStruggle(metrics: PerformanceMetrics): boolean {
    return (
      metrics.timePerWord > this.STRUGGLE_TIME_THRESHOLD ||
      metrics.hintsUsed >= this.HINT_STRUGGLE_THRESHOLD ||
      metrics.resets > 1 ||
      !metrics.completed
    )
  }

  private updateAdaptationTriggers(struggled: boolean, completed: boolean): void {
    if (struggled || !completed) {
      this.session.adaptationTriggers.strugglesInRow++
      this.session.adaptationTriggers.successesInRow = 0
    } else {
      this.session.adaptationTriggers.successesInRow++
      this.session.adaptationTriggers.strugglesInRow = 0
    }
  }

  private checkForAdaptation(): void {
    const triggers = this.session.adaptationTriggers
    const currentDifficulty = this.session.currentDifficulty

    if (triggers.strugglesInRow >= this.STRUGGLE_THRESHOLD) {
      if (currentDifficulty === 'challenge') {
        this.adaptDifficulty('regular', 'Difficulty adapted: Moving to regular words')
      } else if (currentDifficulty === 'regular') {
        this.adaptDifficulty('easy', 'Difficulty adapted: Moving to easier words')
      }
    }

    if (triggers.successesInRow >= this.SUCCESS_THRESHOLD) {
      if (currentDifficulty === 'easy') {
        this.adaptDifficulty('regular', 'Great job! Moving to regular words')
      } else if (currentDifficulty === 'regular') {
        this.adaptDifficulty('challenge', 'Excellent! Moving to challenge words')
      }
    }
  }

  private adaptDifficulty(newDifficulty: 'easy' | 'regular' | 'challenge', message: string): void {
    this.session.currentDifficulty = newDifficulty
    this.session.adaptationTriggers.strugglesInRow = 0
    this.session.adaptationTriggers.successesInRow = 0
    this.session.adaptationTriggers.lastAdaptation = Date.now()
    
    console.log(`🎯 ${message}`)
  }

  private logPerformanceInsights(metrics: PerformanceMetrics, struggled: boolean): void {
    const timeInSeconds = Math.round(metrics.timePerWord / 1000)
    console.log(`📊 Word completed in ${timeInSeconds}s, hints: ${metrics.hintsUsed}, resets: ${metrics.resets}, struggled: ${struggled}`)
  }
}

// ENHANCED: Phonemic chunking function (keeping existing logic)
export const breakWordIntoChunks = (word: string): string[] => {
  const upperWord = word.toUpperCase()
  
  // Handle very short words
  if (upperWord.length <= 2) {
    return [upperWord]
  }
  
  // Handle common short words that shouldn't be split
  const commonWholeWords = ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'HAD', 'BY', 'HOT', 'WHO', 'DID', 'YES', 'HIS', 'HAS', 'HAD']
  if (commonWholeWords.includes(upperWord)) {
    return [upperWord]
  }
  
  // Research-based phoneme patterns
  const patterns = [
    // Consonant blends at start
    { pattern: /^(BL|BR|CL|CR|DR|FL|FR|GL|GR|PL|PR|SC|SK|SL|SM|SN|SP|ST|SW|TR|TW|TH|SH|CH|WH)(.+)/, split: true },
    
    // Ending patterns
    { pattern: /(.+)(ING|TION|SION|NESS|MENT|ABLE|IBLE|ED|ER|EST|LY)$/, split: true },
    
    // Double consonants - split between
    { pattern: /(.+?)([BCDFGHJKLMNPQRSTVWXYZ])\2(.+)/, split: true },
    
    // Magic E pattern
    { pattern: /(.+)([BCDFGHJKLMNPQRSTVWXYZ])E$/, split: false },
    
    // Common prefixes
    { pattern: /^(UN|RE|IN|DIS|EN|NON|OVER|MIS|SUB|PRE|INTER|FORE|DE|OVER)(.+)/, split: true }
  ]
  
  // Check for specific chunking patterns
  for (const { pattern, split } of patterns) {
    const match = upperWord.match(pattern)
    if (match && split) {
      if (match.length === 3) {
        return [match[1], match[2]].filter(chunk => chunk.length > 0)
      } else if (match.length === 4) {
        // For double consonant pattern
        return [match[1] + match[2], match[2] + match[3]].filter(chunk => chunk.length > 0)
      }
    }
  }
  
  // Syllable-based chunking for longer words
  if (upperWord.length > 4) {
    const vowels = 'AEIOU'
    const chunks: string[] = []
    let currentChunk = ''
    let lastWasVowel = false
    
    for (let i = 0; i < upperWord.length; i++) {
      const char = upperWord[i]
      const isVowel = vowels.includes(char)
      
      currentChunk += char
      
      // Split after vowel-consonant-vowel pattern
      if (lastWasVowel && !isVowel && i < upperWord.length - 1 && vowels.includes(upperWord[i + 1])) {
        chunks.push(currentChunk)
        currentChunk = ''
      }
      
      lastWasVowel = isVowel
    }
    
    if (currentChunk) {
      chunks.push(currentChunk)
    }
    
    if (chunks.length > 1 && chunks.length <= 4) {
      return chunks
    }
  }
  
  // Simple fallback: split roughly in half for longer words
  if (upperWord.length > 6) {
    const midPoint = Math.ceil(upperWord.length / 2)
    return [upperWord.slice(0, midPoint), upperWord.slice(midPoint)]
  }
  
  // For 3-6 letter words, try to split intelligently
  if (upperWord.length >= 3) {
    const vowels = 'AEIOU'
    
    // Find a good split point (prefer after consonant, before vowel)
    for (let i = 1; i < upperWord.length - 1; i++) {
      const curr = upperWord[i]
      const next = upperWord[i + 1]
      
      if (!vowels.includes(curr) && vowels.includes(next)) {
        return [upperWord.slice(0, i + 1), upperWord.slice(i + 1)]
      }
    }
    
    // Fallback: split in middle
    const mid = Math.ceil(upperWord.length / 2)
    return [upperWord.slice(0, mid), upperWord.slice(mid)]
  }
  
  return [upperWord]
}

// Get words by theme and difficulty (backward compatibility)
export const getWordsByThemeAndDifficulty = (theme: string, difficulty: 'easy' | 'regular' | 'challenge'): string[] => {
  return wordBank[theme]?.[difficulty] || []
}

// Get all themes (backward compatibility)
export const getAllThemes = (): string[] => {
  return Object.keys(wordBank)
}

// MISSING EXPORT: Sentence templates for SentenceBuildingPage
export const sentenceTemplates = {
  animals: [
    { 
      template: "THE [ANIMAL] IS [ADJECTIVE]", 
      blanks: ["ANIMAL", "ADJECTIVE"],
      adjectives: ["BIG", "SMALL", "FAST", "CUTE", "FUNNY", "SMART", "WILD", "TAME"],
      hint: "Describe what the animal is like!"
    },
    { 
      template: "I SEE A [ADJECTIVE] [ANIMAL]", 
      blanks: ["ADJECTIVE", "ANIMAL"],
      adjectives: ["HUGE", "TINY", "HAPPY", "SLEEPY", "HUNGRY", "PLAYFUL"],
      hint: "What kind of animal do you see?"
    },
    { 
      template: "THE [ANIMAL] CAN [ACTION]", 
      blanks: ["ANIMAL", "ACTION"],
      actions: ["RUN", "JUMP", "SWIM", "FLY", "CLIMB", "HUNT", "SLEEP", "PLAY"],
      hint: "What can the animal do?"
    },
    { 
      template: "MY [COLOR] [ANIMAL] LIKES TO [ACTION]", 
      blanks: ["COLOR", "ANIMAL", "ACTION"],
      colors: ["RED", "BLUE", "GREEN", "BLACK", "WHITE", "BROWN", "GRAY"],
      actions: ["PLAY", "SLEEP", "EAT", "RUN", "HIDE", "SING"],
      hint: "Tell us about your pet!"
    }
  ],
  space: [
    { 
      template: "THE [SPACE] IS [ADJECTIVE]", 
      blanks: ["SPACE", "ADJECTIVE"],
      adjectives: ["BRIGHT", "DARK", "HUGE", "ROUND", "FAR", "CLOSE", "HOT", "COLD"],
      hint: "Describe what you see in space!"
    },
    { 
      template: "I FLY TO THE [SPACE] IN MY [VEHICLE]", 
      blanks: ["SPACE", "VEHICLE"],
      vehicles: ["ROCKET", "SPACESHIP", "SHUTTLE", "UFO"],
      hint: "How do you travel through space?"
    },
    { 
      template: "THE [SPACE] HAS [NUMBER] [OBJECT]", 
      blanks: ["SPACE", "NUMBER", "OBJECT"],
      numbers: ["ONE", "TWO", "MANY", "NO"],
      objects: ["MOONS", "RINGS", "ROCKS", "ALIENS", "STARS"],
      hint: "What can you count in space?"
    }
  ],
  food: [
    { 
      template: "I EAT [ADJECTIVE] [FOOD]", 
      blanks: ["ADJECTIVE", "FOOD"],
      adjectives: ["YUMMY", "SWEET", "HOT", "COLD", "FRESH", "CRUNCHY", "SOFT"],
      hint: "What kind of food do you like?"
    },
    { 
      template: "FOR [MEAL] I WANT [FOOD]", 
      blanks: ["MEAL", "FOOD"],
      meals: ["BREAKFAST", "LUNCH", "DINNER", "SNACK"],
      hint: "When do you eat this food?"
    },
    { 
      template: "THE [FOOD] TASTES [TASTE]", 
      blanks: ["FOOD", "TASTE"],
      tastes: ["SWEET", "SOUR", "SALTY", "SPICY", "GOOD", "GREAT"],
      hint: "How does the food taste?"
    }
  ],
  vehicles: [
    { 
      template: "THE [VEHICLE] IS [ADJECTIVE]", 
      blanks: ["VEHICLE", "ADJECTIVE"],
      adjectives: ["FAST", "SLOW", "BIG", "SMALL", "RED", "BLUE", "NEW", "OLD"],
      hint: "Describe the vehicle!"
    },
    { 
      template: "I RIDE THE [VEHICLE] TO [PLACE]", 
      blanks: ["VEHICLE", "PLACE"],
      places: ["SCHOOL", "HOME", "STORE", "PARK", "BEACH", "CITY"],
      hint: "Where are you going?"
    },
    { 
      template: "THE [VEHICLE] HAS [NUMBER] [PART]", 
      blanks: ["VEHICLE", "NUMBER", "PART"],
      numbers: ["TWO", "FOUR", "SIX", "MANY"],
      parts: ["WHEELS", "DOORS", "WINDOWS", "SEATS", "LIGHTS"],
      hint: "What parts does it have?"
    }
  ]
}