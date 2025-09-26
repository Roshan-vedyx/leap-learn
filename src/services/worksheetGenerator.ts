// src/services/worksheetGenerator.ts - Student-Centered Adaptive Generation
interface Word {
    id: string
    word: string
    complexity: string
    phonics_focus: string
    chunks: string[]
    alternative_chunks: string[]
    themes: string[]
    meaning_support?: string
  }
  
  interface StudentProfile {
    processingStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed'
    attentionSpan: 'brief' | 'moderate' | 'extended'
    sensoryNeeds: string[]
    motorPlanning: 'high_support' | 'some_support' | 'independent'
    socialEmotional: 'confidence_building' | 'challenge_ready' | 'mixed'
  }
  
  interface WorksheetConfig {
    studentProfile: StudentProfile
    energyLevel: 'full_focus' | 'partial' | 'survival_mode'
    learningGoal: 'pattern_recognition' | 'fluency_practice' | 'confidence_building'
    selectedPattern: string
    availableTime: number
    preferredActivities: string[]
  }
  
  interface ActivityModule {
    id: string
    name: string
    description: string
    estimatedTime: number
    cognitiveLoad: 'low' | 'medium' | 'high'
    sensoryDemands: string[]
    canSkip: boolean
    successRate: number
    type: 'recognition' | 'production' | 'application' | 'creative'
    adaptations: StudentAdaptation[]
  }
  
  interface StudentAdaptation {
    profileMatch: Partial<StudentProfile>
    modifications: {
      layout?: 'spacious' | 'compact' | 'boxes'
      instructions?: 'brief' | 'detailed' | 'visual_cues'
      choices?: number
      movementBreaks?: boolean
      timeEstimate?: number
      successSupports?: string[]
    }
  }
  
  interface AdaptiveWorksheetData {
    config: WorksheetConfig
    words: Word[]
    activities: ActivityModule[]
    estimatedTime: number
    adaptations: WorksheetAdaptation[]
    successPredictors: {
      confidenceLevel: number
      engagementFactors: string[]
      potentialChallenges: string[]
      supportStrategies: string[]
    }
  }
  
  interface WorksheetAdaptation {
    reason: string
    modification: string
    targetProfile: string
  }
  
  // Student-Centered Word Selection Logic
  class AdaptiveWordSelector {
    static selectWordsForStudent(
      patternWords: Word[], 
      config: WorksheetConfig
    ): { words: Word[], rationale: string[] } {
      const rationale: string[] = []
      let selectedWords: Word[] = []
  
      // Confidence builders: Always start with success-guaranteed words
      const easyWords = patternWords.filter(w => w.complexity === 'easy')
      const regularWords = patternWords.filter(w => w.complexity === 'regular')
      const challengeWords = patternWords.filter(w => w.complexity === 'challenge')
  
      // Base selection on learning goal and energy level
      if (config.energyLevel === 'survival_mode') {
        selectedWords = [...easyWords.slice(0, 4), ...regularWords.slice(0, 1)]
        rationale.push("Survival mode: Prioritizing success and confidence with easier words")
      } else if (config.learningGoal === 'confidence_building') {
        selectedWords = [...easyWords.slice(0, 3), ...regularWords.slice(0, 3), ...challengeWords.slice(0, 1)]
        rationale.push("Confidence building: 3 easy wins, 3 practice words, 1 stretch goal")
      } else if (config.learningGoal === 'pattern_recognition') {
        selectedWords = [...easyWords.slice(0, 2), ...regularWords.slice(0, 4), ...challengeWords.slice(0, 2)]
        rationale.push("Pattern recognition: Balanced mix for pattern awareness")
      } else { // fluency_practice
        selectedWords = [...easyWords.slice(0, 2), ...regularWords.slice(0, 3), ...challengeWords.slice(0, 3)]
        rationale.push("Fluency practice: More challenging words for speed building")
      }
  
      // Adjust for attention span
      const maxWords = config.studentProfile.attentionSpan === 'brief' ? 6 : 
                      config.studentProfile.attentionSpan === 'moderate' ? 10 : 15
  
      if (selectedWords.length > maxWords) {
        selectedWords = selectedWords.slice(0, maxWords)
        rationale.push(`Limited to ${maxWords} words based on attention span`)
      }
  
      // Theme-based selection for engagement (if available)
      if (selectedWords.length < maxWords) {
        const themeWords = patternWords.filter(w => 
          w.themes && w.themes.some(theme => 
            ['animals', 'nature', 'friendship', 'adventure'].includes(theme)
          )
        )
        const additionalWords = themeWords
          .filter(w => !selectedWords.includes(w))
          .slice(0, maxWords - selectedWords.length)
        
        selectedWords.push(...additionalWords)
        if (additionalWords.length > 0) {
          rationale.push("Added engaging themed words for motivation")
        }
      }
  
      return { words: selectedWords, rationale }
    }
  }
  
  // Activity Selection Based on Student Needs
  class AdaptiveActivitySelector {
    private static ACTIVITY_DATABASE: ActivityModule[] = [
      {
        id: 'pattern_detective',
        name: 'Pattern Detective',
        description: 'Find and circle the magic pattern in words',
        estimatedTime: 5,
        cognitiveLoad: 'low',
        sensoryDemands: ['visual_scanning'],
        canSkip: false,
        successRate: 0.9,
        type: 'recognition',
        adaptations: [
          {
            profileMatch: { processingStyle: 'visual' },
            modifications: { 
              layout: 'boxes',
              instructions: 'visual_cues',
              successSupports: ['Large fonts', 'Clear boxes around patterns']
            }
          },
          {
            profileMatch: { attentionSpan: 'brief' },
            modifications: { 
              choices: 4,
              timeEstimate: 3,
              successSupports: ['Only 4 words', 'Quick completion']
            }
          }
        ]
      },
      {
        id: 'word_choice_builder',
        name: 'Choose & Build',
        description: 'Pick your favorite words and build them from chunks',
        estimatedTime: 8,
        cognitiveLoad: 'medium',
        sensoryDemands: ['decision_making', 'visual_organization'],
        canSkip: true,
        successRate: 0.85,
        type: 'production',
        adaptations: [
          {
            profileMatch: { socialEmotional: 'confidence_building' },
            modifications: { 
              choices: 3,
              instructions: 'brief',
              successSupports: ['Student choice', 'Success guaranteed']
            }
          },
          {
            profileMatch: { motorPlanning: 'high_support' },
            modifications: { 
              layout: 'spacious',
              instructions: 'detailed',
              successSupports: ['Large writing spaces', 'Step-by-step guidance']
            }
          }
        ]
      },
      {
        id: 'movement_spelling',
        name: 'Body Spelling',
        description: 'Spell words using your whole body',
        estimatedTime: 7,
        cognitiveLoad: 'medium',
        sensoryDemands: ['kinesthetic', 'gross_motor'],
        canSkip: true,
        successRate: 0.95,
        type: 'application',
        adaptations: [
          {
            profileMatch: { processingStyle: 'kinesthetic' },
            modifications: { 
              movementBreaks: true,
              timeEstimate: 10,
              successSupports: ['Full body engagement', 'Movement integration']
            }
          }
        ]
      },
      {
        id: 'real_world_hunt',
        name: 'Pattern Hunter',
        description: 'Find pattern words in your environment',
        estimatedTime: 10,
        cognitiveLoad: 'low',
        sensoryDemands: ['environmental_scanning'],
        canSkip: true,
        successRate: 0.8,
        type: 'application',
        adaptations: [
          {
            profileMatch: { attentionSpan: 'extended' },
            modifications: { 
              timeEstimate: 15,
              choices: 5,
              successSupports: ['Extended exploration', 'Multiple examples']
            }
          }
        ]
      },
      {
        id: 'creative_sentence',
        name: 'Story Starter',
        description: 'Create sentences with your pattern words',
        estimatedTime: 12,
        cognitiveLoad: 'high',
        sensoryDemands: ['creative_thinking', 'fine_motor'],
        canSkip: true,
        successRate: 0.6,
        type: 'creative',
        adaptations: [
          {
            profileMatch: { learningGoal: 'fluency_practice' },
            modifications: { 
              choices: 2,
              instructions: 'brief',
              successSupports: ['Just 2 sentences', 'Creative freedom']
            }
          }
        ]
      }
    ]
  
    static selectActivitiesForStudent(config: WorksheetConfig): {
      activities: ActivityModule[],
      adaptations: WorksheetAdaptation[]
    } {
      let availableActivities = [...this.ACTIVITY_DATABASE]
      const adaptations: WorksheetAdaptation[] = []
  
      // Filter out inappropriate activities
      availableActivities = availableActivities.filter(activity => {
        // Remove high cognitive load for survival mode
        if (config.energyLevel === 'survival_mode' && activity.cognitiveLoad === 'high') {
          adaptations.push({
            reason: 'Survival mode energy level',
            modification: `Removed ${activity.name} due to high cognitive load`,
            targetProfile: 'energy_level'
          })
          return false
        }
  
        // Prioritize kinesthetic for kinesthetic learners
        if (config.studentProfile.processingStyle === 'kinesthetic' && 
            !activity.sensoryDemands.includes('kinesthetic') &&
            !activity.sensoryDemands.includes('gross_motor') &&
            activity.id !== 'pattern_detective') {
          return false
        }
  
        return true
      })
  
      // Sort by appropriateness
      availableActivities.sort((a, b) => {
        // Prioritize based on learning goal
        if (config.learningGoal === 'confidence_building') {
          return b.successRate - a.successRate
        }
        return a.estimatedTime - b.estimatedTime
      })
  
      // Select activities within time constraints
      const selectedActivities: ActivityModule[] = []
      let totalTime = 0
  
      // Always include pattern recognition (core skill)
      const coreActivity = availableActivities.find(a => a.id === 'pattern_detective')
      if (coreActivity) {
        selectedActivities.push(coreActivity)
        totalTime += this.getAdaptedTime(coreActivity, config)
      }
  
      // Add complementary activities
      for (const activity of availableActivities) {
        if (activity.id === 'pattern_detective') continue
  
        const adaptedTime = this.getAdaptedTime(activity, config)
        if (totalTime + adaptedTime <= config.availableTime && selectedActivities.length < 4) {
          selectedActivities.push(activity)
          totalTime += adaptedTime
  
          // Add adaptation notes
          const adaptation = this.findBestAdaptation(activity, config)
          if (adaptation) {
            adaptations.push({
              reason: `Adapted for ${config.studentProfile.processingStyle} learner`,
              modification: `${activity.name}: ${adaptation.modifications.successSupports?.join(', ')}`,
              targetProfile: 'processing_style'
            })
          }
        }
      }
  
      return { activities: selectedActivities, adaptations }
    }
  
    private static getAdaptedTime(activity: ActivityModule, config: WorksheetConfig): number {
      const adaptation = this.findBestAdaptation(activity, config)
      return adaptation?.modifications.timeEstimate || activity.estimatedTime
    }
  
    private static findBestAdaptation(activity: ActivityModule, config: WorksheetConfig): StudentAdaptation | null {
      return activity.adaptations.find(adaptation => {
        return Object.keys(adaptation.profileMatch).some(key => 
          config.studentProfile[key as keyof StudentProfile] === adaptation.profileMatch[key as keyof StudentProfile] ||
          config.learningGoal === adaptation.profileMatch.socialEmotional
        )
      }) || null
    }
  }
  
  // Main worksheet generation function
  export const generateAdaptiveWorksheet = async (
    allWords: Word[],
    config: WorksheetConfig
  ): Promise<AdaptiveWorksheetData> => {
    // Filter words by selected pattern
    const patternWords = allWords.filter(word => 
      word.phonics_focus === config.selectedPattern
    )
  
    if (patternWords.length === 0) {
      throw new Error(`No words found for pattern "${config.selectedPattern}"`)
    }
  
    // Select appropriate words for this student
    const { words: selectedWords, rationale: wordRationale } = 
      AdaptiveWordSelector.selectWordsForStudent(patternWords, config)
  
    // Select appropriate activities for this student
    const { activities: selectedActivities, adaptations } = 
      AdaptiveActivitySelector.selectActivitiesForStudent(config)
  
    // Calculate success predictors
    const successPredictors = this.calculateSuccessPredictors(
      selectedWords,
      selectedActivities,
      config
    )
  
    // Estimate total time including adaptations
    const estimatedTime = selectedActivities.reduce((sum, activity) => 
      sum + AdaptiveActivitySelector.getAdaptedTime(activity, config), 0
    )
  
    return {
      config,
      words: selectedWords,
      activities: selectedActivities,
      estimatedTime,
      adaptations: [
        ...adaptations,
        ...wordRationale.map(reason => ({
          reason: 'Word selection strategy',
          modification: reason,
          targetProfile: 'student_needs'
        }))
      ],
      successPredictors
    }
  }
  
  // Success prediction logic
  function calculateSuccessPredictors(
    words: Word[],
    activities: ActivityModule[],
    config: WorksheetConfig
  ): {
    confidenceLevel: number
    engagementFactors: string[]
    potentialChallenges: string[]
    supportStrategies: string[]
  } {
    const avgSuccessRate = activities.reduce((sum, a) => sum + a.successRate, 0) / activities.length
    const wordComplexityScore = words.reduce((sum, w) => {
      return sum + (w.complexity === 'easy' ? 1 : w.complexity === 'regular' ? 0.7 : 0.4)
    }, 0) / words.length
  
    const confidenceLevel = (avgSuccessRate + wordComplexityScore) / 2
  
    const engagementFactors: string[] = []
    if (config.studentProfile.processingStyle === 'kinesthetic') {
      engagementFactors.push('Movement-based activities included')
    }
    if (activities.some(a => a.canSkip)) {
      engagementFactors.push('Student choice and flexibility')
    }
    if (config.energyLevel === 'full_focus') {
      engagementFactors.push('Optimal energy level for learning')
    }
  
    const potentialChallenges: string[] = []
    if (config.energyLevel === 'survival_mode') {
      potentialChallenges.push('Low energy may affect completion')
    }
    if (config.studentProfile.attentionSpan === 'brief') {
      potentialChallenges.push('Short attention span requires pacing')
    }
    if (activities.some(a => a.cognitiveLoad === 'high')) {
      potentialChallenges.push('Some activities require sustained focus')
    }
  
    const supportStrategies: string[] = [
      'Movement breaks between activities',
      'Choice-based completion ("do what feels right")',
      'Success-first word ordering',
      'Visual pattern highlighting'
    ]
  
    return {
      confidenceLevel,
      engagementFactors,
      potentialChallenges,
      supportStrategies
    }
  }
  
  // Backwards compatibility with existing interface
  export const generatePhonicsWorksheet = async (params: any): Promise<any> => {
    // Convert old params to new config format
    const config: WorksheetConfig = {
      studentProfile: {
        processingStyle: 'mixed',
        attentionSpan: 'moderate',
        sensoryNeeds: [],
        motorPlanning: 'some_support',
        socialEmotional: 'confidence_building'
      },
      energyLevel: 'full_focus',
      learningGoal: 'pattern_recognition',
      selectedPattern: params.pattern,
      availableTime: 20,
      preferredActivities: []
    }
  
    const adaptiveResult = await generateAdaptiveWorksheet(params.words, config)
  
    // Convert back to old format for compatibility
    return {
      selectedPattern: adaptiveResult.config.selectedPattern,
      difficulty: 'adaptive',
      wordCount: adaptiveResult.words.length,
      words: adaptiveResult.words,
      activities: adaptiveResult.activities.map(activity => ({
        type: activity.type,
        title: activity.name,
        instructions: activity.description,
        content: activity
      }))
    }
  }