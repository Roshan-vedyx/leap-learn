// src/services/worksheetGenerator.ts
interface Word {
    id: string
    word: string
    complexity: string
    phonics_focus: string
    chunks: string[]
    alternative_chunks: string[]
    themes: string[]
  }
  
  interface GenerateWorksheetParams {
    words: Word[]
    pattern: string
    difficulty: 'easy' | 'regular' | 'challenge'
    wordCount: number
  }
  
  interface WorksheetActivity {
    type: 'word_sort' | 'fill_pattern' | 'build_word'
    title: string
    instructions: string
    content: any
  }
  
  interface WorksheetData {
    selectedPattern: string
    difficulty: string
    wordCount: number
    words: Word[]
    activities: WorksheetActivity[]
  }
  
  // Helper function to count syllables (simple approximation)
  const countSyllables = (word: string): number => {
    const vowels = 'aeiouy'
    let count = 0
    let prevWasVowel = false
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i].toLowerCase())
      if (isVowel && !prevWasVowel) {
        count++
      }
      prevWasVowel = isVowel
    }
    
    // Handle silent 'e'
    if (word.toLowerCase().endsWith('e') && count > 1) {
      count--
    }
    
    return Math.max(1, count)
  }
  
  // Create word sort activity (1 syllable vs 2+ syllables)
  const createWordSortActivity = (words: Word[]): WorksheetActivity => {
    const wordsWithSyllables = words.map(word => ({
      ...word,
      syllableCount: countSyllables(word.word)
    }))
  
    const oneSyllable = wordsWithSyllables
      .filter(w => w.syllableCount === 1)
      .slice(0, 6)
    
    const multiSyllable = wordsWithSyllables
      .filter(w => w.syllableCount > 1)
      .slice(0, 6)
  
    // Mix them up for the activity
    const mixedWords = [...oneSyllable, ...multiSyllable]
      .sort(() => Math.random() - 0.5)
  
    return {
      type: 'word_sort',
      title: 'Word Sort',
      instructions: 'Sort these words by the number of syllables. Write each word in the correct column.',
      content: {
        wordsToSort: mixedWords.map(w => w.word),
        columns: ['1 Syllable', '2+ Syllables'],
        answer: {
          '1 Syllable': oneSyllable.map(w => w.word),
          '2+ Syllables': multiSyllable.map(w => w.word)
        }
      }
    }
  }
  
  // Create fill in the pattern activity
  const createFillPatternActivity = (words: Word[], pattern: string): WorksheetActivity => {
    const selectedWords = words.slice(0, 8)
    
    const fillWords = selectedWords.map(word => {
      // Create fill-in-the-blank by removing 1-2 letters
      const wordChars = word.word.split('')
      const blanksToCreate = Math.min(2, Math.max(1, Math.floor(word.word.length / 3)))
      
      // Remove letters from middle positions
      const positions = []
      for (let i = 1; i < wordChars.length - 1; i++) {
        positions.push(i)
      }
      positions.sort(() => Math.random() - 0.5)
      
      const fillWord = [...wordChars]
      for (let i = 0; i < blanksToCreate && i < positions.length; i++) {
        fillWord[positions[i]] = '_'
      }
      
      return {
        original: word.word,
        fillIn: fillWord.join(''),
        missingLetters: positions.slice(0, blanksToCreate).map(pos => wordChars[pos]).join(', ')
      }
    })
  
    return {
      type: 'fill_pattern',
      title: 'Fill in the Pattern',
      instructions: 'Complete each word by filling in the missing letters.',
      content: {
        words: fillWords,
        pattern: pattern.replace(/_/g, ' ')
      }
    }
  }
  
  // Create build-a-word activity using chunks
  const createBuildWordActivity = (words: Word[]): WorksheetActivity => {
    const selectedWords = words.slice(0, 6)
    
    const buildWords = selectedWords.map(word => {
      // Use the chunks from the word data, or fall back to simple splitting
      const chunks = word.chunks && word.chunks.length > 1 
        ? word.chunks 
        : word.alternative_chunks || [word.word]
      
      return {
        word: word.word,
        chunks: chunks,
        scrambledChunks: [...chunks].sort(() => Math.random() - 0.5)
      }
    })
  
    return {
      type: 'build_word',
      title: 'Build-a-Word',
      instructions: 'Use the letter chunks to build each word. Write the complete word on the line.',
      content: {
        buildWords
      }
    }
  }
  
  export const generatePhonicsWorksheet = async (params: GenerateWorksheetParams): Promise<WorksheetData> => {
    const { words, pattern, difficulty, wordCount } = params
    
    // Filter words by pattern and difficulty
    const filteredWords = words.filter(word => 
      word.phonics_focus === pattern && 
      word.complexity === difficulty
    )
  
    if (filteredWords.length === 0) {
      throw new Error(`No words found for pattern "${pattern}" at ${difficulty} level`)
    }
  
    // Select the requested number of words
    const selectedWords = filteredWords
      .sort(() => Math.random() - 0.5) // Shuffle
      .slice(0, Math.min(wordCount, filteredWords.length))
  
    if (selectedWords.length < 5) {
      // If too few words, supplement with words from other difficulties
      const supplementWords = words
        .filter(word => word.phonics_focus === pattern && word.complexity !== difficulty)
        .sort(() => Math.random() - 0.5)
        .slice(0, wordCount - selectedWords.length)
      
      selectedWords.push(...supplementWords)
    }
  
    // Generate activities
    const activities: WorksheetActivity[] = [
      createWordSortActivity(selectedWords),
      createFillPatternActivity(selectedWords, pattern),
      createBuildWordActivity(selectedWords)
    ]
  
    return {
      selectedPattern: pattern,
      difficulty,
      wordCount: selectedWords.length,
      words: selectedWords,
      activities
    }
  }