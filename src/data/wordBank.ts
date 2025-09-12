// src/data/wordBank.ts - UPDATED VERSION
// Enhanced word database with TTS chunks support

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

export interface WordBankEntry {
  easy: string[]
  regular: string[]
  challenge: string[]
}

export interface WordBank {
  [theme: string]: WordBankEntry
}

// UPDATED: JSON word bank structure with TTS chunks
interface WordEntry {
  word: string
  chunks: string[]
  tts_chunks: string[]  // NEW: Better pronunciation chunks
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
  words: WordEntry[]
}

// Fallback hardcoded word bank
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
    challenge: ["spaghetti", "hamburger", "strawberry", "sandwich", "broccoli", "watermelon"]
  },
  vehicles: {
    easy: ["car", "bus", "bike", "boat", "train", "truck", "van", "taxi"],
    regular: ["airplane", "scooter", "rocket", "ferry", "subway", "tractor", "jeep"],
    challenge: ["helicopter", "motorcycle", "submarine", "ambulance", "bulldozer", "limousine"]
  }
}

// UPDATED: Adaptive system with TTS chunks support
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
      const response = await fetch('/words.json')
      
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

  // Get words for theme
  getWordsForTheme(theme: string): string[] {
    console.log(`🎯 Getting words for theme: ${theme}, difficulty: ${this.session.currentDifficulty}`)
    
    if (this.enhancedWordBank && this.isJsonLoaded) {
      // NEW: Handle your flat array structure
      const allWords = this.enhancedWordBank.words
      
      const filteredWords = allWords.filter(entry => {
        // Filter by complexity/difficulty
        const matchesDifficulty = entry.complexity === this.session.currentDifficulty
        
        // Filter by theme
        const matchesTheme = entry.themes.includes(theme) || entry.themes.includes('universal')
        
        return matchesDifficulty && matchesTheme
      })
      
      const wordStrings = filteredWords.map(entry => entry.word.toUpperCase())
      const randomizedWords = wordStrings.sort(() => Math.random() - 0.5)
      console.log(`✅ Found ${randomizedWords.length} ${this.session.currentDifficulty} words for theme: ${theme} (from JSON)`)
      return randomizedWords
    }
  
    // Fallback to hardcoded word bank
    const themeWords = wordBank[theme]
    if (!themeWords) {
      console.log(`⚠️ Theme '${theme}' not found in hardcoded wordBank, using animals as fallback`)
      const fallbackWords = wordBank['animals'][this.session.currentDifficulty]
      return fallbackWords.map(w => w.toUpperCase())
    }
    
    const words = themeWords[this.session.currentDifficulty] || []
    const randomizedWords = words.sort(() => Math.random() - 0.5)
    console.log(`✅ Found ${randomizedWords.length} ${this.session.currentDifficulty} words for theme: ${theme} (from hardcoded)`)
    return randomizedWords.map(w => w.toUpperCase())
  }

  // NEW: Get words by slot type and theme from JSON
  getAllWordsForSlotType(slotType: string, theme: string): string[] {
    if (!this.enhancedWordBank || !this.isJsonLoaded) return []
    
    // NEW: Handle your flat array structure
    const allWords = this.enhancedWordBank.words
    
    const filtered = allWords.filter(entry => {
      // Filter by theme
      const matchesTheme = entry.themes.includes(theme) || entry.themes.includes('universal')
      
      // Filter by slot type
      const matchesSlotType = this.getSlotTypeForWord(entry, slotType)
      
      return matchesTheme && matchesSlotType
    })
    
    return filtered.map(entry => entry.word.toUpperCase()).slice(0, 8)
  }

  private getSlotTypeForWord(entry: WordEntry, slotType: string): boolean {
    // Map slot types to your actual JSON themes and word patterns
    switch (slotType) {
      case 'adjective':
        // Look for descriptive words, emotions, or check the word itself
        return entry.themes.includes('emotions') || 
               entry.themes.includes('universal') ||
               ['big', 'small', 'fast', 'slow', 'hot', 'cold', 'bright', 'dark', 'round', 'tall', 'wide', 'soft', 'hard'].includes(entry.word.toLowerCase())
               
      case 'action': 
        // Look for action-related words or check phonics patterns
        return entry.phonics_focus === 'suffix_ing' ||
               ['run', 'jump', 'swim', 'fly', 'walk', 'play', 'eat', 'sleep', 'help'].includes(entry.word.toLowerCase())
               
      case 'space':
        return entry.themes.includes('space')
        
      case 'animal':
        return entry.themes.includes('animals')
        
      case 'food':
        return entry.themes.includes('universal') && 
               ['cake', 'milk', 'bread', 'apple', 'orange', 'food'].includes(entry.word.toLowerCase())
               
      case 'color':
        return ['blue', 'green', 'yellow', 'white', 'black', 'brown', 'purple', 'pink', 'gray'].includes(entry.word.toLowerCase())
        
      default:
        return entry.themes.includes(slotType) || entry.themes.includes('universal')
    }
  }

  // UPDATED: Get visual chunks for game pieces
  getWordChunks(word: string): string[] {
    if (this.enhancedWordBank && this.isJsonLoaded) {
      const currentWords = this.enhancedWordBank.words
      const wordEntry = currentWords.find(entry => 
        entry.word.toUpperCase() === word.toUpperCase()
      )

      if (wordEntry) {
        console.log(`📝 Using JSON visual chunks for ${word}:`, wordEntry.chunks)
        return wordEntry.chunks.map(chunk => chunk.toUpperCase())
      }
    }

    // Fallback to phonetic chunking
    console.log(`📝 Using fallback chunking for ${word}`)
    return breakWordIntoChunks(word)
  }

  // NEW: Get TTS chunks for better pronunciation
  getTTSChunks(word: string): string[] {
    if (this.enhancedWordBank && this.isJsonLoaded) {
      const currentWords = this.enhancedWordBank.words
      const wordEntry = currentWords.find(entry => 
        entry.word.toUpperCase() === word.toUpperCase()
      )

      if (wordEntry && wordEntry.tts_chunks) {
        console.log(`🎵 Using TTS chunks for ${word}:`, wordEntry.tts_chunks)
        return wordEntry.tts_chunks
      }
    }

    // Fallback to regular chunks if no TTS chunks available
    console.log(`🎵 Using fallback chunks for TTS: ${word}`)
    return this.getWordChunks(word)
  }

  // Performance tracking
  recordWordPerformance(metrics: PerformanceMetrics): void {
    const fullMetrics = {
      ...metrics,
      difficulty: this.session.currentDifficulty,
      timestamp: Date.now()
    }
    
    this.session.sessionMetrics.push(fullMetrics)
    
    const timeInSeconds = metrics.timePerWord / 1000
    const struggled = timeInSeconds > 30 || metrics.hintsUsed >= 2 || metrics.resets > 0
    
    this.logPerformanceInsights(fullMetrics, struggled)
    
    if (struggled) {
      this.session.adaptationTriggers.strugglesInRow++
      this.session.adaptationTriggers.successesInRow = 0
      
      if (this.session.adaptationTriggers.strugglesInRow >= this.STRUGGLE_THRESHOLD) {
        this.considerDifficultyDecrease()
      }
    } else {
      this.session.adaptationTriggers.successesInRow++
      this.session.adaptationTriggers.strugglesInRow = 0
      
      if (this.session.adaptationTriggers.successesInRow >= this.SUCCESS_THRESHOLD) {
        this.considerDifficultyIncrease()
      }
    }
  }

  private considerDifficultyDecrease(): void {
    const currentDifficulty = this.session.currentDifficulty
    if (currentDifficulty === 'challenge') {
      this.adaptDifficulty('regular', 'Adjusting to regular words for better success')
    } else if (currentDifficulty === 'regular') {
      this.adaptDifficulty('easy', 'Moving to easier words for confidence building')
    }
  }

  private considerDifficultyIncrease(): void {
    const currentDifficulty = this.session.currentDifficulty
    if (currentDifficulty === 'easy') {
      this.adaptDifficulty('regular', 'Great progress! Moving to regular words')
    } else if (currentDifficulty === 'regular') {
      this.adaptDifficulty('challenge', 'Excellent! Moving to challenge words')
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

// Get words by theme and difficulty (for SentenceBuildingPage)
export const getWordsByThemeAndDifficulty = (theme: string, difficulty: 'easy' | 'regular' | 'challenge'): string[] => {
  return wordBank[theme]?.[difficulty] || []
}

// Get all themes (backward compatibility)
export const getAllThemes = (): string[] => {
  return Object.keys(wordBank)
}

// Sentence templates for SentenceBuildingPage
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
      template: "I RIDE IN A [ADJECTIVE] [VEHICLE]", 
      blanks: ["ADJECTIVE", "VEHICLE"],
      adjectives: ["FAST", "SLOW", "COOL", "SHINY", "NEW", "BIG"],
      hint: "What kind of vehicle do you like?"
    },
    { 
      template: "THE [VEHICLE] CAN [ACTION]", 
      blanks: ["VEHICLE", "ACTION"],
      actions: ["FLY", "DRIVE", "SAIL", "FLOAT", "SPEED", "STOP"],
      hint: "What can the vehicle do?"
    }
  ]
}

// Fallback phonemic chunking function
export const breakWordIntoChunks = (word: string): string[] => {
  const upperWord = word.toUpperCase()
  
  if (upperWord.length <= 2) {
    return [upperWord]
  }
  
  const commonWholeWords = ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'HAD', 'BY', 'HOT', 'WHO', 'DID', 'YES', 'HIS', 'HAS', 'HAD']
  if (commonWholeWords.includes(upperWord)) {
    return [upperWord]
  }
  
  // Basic phonemic patterns
  const patterns = [
    { pattern: /^(BL|BR|CL|CR|DR|FL|FR|GL|GR|PL|PR|SC|SK|SL|SM|SN|SP|ST|SW|TR|TW|TH|SH|CH|WH)(.+)/, split: true },
    { pattern: /(.+)(ING|TION|SION|NESS|MENT|ABLE|IBLE|ED|ER|EST|LY)$/, split: true },
    { pattern: /(.+?)([BCDFGHJKLMNPQRSTVWXYZ])\2(.+)/, split: true }
  ]
  
  for (const { pattern } of patterns) {
    const match = upperWord.match(pattern)
    if (match) {
      return [match[1], match[2]]
    }
  }
  
  // Simple split for longer words
  if (upperWord.length >= 4) {
    const mid = Math.ceil(upperWord.length / 2)
    return [upperWord.slice(0, mid), upperWord.slice(mid)]
  }
  
  return [upperWord]
}