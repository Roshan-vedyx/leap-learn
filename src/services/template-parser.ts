// Template Parser - Phase 1: Basic Template Parsing and Slot Identification
// This handles the fundamental template processing before word selection

import type { 
    StoryTemplate, 
    ParsedTemplate, 
    ParsedSection, 
    IdentifiedSlot,
    TemplateSection,
    WordSlot,
    TemplateValidationResult 
  } from './template-interfaces'
  
  /**
   * Core template parser that converts raw templates into structured data
   */
  export class TemplateParser {
    
    /**
     * Parse a story template for a specific complexity level
     */
    static parseTemplate(
      template: StoryTemplate, 
      complexity: 'simple' | 'full' | 'challenge'
    ): ParsedTemplate {
      
      // Get the appropriate structure for this complexity level
      const structure = this.getComplexityStructure(template, complexity)
      
      // Parse each section
      const parsedSections: ParsedSection[] = []
      
      for (const [sectionName, section] of Object.entries(structure)) {
        const parsedSection = this.parseSection(section, sectionName)
        parsedSections.push(parsedSection)
      }
      
      // Calculate totals and requirements
      const totalSlots = parsedSections.reduce((sum, section) => sum + section.slots.length, 0)
      const requiredPhonicsPatterns = this.extractPhonicsPatterns(parsedSections)
      const estimatedWordCount = parsedSections.reduce((sum, section) => sum + section.section_metadata.target_word_count, 0)
      
      return {
        sections: parsedSections,
        total_slots: totalSlots,
        required_phonics_patterns: requiredPhonicsPatterns,
        estimated_word_count: estimatedWordCount,
        complexity_level: complexity
      }
    }
    
    /**
     * Get the correct structure based on complexity level
     */
    private static getComplexityStructure(
      template: StoryTemplate, 
      complexity: 'simple' | 'full' | 'challenge'
    ): Record<string, TemplateSection> {
      
      if (complexity === 'simple') {
        return {
          beginning: template.structure.beginning,
          middle: template.structure.middle,
          end: template.structure.end
        }
      }
      
      // For full and challenge, use extended structure if available
      const extendedTemplate = template as any // Type assertion for extended structure
      
      if (complexity === 'full') {
        return {
          beginning: extendedTemplate.structure.simple?.beginning || extendedTemplate.structure.full?.beginning || template.structure.beginning,
          setup: extendedTemplate.structure.full?.setup,
          problem: extendedTemplate.structure.full?.problem || template.structure.middle,
          solution: extendedTemplate.structure.full?.solution,
          reflection: extendedTemplate.structure.full?.reflection,
          end: extendedTemplate.structure.full?.end || template.structure.end
        }
      }
      
      // Challenge level
      return {
        beginning: extendedTemplate.structure.challenge?.beginning || template.structure.beginning,
        setup: extendedTemplate.structure.challenge?.setup,
        problem: extendedTemplate.structure.challenge?.problem || template.structure.middle,
        solution: extendedTemplate.structure.challenge?.solution,
        reflection: extendedTemplate.structure.challenge?.reflection,
        end: extendedTemplate.structure.challenge?.end || template.structure.end
      }
    }
    
    /**
     * Parse an individual template section
     */
    private static parseSection(section: TemplateSection, sectionName: string): ParsedSection {
      const { text_template } = section
      
      // Find all slot patterns [SLOT_NAME]
      const slotPattern = /\[([A-Z_]+)\]/g
      const slots: IdentifiedSlot[] = []
      const staticTextParts: string[] = []
      
      let lastIndex = 0
      let match
      
      while ((match = slotPattern.exec(text_template)) !== null) {
        const [fullMatch, slotName] = match
        const position = match.index
        
        // Add static text before this slot
        if (position > lastIndex) {
          staticTextParts.push(text_template.slice(lastIndex, position))
        }
        
        // Find the slot definition
        const slotDefinition = section.word_slots.find(slot => slot.slot_name === slotName)
        
        if (slotDefinition) {
          // Extract surrounding context (20 chars before and after)
          const contextStart = Math.max(0, position - 20)
          const contextEnd = Math.min(text_template.length, position + fullMatch.length + 20)
          const surroundingContext = text_template.slice(contextStart, contextEnd)
          
          slots.push({
            slot_name: slotName,
            position,
            slot_definition: slotDefinition,
            surrounding_context: surroundingContext
          })
        } else {
          console.warn(`No slot definition found for: ${slotName} in section: ${sectionName}`)
        }
        
        lastIndex = position + fullMatch.length
      }
      
      // Add remaining static text
      if (lastIndex < text_template.length) {
        staticTextParts.push(text_template.slice(lastIndex))
      }
      
      return {
        original_template: text_template,
        slots,
        static_text_parts: staticTextParts,
        section_metadata: {
          type: section.section_type || sectionName,
          phonics_emphasis: section.phonics_emphasis,
          target_word_count: section.target_word_count
        }
      }
    }
    
    /**
     * Extract all required phonics patterns from parsed sections
     */
    private static extractPhonicsPatterns(sections: ParsedSection[]): string[] {
      const patterns = new Set<string>()
      
      sections.forEach(section => {
        section.section_metadata.phonics_emphasis.forEach(pattern => patterns.add(pattern))
        section.slots.forEach(slot => {
          if (slot.slot_definition.phonics_preference) {
            slot.slot_definition.phonics_preference.forEach(pattern => patterns.add(pattern))
          }
        })
      })
      
      return Array.from(patterns)
    }
    
    /**
     * Validate template structure and completeness
     */
    static validateTemplate(template: StoryTemplate): TemplateValidationResult {
      const errors: string[] = []
      const warnings: string[] = []
      const suggestions: string[] = []
      const slotCoverage: Record<string, boolean> = {}
      
      // Check basic structure
      if (!template.id || !template.title) {
        errors.push('Template must have id and title')
      }
      
      if (!template.themes || template.themes.length === 0) {
        errors.push('Template must specify at least one theme')
      }
      
      // Check complexity levels
      const requiredComplexities = ['simple', 'full', 'challenge']
      if (!template.complexity_levels || 
          !requiredComplexities.every(level => template.complexity_levels.includes(level as any))) {
        errors.push('Template must support all complexity levels: simple, full, challenge')
      }
      
      // Validate each complexity structure
      for (const complexity of ['simple', 'full', 'challenge'] as const) {
        try {
          const parsed = this.parseTemplate(template, complexity)
          
          // Check for orphaned slots (slots in template but no definition)
          parsed.sections.forEach((section, sectionIndex) => {
            const templateSlots = this.extractSlotNames(section.original_template)
            const definedSlots = section.slots.map(slot => slot.slot_name)
            
            const orphanedSlots = templateSlots.filter(slot => !definedSlots.includes(slot))
            if (orphanedSlots.length > 0) {
              errors.push(`${complexity} level, section ${sectionIndex}: Orphaned slots: ${orphanedSlots.join(', ')}`)
            }
            
            // Track slot coverage
            definedSlots.forEach(slot => {
              slotCoverage[`${complexity}_${slot}`] = true
            })
          })
          
          // Check phonics progression makes sense
          if (complexity === 'simple' && parsed.required_phonics_patterns.includes('multisyllabic')) {
            warnings.push('Simple level contains advanced phonics patterns')
          }
          
          if (complexity === 'challenge' && !parsed.required_phonics_patterns.includes('multisyllabic')) {
            suggestions.push('Challenge level should include multisyllabic words')
          }
          
        } catch (error) {
          errors.push(`Failed to parse ${complexity} level: ${error}`)
        }
      }
      
      // Check phonics progression
      const phonicsProgression = template.phonics_progression
      if (!phonicsProgression) {
        errors.push('Template must specify phonics progression for each complexity level')
      } else {
        if (!phonicsProgression.simple || phonicsProgression.simple.length === 0) {
          errors.push('Simple level must have phonics patterns defined')
        }
        if (!phonicsProgression.challenge || phonicsProgression.challenge.length === 0) {
          errors.push('Challenge level must have phonics patterns defined')
        }
      }
      
      // Check word tag requirements
      if (!template.required_word_tags || template.required_word_tags.length === 0) {
        warnings.push('Template should specify required word tags for better word selection')
      }
      
      // Suggest improvements
      if (template.themes.length === 1) {
        suggestions.push('Consider adding cross-theme elements for more variety')
      }
      
      const isValid = errors.length === 0
      
      return {
        is_valid: isValid,
        errors,
        warnings,
        suggestions,
        slot_coverage: slotCoverage
      }
    }
    
    /**
     * Extract slot names from template text
     */
    private static extractSlotNames(templateText: string): string[] {
      const slotPattern = /\[([A-Z_]+)\]/g
      const slots: string[] = []
      let match
      
      while ((match = slotPattern.exec(templateText)) !== null) {
        slots.push(match[1])
      }
      
      return slots
    }
    
    /**
     * Preview how a template will look with sample words
     */
    static previewTemplate(
      template: StoryTemplate, 
      complexity: 'simple' | 'full' | 'challenge',
      sampleWords: Record<string, string> = {}
    ): string[] {
      
      const parsed = this.parseTemplate(template, complexity)
      const previews: string[] = []
      
      // Default sample words for preview
      const defaultSamples: Record<string, string> = {
        'CHARACTER': 'Sam',
        'LOCATION': 'ocean',
        'ADJECTIVE': 'amazing',
        'CREATURE': 'dolphin',
        'ACTION': 'swam',
        'EMOTION': 'joy',
        'NOUN': 'adventure',
        'EXCLAMATION': 'Wow',
        'DIRECTION': 'ahead',
        'TIME_PERIOD': 'summer',
        'TIME_REFERENCE': 'yesterday',
        'BODY_PART': 'eyes',
        ...sampleWords
      }
      
      parsed.sections.forEach((section, index) => {
        let preview = section.original_template
        
        // Replace each slot with sample word
        section.slots.forEach(slot => {
          const sampleWord = defaultSamples[slot.slot_name] || `[${slot.slot_name}]`
          preview = preview.replace(`[${slot.slot_name}]`, sampleWord)
        })
        
        previews.push(`Section ${index + 1} (${section.section_metadata.type}): ${preview}`)
      })
      
      return previews
    }
    
    /**
     * Get template statistics for analysis
     */
    static getTemplateStats(template: StoryTemplate): Record<string, any> {
      const stats: Record<string, any> = {
        template_id: template.id,
        themes: template.themes,
        complexity_analysis: {}
      }
      
      for (const complexity of ['simple', 'full', 'challenge'] as const) {
        try {
          const parsed = this.parseTemplate(template, complexity)
          
          stats.complexity_analysis[complexity] = {
            section_count: parsed.sections.length,
            total_slots: parsed.total_slots,
            estimated_word_count: parsed.estimated_word_count,
            phonics_patterns: parsed.required_phonics_patterns.length,
            unique_slot_types: [...new Set(parsed.sections.flatMap(s => s.slots.map(slot => slot.slot_name)))].length
          }
        } catch (error) {
          stats.complexity_analysis[complexity] = { error: String(error) }
        }
      }
      
      return stats
    }
  }