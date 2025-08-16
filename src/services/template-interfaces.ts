// Template-based Story Generation System - Type Definitions
// Phase 1: Foundation - Template Schema and Interfaces

/**
 * Core template structure for deterministic story generation
 */
export interface StoryTemplate {
    id: string
    title: string
    themes: string[] // ["ocean", "adventure", "friendship"]
    complexity_levels: ["simple", "full", "challenge"]
    structure: {
      beginning: TemplateSection
      middle: TemplateSection  
      end: TemplateSection
    }
    required_word_tags: string[] // ["animals", "emotions", "actions"]
    phonics_progression: {
      simple: string[]    // ["cvc_pattern", "consonant_blends"]
      full: string[]      // ["digraphs", "suffixes", "compound_words"] 
      challenge: string[] // ["multisyllabic", "prefixes", "complex_patterns"]
    }
    metadata: {
      author: string
      created_date: string
      target_age_range: string
      estimated_completion_time: {
        simple: string    // "3-4 minutes"
        full: string      // "6-8 minutes"
        challenge: string // "10-12 minutes"
      }
    }
  }
  
  /**
   * Individual section within a story template
   */
  export interface TemplateSection {
    text_template: string // "The [CHARACTER] walked to the [LOCATION] and saw a [ADJECTIVE] [CREATURE]"
    word_slots: WordSlot[]
    target_word_count: number
    phonics_emphasis: string[] // Phonics patterns to highlight in this section
    target_pattern_count: number // How many phonics patterns to include
    section_type: 'intro' | 'setup' | 'problem' | 'attempt' | 'solution' | 'reflection' | 'conclusion'
  }
  
  /**
   * Word slot definition for template filling
   */
  export interface WordSlot {
    slot_name: string // "CHARACTER", "LOCATION", "ADJECTIVE", "CREATURE"
    word_type: string // "noun", "verb", "adjective", "adverb"  
    required_themes: string[] // ["ocean", "animals"] - must match at least one
    complexity_level: "easy" | "regular" | "challenge"
    phonics_preference?: string[] // Bonus points for these phonics patterns
    context_hints?: string[] // Additional context for better word selection
    allow_repetition?: boolean // Can this word appear multiple times in story?
  }
  
  /**
   * Extended story template for full/challenge versions with more sections
   */
  export interface ExtendedStoryTemplate extends StoryTemplate {
    structure: {
      beginning: TemplateSection
      setup?: TemplateSection      // Only for full/challenge
      problem: TemplateSection
      attempt?: TemplateSection    // Only for challenge
      complication?: TemplateSection // Only for challenge  
      solution: TemplateSection
      reflection?: TemplateSection // Only for full/challenge
      end: TemplateSection
    }
  }
  
  /**
   * Word database interface (matching Firestore structure)
   */
  export interface WordDocument {
    id: string
    word: string 
    complexity: "easy" | "regular" | "challenge"
    difficulty_level: number // 1-5 scale
    chunks: string[] // ["strong"] for phonics breakdown
    alternative_chunks: string[] // ["str", "ong"] alternative pronunciations
    phonics_focus: string // "consonant_blend_triple"
    themes: string[] // ["universal", "emotions", "ocean"]
    high_frequency: boolean // Common sight word
    meaning_support: string // Definition/context
    word_type: string // "noun", "verb", "adjective", "adverb"
    syllable_count: number
    rhyme_family?: string // For phonics patterns
  }
  
  /**
   * Word selection criteria for template filling
   */
  export interface WordSelectionCriteria {
    slot: WordSlot
    themes: string[]
    complexity_level: "easy" | "regular" | "challenge"
    phonics_preferences: string[]
    exclude_words: string[] // Words already used in this story
    context: string // Surrounding text for better selection
  }
  
  /**
   * Word selection result with scoring
   */
  export interface WordSelectionResult {
    word: WordDocument
    score: number // 0-100 relevance score
    match_reasons: string[] // Why this word was selected
    phonics_bonus: boolean // Got bonus for phonics pattern match
  }
  
  /**
   * Template parsing and filling service interface
   */
  export interface TemplateProcessor {
    parseTemplate(template: StoryTemplate, complexity: 'simple' | 'full' | 'challenge'): ParsedTemplate
    fillTemplate(parsedTemplate: ParsedTemplate, wordDatabase: WordDocument[]): FilledTemplate
    validateTemplate(template: StoryTemplate): TemplateValidationResult
  }
  
  /**
   * Parsed template ready for word filling
   */
  export interface ParsedTemplate {
    sections: ParsedSection[]
    total_slots: number
    required_phonics_patterns: string[]
    estimated_word_count: number
    complexity_level: 'simple' | 'full' | 'challenge'
  }
  
  /**
   * Individual parsed section
   */
  export interface ParsedSection {
    original_template: string
    slots: IdentifiedSlot[]
    static_text_parts: string[]
    section_metadata: {
      type: string
      phonics_emphasis: string[]
      target_word_count: number
    }
  }
  
  /**
   * Identified slot in template text
   */
  export interface IdentifiedSlot {
    slot_name: string
    position: number // Character position in template
    slot_definition: WordSlot
    surrounding_context: string
  }
  
  /**
   * Template after word filling
   */
  export interface FilledTemplate {
    sections: FilledSection[]
    selected_words: SelectedWord[]
    phonics_patterns_used: string[]
    total_word_count: number
    vocabulary_complexity: 'basic' | 'standard' | 'advanced'
  }
  
  /**
   * Section with words filled in
   */
  export interface FilledSection {
    final_text: string
    words_used: SelectedWord[]
    phonics_moments: PhonicsOpportunity[]
    section_type: string
  }
  
  /**
   * Word selected for a specific slot
   */
  export interface SelectedWord {
    slot_name: string
    word: string
    word_document: WordDocument
    selection_score: number
    phonics_contribution: string[]
  }
  
  /**
   * Phonics learning opportunity in text
   */
  export interface PhonicsOpportunity {
    pattern: string
    words: string[]
    instruction: string
    position: 'before' | 'after' // Where to place phonics moment
  }
  
  /**
   * Template validation result
   */
  export interface TemplateValidationResult {
    is_valid: boolean
    errors: string[]
    warnings: string[]
    suggestions: string[]
    slot_coverage: {
      [slot_name: string]: boolean
    }
  }
  
  /**
   * Story generation cache entry
   */
  export interface StoryGenerationCache {
    key: string // Hash of interests + brain_state + complexity
    story: any // MultiVersionStory format
    generated_at: string
    hit_count: number
    last_accessed: string
  }
  
  /**
   * Template library organization
   */
  export interface TemplateLibrary {
    templates_by_theme: {
      [theme: string]: StoryTemplate[]
    }
    cross_theme_templates: StoryTemplate[]
    total_templates: number
    metadata: {
      version: string
      last_updated: string
      coverage_report: ThemeCoverage[]
    }
  }
  
  /**
   * Theme coverage analysis
   */
  export interface ThemeCoverage {
    theme: string
    template_count: number
    complexity_coverage: {
      simple: number
      full: number  
      challenge: number
    }
    phonics_pattern_coverage: string[]
  }
  
  /**
   * Emergency fallback word structure
   */
  export interface FallbackWordSet {
    [word_type: string]: {
      [complexity: string]: {
        [theme: string]: string[]
      }
    }
  }
  
  /**
   * Word selection algorithm configuration
   */
  export interface WordSelectionConfig {
    scoring_weights: {
      theme_match: number      // 0.4
      complexity_match: number // 0.3  
      phonics_bonus: number    // 0.2
      frequency_bonus: number  // 0.1
    }
    fallback_strategy: {
      broaden_complexity: boolean
      broaden_themes: boolean
      use_universal_themes: boolean
      use_fallback_words: boolean
    }
    quality_thresholds: {
      minimum_score: number    // 30
      ideal_score: number      // 70
      phonics_bonus_threshold: number // 10
    }
  }