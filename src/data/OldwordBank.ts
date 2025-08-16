// src/data/wordBank.ts
// Enhanced word database with phonemic awareness focus

export interface WordBankEntry {
    easy: string[]
    regular: string[]
    challenge: string[]
  }
  
  export interface WordBank {
    [theme: string]: WordBankEntry
  }
  
  // Words selected specifically for phonemic patterns kids need to master
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
  
  // COMPLETELY NEW: Enhanced phonemic chunking function
  export const breakWordIntoChunks = (word: string): string[] => {
    const upperWord = word.toUpperCase()
    
    // Research-based phoneme patterns that dyslexic brains need to recognize
    const phoneticPatterns = [
      // Trigraphs (three letters, one sound) - check first
      'TCH', 'DGE', 'IGH',
      
      // Common suffixes (keep together for meaning)
      'ING', 'TION', 'SION', 'NESS', 'MENT', 'ABLE', 'IBLE', 'TURE', 'SURE',
      
      // Common prefixes (keep together for meaning)
      'UN', 'RE', 'PRE', 'DIS', 'MIS', 'NON', 'OVER', 'UNDER', 'OUT', 'SUB',
      
      // Vowel teams (two vowels working together)
      'AI', 'AY', 'EE', 'EA', 'IE', 'OA', 'OW', 'OU', 'UI', 'UE', 'OO', 'AU', 'AW', 'EW', 'OI', 'OY', 'EI', 'EY',
      
      // R-controlled vowels (critical for reading)
      'AR', 'ER', 'IR', 'OR', 'UR', 'EAR', 'AIR', 'OOR',
      
      // Beginning blends (consonant clusters)
      'ST', 'SP', 'SC', 'SK', 'SM', 'SN', 'SW', 'SL', 'STR', 'SPR', 'SCR',
      'TR', 'BR', 'CR', 'DR', 'FR', 'GR', 'PR', 'PL', 'BL', 'CL', 'FL', 'GL',
      
      // Ending blends
      'NT', 'ND', 'MP', 'LK', 'LT', 'LF', 'NK',
      
      // Digraphs (two letters, one sound)
      'TH', 'CH', 'SH', 'PH', 'WH', 'CK', 'NG'
    ]
    
    // Sort by length (longest first) to catch complex patterns first
    const sortedPatterns = phoneticPatterns.sort((a, b) => b.length - a.length)
    
    let remainingWord = upperWord
    const chunks: string[] = []
    
    while (remainingWord.length > 0) {
      let patternFound = false
      
      // Look for phonetic patterns starting from the beginning
      for (const pattern of sortedPatterns) {
        if (remainingWord.startsWith(pattern)) {
          chunks.push(pattern)
          remainingWord = remainingWord.slice(pattern.length)
          patternFound = true
          break
        }
      }
      
      // If no pattern at start, look for patterns within first few characters
      if (!patternFound) {
        for (const pattern of sortedPatterns) {
          const patternIndex = remainingWord.indexOf(pattern)
          if (patternIndex > 0 && patternIndex <= 2) {
            // Add the part before the pattern
            chunks.push(remainingWord.slice(0, patternIndex))
            chunks.push(pattern)
            remainingWord = remainingWord.slice(patternIndex + pattern.length)
            patternFound = true
            break
          }
        }
      }
      
      // If still no pattern, use intelligent syllable breaking
      if (!patternFound) {
        if (remainingWord.length <= 2) {
          chunks.push(remainingWord)
          break
        } else {
          // Find vowel-consonant-vowel pattern for syllable division
          const vowels = 'AEIOU'
          let splitPoint = 1
          
          for (let i = 1; i < remainingWord.length - 1; i++) {
            const prev = remainingWord[i - 1]
            const curr = remainingWord[i]
            const next = remainingWord[i + 1]
            
            // Vowel-Consonant-Vowel: split after consonant
            if (vowels.includes(prev) && !vowels.includes(curr) && vowels.includes(next)) {
              splitPoint = i + 1
              break
            }
            
            // Double consonant: split between consonants
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
    
    // Clean up and ensure reasonable chunk count (2-4 chunks for game playability)
    const finalChunks = chunks.filter(chunk => chunk.length > 0)
    
    // If we have too many chunks, consolidate some
    if (finalChunks.length > 4) {
      const consolidated: string[] = []
      let i = 0
      
      while (i < finalChunks.length && consolidated.length < 4) {
        if (i === finalChunks.length - 1) {
          consolidated.push(finalChunks[i])
          i++
        } else if (finalChunks[i].length === 1 && finalChunks[i + 1].length === 1) {
          // Combine two single letters
          consolidated.push(finalChunks[i] + finalChunks[i + 1])
          i += 2
        } else {
          consolidated.push(finalChunks[i])
          i++
        }
      }
      
      // Add any remaining to last chunk
      while (i < finalChunks.length) {
        consolidated[consolidated.length - 1] += finalChunks[i]
        i++
      }
      
      return consolidated
    }
    
    return finalChunks
  }
  
  // Get words by theme and difficulty (unchanged)
  export const getWordsByThemeAndDifficulty = (theme: string, difficulty: 'easy' | 'regular' | 'challenge'): string[] => {
    return wordBank[theme]?.[difficulty] || []
  }
  
  // Get all themes (unchanged)
  export const getAllThemes = (): string[] => {
    return Object.keys(wordBank)
  }
  
  // ENHANCED: Sentence templates with better scaffolding and word categorization
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