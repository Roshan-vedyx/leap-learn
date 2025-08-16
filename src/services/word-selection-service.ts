// Word Selection Service - Phase 1: Core word selection with 4-tier fallback
// This implements the smart word selection algorithm for template filling

import type { 
    WordDocument, 
    WordSelectionCriteria, 
    WordSelectionResult, 
    WordSlot,
    WordSelectionConfig,
    FallbackWordSet 
  } from './template-interfaces'
  
  /**
   * Configuration for word selection scoring and fallback behavior
   */
  const DEFAULT_WORD_SELECTION_CONFIG: WordSelectionConfig = {
    scoring_weights: {
      theme_match: 0.4,
      complexity_match: 0.3,
      phonics_bonus: 0.2,
      frequency_bonus: 0.1
    },
    fallback_strategy: {
      broaden_complexity: true,
      broaden_themes: true,
      use_universal_themes: true,
      use_fallback_words: true
    },
    quality_thresholds: {
      minimum_score: 30,
      ideal_score: 70,
      phonics_bonus_threshold: 10
    }
  }
  
  /**
   * Core word selection service with intelligent fallback strategies
   */
  export class WordSelectionService {
    private config: WordSelectionConfig
    private fallbackWords: FallbackWordSet
    
    constructor(config: Partial<WordSelectionConfig> = {}, fallbackWords: FallbackWordSet = {}) {
      this.config = { ...DEFAULT_WORD_SELECTION_CONFIG, ...config }
      this.fallbackWords = fallbackWords
    }
    
    /**
     * Main word selection method - implements 4-tier fallback strategy
     */
    async selectWord(
      criteria: WordSelectionCriteria,
      availableWords: WordDocument[],
      excludeWords: string[] = []
    ): Promise<WordSelectionResult | null> {
      
      // Tier 1: Exact Match - theme + complexity + word_type + phonics_preference
      let result = await this.tierOneExactMatch(criteria, availableWords, excludeWords)
      if (result && result.score >= this.config.quality_thresholds.ideal_score) {
        return result
      }
      
      // Tier 2: Broaden Complexity - ±1 complexity level
      result = await this.tierTwoBroadenComplexity(criteria, availableWords, excludeWords)
      if (result && result.score >= this.config.quality_thresholds.minimum_score) {
        return result
      }
      
      // Tier 3: Broaden Themes - Add 'universal' theme
      result = await this.tierThreeBroadenThemes(criteria, availableWords, excludeWords)
      if (result && result.score >= this.config.quality_thresholds.minimum_score) {
        return result
      }
      
      // Tier 4: Emergency Defaults - From fallbackWords.json
      result = await this.tierFourEmergencyDefaults(criteria, excludeWords)
      if (result) {
        return result
      }
      
      // Complete failure - should be very rare
      console.warn(`Failed to find word for slot: ${criteria.slot.slot_name}`)
      return null
    }
    
    /**
     * Tier 1: Exact match search with optimal scoring
     */
    private async tierOneExactMatch(
      criteria: WordSelectionCriteria,
      words: WordDocument[],
      excludeWords: string[]
    ): Promise<WordSelectionResult | null> {
      
      const candidates = words.filter(word => 
        word.word_type === criteria.slot.word_type &&
        word.complexity === criteria.slot.complexity_level &&
        this.hasThemeMatch(word.themes, criteria.slot.required_themes) &&
        !excludeWords.includes(word.word.toLowerCase())
      )
      
      if (candidates.length === 0) return null
      
      return this.selectBestCandidate(candidates, criteria, 'Tier 1: Exact Match')
    }
    
    /**
     * Tier 2: Broaden complexity by ±1 level
     */
    private async tierTwoBroadenComplexity(
      criteria: WordSelectionCriteria,
      words: WordDocument[],
      excludeWords: string[]
    ): Promise<WordSelectionResult | null> {
      
      const allowedComplexities = this.getBroadenedComplexities(criteria.slot.complexity_level)
      
      const candidates = words.filter(word => 
        word.word_type === criteria.slot.word_type &&
        allowedComplexities.includes(word.complexity) &&
        this.hasThemeMatch(word.themes, criteria.slot.required_themes) &&
        !excludeWords.includes(word.word.toLowerCase())
      )
      
      if (candidates.length === 0) return null
      
      return this.selectBestCandidate(candidates, criteria, 'Tier 2: Broadened Complexity')
    }
    
    /**
     * Tier 3: Add universal themes to broaden search
     */
    private async tierThreeBroadenThemes(
      criteria: WordSelectionCriteria,
      words: WordDocument[],
      excludeWords: string[]
    ): Promise<WordSelectionResult | null> {
      
      const allowedComplexities = this.getBroadenedComplexities(criteria.slot.complexity_level)
      const broadenedThemes = [...criteria.slot.required_themes, 'universal']
      
      const candidates = words.filter(word => 
        word.word_type === criteria.slot.word_type &&
        allowedComplexities.includes(word.complexity) &&
        this.hasThemeMatch(word.themes, broadenedThemes) &&
        !excludeWords.includes(word.word.toLowerCase())
      )
      
      if (candidates.length === 0) return null
      
      return this.selectBestCandidate(candidates, criteria, 'Tier 3: Broadened Themes')
    }
    
    /**
     * Tier 4: Emergency fallback to predefined word sets
     */
    private async tierFourEmergencyDefaults(
      criteria: WordSelectionCriteria,
      excludeWords: string[]
    ): Promise<WordSelectionResult | null> {
      
      const { word_type, complexity_level, required_themes } = criteria.slot
      
      // Try to find fallback words for this word type and complexity
      const fallbackSet = this.fallbackWords[word_type]?.[complexity_level]
      if (!fallbackSet) return null
      
      // Try each theme, then universal
      const themesToTry = [...required_themes, 'universal']
      
      for (const theme of themesToTry) {
        const words = fallbackSet[theme]
        if (words && words.length > 0) {
          const availableWords = words.filter(word => !excludeWords.includes(word.toLowerCase()))
          if (availableWords.length > 0) {
            // Pick first available word (could randomize here)
            const selectedWord = availableWords[0]
            
            // Create a synthetic WordDocument for the fallback
            const syntheticWord: WordDocument = {
              id: `fallback_${Date.now()}`,
              word: selectedWord,
              complexity: complexity_level,
              difficulty_level: complexity_level === 'easy' ? 2 : complexity_level === 'regular' ? 3 : 4,
              chunks: [selectedWord],
              alternative_chunks: [],
              phonics_focus: 'basic_pattern',
              themes: [theme],
              high_frequency: true,
              meaning_support: `A ${word_type} word`,
              word_type: word_type,
              syllable_count: this.estimateSyllableCount(selectedWord)
            }
            
            return {
              word: syntheticWord,
              score: 25, // Low score to indicate fallback
              match_reasons: ['Tier 4: Emergency Fallback'],
              phonics_bonus: false
            }
          }
        }
      }
      
      return null
    }
    
    /**
     * Select the best candidate from a list using scoring algorithm
     */
    private selectBestCandidate(
      candidates: WordDocument[],
      criteria: WordSelectionCriteria,
      tier: string
    ): WordSelectionResult {
      
      let bestCandidate: WordDocument | null = null
      let bestScore = 0
      let bestReasons: string[] = []
      let bestPhonicsBonus = false
      
      for (const candidate of candidates) {
        const result = this.scoreWord(candidate, criteria)
        
        if (result.score > bestScore) {
          bestScore = result.score
          bestCandidate = candidate
          bestReasons = result.reasons
          bestPhonicsBonus = result.phonics_bonus
        }
      }
      
      if (!bestCandidate) {
        // This shouldn't happen if candidates.length > 0, but safety check
        bestCandidate = candidates[0]
        bestScore = 10
        bestReasons = [tier, 'Default selection']
      }
      
      return {
        word: bestCandidate,
        score: bestScore,
        match_reasons: [tier, ...bestReasons],
        phonics_bonus: bestPhonicsBonus
      }
    }
    
    /**
     * Score a word based on how well it matches the criteria
     */
    private scoreWord(word: WordDocument, criteria: WordSelectionCriteria): {
      score: number
      reasons: string[]
      phonics_bonus: boolean
    } {
      
      let score = 0
      const reasons: string[] = []
      let phonicsBonus = false
      
      // Theme match scoring (40% weight)
      const themeScore = this.calculateThemeScore(word.themes, criteria.slot.required_themes)
      score += themeScore * this.config.scoring_weights.theme_match * 100
      if (themeScore > 0.5) reasons.push('Strong theme match')
      
      // Complexity match scoring (30% weight)
      const complexityScore = this.calculateComplexityScore(word.complexity, criteria.slot.complexity_level)
      score += complexityScore * this.config.scoring_weights.complexity_match * 100
      if (complexityScore === 1.0) reasons.push('Perfect complexity match')
      
      // Phonics bonus scoring (20% weight)
      const phonicsScore = this.calculatePhonicsScore(word, criteria.slot.phonics_preference || [])
      score += phonicsScore * this.config.scoring_weights.phonics_bonus * 100
      if (phonicsScore > 0.5) {
        reasons.push('Phonics pattern match')
        phonicsBonus = true
      }
      
      // High frequency bonus (10% weight)
      if (word.high_frequency) {
        score += this.config.scoring_weights.frequency_bonus * 100
        reasons.push('High frequency word')
      }
      
      // Context bonus - if word fits context hints
      if (criteria.slot.context_hints) {
        const contextScore = this.calculateContextScore(word, criteria.slot.context_hints)
        score += contextScore * 10 // Small bonus for context fit
        if (contextScore > 0) reasons.push('Context appropriate')
      }
      
      return { score: Math.round(score), reasons, phonics_bonus: phonicsBonus }
    }
    
    /**
     * Calculate theme matching score (0-1)
     */
    private calculateThemeScore(wordThemes: string[], requiredThemes: string[]): number {
      if (requiredThemes.length === 0) return 1.0
      
      const matches = requiredThemes.filter(theme => wordThemes.includes(theme))
      return matches.length / requiredThemes.length
    }
    
    /**
     * Calculate complexity matching score (0-1)
     */
    private calculateComplexityScore(
      wordComplexity: "easy" | "regular" | "challenge",
      targetComplexity: "easy" | "regular" | "challenge"
    ): number {
      
      if (wordComplexity === targetComplexity) return 1.0
      
      // Adjacent complexity levels get partial credit
      const complexityOrder = ['easy', 'regular', 'challenge']
      const wordIndex = complexityOrder.indexOf(wordComplexity)
      const targetIndex = complexityOrder.indexOf(targetComplexity)
      const distance = Math.abs(wordIndex - targetIndex)
      
      if (distance === 1) return 0.7  // Adjacent level
      if (distance === 2) return 0.3  // Two levels apart
      return 0
    }
    
    /**
     * Calculate phonics pattern matching score (0-1)
     */
    private calculatePhonicsScore(word: WordDocument, preferredPatterns: string[]): number {
      if (preferredPatterns.length === 0) return 0.5 // Neutral if no preference
      
      // Check if word's phonics focus matches any preferred patterns
      const wordPatterns = [word.phonics_focus, ...this.inferPhonicsPatternsFromWord(word)]
      const matches = preferredPatterns.filter(pattern => 
        wordPatterns.some(wordPattern => wordPattern.includes(pattern) || pattern.includes(wordPattern))
      )
      
      return matches.length > 0 ? 1.0 : 0.0
    }
    
    /**
     * Calculate context appropriateness score (0-1)
     */
    private calculateContextScore(word: WordDocument, contextHints: string[]): number {
      const wordLower = word.word.toLowerCase()
      const meaningLower = word.meaning_support.toLowerCase()
      
      for (const hint of contextHints) {
        const hintLower = hint.toLowerCase()
        
        // Exact match
        if (wordLower === hintLower) return 1.0
        
        // Word contains hint or vice versa
        if (wordLower.includes(hintLower) || hintLower.includes(wordLower)) return 0.8
        
        // Meaning contains hint
        if (meaningLower.includes(hintLower)) return 0.6
      }
      
      return 0
    }
    
    /**
     * Get broadened complexity levels (±1 from target)
     */
    private getBroadenedComplexities(target: "easy" | "regular" | "challenge"): ("easy" | "regular" | "challenge")[] {
      const all: ("easy" | "regular" | "challenge")[] = ['easy', 'regular', 'challenge']
      const targetIndex = all.indexOf(target)
      
      const result = [target] // Always include target
      
      // Add adjacent levels
      if (targetIndex > 0) result.push(all[targetIndex - 1])
      if (targetIndex < all.length - 1) result.push(all[targetIndex + 1])
      
      return result
    }
    
    /**
     * Check if word themes match any required themes
     */
    private hasThemeMatch(wordThemes: string[], requiredThemes: string[]): boolean {
      return requiredThemes.some(theme => wordThemes.includes(theme))
    }
    
    /**
     * Infer additional phonics patterns from word structure
     */
    private inferPhonicsPatternsFromWord(word: WordDocument): string[] {
      const patterns: string[] = []
      const wordText = word.word.toLowerCase()
      
      // Simple pattern detection
      if (wordText.length <= 3 && /^[bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxyz]$/.test(wordText)) {
        patterns.push('cvc_pattern')
      }
      
      if (word.syllable_count >= 3) {
        patterns.push('multisyllabic')
      }
      
      // Check for common prefixes/suffixes
      const prefixes = ['un', 're', 'pre', 'dis', 'over', 'under', 'sub']
      const suffixes = ['ing', 'ed', 'er', 'est', 'ly', 'tion', 'sion']
      
      for (const prefix of prefixes) {
        if (wordText.startsWith(prefix)) {
          patterns.push('prefixes')
          break
        }
      }
      
      for (const suffix of suffixes) {
        if (wordText.endsWith(suffix)) {
          patterns.push('suffixes')
          break
        }
      }
      
      // Check for consonant blends
      const blends = ['bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'sc', 'sk', 'sl', 'sm', 'sn', 'sp', 'st', 'sw', 'tr', 'tw']
      for (const blend of blends) {
        if (wordText.includes(blend)) {
          patterns.push('consonant_blends')
          break
        }
      }
      
      // Check for vowel teams
      const vowelTeams = ['ai', 'ay', 'ea', 'ee', 'ie', 'oa', 'ow', 'ue', 'ui']
      for (const team of vowelTeams) {
        if (wordText.includes(team)) {
          patterns.push('vowel_teams')
          break
        }
      }
      
      return patterns
    }
    
    /**
     * Estimate syllable count for fallback words
     */
    private estimateSyllableCount(word: string): number {
      // Simple syllable estimation
      const vowels = word.toLowerCase().match(/[aeiouy]+/g)
      let count = vowels ? vowels.length : 1
      
      // Adjust for silent 'e'
      if (word.toLowerCase().endsWith('e') && count > 1) {
        count--
      }
      
      return Math.max(1, count)
    }
    
    /**
     * Batch word selection for multiple slots
     */
    async selectWordsForSlots(
      slots: WordSelectionCriteria[],
      availableWords: WordDocument[]
    ): Promise<Map<string, WordSelectionResult>> {
      
      const results = new Map<string, WordSelectionResult>()
      const usedWords: string[] = []
      
      // Sort slots by specificity (most specific requirements first)
      const sortedSlots = slots.sort((a, b) => {
        const aSpecificity = a.slot.required_themes.length + (a.slot.phonics_preference?.length || 0)
        const bSpecificity = b.slot.required_themes.length + (b.slot.phonics_preference?.length || 0)
        return bSpecificity - aSpecificity
      })
      
      for (const criteria of sortedSlots) {
        const excludeWords = criteria.slot.allow_repetition ? [] : usedWords
        const result = await this.selectWord(criteria, availableWords, excludeWords)
        
        if (result) {
          results.set(criteria.slot.slot_name, result)
          if (!criteria.slot.allow_repetition) {
            usedWords.push(result.word.word.toLowerCase())
          }
        }
      }
      
      return results
    }
    
    /**
     * Generate word selection report for debugging
     */
    generateSelectionReport(
      criteria: WordSelectionCriteria,
      result: WordSelectionResult | null
    ): string {
      
      let report = `Word Selection Report for slot: ${criteria.slot.slot_name}\n`
      report += `Required: ${criteria.slot.word_type}, ${criteria.slot.complexity_level}\n`
      report += `Themes: ${criteria.slot.required_themes.join(', ')}\n`
      
      if (criteria.slot.phonics_preference) {
        report += `Phonics preference: ${criteria.slot.phonics_preference.join(', ')}\n`
      }
      
      if (criteria.slot.context_hints) {
        report += `Context hints: ${criteria.slot.context_hints.join(', ')}\n`
      }
      
      if (result) {
        report += `\nSelected: "${result.word.word}"\n`
        report += `Score: ${result.score}/100\n`
        report += `Reasons: ${result.match_reasons.join(', ')}\n`
        report += `Phonics bonus: ${result.phonics_bonus ? 'Yes' : 'No'}\n`
        report += `Word themes: ${result.word.themes.join(', ')}\n`
        report += `Phonics focus: ${result.word.phonics_focus}\n`
      } else {
        report += `\nFAILED: No suitable word found\n`
      }
      
      return report
    }
    
    /**
     * Update configuration for different story types or user preferences
     */
    updateConfig(newConfig: Partial<WordSelectionConfig>): void {
      this.config = { ...this.config, ...newConfig }
    }
    
    /**
     * Load fallback words from external source
     */
    loadFallbackWords(fallbackWords: FallbackWordSet): void {
      this.fallbackWords = fallbackWords
    }
    
    /**
     * Get statistics about word selection performance
     */
    getPerformanceStats(selections: WordSelectionResult[]): {
      average_score: number
      tier_distribution: Record<string, number>
      phonics_bonus_rate: number
      fallback_rate: number
    } {
      
      if (selections.length === 0) {
        return {
          average_score: 0,
          tier_distribution: {},
          phonics_bonus_rate: 0,
          fallback_rate: 0
        }
      }
      
      const averageScore = selections.reduce((sum, s) => sum + s.score, 0) / selections.length
      const phonicsBonusCount = selections.filter(s => s.phonics_bonus).length
      const fallbackCount = selections.filter(s => 
        s.match_reasons.some(reason => reason.includes('Tier 4'))
      ).length
      
      // Count tier distribution
      const tierDistribution: Record<string, number> = {}
      selections.forEach(selection => {
        const tierReason = selection.match_reasons.find(reason => reason.startsWith('Tier'))
        if (tierReason) {
          tierDistribution[tierReason] = (tierDistribution[tierReason] || 0) + 1
        }
      })
      
      return {
        average_score: Math.round(averageScore),
        tier_distribution: tierDistribution,
        phonics_bonus_rate: Math.round((phonicsBonusCount / selections.length) * 100),
        fallback_rate: Math.round((fallbackCount / selections.length) * 100)
      }
    }
  }