// src/data/enhancedWordBank.ts
// BACKWARD COMPATIBLE: Keeps all existing exports + adds adaptive features

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

// KEEP EXISTING WORD BANK (your original data)
export const wordBank: WordBank = {
  animals: {
    easy: ["cat", "dog", "pig", "cow", "hen", "fish", "duck", "frog"],
    regular: ["tiger", "horse", "sheep", "bird", "snake", "shark", "whale"],
    challenge: ["elephant", "giraffe", "penguin", "dolphin", "cheetah"]
  },
  space: {
    easy: ["sun", "moon", "star", "sky", "rock", "ship"],
    regular: ["planet", "rocket", "comet", "orbit", "solar", "lunar"],
    challenge: ["astronaut", "telescope", "satellite", "universe", "galaxy"]
  },
  food: {
    easy: ["pie", "cake", "milk", "egg", "jam", "nuts", "corn", "rice"],
    regular: ["pizza", "bread", "apple", "grape", "orange", "carrot"],
    challenge: ["spaghetti", "hamburger", "strawberry", "sandwich", "broccoli"]
  },
  vehicles: {
    easy: ["car", "bus", "bike", "boat", "train", "truck"],
    regular: ["airplane", "scooter", "rocket", "ferry", "subway"],
    challenge: ["helicopter", "motorcycle", "submarine", "ambulance", "bulldozer"]
  }
}

// KEEP EXISTING PHONEMIC CHUNKING (your original function)
export const breakWordIntoChunks = (word: string): string[] => {
  const upperWord = word.toUpperCase()
  
  const phoneticPatterns = [
    'TCH', 'DGE', 'IGH',
    'ING', 'TION', 'SION', 'NESS', 'MENT', 'ABLE', 'IBLE', 'TURE', 'SURE',
    'UN', 'RE', 'PRE', 'DIS', 'MIS', 'NON', 'OVER', 'UNDER', 'OUT', 'SUB',
    'AI', 'AY', 'EE', 'EA', 'IE', 'OA', 'OW', 'OU', 'UI', 'UE', 'OO', 'AU', 'AW', 'EW', 'OI', 'OY', 'EI', 'EY',
    'AR', 'ER', 'IR', 'OR', 'UR', 'EAR', 'AIR', 'OOR',
    'ST', 'SP', 'SC', 'SK', 'SM', 'SN', 'SW', 'SL', 'STR', 'SPR', 'SCR',
    'TR', 'BR', 'CR', 'DR', 'FR', 'GR', 'PR', 'PL', 'BL', 'CL', 'FL', 'GL',
    'NT', 'ND', 'MP', 'LK', 'LT', 'LF', 'NK',
    'TH', 'CH', 'SH', 'PH', 'WH', 'CK', 'NG'
  ]
  
  const sortedPatterns = phoneticPatterns.sort((a, b) => b.length - a.length)
  
  let remainingWord = upperWord
  const chunks: string[] = []
  
  while (remainingWord.length > 0) {
    let patternFound = false
    
    for (const pattern of sortedPatterns) {
      if (remainingWord.startsWith(pattern)) {
        chunks.push(pattern)
        remainingWord = remainingWord.slice(pattern.length)
        patternFound = true
        break
      }
    }
    
    if (!patternFound) {
      for (const pattern of sortedPatterns) {
        const patternIndex = remainingWord.indexOf(pattern)
        if (patternIndex > 0 && patternIndex <= 2) {
          chunks.push(remainingWord.slice(0, patternIndex))
          chunks.push(pattern)
          remainingWord = remainingWord.slice(patternIndex + pattern.length)
          patternFound = true
          break
        }
      }
    }
    
    if (!patternFound) {
      if (remainingWord.length <= 2) {
        chunks.push(remainingWord)
        break
      } else {
        const vowels = 'AEIOU'
        let splitPoint = 1
        
        for (let i = 1; i < remainingWord.length - 1; i++) {
          const prev = remainingWord[i - 1]
          const curr = remainingWord[i]
          const next = remainingWord[i + 1]
          
          if (vowels.includes(prev) && !vowels.includes(curr) && vowels.includes(next)) {
            splitPoint = i + 1
            break
          }
          
          if (curr === next && !vowels.includes(curr)) {
            splitPoint = i + 1
            break
          }
        }
        
        chunks.push(remainingWord.slice(0, splitPoint))
        remainingWord = remainingWord.slice(splitPoint)
      }
    }
  }
  
  const finalChunks = chunks.filter(chunk => chunk.length > 0)
  
  if (finalChunks.length > 4) {
    const consolidated: string[] = []
    let i = 0
    
    while (i < finalChunks.length && consolidated.length < 4) {
      if (i === finalChunks.length - 1) {
        consolidated.push(finalChunks[i])
        i++
      } else if (finalChunks[i].length === 1 && finalChunks[i + 1].length === 1) {
        consolidated.push(finalChunks[i] + finalChunks[i + 1])
        i += 2
      } else {
        consolidated.push(finalChunks[i])
        i++
      }
    }
    
    while (i < finalChunks.length) {
      consolidated[consolidated.length - 1] += finalChunks[i]
      i++
    }
    
    return consolidated
  }
  
  return finalChunks
}

// KEEP EXISTING API (unchanged - this is what SentenceBuildingPage imports)
export const getWordsByThemeAndDifficulty = (theme: string, difficulty: 'easy' | 'regular' | 'challenge'): string[] => {
  return wordBank[theme]?.[difficulty] || []
}

// KEEP EXISTING API
export const getAllThemes = (): string[] => {
  return Object.keys(wordBank)
}

// KEEP EXISTING SENTENCE TEMPLATES (your original data)
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
      adjectives: ["BRIGHT", "HUGE", "HOT", "COLD", "DISTANT", "AMAZING"],
      hint: "Describe something in space!"
    },
    { 
      template: "I FLY TO THE [SPACE]", 
      blanks: ["SPACE"],
      hint: "Where will you travel in space?"
    },
    { 
      template: "THE [SPACE] HAS [NUMBER] [OBJECT]", 
      blanks: ["SPACE", "NUMBER", "OBJECT"],
      numbers: ["TWO", "THREE", "MANY", "ZERO", "FIVE"],
      objects: ["RINGS", "MOONS", "STARS", "ROCKS", "CRATERS"],
      hint: "Count the objects in space!"
    }
  ],
  food: [
    { 
      template: "THE [FOOD] IS [TASTE]", 
      blanks: ["FOOD", "TASTE"],
      tastes: ["SWEET", "SOUR", "SPICY", "SALTY", "BITTER", "YUMMY"],
      hint: "How does the food taste?"
    },
    { 
      template: "I EAT [FOOD] FOR [MEAL]", 
      blanks: ["FOOD", "MEAL"],
      meals: ["BREAKFAST", "LUNCH", "DINNER", "SNACK"],
      hint: "When do you eat this food?"
    },
    { 
      template: "MY [TEMPERATURE] [FOOD] IS [ADJECTIVE]", 
      blanks: ["TEMPERATURE", "FOOD", "ADJECTIVE"],
      temperatures: ["HOT", "COLD", "WARM", "FROZEN"],
      adjectives: ["GOOD", "GREAT", "SOFT", "HARD"],
      hint: "Describe your food!"
    }
  ],
  vehicles: [
    { 
      template: "THE [VEHICLE] IS [SPEED]", 
      blanks: ["VEHICLE", "SPEED"],
      speeds: ["FAST", "SLOW", "QUICK"],
      hint: "How fast does it go?"
    },
    { 
      template: "I RIDE THE [VEHICLE] TO [PLACE]", 
      blanks: ["VEHICLE", "PLACE"],
      places: ["SCHOOL", "HOME", "STORE", "PARK"],
      hint: "Where are you going?"
    },
    { 
      template: "THE [VEHICLE] HAS [NUMBER] [PART]", 
      blanks: ["VEHICLE", "NUMBER", "PART"],
      numbers: ["TWO", "FOUR", "SIX", "MANY"],
      parts: ["WHEELS", "DOORS", "WINDOWS", "SEATS"],
      hint: "What parts does it have?"
    }
  ]
}

// NEW: JSON word bank structure for your wordBank.json
interface WordEntry {
  word: string
  chunks: string[]
  alternative_chunks: string[]
  phonics_pattern: string
  syllables: number
  themes: string[]
  teaching_notes: string
  use_context: string
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

// NEW: Adaptive system (invisible to existing code)
export class AdaptiveWordBank {
  private enhancedWordBank: EnhancedWordBankData | null = null
  private session: AdaptiveSession
  private readonly STRUGGLE_THRESHOLD = 2
  private readonly SUCCESS_THRESHOLD = 3
  private readonly STRUGGLE_TIME_THRESHOLD = 30000
  private readonly HINT_STRUGGLE_THRESHOLD = 2

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
      const response = await fetch('/wordBank.json')
      if (response.ok) {
        this.enhancedWordBank = await response.json()
        console.log(`📚 Enhanced WordBank loaded: ${this.enhancedWordBank?.metadata.total_words} total words (v${this.enhancedWordBank?.metadata.version})`)
      } else {
        throw new Error('Enhanced WordBank file not found')
      }
    } catch (error) {
      console.log('📝 Using existing hardcoded word bank (no JSON file needed)')
    }
  }

  // NEW API: Get words using adaptive system + optional JSON enhancement
  getWordsForTheme(theme: string): string[] {
    // If we have enhanced word bank, use it with filtering
    if (this.enhancedWordBank) {
      const difficultyWords = this.enhancedWordBank.words[this.session.currentDifficulty]
      const filteredWords = theme === 'all' ? 
        difficultyWords : 
        difficultyWords.filter(wordEntry => wordEntry.themes.includes(theme))
      
      const wordStrings = filteredWords.map(entry => entry.word.toUpperCase())
      console.log(`🎯 Got ${wordStrings.length} ${this.session.currentDifficulty} words for theme: ${theme} (from JSON)`)
      return wordStrings
    }

    // Fallback to existing hardcoded word bank
    const words = getWordsByThemeAndDifficulty(theme, this.session.currentDifficulty)
    console.log(`🎯 Got ${words.length} ${this.session.currentDifficulty} words for theme: ${theme} (from hardcoded)`)
    return words.map(w => w.toUpperCase())
  }

  // NEW API: Get chunks (enhanced or fallback)
  getWordChunks(word: string): string[] {
    if (this.enhancedWordBank) {
      const currentWords = this.enhancedWordBank.words[this.session.currentDifficulty]
      const wordEntry = currentWords.find(entry => 
        entry.word.toUpperCase() === word.toUpperCase()
      )

      if (wordEntry) {
        return wordEntry.chunks.map(chunk => chunk.toUpperCase())
      }
    }

    // Fallback to existing phonemic chunking
    return breakWordIntoChunks(word)
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
        this.adaptDifficulty('regular', 'Great job! Moving to regular difficulty')
      } else if (currentDifficulty === 'regular') {
        this.adaptDifficulty('challenge', 'Excellent! Moving to challenge words')
      }
    }
  }

  private adaptDifficulty(newDifficulty: 'easy' | 'regular' | 'challenge', reason: string): void {
    const oldDifficulty = this.session.currentDifficulty
    this.session.currentDifficulty = newDifficulty
    this.session.adaptationTriggers.lastAdaptation = Date.now()
    this.session.adaptationTriggers.strugglesInRow = 0
    this.session.adaptationTriggers.successesInRow = 0

    console.log(`🎯 ADAPTATION: ${oldDifficulty} → ${newDifficulty}. ${reason}`)
  }

  private logPerformanceInsights(metrics: PerformanceMetrics, struggled: boolean): void {
    const timeMsg = `⏱️ Time: ${Math.round(metrics.timePerWord / 1000)}s`
    const hintsMsg = `💡 Hints: ${metrics.hintsUsed}`
    const resetsMsg = `🔄 Resets: ${metrics.resets}`
    const difficultyMsg = `📊 Difficulty: ${metrics.difficulty}`
    const statusMsg = struggled ? '❌ Struggled' : '✅ Success'
    
    console.log(`${statusMsg} | ${timeMsg} | ${hintsMsg} | ${resetsMsg} | ${difficultyMsg}`)
  }

  getCurrentDifficulty(): 'easy' | 'regular' | 'challenge' {
    return this.session.currentDifficulty
  }

  getSessionAnalytics(): {
    totalWords: number
    averageTime: number
    totalHints: number
    successRate: number
    currentDifficulty: string
  } {
    const metrics = this.session.sessionMetrics
    if (metrics.length === 0) {
      return {
        totalWords: 0,
        averageTime: 0,
        totalHints: 0,
        successRate: 0,
        currentDifficulty: this.session.currentDifficulty
      }
    }

    return {
      totalWords: metrics.length,
      averageTime: Math.round(metrics.reduce((sum, m) => sum + m.timePerWord, 0) / metrics.length / 1000),
      totalHints: metrics.reduce((sum, m) => sum + m.hintsUsed, 0),
      successRate: Math.round((metrics.filter(m => m.completed).length / metrics.length) * 100),
      currentDifficulty: this.session.currentDifficulty
    }
  }

  setDifficulty(difficulty: 'easy' | 'regular' | 'challenge'): void {
    this.session.currentDifficulty = difficulty
    console.log(`🎯 Manual difficulty set to: ${difficulty}`)
  }
}