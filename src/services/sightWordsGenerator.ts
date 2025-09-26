// src/services/sightWordsGenerator.ts
// Student-Centered Sight Word Worksheet Generation

interface SightWord {
    id: string
    word: string
    frequency_tier: 'essential' | 'high' | 'medium' | 'advanced'
    grade_intro: number
    complexity: 'easy' | 'regular' | 'tricky'
    visual_features: string[] // ['double_letters', 'silent_letters', 'unusual_pattern']
    meaning_category: string[] // ['emotions', 'actions', 'descriptions', 'questions']
    student_interest_tags: string[] // ['animals', 'friendship', 'mystery', 'space']
    phonetic_irregular: boolean
    length: number
    emotional_valence: 'positive' | 'neutral' | 'complex'
    context_examples: string[] // example sentences/contexts where word appears
  }
  
  interface SightWordStudentProfile {
    processingStyle: 'visual_strengths' | 'auditory_strengths' | 'kinesthetic_movement' | 'pattern_detective' | 'story_connections'
    attentionSpan: 'quick_wins' | 'moderate_focus' | 'deep_dive_ready'
    sensoryNeeds: string[]
    motorPlanning: 'high_support' | 'some_support' | 'independent_writing'
    confidenceLevel: 'building_trust' | 'ready_to_stretch' | 'seeking_challenge'
    interests: string[]
    knownWordEstimate: 'emerging_reader' | 'developing_reader' | 'fluent_but_gaps'
  }
  
  interface SightWordConfig {
    studentProfile: SightWordStudentProfile
    todaysEnergy: 'survival_mode' | 'steady_learning' | 'peak_performance'
    learningGoal: 'confidence_building' | 'filling_gaps' | 'expanding_vocabulary' | 'fluency_practice'
    knownWords: string[]
    curiousWords: string[]
    interestContext: string
    availableTime: number
    preferredActivities: string[]
    avoidToday: string[]
  }
  
  interface SightWordActivity {
    id: string
    name: string
    description: string
    estimatedTime: number
    cognitiveLoad: 'light' | 'moderate' | 'intensive'
    requires: string[]
    adaptations: SightWordAdaptation[]
    successRate: number
    type: 'recognition' | 'meaning_connection' | 'context_practice' | 'creative_expression'
    ndFriendlyFeatures: string[]
  }
  
  interface SightWordAdaptation {
    profileMatch: Partial<SightWordStudentProfile>
    modifications: {
      wordCount?: number
      activityType?: string
      supportLevel?: 'minimal' | 'moderate' | 'intensive'
      choiceOptions?: number
      timeAdjustment?: number
      instructions?: 'visual' | 'verbal' | 'step_by_step'
      successSupports?: string[]
    }
  }
  
  interface SightWordWorksheetData {
    config: SightWordConfig
    selectedWords: SightWord[]
    activities: SightWordActivity[]
    estimatedTime: number
    rationale: string
    successPrediction: number
    adaptations: {
      reason: string
      modification: string
      targetProfile: string
    }[]
  }
  
  // Available sight word activities with ND-friendly design
  const SIGHT_WORD_ACTIVITIES: SightWordActivity[] = [
    {
      id: 'word_detective',
      name: 'Word Detective',
      description: 'Find and circle chosen words in a mini story or paragraph',
      estimatedTime: 6,
      cognitiveLoad: 'light',
      requires: ['visual_scanning'],
      successRate: 0.95,
      type: 'recognition',
      ndFriendlyFeatures: ['Student choice of which words to find', 'Context provides meaning support', 'No writing required'],
      adaptations: [
        {
          profileMatch: { processingStyle: 'visual_strengths' },
          modifications: {
            supportLevel: 'minimal',
            instructions: 'visual',
            successSupports: ['Color coding', 'Clear visual hierarchy']
          }
        },
        {
          profileMatch: { confidenceLevel: 'building_trust' },
          modifications: {
            wordCount: 3,
            choiceOptions: 2,
            successSupports: ['Words appear multiple times', 'Guaranteed success']
          }
        }
      ]
    },
    {
      id: 'meaning_connections',
      name: 'What Does This Mean to You?',
      description: 'Connect words to personal experiences through pictures, phrases, or memories',
      estimatedTime: 8,
      cognitiveLoad: 'moderate',
      requires: ['self_reflection', 'personal_connection'],
      successRate: 0.88,
      type: 'meaning_connection',
      ndFriendlyFeatures: ['Honors lived experience', 'Multiple expression options', 'No "wrong" answers'],
      adaptations: [
        {
          profileMatch: { motorPlanning: 'high_support' },
          modifications: {
            supportLevel: 'intensive',
            instructions: 'step_by_step',
            successSupports: ['Drawing option', 'Voice recording', 'Symbol selection']
          }
        },
        {
          profileMatch: { processingStyle: 'story_connections' },
          modifications: {
            activityType: 'narrative_prompts',
            successSupports: ['Story starters', 'Character connections']
          }
        }
      ]
    },
    {
      id: 'context_champions',
      name: 'Context Champions',
      description: 'See your words in 3 different contexts (story, question, description)',
      estimatedTime: 7,
      cognitiveLoad: 'moderate',
      requires: ['reading_comprehension', 'pattern_recognition'],
      successRate: 0.82,
      type: 'context_practice',
      ndFriendlyFeatures: ['Multiple meaning exposure', 'Builds comprehension', 'Shows word flexibility'],
      adaptations: [
        {
          profileMatch: { attentionSpan: 'quick_wins' },
          modifications: {
            wordCount: 2,
            timeAdjustment: -3,
            successSupports: ['One context per word', 'Clear visual separation']
          }
        },
        {
          profileMatch: { knownWordEstimate: 'emerging_reader' },
          modifications: {
            supportLevel: 'intensive',
            instructions: 'visual',
            successSupports: ['Audio support', 'Picture context clues']
          }
        }
      ]
    },
    {
      id: 'movement_words',
      name: 'Movement Words',
      description: 'Spell words with movement, find word cards, or act out meanings',
      estimatedTime: 8,
      cognitiveLoad: 'light',
      requires: ['movement_space', 'gross_motor'],
      successRate: 0.92,
      type: 'recognition',
      ndFriendlyFeatures: ['Full body engagement', 'Kinesthetic memory', 'Natural movement breaks'],
      adaptations: [
        {
          profileMatch: { processingStyle: 'kinesthetic_movement' },
          modifications: {
            timeAdjustment: 3,
            supportLevel: 'minimal',
            successSupports: ['Extended movement time', 'Multiple movement options']
          }
        },
        {
          profileMatch: { sensoryNeeds: ['movement_breaks'] },
          modifications: {
            activityType: 'integrated_breaks',
            successSupports: ['Movement between each word', 'Sensory regulation']
          }
        }
      ]
    },
    {
      id: 'word_building_blocks',
      name: 'Word Building Blocks',
      description: 'Build words from letter tiles, trace creatively, or type on device',
      estimatedTime: 10,
      cognitiveLoad: 'moderate',
      requires: ['fine_motor', 'sequencing'],
      successRate: 0.75,
      type: 'creative_expression',
      ndFriendlyFeatures: ['Choice of materials', 'Accommodates motor differences', 'Builds confidence'],
      adaptations: [
        {
          profileMatch: { motorPlanning: 'high_support' },
          modifications: {
            supportLevel: 'intensive',
            instructions: 'step_by_step',
            successSupports: ['Large letter tiles', 'Magnetic letters', 'Digital option']
          }
        },
        {
          profileMatch: { confidenceLevel: 'ready_to_stretch' },
          modifications: {
            wordCount: 4,
            choiceOptions: 3,
            successSupports: ['Creative spelling options', 'Personal style encouraged']
          }
        }
      ]
    },
    {
      id: 'story_starring_you',
      name: 'Story Starring You',
      description: 'Create a mini story using your words and your interests',
      estimatedTime: 12,
      cognitiveLoad: 'intensive',
      requires: ['creative_thinking', 'writing_or_dictation'],
      successRate: 0.68,
      type: 'creative_expression',
      ndFriendlyFeatures: ['Student interests central', 'Multiple creation options', 'Celebrates creativity'],
      adaptations: [
        {
          profileMatch: { processingStyle: 'story_connections' },
          modifications: {
            supportLevel: 'minimal',
            timeAdjustment: 5,
            successSupports: ['Extended creative time', 'Story structure support']
          }
        },
        {
          profileMatch: { motorPlanning: 'high_support' },
          modifications: {
            activityType: 'dictation_supported',
            successSupports: ['Voice-to-text', 'Drawing + words', 'Partner scribing']
          }
        }
      ]
    }
  ]
  
  /**
   * Smart word selection for sight words - focuses on meaning and recognition
   */
  export class SightWordSelector {
    static selectWordsForStudent(
      allWords: SightWord[], 
      config: SightWordConfig
    ): { words: SightWord[], rationale: string[] } {
      
      const rationale: string[] = []
      let candidateWords = [...allWords]
      
      // Filter by student's estimated reading level
      candidateWords = this.filterByReadingLevel(candidateWords, config)
      rationale.push(`Filtered for ${config.studentProfile.knownWordEstimate} level`)
      
      // Prioritize by interest context
      if (config.interestContext) {
        candidateWords = this.prioritizeByInterest(candidateWords, config.interestContext)
        rationale.push(`Prioritized words related to "${config.interestContext}"`)
      }
      
      // Include confidence builders (words they likely know)
      const confidenceWords = this.selectConfidenceBuilders(candidateWords, config)
      rationale.push(`Included ${confidenceWords.length} confidence-building words`)
      
      // Add curiosity words (words they've shown interest in)
      const curiosityWords = this.selectCuriosityWords(candidateWords, config)
      if (curiosityWords.length > 0) {
        rationale.push(`Added ${curiosityWords.length} words student is curious about`)
      }
      
      // Add strategic new words based on learning goal
      const newWords = this.selectStrategicNewWords(candidateWords, config)
      rationale.push(`Selected ${newWords.length} new words for ${config.learningGoal}`)
      
      // Combine and limit based on energy/attention
      const allSelected = [...confidenceWords, ...curiosityWords, ...newWords]
      const finalWords = this.limitByCapacity(allSelected, config)
      
      rationale.push(`Final selection: ${finalWords.length} words matched to student's capacity today`)
      
      return { words: finalWords, rationale }
    }
    
    private static filterByReadingLevel(words: SightWord[], config: SightWordConfig): SightWord[] {
      const levelMap = {
        'emerging_reader': ['essential', 'high'],
        'developing_reader': ['essential', 'high', 'medium'],
        'fluent_but_gaps': ['essential', 'high', 'medium', 'advanced']
      }
      
      const allowedTiers = levelMap[config.studentProfile.knownWordEstimate]
      return words.filter(word => allowedTiers.includes(word.frequency_tier))
    }
    
    private static prioritizeByInterest(words: SightWord[], context: string): SightWord[] {
      // Sort by relevance to student interest
      return words.sort((a, b) => {
        const aMatch = a.student_interest_tags.some(tag => 
          context.toLowerCase().includes(tag) || tag === 'universal'
        )
        const bMatch = b.student_interest_tags.some(tag => 
          context.toLowerCase().includes(tag) || tag === 'universal'
        )
        if (aMatch && !bMatch) return -1
        if (!aMatch && bMatch) return 1
        return 0
      })
    }
    
    private static selectConfidenceBuilders(words: SightWord[], config: SightWordConfig): SightWord[] {
      // Include words they likely already know for confidence
      const knownWords = words.filter(word => 
        config.knownWords.includes(word.word) || 
        (word.complexity === 'easy' && word.frequency_tier === 'essential')
      )
      
      return knownWords.slice(0, 2) // Always include 2 confidence builders
    }
    
    private static selectCuriosityWords(words: SightWord[], config: SightWordConfig): SightWord[] {
      return words.filter(word => config.curiousWords.includes(word.word)).slice(0, 2)
    }
    
    private static selectStrategicNewWords(words: SightWord[], config: SightWordConfig): SightWord[] {
      let candidates = words.filter(word => 
        !config.knownWords.includes(word.word) && 
        !config.curiousWords.includes(word.word)
      )
      
      // Filter by learning goal
      switch (config.learningGoal) {
        case 'confidence_building':
          candidates = candidates.filter(w => w.complexity === 'easy')
          break
        case 'filling_gaps':
          candidates = candidates.filter(w => w.frequency_tier === 'essential' || w.frequency_tier === 'high')
          break
        case 'expanding_vocabulary':
          candidates = candidates.filter(w => w.emotional_valence === 'positive')
          break
        case 'fluency_practice':
          // No additional filtering - include variety
          break
      }
      
      return candidates.slice(0, 3)
    }
    
    private static limitByCapacity(words: SightWord[], config: SightWordConfig): SightWord[] {
      let maxWords = 6 // default
      
      if (config.todaysEnergy === 'survival_mode') maxWords = 3
      else if (config.studentProfile.attentionSpan === 'quick_wins') maxWords = 4
      else if (config.studentProfile.attentionSpan === 'deep_dive_ready') maxWords = 7
      
      return words.slice(0, maxWords)
    }
  }
  
  /**
   * Activity selection for sight word practice
   */
  export class SightWordActivitySelector {
    static selectActivitiesForStudent(
      config: SightWordConfig
    ): { activities: SightWordActivity[], adaptations: any[] } {
      
      let activities = [...SIGHT_WORD_ACTIVITIES]
      const adaptations: any[] = []
      
      // Filter out activities to avoid
      activities = activities.filter(activity => 
        !config.avoidToday.includes(activity.id)
      )
      
      // Prioritize by processing style
      activities = this.prioritizeByProcessingStyle(activities, config.studentProfile.processingStyle)
      
      // Adjust for energy level
      if (config.todaysEnergy === 'survival_mode') {
        activities = activities.filter(a => a.cognitiveLoad === 'light')
        adaptations.push({
          reason: 'Low energy day',
          modification: 'Selected only light cognitive load activities',
          targetProfile: 'energy_management'
        })
      }
      
      // Adjust for confidence level
      if (config.studentProfile.confidenceLevel === 'building_trust') {
        activities = activities.filter(a => a.successRate >= 0.85)
        adaptations.push({
          reason: 'Building confidence',
          modification: 'Selected high-success activities only',
          targetProfile: 'confidence_building'
        })
      }
      
      // Select appropriate number based on attention span
      const maxActivities = this.getMaxActivities(config.studentProfile.attentionSpan)
      const selectedActivities = activities.slice(0, maxActivities)
      
      return { activities: selectedActivities, adaptations }
    }
    
    private static prioritizeByProcessingStyle(
      activities: SightWordActivity[], 
      style: SightWordStudentProfile['processingStyle']
    ): SightWordActivity[] {
      const priorityMap = {
        'visual_strengths': ['word_detective', 'context_champions'],
        'kinesthetic_movement': ['movement_words', 'word_building_blocks'],
        'story_connections': ['story_starring_you', 'meaning_connections'],
        'pattern_detective': ['context_champions', 'word_detective'],
        'auditory_strengths': ['meaning_connections', 'context_champions']
      }
      
      const priorities = priorityMap[style] || []
      
      return activities.sort((a, b) => {
        const aIndex = priorities.indexOf(a.id)
        const bIndex = priorities.indexOf(b.id)
        if (aIndex !== -1 && bIndex === -1) return -1
        if (aIndex === -1 && bIndex !== -1) return 1
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
        return 0
      })
    }
    
    private static getMaxActivities(attentionSpan: SightWordStudentProfile['attentionSpan']): number {
      switch (attentionSpan) {
        case 'quick_wins': return 2
        case 'moderate_focus': return 3
        case 'deep_dive_ready': return 4
        default: return 3
      }
    }
  }
  
  /**
   * Main sight word worksheet generation function
   */
  export const generateSightWordWorksheet = async (
    allWords: SightWord[],
    config: SightWordConfig
  ): Promise<SightWordWorksheetData> => {
    
    // Select appropriate words for this student
    const { words: selectedWords, rationale: wordRationale } = 
      SightWordSelector.selectWordsForStudent(allWords, config)
    
    // Select appropriate activities for this student  
    const { activities: selectedActivities, adaptations } = 
      SightWordActivitySelector.selectActivitiesForStudent(config)
    
    // Calculate success prediction
    const successPrediction = calculateSuccessPrediction(selectedWords, selectedActivities, config)
    
    // Estimate total time
    const estimatedTime = selectedActivities.reduce((sum, activity) => 
      sum + activity.estimatedTime, 0
    )
    
    // Generate rationale
    const rationale = `Selected ${selectedWords.length} sight words using ${config.learningGoal} approach. ${wordRationale.join('. ')}`
    
    return {
      config,
      selectedWords,
      activities: selectedActivities,
      estimatedTime,
      rationale,
      successPrediction,
      adaptations: adaptations.concat(
        wordRationale.map(reason => ({
          reason: 'Word selection strategy',
          modification: reason,
          targetProfile: 'student_needs'
        }))
      )
    }
  }
  
  /**
   * Calculate likelihood of student success with this worksheet
   */
  function calculateSuccessPrediction(
    words: SightWord[],
    activities: SightWordActivity[],
    config: SightWordConfig
  ): number {
    const avgActivitySuccess = activities.reduce((sum, a) => sum + a.successRate, 0) / activities.length
    
    const wordComplexityScore = words.reduce((sum, w) => {
      return sum + (w.complexity === 'easy' ? 1 : w.complexity === 'regular' ? 0.7 : 0.4)
    }, 0) / words.length
    
    const energyMultiplier = {
      'survival_mode': 0.9,
      'steady_learning': 1.0,
      'peak_performance': 1.1
    }[config.todaysEnergy]
    
    const confidenceMultiplier = {
      'building_trust': 0.95,
      'ready_to_stretch': 1.0,
      'seeking_challenge': 1.05
    }[config.studentProfile.confidenceLevel]
    
    const baseSuccess = (avgActivitySuccess + wordComplexityScore) / 2
    return Math.min(0.98, baseSuccess * energyMultiplier * confidenceMultiplier)
  }
  
  // Backwards compatibility function (similar to existing phonics generator)
  export const generateSightWordsWorksheet = async (params: any): Promise<any> => {
    // Convert old-style params to new config format if needed
    const config: SightWordConfig = {
      studentProfile: {
        processingStyle: params.processingStyle || 'visual_strengths',
        attentionSpan: params.attentionSpan || 'moderate_focus',
        sensoryNeeds: params.sensoryNeeds || [],
        motorPlanning: params.motorPlanning || 'some_support',
        confidenceLevel: params.confidenceLevel || 'building_trust',
        interests: params.interests || [],
        knownWordEstimate: params.knownWordEstimate || 'developing_reader'
      },
      todaysEnergy: params.todaysEnergy || 'steady_learning',
      learningGoal: params.learningGoal || 'confidence_building',
      knownWords: params.knownWords || [],
      curiousWords: params.curiousWords || [],
      interestContext: params.interestContext || '',
      availableTime: params.availableTime || 15,
      preferredActivities: params.preferredActivities || [],
      avoidToday: params.avoidToday || []
    }
    
    const result = await generateSightWordWorksheet(params.words || [], config)
    
    // Convert to expected format for existing PDF generator
    return {
      selectedWords: result.selectedWords,
      activities: result.activities.map(activity => ({
        type: activity.type,
        title: activity.name,
        instructions: activity.description,
        content: activity,
        estimatedTime: activity.estimatedTime
      })),
      rationale: result.rationale,
      successPrediction: result.successPrediction,
      config: result.config
    }
  }