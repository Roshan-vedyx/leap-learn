// src/data/wordBank.ts
// Hardcoded word database for word building game
// 3 themes × 5 words × 3 difficulty levels = 45 total words

export interface WordBankEntry {
    easy: string[]
    regular: string[]
    challenge: string[]
  }
  
  export interface WordBank {
    [theme: string]: WordBankEntry
  }
  
  export const wordBank: WordBank = {
    animals: {
      easy: ["cat", "dog", "pig", "cow", "hen"],
      regular: ["tiger", "elephant", "monkey", "rabbit"],
      challenge: ["rhinoceros", "hippopotamus", "chimpanzee"]
    },
    space: {
      easy: ["sun", "moon", "star", "sky"],
      regular: ["planet", "rocket", "comet", "galaxy"], 
      challenge: ["astronaut", "telescope", "satellite"]
    },
    food: {
      easy: ["pie", "cake", "milk", "egg", "jam"],
      regular: ["pizza", "burger", "cookie", "banana"],
      challenge: ["spaghetti", "hamburger", "strawberry"]
    },
    vehicles: {
      easy: ["car", "bus", "bike", "boat"],
      regular: ["airplane", "helicopter", "motorcycle"],
      challenge: ["submarine", "ambulance", "bulldozer"]
    }
  }
  
  // Helper function to break words into chunks for the game
  export const breakWordIntoChunks = (word: string): string[] => {
    const upperWord = word.toUpperCase()
    
    // Simple chunking rules - can be enhanced later
    const chunkPatterns = {
      // Common prefixes and suffixes
      'UN': ['UN'],
      'RE': ['RE'], 
      'ING': ['ING'],
      'ED': ['ED'],
      'ER': ['ER'],
      'EST': ['EST'],
      
      // Common consonant blends
      'TH': ['TH'],
      'CH': ['CH'],
      'SH': ['SH'],
      'PH': ['PH'],
      'ST': ['ST'],
      'SP': ['SP'],
      'SC': ['SC'],
      'SK': ['SK'],
      'SM': ['SM'],
      'SN': ['SN'],
      'SW': ['SW'],
      'TR': ['TR'],
      'BR': ['BR'],
      'CR': ['CR'],
      'DR': ['DR'],
      'FR': ['FR'],
      'GR': ['GR'],
      'PR': ['PR']
    }
    
    // For now, simple 2-3 chunk breakdown
    if (upperWord.length <= 3) {
      return [upperWord]
    } else if (upperWord.length <= 5) {
      // Split into 2 chunks
      const mid = Math.ceil(upperWord.length / 2)
      return [upperWord.slice(0, mid), upperWord.slice(mid)]
    } else {
      // Split into 3 chunks
      const third = Math.ceil(upperWord.length / 3)
      return [
        upperWord.slice(0, third),
        upperWord.slice(third, third * 2),
        upperWord.slice(third * 2)
      ]
    }
  }
  
  // Get words by theme and difficulty
  export const getWordsByThemeAndDifficulty = (theme: string, difficulty: 'easy' | 'regular' | 'challenge'): string[] => {
    return wordBank[theme]?.[difficulty] || []
  }
  
  // Get all themes
  export const getAllThemes = (): string[] => {
    return Object.keys(wordBank)
  }
  
  // Sentence templates for each theme
  export const sentenceTemplates = {
    animals: [
      { template: "THE [ANIMAL] IS [ADJECTIVE]", blanks: ["ANIMAL"], adjectives: ["BIG", "SMALL", "FAST", "CUTE"] },
      { template: "I SEE A [ANIMAL]", blanks: ["ANIMAL"] },
      { template: "THE [ANIMAL] CAN [ACTION]", blanks: ["ANIMAL"], actions: ["RUN", "JUMP", "SWIM", "FLY"] },
      { template: "MY [ANIMAL] IS [COLOR]", blanks: ["ANIMAL"], colors: ["RED", "BLUE", "GREEN", "BLACK"] }
    ],
    space: [
      { template: "THE [SPACE] IS [ADJECTIVE]", blanks: ["SPACE"], adjectives: ["BRIGHT", "BIG", "HOT", "COLD"] },
      { template: "I FLY TO THE [SPACE]", blanks: ["SPACE"] },
      { template: "THE [SPACE] HAS [NUMBER] [OBJECT]", blanks: ["SPACE"], numbers: ["TWO", "THREE", "MANY"], objects: ["RINGS", "MOONS", "STARS"] }
    ],
    food: [
      { template: "THE [FOOD] IS [TASTE]", blanks: ["FOOD"], tastes: ["SWEET", "SOUR", "SPICY", "GOOD"] },
      { template: "I EAT [FOOD] FOR [MEAL]", blanks: ["FOOD"], meals: ["LUNCH", "DINNER", "SNACK"] },
      { template: "MY [FOOD] IS [TEMPERATURE]", blanks: ["FOOD"], temperatures: ["HOT", "COLD", "WARM"] }
    ],
    vehicles: [
      { template: "THE [VEHICLE] IS [SPEED]", blanks: ["VEHICLE"], speeds: ["FAST", "SLOW", "QUICK"] },
      { template: "I RIDE THE [VEHICLE] TO [PLACE]", blanks: ["VEHICLE"], places: ["SCHOOL", "HOME", "STORE"] },
      { template: "THE [VEHICLE] HAS [NUMBER] [PART]", blanks: ["VEHICLE"], numbers: ["TWO", "FOUR"], parts: ["WHEELS", "DOORS", "WINDOWS"] }
    ]
  }