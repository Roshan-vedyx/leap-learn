// Enhanced StoryGenerationService.ts - Updated for your template format
import * as Types from '@/types'

interface YourStoryTemplate {
  id: string
  title: string
  themes: string[]
  complexity_levels: ["simple", "full", "challenge"]
  structure: {
    simple: TemplateLevel
    full: TemplateLevel
    challenge: TemplateLevel
  }
  required_word_tags: string[]
  phonics_progression: {
    simple: string[]
    full: string[]
    challenge: string[]
  }
  metadata: {
    author: string
    created_date: string
    target_age_range: string
    estimated_completion_time: {
      simple: string
      full: string
      challenge: string
    }
  }
  story_structure_notes?: any
  phonics_integration?: any
  nd_design_principles?: any
}

interface TemplateLevel {
  beginning: TemplateSection
  setup?: TemplateSection
  middle?: TemplateSection
  problem?: TemplateSection
  solution?: TemplateSection
  end?: TemplateSection
  reflection?: TemplateSection
}

interface TemplateSection {
  text_template: string
  word_slots: WordSlot[]
  target_word_count: number
  phonics_emphasis: string[]
  target_pattern_count?: number
  section_type: string
}

interface WordSlot {
  slot_name: string
  themes: string[]
  complexity: "easy" | "regular" | "challenge"
  word_hints: string[]
}

export class StoryGenerationService {
  
  // Template mapping based on your folder structure
  private static readonly TEMPLATE_MAPPING = {
    'ocean': '/src/data/story-templates/ocean/ocean-discovery-001.json',
    'animals': '/src/data/story-templates/animals/animal-rescue-001.json',
    'space': '/src/data/story-templates/space/space-adventure-001.json',
    'friendship': '/src/data/story-templates/friendship/friendship-story-001.json',
    'mystery': '/src/data/story-templates/mystery/mystery-solver-001.json'
  }

  // Fallback templates for interests without JSON templates
  private static readonly FALLBACK_TEMPLATES = {
    'robots': {
      title: 'Robot Helper Adventure',
      themes: ['technology', 'friendship'],
      simple: {
        beginning: {
          text_template: "Sam found a [ADJECTIVE] robot in the [LOCATION]. The robot said \"[GREETING]!\"",
          word_slots: [
            { slot_name: "ADJECTIVE", themes: ["technology"], complexity: "easy", word_hints: ["friendly", "helpful", "shiny"] },
            { slot_name: "LOCATION", themes: ["technology"], complexity: "easy", word_hints: ["garage", "lab", "workshop"] },
            { slot_name: "GREETING", themes: ["universal"], complexity: "easy", word_hints: ["Hello", "Hi there", "Greetings"] }
          ],
          target_word_count: 12,
          phonics_emphasis: ["found", "robot", "said"],
          section_type: "intro"
        },
        middle: {
          text_template: "Together they [ACTION] and discovered [DISCOVERY]. It was so [ADJECTIVE]!",
          word_slots: [
            { slot_name: "ACTION", themes: ["technology"], complexity: "easy", word_hints: ["worked", "played", "explored"] },
            { slot_name: "DISCOVERY", themes: ["technology"], complexity: "easy", word_hints: ["a secret", "something cool", "a surprise"] },
            { slot_name: "ADJECTIVE", themes: ["emotions"], complexity: "easy", word_hints: ["exciting", "amazing", "awesome"] }
          ],
          target_word_count: 15,
          phonics_emphasis: ["together", "discovered", "exciting"],
          section_type: "problem"
        },
        end: {
          text_template: "Sam and the robot became [RELATIONSHIP] and had many more [ADVENTURES].",
          word_slots: [
            { slot_name: "RELATIONSHIP", themes: ["friendship"], complexity: "easy", word_hints: ["best friends", "partners", "teammates"] },
            { slot_name: "ADVENTURES", themes: ["universal"], complexity: "easy", word_hints: ["fun times", "adventures", "discoveries"] }
          ],
          target_word_count: 12,
          phonics_emphasis: ["became", "adventures"],
          section_type: "solution"
        }
      }
    },
    'magic': {
      title: 'Magic Discovery',
      themes: ['creative', 'mystery'],
      simple: {
        beginning: {
          text_template: "[CHARACTER] found a [MAGICAL_ITEM] that could [POWER]. This was [ADJECTIVE]!",
          word_slots: [
            { slot_name: "CHARACTER", themes: ["universal"], complexity: "easy", word_hints: ["Maya", "Sam", "Alex"] },
            { slot_name: "MAGICAL_ITEM", themes: ["creative"], complexity: "easy", word_hints: ["magic wand", "special stone", "glowing book"] },
            { slot_name: "POWER", themes: ["creative"], complexity: "easy", word_hints: ["glow", "sparkle", "shine"] },
            { slot_name: "ADJECTIVE", themes: ["emotions"], complexity: "easy", word_hints: ["amazing", "incredible", "wonderful"] }
          ],
          target_word_count: 12,
          phonics_emphasis: ["found", "magic", "special"],
          section_type: "intro"
        },
        middle: {
          text_template: "When [CHARACTER] used it, something [UNEXPECTED] happened. [EXCLAMATION]!",
          word_slots: [
            { slot_name: "UNEXPECTED", themes: ["mystery"], complexity: "easy", word_hints: ["magical", "surprising", "cool"] },
            { slot_name: "EXCLAMATION", themes: ["emotions"], complexity: "easy", word_hints: ["Wow", "Amazing", "Incredible"] }
          ],
          target_word_count: 10,
          phonics_emphasis: ["happened", "magical"],
          section_type: "problem"
        },
        end: {
          text_template: "Now [CHARACTER] uses magic to [HELP_OTHERS] every day. Magic is [ADJECTIVE]!",
          word_slots: [
            { slot_name: "HELP_OTHERS", themes: ["friendship"], complexity: "easy", word_hints: ["help friends", "make things better", "solve problems"] },
            { slot_name: "ADJECTIVE", themes: ["emotions"], complexity: "easy", word_hints: ["wonderful", "amazing", "special"] }
          ],
          target_word_count: 12,
          phonics_emphasis: ["magic", "wonderful"],
          section_type: "solution"
        }
      }
    }
  }

  static async generateStory(
    selectedInterests: string[], 
    brainState: string
  ): Promise<MultiVersionStory> {
    
    const template = await this.loadTemplate(selectedInterests[0])
    const concept = this.createStoryConcept(selectedInterests)
    const storyId = `generated-${Date.now()}`
    
    // CRITICAL FIX: Generate story-wide consistent choices ONCE
    const storyWideChoices = this.generateStoryWideConsistentChoices(template)
    console.log('🎯 STORY-WIDE CONSISTENT CHOICES:', storyWideChoices)
    
    const generatedStory = await this.generateFromTemplate(template, selectedInterests, brainState, storyWideChoices)
    
    return {
      id: storyId,
      title: template.title,
      concept,
      interests: selectedInterests,
      level: 'Adaptive (Grades 3-6)',
      phonicsSkills: template.phonics_progression.full,
      difficulty: 3,
      themes: selectedInterests,
      versions: {
        simple: generatedStory.simple,
        full: generatedStory.full,
        challenge: generatedStory.challenge
      }
    }
  }

  private static async loadTemplate(primaryInterest: string): Promise<YourStoryTemplate> {
    try {
      // Check if we have a JSON template for this interest
      const templatePath = this.TEMPLATE_MAPPING[primaryInterest as keyof typeof this.TEMPLATE_MAPPING]
      
      if (templatePath) {
        // Load from JSON file
        const response = await fetch(templatePath)
        if (response.ok) {
          const template = await response.json()
          console.log(`Loaded template from: ${templatePath}`)
          return template as YourStoryTemplate
        }
      }
      
      // Fallback to hardcoded template
      const fallbackTemplate = this.FALLBACK_TEMPLATES[primaryInterest as keyof typeof this.FALLBACK_TEMPLATES]
      if (fallbackTemplate) {
        console.log(`Using fallback template for: ${primaryInterest}`)
        return this.convertFallbackToYourFormat(fallbackTemplate, primaryInterest)
      }
      
      // Ultimate fallback - generic adventure template
      console.log(`Using generic template for: ${primaryInterest}`)
      return this.getGenericTemplate(primaryInterest)
      
    } catch (error) {
      console.error(`Error loading template for ${primaryInterest}:`, error)
      return this.getGenericTemplate(primaryInterest)
    }
  }

  private static generateStoryWideConsistentChoices(template: YourStoryTemplate): Record<string, string> {
    const storyChoices: Record<string, string> = {}
    
    // Define story-critical slots that MUST remain consistent
    const criticalSlots = [
      'CHARACTER', 'CHARACTER_1', 'MAIN_CHARACTER',
      'CHARACTER_2', 'FRIEND', 'COMPANION',
      'CREATURE', 'ANIMAL', 'PET', 'ANIMALS', // All animal-related slots
      'OBJECT', 'MAGICAL_ITEM', 'TOOL',
      'LOCATION', 'PLACE', 'SETTING'
    ]
    
    // Define slot groups that should use related values
    const slotGroups = {
      animals: ['ANIMAL', 'ANIMALS', 'CREATURE', 'PET'],
      characters: ['CHARACTER', 'CHARACTER_1', 'MAIN_CHARACTER'],
      locations: ['LOCATION', 'PLACE', 'SETTING'],
      objects: ['OBJECT', 'MAGICAL_ITEM', 'TOOL']
    }
    
    // Collect ALL possible choices for each critical slot across ALL levels
    const slotChoicesMap = new Map<string, Set<string>>()
    
    // Scan all levels and sections for word slots
    Object.entries(template.structure).forEach(([levelName, level]) => {
      if (level) {
        Object.entries(level).forEach(([sectionName, section]) => {
          if (section?.word_slots) {
            section.word_slots.forEach(slot => {
              // Only process critical slots that need consistency
              if (criticalSlots.includes(slot.slot_name)) {
                if (!slotChoicesMap.has(slot.slot_name)) {
                  slotChoicesMap.set(slot.slot_name, new Set())
                }
                // Add all word hints for this slot
                slot.word_hints.forEach(hint => {
                  slotChoicesMap.get(slot.slot_name)!.add(hint)
                })
              }
            })
          }
        })
      }
    })
    
    // Generate ONE choice per critical slot for the ENTIRE story
    slotChoicesMap.forEach((choicesSet, slotName) => {
      const choicesArray = Array.from(choicesSet)
      if (choicesArray.length > 0) {
        // Pick ONE choice that will be used throughout the entire story
        const storyChoice = choicesArray[Math.floor(Math.random() * choicesArray.length)]
        storyChoices[slotName] = storyChoice
        console.log(`🔒 LOCKED IN: "${slotName}" = "${storyChoice}" for entire story`)
      }
    })
    
    // Handle character relationships - ensure they're different
    if (storyChoices['CHARACTER'] && storyChoices['CHARACTER_2']) {
      // If both main characters ended up with the same name, change CHARACTER_2
      if (storyChoices['CHARACTER'] === storyChoices['CHARACTER_2']) {
        const character2Options = Array.from(slotChoicesMap.get('CHARACTER_2') || new Set())
        const differentName = character2Options.find(name => name !== storyChoices['CHARACTER'])
        if (differentName) {
          storyChoices['CHARACTER_2'] = differentName
          console.log(`🔄 Changed CHARACTER_2 to "${differentName}" to avoid duplication`)
        }
      }
    }
    
    return storyChoices
  }

  private static convertFallbackToYourFormat(fallback: any, interest: string): YourStoryTemplate {
    return {
      id: `fallback-${interest}`,
      title: fallback.title,
      themes: fallback.themes,
      complexity_levels: ["simple", "full", "challenge"],
      structure: {
        simple: fallback.simple,
        full: this.expandToFullLevel(fallback.simple),
        challenge: this.expandToChallengeLevel(fallback.simple)
      },
      required_word_tags: fallback.themes,
      phonics_progression: {
        simple: ['cvc_pattern', 'consonant_blends'],
        full: ['digraphs', 'suffixes', 'compound_words'],
        challenge: ['multisyllabic', 'prefixes', 'complex_patterns']
      },
      metadata: {
        author: 'System Generated',
        created_date: new Date().toISOString(),
        target_age_range: '8-12',
        estimated_completion_time: {
          simple: '3-4 minutes',
          full: '6-8 minutes',
          challenge: '10-12 minutes'
        }
      }
    }
  }

  private static expandToFullLevel(simpleLevel: any): TemplateLevel {
    // Create a more detailed version for full level
    return {
      beginning: {
        ...simpleLevel.beginning,
        text_template: simpleLevel.beginning.text_template.replace(/\[CHARACTER\]/g, "[CHARACTER] had always been curious about adventures. Today, [CHARACTER]"),
        target_word_count: simpleLevel.beginning.target_word_count + 8
      },
      setup: {
        text_template: "Something interesting was about to happen. [CHARACTER] could feel it.",
        word_slots: [],
        target_word_count: 10,
        phonics_emphasis: ["interesting", "happen", "could"],
        section_type: "setup"
      },
      problem: simpleLevel.middle,
      solution: simpleLevel.end,
      reflection: {
        text_template: "This had been an amazing day. [CHARACTER] couldn't wait for the next adventure!",
        word_slots: [],
        target_word_count: 12,
        phonics_emphasis: ["amazing", "couldn't", "adventure"],
        section_type: "reflection"
      }
    }
  }

  private static expandToChallengeLevel(simpleLevel: any): TemplateLevel {
    // Create an even more sophisticated version for challenge level
    return {
      beginning: {
        ...simpleLevel.beginning,
        text_template: simpleLevel.beginning.text_template.replace(/\[CHARACTER\]/g, "[CHARACTER] had always possessed an extraordinary curiosity about adventures. Today, [CHARACTER]"),
        target_word_count: simpleLevel.beginning.target_word_count + 12,
        phonics_emphasis: [...simpleLevel.beginning.phonics_emphasis, "extraordinary", "curiosity", "possessed"]
      },
      setup: {
        text_template: "Something unprecedented was about to unfold. [CHARACTER] could sense the anticipation building.",
        word_slots: [],
        target_word_count: 12,
        phonics_emphasis: ["unprecedented", "anticipation", "building"],
        section_type: "setup"
      },
      problem: {
        ...simpleLevel.middle,
        target_word_count: simpleLevel.middle.target_word_count + 8
      },
      solution: {
        ...simpleLevel.end,
        target_word_count: simpleLevel.end.target_word_count + 8
      },
      reflection: {
        text_template: "This extraordinary experience had exceeded all expectations. [CHARACTER] eagerly anticipated future discoveries.",
        word_slots: [],
        target_word_count: 15,
        phonics_emphasis: ["extraordinary", "exceeded", "expectations", "anticipated"],
        section_type: "reflection"
      }
    }
  }

  private static getGenericTemplate(interest: string): YourStoryTemplate {
    return {
      id: `generic-${interest}`,
      title: `The ${interest.charAt(0).toUpperCase() + interest.slice(1)} Adventure`,
      themes: [interest, 'adventure'],
      complexity_levels: ["simple", "full", "challenge"],
      structure: {
        simple: {
          beginning: {
            text_template: `Alex loved ${interest}. Today felt special.`,
            word_slots: [],
            target_word_count: 8,
            phonics_emphasis: ['loved', 'special'],
            section_type: 'intro'
          },
          middle: {
            text_template: `Something amazing happened when Alex explored ${interest}.`,
            word_slots: [],
            target_word_count: 10,
            phonics_emphasis: ['amazing', 'happened', 'explored'],
            section_type: 'problem'
          },
          end: {
            text_template: `Alex smiled. This ${interest} adventure was awesome!`,
            word_slots: [],
            target_word_count: 9,
            phonics_emphasis: ['smiled', 'adventure', 'awesome'],
            section_type: 'solution'
          }
        },
        full: {
          beginning: {
            text_template: `Alex had always been fascinated by ${interest}. Today felt different somehow.`,
            word_slots: [],
            target_word_count: 12,
            phonics_emphasis: ['fascinated', 'different', 'somehow'],
            section_type: 'intro'
          },
          setup: {
            text_template: `Walking through the area, Alex noticed something unusual.`,
            word_slots: [],
            target_word_count: 9,
            phonics_emphasis: ['walking', 'noticed', 'unusual'],
            section_type: 'setup'
          },
          problem: {
            text_template: `Something amazing was happening with ${interest}. Alex needed to investigate.`,
            word_slots: [],
            target_word_count: 11,
            phonics_emphasis: ['amazing', 'happening', 'investigate'],
            section_type: 'problem'
          },
          solution: {
            text_template: `After careful exploration, Alex discovered the answer. It was incredible!`,
            word_slots: [],
            target_word_count: 11,
            phonics_emphasis: ['careful', 'exploration', 'incredible'],
            section_type: 'solution'
          },
          reflection: {
            text_template: `Alex felt proud of this discovery. This ${interest} adventure would be remembered forever.`,
            word_slots: [],
            target_word_count: 13,
            phonics_emphasis: ['discovery', 'adventure', 'remembered'],
            section_type: 'reflection'
          }
        },
        challenge: {
          beginning: {
            text_template: `Alex had spent considerable time studying ${interest}, always hoping to make an extraordinary discovery.`,
            word_slots: [],
            target_word_count: 15,
            phonics_emphasis: ['considerable', 'extraordinary', 'discovery'],
            section_type: 'intro'
          },
          setup: {
            text_template: `Today's investigation revealed something unprecedented in the field of ${interest}.`,
            word_slots: [],
            target_word_count: 11,
            phonics_emphasis: ['investigation', 'unprecedented'],
            section_type: 'setup'
          },
          problem: {
            text_template: `The phenomenon required immediate analysis and careful documentation.`,
            word_slots: [],
            target_word_count: 9,
            phonics_emphasis: ['phenomenon', 'analysis', 'documentation'],
            section_type: 'problem'
          },
          solution: {
            text_template: `Through methodical research and persistent investigation, Alex unraveled the mystery.`,
            word_slots: [],
            target_word_count: 11,
            phonics_emphasis: ['methodical', 'persistent', 'unraveled'],
            section_type: 'solution'
          },
          reflection: {
            text_template: `This remarkable experience demonstrated that curiosity and perseverance lead to extraordinary discoveries in ${interest}.`,
            word_slots: [],
            target_word_count: 15,
            phonics_emphasis: ['remarkable', 'perseverance', 'extraordinary'],
            section_type: 'reflection'
          }
        }
      },
      required_word_tags: [interest],
      phonics_progression: {
        simple: ['cvc_pattern', 'consonant_blends'],
        full: ['digraphs', 'suffixes', 'compound_words'],
        challenge: ['multisyllabic', 'prefixes', 'complex_patterns']
      },
      metadata: {
        author: 'Auto-generated',
        created_date: new Date().toISOString(),
        target_age_range: '8-12',
        estimated_completion_time: {
          simple: '3-4 minutes',
          full: '6-8 minutes',
          challenge: '10-12 minutes'
        }
      }
    }
  }

  private static async generateFromTemplate(
    template: YourStoryTemplate,
    selectedInterests: string[],
    brainState: string,
    storyWideChoices: Record<string, string>  // Pass the story-wide choices
  ): Promise<{ simple: StoryVersion, full: StoryVersion, challenge: StoryVersion }> {
    
    console.log('🎯 Using story-wide choices for ALL levels:', storyWideChoices)
    
    return {
      simple: this.generateVersionFromStructure(
        template.structure.simple, 
        template, 
        'simple', 
        storyWideChoices
      ),
      full: this.generateVersionFromStructure(
        template.structure.full, 
        template, 
        'full', 
        storyWideChoices
      ),
      challenge: this.generateVersionFromStructure(
        template.structure.challenge, 
        template, 
        'challenge', 
        storyWideChoices
      )
    }
  }

  private static generateVersionFromStructure(
    structure: TemplateLevel, 
    template: YourStoryTemplate, 
    level: 'simple' | 'full' | 'challenge',
    storyWideChoices: Record<string, string>  // Use story-wide choices
  ): StoryVersion {
    
    console.log(`🗂️ Building ${level} version with STORY-WIDE choices:`, storyWideChoices)
    
    const content: StoryContent[] = []
    const sections = Object.entries(structure)
    
    sections.forEach(([sectionName, section]) => {
      if (section && section.text_template) {
        console.log(`📖 Processing section "${sectionName}" for ${level} level`)
        
        // CRITICAL: Use story-wide choices + generate section-specific choices for non-critical slots
        const sectionChoices = this.generateSectionChoices(
          section.word_slots || [], 
          storyWideChoices
        )
        
        let filledText = this.fillTemplate(section.text_template, sectionChoices)
        
        console.log(`✨ Filled text: "${filledText}"`)
        
        content.push({
          type: 'paragraph',
          text: filledText,
          phonicsFocus: section.phonics_emphasis || []
        })
      }
    })
  
    // Add phonics moment
    if (content.length > 1) {
      const phonicsWords = template.phonics_progression[level]?.slice(0, 4) || ['reading', 'words', 'together']
      const allPhonicsWords = content.flatMap(c => c.phonicsFocus || []).slice(0, 4)
      
      content.splice(Math.floor(content.length / 2), 0, {
        type: 'phonics-moment',
        skill: phonicsWords[0] || 'word patterns',
        words: allPhonicsWords.length > 0 ? allPhonicsWords : ['practice', 'reading', 'together'],
        instruction: level === 'simple' 
          ? 'Look at these cool word patterns!' 
          : level === 'full'
          ? 'Notice how these words work together in similar ways.'
          : 'Can you see the patterns in how these words are built?'
      })
    }
  
    return {
      content,
      readingTime: template.metadata.estimated_completion_time[level],
      vocabulary: level === 'simple' ? 'basic' : level === 'full' ? 'standard' : 'advanced',
      averageWordsPerSentence: level === 'simple' ? 6 : level === 'full' ? 10 : 14,
      phonicsComplexity: level === 'simple' ? 'basic' : level === 'full' ? 'intermediate' : 'advanced'
    }
  }

  // NEW METHOD: Generate choices for a specific section, respecting story-wide choices
  private static generateSectionChoices(
    wordSlots: WordSlot[], 
    storyWideChoices: Record<string, string>
  ): Record<string, string> {
    const sectionChoices = { ...storyWideChoices } // Start with story-wide choices
    
    // Only generate new choices for slots that aren't already locked in
    wordSlots.forEach(slot => {
      if (!sectionChoices[slot.slot_name] && slot.word_hints.length > 0) {
        // This is a non-critical slot, generate a choice just for this section
        const randomChoice = slot.word_hints[Math.floor(Math.random() * slot.word_hints.length)]
        sectionChoices[slot.slot_name] = randomChoice
        console.log(`🆕 Section-specific choice: "${slot.slot_name}" = "${randomChoice}"`)
      }
    })
    
    return sectionChoices
  }

  private static fillTemplate(template: string, choices: Record<string, string>): string {
    let result = template
    
    Object.entries(choices).forEach(([slotName, chosenWord]) => {
      const placeholder = `[${slotName}]`
      const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      result = result.replace(regex, chosenWord)
    })
    
    return result
  }
    
  // Keep existing helper methods
  private static createStoryConcept(interests: string[]): string {
    const combinations = [
      `A ${interests[0]} adventure with ${interests[1] || 'unexpected twists'}`,
      `When ${interests[0]} meets ${interests[1] || 'new challenges'}`,
      `The mystery of ${interests[0]} and ${interests[1] || 'hidden secrets'}`,
      `An unexpected journey through ${interests[0]} and ${interests[1] || 'amazing discoveries'}`
    ]
    
    return combinations[Math.floor(Math.random() * combinations.length)]
  }
}