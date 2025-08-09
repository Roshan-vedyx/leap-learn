import { MultiVersionStory, StoryVersion, StoryContent } from '@/types'

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export class AIStoryService {
  private static readonly API_URL = 'https://api.openai.com/v1/chat/completions'
  private static readonly API_KEY = import.meta.env.VITE_OPENAI_API_KEY

  static async generateStory(
    selectedInterests: string[], 
    brainState: string
  ): Promise<MultiVersionStory> {
    
    if (!this.API_KEY) {
      console.warn('OpenAI API key not found, using mock generation')
      return this.fallbackToMockGeneration(selectedInterests, brainState)
    }

    try {
      // Generate the story concept and all three versions
      const storyData = await this.callOpenAI(selectedInterests, brainState)
      
      // Parse and structure the response
      const structuredStory = this.parseAIResponse(storyData, selectedInterests, brainState)
      
      return structuredStory
    } catch (error) {
      console.error('AI Story generation failed:', error)
      // Fallback to mock generation if API fails
      return this.fallbackToMockGeneration(selectedInterests, brainState)
    }
  }

  private static async callOpenAI(interests: string[], brainState: string): Promise<string> {
    const prompt = this.buildPrompt(interests, brainState)

    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Cost-effective model good for creative tasks
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.8, // Creative but not too random
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const data: OpenAIResponse = await response.json()
    return data.choices[0].message.content
  }

  private static getSystemPrompt(): string {
    return `You are a specialized children's literacy AI that creates engaging, age-appropriate stories for neurodivergent middle schoolers (ages 11-14). Your stories integrate "stealth phonics" - embedding systematic reading skills naturally within exciting adventures.

CRITICAL REQUIREMENTS:
1. Create ONE story concept with THREE versions (simple/full/challenge) that maintain the SAME plot and characters
2. All versions must feel dignified and age-appropriate - never babyish or remedial
3. Embed phonics naturally through character names, locations, and action words
4. Keep paragraphs short (2-3 sentences) and snappy
5. Include authentic tween dialogue and relatable situations
6. Integrate the user's interests seamlessly into the plot

STORY STRUCTURE for each version:
- 4 story sections + 1 phonics moment (5 total)
- Simple: 6 words/sentence average, basic vocabulary
- Full: 12 words/sentence average, standard vocabulary  
- Challenge: 20 words/sentence average, advanced vocabulary

PHONICS INTEGRATION:
- Identify 3-5 target words per section that demonstrate phonics patterns
- Include one dedicated "phonics moment" that feels like a natural part of the story
- Focus on: consonant blends, long vowels, compound words, syllable patterns

TONE: Cool, engaging, respectful of intelligence while being accessible. Think Percy Jackson meets everyday middle school adventures.

RESPOND WITH VALID JSON ONLY using this exact structure:
{
  "title": "story title",
  "concept": "brief concept description", 
  "phonicsSkills": ["skill1", "skill2"],
  "versions": {
    "simple": {
      "content": [
        {"type": "paragraph", "text": "story text", "phonicsFocus": ["word1", "word2"]},
        {"type": "phonics-moment", "skill": "phonics skill", "words": ["word1", "word2", "word3"], "instruction": "teaching instruction"}
      ],
      "readingTime": "3-4 minutes",
      "vocabulary": "basic"
    },
    "full": { /* same structure */ },
    "challenge": { /* same structure */ }
  }
}`
  }

  private static buildPrompt(interests: string[], brainState: string): string {
    const interestsList = interests.slice(0, 3).join(', ')
    const brainStateContext = this.getBrainStateContext(brainState)
    
    return `Create a personalized story for a middle schooler who is interested in: ${interestsList}

The student's current brain state is: ${brainState}
${brainStateContext}

STORY REQUIREMENTS:
- Combine the interests: ${interestsList} into one cohesive adventure
- Create exactly 4 story paragraphs + 1 phonics moment (5 sections total)
- Same plot/characters across all three versions, only complexity changes
- Include stealth phonics focusing on consonant blends, long vowels, or compound words
- Make the phonics moment feel natural (like solving a code, reading a sign, etc.)
- Ensure all content feels "cool" and age-appropriate for 11-14 year olds

Remember: This student chose these interests because they sound exciting today. Make it feel like the perfect adventure for them!`
  }

  private static getBrainStateContext(brainState: string): string {
    const contexts = {
      energetic: 'Include more action, movement, and dynamic scenes. The student has high energy today.',
      focused: 'Student is ready to concentrate. Include mystery elements and details to discover.',
      tired: 'Keep the pace gentle but engaging. Include calming elements and supportive characters.',
      excited: 'Student is enthusiastic! Include celebrations, discoveries, and positive surprises.',
      overwhelmed: 'Keep content simple and calming. Include supportive friends and manageable challenges.',
      curious: 'Include lots of discovery, investigation, and "what if" moments to explore.'
    }
    
    return contexts[brainState as keyof typeof contexts] || contexts.focused
  }

  private static parseAIResponse(
    aiResponse: string, 
    interests: string[], 
    brainState: string
  ): MultiVersionStory {
    try {
      const parsed = JSON.parse(aiResponse)
      
      // Validate the structure
      if (!parsed.title || !parsed.versions) {
        throw new Error('Invalid AI response structure')
      }

      // Create the MultiVersionStory object
      return {
        id: `ai-generated-${Date.now()}`,
        title: parsed.title,
        concept: parsed.concept || `Adventure combining ${interests.join(' and ')}`,
        interests: interests,
        level: 'Adaptive (Grades 3-6)',
        phonicsSkills: parsed.phonicsSkills || ['consonant blends', 'long vowels'],
        difficulty: 3,
        themes: interests,
        versions: {
          simple: this.validateStoryVersion(parsed.versions.simple, 'simple'),
          full: this.validateStoryVersion(parsed.versions.full, 'full'),
          challenge: this.validateStoryVersion(parsed.versions.challenge, 'challenge')
        }
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error)
      throw new Error('AI response parsing failed')
    }
  }

  private static validateStoryVersion(versionData: any, type: 'simple' | 'full' | 'challenge'): StoryVersion {
    // Ensure we have valid content array
    if (!versionData?.content || !Array.isArray(versionData.content)) {
      throw new Error(`Invalid ${type} version content`)
    }

    // Set defaults based on complexity level
    const defaults = {
      simple: { readingTime: '3-4 minutes', vocabulary: 'basic' as const, averageWordsPerSentence: 6, phonicsComplexity: 'basic' as const },
      full: { readingTime: '6-8 minutes', vocabulary: 'standard' as const, averageWordsPerSentence: 12, phonicsComplexity: 'intermediate' as const },
      challenge: { readingTime: '10-12 minutes', vocabulary: 'advanced' as const, averageWordsPerSentence: 20, phonicsComplexity: 'advanced' as const }
    }

    return {
      content: versionData.content.map((section: any) => this.validateContentSection(section)),
      readingTime: versionData.readingTime || defaults[type].readingTime,
      vocabulary: versionData.vocabulary || defaults[type].vocabulary,
      averageWordsPerSentence: versionData.averageWordsPerSentence || defaults[type].averageWordsPerSentence,
      phonicsComplexity: versionData.phonicsComplexity || defaults[type].phonicsComplexity
    }
  }

  private static validateContentSection(section: any): StoryContent {
    // Ensure required fields exist
    if (!section.type) {
      throw new Error('Content section missing type')
    }

    if (section.type === 'phonics-moment') {
      return {
        type: 'phonics-moment',
        skill: section.skill || 'consonant blends',
        words: section.words || ['word1', 'word2', 'word3'],
        instruction: section.instruction || 'Notice the letter patterns in these words.'
      }
    } else {
      return {
        type: section.type || 'paragraph',
        text: section.text || 'Story content goes here.',
        phonicsFocus: section.phonicsFocus || []
      }
    }
  }

  // Fallback to mock generation if AI fails
  private static async fallbackToMockGeneration(
    interests: string[], 
    brainState: string
  ): Promise<MultiVersionStory> {
    console.log('Using fallback mock generation')
    
    // Import the mock service and use it
    const { StoryGenerationService } = await import('./StoryGenerationService')
    return StoryGenerationService.generateStory(interests, brainState)
  }

  // Test method for checking API connectivity
  static async testConnection(): Promise<boolean> {
    if (!this.API_KEY) {
      console.warn('No OpenAI API key found')
      return false
    }

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
        },
      })
      return response.ok
    } catch (error) {
      console.error('OpenAI connection test failed:', error)
      return false
    }
  }
}