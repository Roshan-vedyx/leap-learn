// src/services/TemplateStoryService.ts
import { db } from '@/lib/firebase-config'
import { collection, query, where, limit, getDocs } from 'firebase/firestore'
import type { MultiVersionStory, ComplexityLevel } from '@/types'

export class TemplateStoryService {
  static async generateStory(
    selectedInterests: string[], 
    brainState: string
  ): Promise<MultiVersionStory> {
    
    // 1. Load ocean template (only one for now)
    const template = await this.loadTemplate('ocean-discovery-001')
    
    // 2. Fill all three complexity levels
    const simpleStory = await this.fillComplexityLevel(template.structure.simple, 'easy')
    const fullStory = await this.fillComplexityLevel(template.structure.full, 'regular')
    const challengeStory = await this.fillComplexityLevel(template.structure.challenge, 'challenge')
    
    // 3. Return in existing MultiVersionStory format
    return {
      id: `template-${Date.now()}`,
      title: template.title,
      concept: `An ocean adventure story`,
      interests: selectedInterests,
      level: 'Adaptive (Grades 3-6)',
      phonicsSkills: template.phonics_progression.simple || ['consonant blends', 'long vowels'],
      difficulty: 3,
      themes: selectedInterests,
      versions: {
        simple: { 
          content: simpleStory, 
          readingTime: template.metadata.estimated_completion_time.simple,
          vocabulary: 'basic', 
          averageWordsPerSentence: 6, 
          phonicsComplexity: 'basic' 
        },
        full: { 
          content: fullStory, 
          readingTime: template.metadata.estimated_completion_time.full,
          vocabulary: 'standard', 
          averageWordsPerSentence: 12, 
          phonicsComplexity: 'intermediate' 
        }, 
        challenge: { 
          content: challengeStory, 
          readingTime: template.metadata.estimated_completion_time.challenge,
          vocabulary: 'advanced', 
          averageWordsPerSentence: 18, 
          phonicsComplexity: 'advanced' 
        }
      }
    }
  }

  private static async fillComplexityLevel(complexityLevel: any, complexity: string) {
    const sections = []
    
    // Iterate through each section (beginning, middle, end, etc.)
    for (const [sectionName, sectionData] of Object.entries(complexityLevel)) {
      const filledSection = await this.fillSection(sectionData as any, complexity)
      sections.push({
        type: 'paragraph',
        text: filledSection,
        phonicsFocus: sectionData.phonics_emphasis || []
      })
    }
    
    return sections
  }

  private static async fillSection(section: any, complexity: string): Promise<string> {
    let text = section.text_template
    const usedWords = new Map<string, string>() // Track words for repetition
    
    for (const slot of section.word_slots) {
      const word = await this.getWordForSlot(slot, complexity, usedWords)
      
      // Handle repetition by reusing the same word for same slot names
      if (slot.allow_repetition && usedWords.has(slot.slot_name)) {
        const reusedWord = usedWords.get(slot.slot_name)!
        text = text.replace(`[${slot.slot_name}]`, reusedWord)
      } else {
        text = text.replace(`[${slot.slot_name}]`, word)
        usedWords.set(slot.slot_name, word)
      }
    }
    
    return text
  }

  private static async getWordForSlot(
    slot: any, 
    complexity: string, 
    usedWords: Map<string, string>
  ): Promise<string> {
    
    // Check if we should reuse a word
    if (slot.allow_repetition && usedWords.has(slot.slot_name)) {
      return usedWords.get(slot.slot_name)!
    }

    try {
      // Build Firestore query using v9+ modular syntax
      const wordsRef = collection(db, 'words')
      let q = query(
        wordsRef,
        where('complexity', '==', complexity),
        limit(10)
      )

      // Add theme filtering if themes are provided
      if (slot.required_themes && slot.required_themes.length > 0) {
        q = query(
          wordsRef,
          where('complexity', '==', complexity),
          where('themes', 'array-contains-any', slot.required_themes),
          limit(10)
        )
      }

      const querySnapshot = await getDocs(q)
      const words = querySnapshot.docs.map(doc => doc.data())
      
      if (words.length === 0) {
        // Fallback: try with just 'universal' theme
        const fallbackQuery = query(
          wordsRef,
          where('complexity', '==', complexity),
          where('themes', 'array-contains', 'universal'),
          limit(5)
        )
        
        const fallbackSnapshot = await getDocs(fallbackQuery)
        const fallbackWords = fallbackSnapshot.docs.map(doc => doc.data())
        
        if (fallbackWords.length > 0) {
          return this.selectBestWord(fallbackWords, slot)
        }
      }

      // Select best word from results
      return this.selectBestWord(words, slot)
      
    } catch (error) {
      console.warn('Error fetching word from Firestore:', error)
      return this.getFallbackWord(slot)
    }
  }

  private static selectBestWord(words: any[], slot: any): string {
    if (words.length === 0) {
      return this.getFallbackWord(slot)
    }

    // Try to match context hints first
    if (slot.context_hints && slot.context_hints.length > 0) {
      for (const hint of slot.context_hints) {
        const hintMatch = words.find(w => 
          w.word.toLowerCase().includes(hint.toLowerCase()) ||
          hint.toLowerCase().includes(w.word.toLowerCase())
        )
        if (hintMatch) return hintMatch.word
      }
    }

    // Try to match phonics preferences
    if (slot.phonics_preference && slot.phonics_preference.length > 0) {
      const phonicsMatch = words.find(w => 
        slot.phonics_preference.includes(w.phonics_focus)
      )
      if (phonicsMatch) return phonicsMatch.word
    }

    // Return first available word
    return words[0].word
  }

  private static getFallbackWord(slot: any): string {
    const fallbacks: Record<string, string> = {
      CHARACTER: 'Sam',
      LOCATION: 'ocean',
      CREATURE: 'fish',
      ADJECTIVE: 'happy',
      EXCLAMATION: 'Wow',
      ACTION: 'play',
      NOUN: 'thing',
      EMOTION: 'joy',
      DIRECTION: 'nearby',
      TIME_PERIOD: 'summer',
      TIME_REFERENCE: 'yesterday',
      BODY_PART: 'eyes'
    }
    
    return fallbacks[slot.slot_name] || 'something'
  }

  private static async loadTemplate(templateName: string) {
    try {
      // Import template directly from src/data
      const template = await import(`@/data/story-templates/ocean/${templateName}.json`)
      return template.default || template
    } catch (error) {
      console.error('Error loading template:', error)
      throw new Error(`Failed to load template: ${templateName}`)
    }
  }
}