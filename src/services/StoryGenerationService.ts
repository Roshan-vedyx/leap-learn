import { Story, StoryContent } from '@/types'

// Extended Story interface for multi-version stories
export interface MultiVersionStory extends Omit<Story, 'content'> {
  concept: string
  interests: string[]
  versions: {
    simple: StoryVersion
    full: StoryVersion
    challenge: StoryVersion
  }
}

export interface StoryVersion {
  content: StoryContent[]
  readingTime: string
  vocabulary: 'basic' | 'standard' | 'advanced'
  averageWordsPerSentence: number
  phonicsComplexity: 'basic' | 'intermediate' | 'advanced'
}

export class StoryGenerationService {
  
  static async generateStory(
    selectedInterests: string[], 
    brainState: string
  ): Promise<MultiVersionStory> {
    
    // For now, we'll use sophisticated mock generation
    // Later this will be replaced with actual AI API calls
    
    // Create a story concept by combining interests
    const concept = this.createStoryConcept(selectedInterests)
    const storyId = `generated-${Date.now()}`
    
    // Generate base story elements
    const baseElements = this.generateBaseElements(selectedInterests, brainState)
    
    // Create three versions of the same story
    const simpleVersion = this.generateSimpleVersion(baseElements, brainState)
    const fullVersion = this.generateFullVersion(baseElements, brainState)
    const challengeVersion = this.generateChallengeVersion(baseElements, brainState)
    
    return {
      id: storyId,
      title: baseElements.title,
      concept,
      interests: selectedInterests,
      level: 'Adaptive (Grades 3-6)',
      phonicsSkills: baseElements.phonicsSkills,
      difficulty: 3, // Will adapt based on chosen version
      themes: selectedInterests,
      versions: {
        simple: simpleVersion,
        full: fullVersion,
        challenge: challengeVersion
      }
    }
  }

  private static createStoryConcept(interests: string[]): string {
    // Create engaging combinations
    const combinations = [
      `A ${interests[0]} adventure with ${interests[1]}`,
      `When ${interests[0]} meets ${interests[1]}`,
      `The mystery of ${interests[0]} and ${interests[1]}`,
      `An unexpected journey through ${interests[0]} and ${interests[1]}`
    ]
    
    return combinations[Math.floor(Math.random() * combinations.length)]
  }

  private static generateBaseElements(interests: string[], brainState: string) {
    // Story templates based on interest combinations
    const templates = this.getStoryTemplates()
    const template = templates[interests[0]] || templates.default
    
    // Adapt elements based on brain state
    const adaptedElements = this.adaptForBrainState(template, brainState)
    
    return {
      title: this.generateTitle(interests),
      characters: adaptedElements.characters,
      setting: adaptedElements.setting,
      plotPoints: adaptedElements.plotPoints,
      phonicsSkills: ['consonant blends', 'long vowels', 'compound words'],
      vocabulary: this.getVocabularyByInterests(interests)
    }
  }

  private static generateTitle(interests: string[]): string {
    const titleTemplates = {
      ocean: ['The Secret of the Deep', 'Ocean Mystery', 'Underwater Adventure'],
      space: ['Mission to the Stars', 'The Space Station Secret', 'Galactic Adventure'],
      friendship: ['The Friendship Code', 'Best Friends Forever', 'New Kid Adventures'],
      mystery: ['The Hidden Clue', 'Mystery at School', 'The Secret Message'],
      animals: ['The Animal Rescue', 'Wild Adventure', 'Pet Detective'],
      robots: ['Robot Helper', 'The AI Adventure', 'Future Friends'],
      magic: ['The Magic Discovery', 'Enchanted Adventure', 'Wizard School'],
      sports: ['Championship Day', 'The Big Game', 'Team Spirit'],
      invention: ['The Amazing Invention', 'Gadget Genius', 'Science Fair Success'],
      school: ['School Mystery', 'The Class Project', 'Teacher\'s Secret'],
      family: ['Family Adventure', 'The Great Family Mystery', 'Home Sweet Home'],
      art: ['The Art Contest', 'Creative Adventures', 'Music Magic']
    }

    const primaryInterest = interests[0]
    const titles = titleTemplates[primaryInterest as keyof typeof titleTemplates] || ['The Great Adventure']
    
    return titles[Math.floor(Math.random() * titles.length)]
  }

  private static generateSimpleVersion(baseElements: any, brainState: string): StoryVersion {
    const content: StoryContent[] = [
      {
        type: 'paragraph',
        text: `Sam loved ${baseElements.setting}. Today felt different. Something exciting was about to happen.`,
        phonicsFocus: ['loved', 'different', 'exciting']
      },
      {
        type: 'paragraph',
        text: `"Look!" said Sam's friend. "I see something cool over there!"`,
        phonicsFocus: ['friend', 'something']
      },
      {
        type: 'phonics-moment',
        skill: 'consonant blends',
        words: ['friend', 'something', 'exciting'],
        instruction: 'These words have letter teams that work together!'
      },
      {
        type: 'paragraph',
        text: `They ran to see what it was. It was amazing! This was going to be the best day ever.`,
        phonicsFocus: ['amazing', 'going', 'best']
      }
    ]

    return {
      content,
      readingTime: '3-4 minutes',
      vocabulary: 'basic',
      averageWordsPerSentence: 6,
      phonicsComplexity: 'basic'
    }
  }

  private static generateFullVersion(baseElements: any, brainState: string): StoryVersion {
    const content: StoryContent[] = [
      {
        type: 'paragraph',
        text: `Sam had always been fascinated by ${baseElements.setting}, but today something felt unusually different. The air seemed to buzz with possibility.`,
        phonicsFocus: ['fascinated', 'unusually', 'possibility']
      },
      {
        type: 'paragraph',
        text: `"Check this out!" called Maya, Sam's best friend since kindergarten. She was pointing toward something that definitely hadn't been there yesterday.`,
        phonicsFocus: ['kindergarten', 'pointing', 'definitely']
      },
      {
        type: 'phonics-moment',
        skill: 'long vowels',
        words: ['fascinated', 'kindergarten', 'definitely'],
        instruction: 'Notice the long vowel sounds in these longer words.'
      },
      {
        type: 'paragraph',
        text: `They approached cautiously, their curiosity growing with each step. What they discovered would change everything they thought they knew about their neighborhood.`,
        phonicsFocus: ['approached', 'cautiously', 'curiosity', 'neighborhood']
      }
    ]

    return {
      content,
      readingTime: '6-8 minutes',
      vocabulary: 'standard',
      averageWordsPerSentence: 12,
      phonicsComplexity: 'intermediate'
    }
  }

  private static generateChallengeVersion(baseElements: any, brainState: string): StoryVersion {
    const content: StoryContent[] = [
      {
        type: 'paragraph',
        text: `Sam had harbored an inexplicable fascination with ${baseElements.setting} for as long as anyone could remember, but today's atmosphere seemed permeated with an almost palpable sense of anticipation.`,
        phonicsFocus: ['inexplicable', 'fascination', 'permeated', 'anticipation']
      },
      {
        type: 'paragraph',
        text: `"You need to see this immediately!" exclaimed Maya, Sam's steadfast companion since their kindergarten days, gesturing emphatically toward an anomalous structure that had mysteriously materialized overnight.`,
        phonicsFocus: ['immediately', 'steadfast', 'emphatically', 'anomalous', 'materialized']
      },
      {
        type: 'phonics-moment',
        skill: 'compound words',
        words: ['neighborhood', 'overnight', 'something'],
        instruction: 'These compound words combine two smaller words to create new meanings.'
      },
      {
        type: 'paragraph',
        text: `They approached with calculated deliberation, their intellectual curiosity intensifying exponentially with each measured stride toward what would inevitably revolutionize their fundamental understanding of their familiar neighborhood.`,
        phonicsFocus: ['calculated', 'deliberation', 'exponentially', 'revolutionize']
      }
    ]

    return {
      content,
      readingTime: '10-12 minutes',
      vocabulary: 'advanced',
      averageWordsPerSentence: 20,
      phonicsComplexity: 'advanced'
    }
  }

  private static getStoryTemplates() {
    return {
      ocean: {
        characters: ['marine biologist', 'dolphin friend', 'submarine captain'],
        setting: 'the mysterious depths of the ocean',
        plotPoints: ['discovery of underwater cave', 'encounter with sea creatures', 'solving ocean mystery']
      },
      space: {
        characters: ['young astronaut', 'friendly robot', 'alien visitor'],
        setting: 'a space station orbiting Earth',
        plotPoints: ['equipment malfunction', 'first contact', 'working together to solve problems']
      },
      friendship: {
        characters: ['new student', 'shy classmate', 'helpful teacher'],
        setting: 'the local middle school',
        plotPoints: ['overcoming differences', 'building trust', 'supporting each other']
      },
      default: {
        characters: ['curious student', 'wise mentor', 'helpful friend'],
        setting: 'an interesting place in town',
        plotPoints: ['making a discovery', 'solving a problem', 'learning something new']
      }
    }
  }

  private static adaptForBrainState(template: any, brainState: string) {
    // Adjust story elements based on brain state
    switch (brainState) {
      case 'energetic':
        return {
          ...template,
          plotPoints: template.plotPoints.map((point: string) => `action-packed ${point}`)
        }
      case 'overwhelmed':
        return {
          ...template,
          plotPoints: template.plotPoints.map((point: string) => `calm ${point}`)
        }
      case 'curious':
        return {
          ...template,
          plotPoints: template.plotPoints.map((point: string) => `mysterious ${point}`)
        }
      default:
        return template
    }
  }

  private static getVocabularyByInterests(interests: string[]) {
    const vocabularySets = {
      ocean: ['marine', 'current', 'depth', 'surface', 'coral'],
      space: ['orbit', 'galaxy', 'planet', 'asteroid', 'cosmic'],
      friendship: ['loyalty', 'trust', 'support', 'kindness', 'understanding'],
      mystery: ['clue', 'evidence', 'suspect', 'investigate', 'solution'],
      animals: ['habitat', 'species', 'conservation', 'wildlife', 'ecosystem'],
      robots: ['artificial', 'programming', 'technology', 'automation', 'digital']
    }

    const vocabulary: string[] = []
    interests.forEach(interest => {
      const words = vocabularySets[interest as keyof typeof vocabularySets] || []
      vocabulary.push(...words)
    })

    return vocabulary.slice(0, 10) // Limit to 10 key vocabulary words
  }
}