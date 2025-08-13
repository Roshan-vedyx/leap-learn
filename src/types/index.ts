// Global types for Vedyx Leap V2.0

// Accessibility and Neurodivergent Support Types
export type AccessibilityMode = 'default' | 'adhd' | 'dyslexia' | 'autism'
export type FontSize = 'default' | 'large' | 'extra-large'
export type ReadingMode = 'text' | 'audio' | 'both'

// Brain State and Emotional Regulation Types
export type BrainState = 'energetic' | 'focused' | 'tired' | 'excited' | 'overwhelmed' | 'curious'
export type Mood = 'calm' | 'energetic' | 'focused' | 'neutral'

// User Preference Types
export interface UserPreferences {
  accessibilityMode: AccessibilityMode
  fontSize: FontSize
  reducedMotion: boolean
  highContrast: boolean
  audioEnabled: boolean
  audioSettings: AudioSettings
}

export type TtsAccent = 'US' | 'GB' | 'IN'

export interface AudioSettings {
  rate: number
  pitch: number
  volume: number
  voice?: SpeechSynthesisVoice
  lang?: string
  accent?: TtsAccent
}

// Story and Content Types
export interface Story {
  id: string
  title: string
  level: string
  readingTime: string
  phonicsSkills: string[]
  content: StoryContent[]
  difficulty: 1 | 2 | 3 | 4 | 5
  themes: string[]
}

export type StoryContentType = 'paragraph' | 'phonics-moment' | 'illustration' | 'interaction'

export interface StoryContent {
  type: StoryContentType
  text?: string
  phonicsFocus?: string[]
  skill?: string
  words?: string[]
  instruction?: string
  imageUrl?: string
  altText?: string
}

// Phonics and Learning Types
export interface PhonicsSkill {
  id: string
  name: string
  description: string
  level: number
  examples: string[]
  practiceWords: string[]
}

export interface PhonicsProgress {
  skillId: string
  level: number
  practiceCount: number
  masteryScore: number
  lastPracticed: string
}

// Session and Progress Types
export interface LearningSession {
  id: string
  startTime: string
  endTime?: string
  brainState: BrainState
  storyId: string
  readingMode: ReadingMode
  sectionsCompleted: number
  totalSections: number
  phonicsSkillsPracticed: string[]
  creativeResponse?: CreativeResponse
  completed: boolean
}

export interface CreativeResponse {
  promptId: string
  promptText: string
  userResponse: string
  wordCount: number
  timestamp: string
}

// User Progress and Analytics Types
export interface UserProgress {
  totalSessionsCompleted: number
  totalStoriesRead: number
  totalReadingTime: number // in minutes
  phonicsProgress: PhonicsProgress[]
  favoriteGenres: string[]
  readingLevel: number
  lastActiveDate: string
  streakDays: number
}

// Component Prop Types
export interface AccessibleComponentProps {
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-pressed'?: boolean
  role?: string
  tabIndex?: number
}

// Button Variants and Sizes
export type ButtonVariant = 
  | 'default' 
  | 'destructive' 
  | 'outline' 
  | 'secondary' 
  | 'ghost' 
  | 'link'
  | 'calm'
  | 'high-contrast'
  | 'celebration'

export type ButtonSize = 'default' | 'sm' | 'lg' | 'xl' | 'comfortable' | 'extra-large' | 'icon'

// Card Variants
export type CardVariant = 
  | 'default' 
  | 'outline' 
  | 'elevated' 
  | 'calm' 
  | 'high-contrast' 
  | 'celebration'

export type CardPadding = 'none' | 'sm' | 'default' | 'lg' | 'comfortable'

export type CardInteractive = 'none' | 'hover' | 'focus' | 'full'

// Input Variants
export type InputVariant = 
  | 'default' 
  | 'outline' 
  | 'calm' 
  | 'high-contrast' 
  | 'error' 
  | 'success'

export type InputSize = 'sm' | 'default' | 'lg' | 'comfortable'

// Modal Types
export type ModalVariant = 'default' | 'calm' | 'high-contrast' | 'celebration'
export type ModalSize = 'sm' | 'default' | 'lg' | 'xl' | 'full'

// Breathing Exercise Types
export type BreathingPattern = '4-7-8' | '4-4-4' | 'box'

export interface BreathingExercise {
  pattern: BreathingPattern
  duration: number // in seconds
  instructions: string[]
  completed: boolean
}

// Navigation Types
export interface NavigationItem {
  path: string
  label: string
  icon?: string
  accessKey?: string
  description?: string
}

// Error and Loading States
export interface ErrorState {
  hasError: boolean
  message?: string
  code?: string
  timestamp?: string
}

export interface LoadingState {
  isLoading: boolean
  message?: string
  progress?: number
}

// Multi-Version Story Support
export interface StoryVersion {
  content: StoryContent[]
  readingTime: string
  vocabulary: 'basic' | 'standard' | 'advanced'
  averageWordsPerSentence: number
  phonicsComplexity: 'basic' | 'intermediate' | 'advanced'
}

export interface MultiVersionStory extends Omit<Story, 'content'> {
  concept: string
  interests: string[]
  versions: {
    simple: StoryVersion
    full: StoryVersion
    challenge: StoryVersion
  }
}

// Complexity Level Type
export type ComplexityLevel = 'simple' | 'full' | 'challenge'

// Interest Selection Types
export interface InterestTopic {
  id: string
  label: string
  emoji: string
  description: string
  color: string
  category: 'nature' | 'technology' | 'social' | 'adventure' | 'mystery' | 'creative'
}

// Story Generation Types
export interface StoryGenerationRequest {
  interests: string[]
  brainState: BrainState
  complexityPreference?: ComplexityLevel
}

export interface StoryGenerationResult {
  story: MultiVersionStory
  generationTime: number
  selectedComplexity: ComplexityLevel
}

// API Response Types (for future backend integration)
export interface ApiResponse<T> {
  data: T
  status: 'success' | 'error'
  message?: string
  timestamp: string
}

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user-preferences',
  ACCESSIBILITY_MODE: 'accessibility-mode',
  FONT_SIZE: 'font-size',
  TTS_ACCENT: 'tts-accent', // Add this line
  AUDIO_PREFERENCES: 'audio-preferences',
  CURRENT_BRAIN_STATE: 'current-brain-state',
  CREATIVE_RESPONSE: 'creative-response',
  COMPLETED_SESSIONS: 'completed-sessions',
  USER_PROGRESS: 'user-progress',
  PHONICS_PROGRESS: 'phonics-progress',
  SELECTED_INTERESTS: 'selected-interests',
  CURRENT_GENERATED_STORY: 'current-generated-story',
  CURRENT_COMPLEXITY_LEVEL: 'current-complexity-level',
  STORY_GENERATION_HISTORY: 'story-generation-history'
} as const

// Validation Types
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

// Utility Types
export type Writeable<T> = { -readonly [P in keyof T]: T[P] }

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredField<T, K extends keyof T> = T & Required<Pick<T, K>>

// Event Handler Types
export type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void
export type KeyboardHandler = (event: React.KeyboardEvent<HTMLElement>) => void
export type ChangeHandler<T = string> = (value: T) => void

// Accessibility Testing Types
export interface AccessibilityTestResult {
  component: string
  wcagLevel: 'A' | 'AA' | 'AAA'
  tests: {
    colorContrast: boolean
    keyboardNavigation: boolean
    screenReader: boolean
    focusManagement: boolean
    touchTargetSize: boolean
  }
  issues: string[]
  score: number
}

// Component Ref Types
export type ComponentRef<T = HTMLElement> = React.RefObject<T>

// Custom Hook Types
export interface UseAudioReturn {
  speak: (text: string, options?: Partial<AudioSettings>) => Promise<void>
  stop: () => void
  isSupported: boolean
  isPlaying: boolean
  voices: SpeechSynthesisVoice[]
}

export interface UseLocalStorageReturn<T> {
  value: T
  setValue: (value: T) => void
  removeValue: () => void
}

// Theme and Design System Types
export interface DesignTokens {
  colors: Record<string, string>
  spacing: Record<string, string>
  typography: Record<string, string>
  animations: Record<string, string>
  breakpoints: Record<string, string>
}

// Testing and Analytics Types (for future implementation)
export interface AnalyticsEvent {
  event: string
  category: string
  action: string
  value?: number
  userId?: string
  sessionId: string
  timestamp: string
  properties?: Record<string, any>
}

export interface PerformanceMetrics {
  loadTime: number
  interactionTime: number
  readingSpeed: number // words per minute
  completionRate: number
  errorRate: number
}