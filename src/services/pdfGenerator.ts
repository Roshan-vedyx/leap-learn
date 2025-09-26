// src/services/pdfGenerator.ts - Student-Centered Adaptive PDF Generator
import jsPDF from 'jspdf'

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
}

interface AdaptiveWorksheetData {
  config: WorksheetConfig
  words: Word[]
  activities: ActivityModule[]
  estimatedTime: number
  adaptations: WorksheetAdaptation[]
  successPredictors: any
  studentProfile?: StudentProfile // For backwards compatibility
}

interface WorksheetAdaptation {
  reason: string
  modification: string
  targetProfile: string
}

interface LayoutConfig {
  fontSize: number
  lineSpacing: number
  margin: number
  wordBoxSize: { width: number, height: number }
  wordsPerRow: number
  includeMovementBreaks: boolean
  choiceBasedInstructions: boolean
  largeTargetAreas: boolean
}

export class AdaptivePDFGenerator {
  private doc: jsPDF
  private pageHeight: number = 279.4 // A4 height in mm
  private pageWidth: number = 215.9 // A4 width in mm
  private currentY: number = 20
  private pageNumber: number = 1
  private layout: LayoutConfig
  private config: WorksheetConfig

  constructor(worksheetConfig: WorksheetConfig) {
    this.doc = new jsPDF('p', 'mm', 'a4')
    this.doc.setFont('helvetica')
    this.config = worksheetConfig
    this.layout = this.calculateLayoutConfig(worksheetConfig.studentProfile)
  }

  // Calculate layout based on student profile
  private calculateLayoutConfig(profile: StudentProfile): LayoutConfig {
    const base: LayoutConfig = {
      fontSize: 12,
      lineSpacing: 8,
      margin: 25,
      wordBoxSize: { width: 40, height: 15 },
      wordsPerRow: 4,
      includeMovementBreaks: false,
      choiceBasedInstructions: false,
      largeTargetAreas: false
    }

    // Visual processor adaptations
    if (profile.processingStyle === 'visual') {
      base.fontSize = 14
      base.lineSpacing = 10
      base.margin = 30
      base.wordBoxSize = { width: 45, height: 18 }
      base.wordsPerRow = 3
      base.largeTargetAreas = true
    }

    // Kinesthetic learner adaptations
    if (profile.processingStyle === 'kinesthetic') {
      base.includeMovementBreaks = true
      base.wordBoxSize = { width: 50, height: 20 }
      base.wordsPerRow = 3
      base.lineSpacing = 12
    }

    // Motor planning support
    if (profile.motorPlanning === 'high_support') {
      base.fontSize = 16
      base.lineSpacing = 12
      base.margin = 35
      base.wordBoxSize = { width: 60, height: 25 }
      base.wordsPerRow = 2
      base.largeTargetAreas = true
    }

    // Brief attention span
    if (profile.attentionSpan === 'brief') {
      base.wordsPerRow = Math.max(2, base.wordsPerRow - 1)
      base.choiceBasedInstructions = true
    }

    // Confidence building needs
    if (profile.socialEmotional === 'confidence_building') {
      base.choiceBasedInstructions = true
      base.includeMovementBreaks = true
    }

    return base
  }

  private addNewPage() {
    this.doc.addPage()
    this.pageNumber++
    this.currentY = this.layout.margin
    this.addPageNumber()
  }

  private addPageNumber() {
    this.doc.setFontSize(10)
    this.doc.setTextColor(150)
    this.doc.text(
      `Page ${this.pageNumber}`, 
      this.pageWidth - this.layout.margin, 
      this.pageHeight - 15, 
      { align: 'right' }
    )
    this.doc.setTextColor(0)
  }

  private checkPageBreak(requiredSpace: number = 40) {
    if (this.currentY + requiredSpace > this.pageHeight - 40) {
      this.addNewPage()
    }
  }

  private addTitle(text: string, isMain: boolean = false) {
    const fontSize = isMain ? 20 : 16
    this.doc.setFontSize(fontSize)
    this.doc.setFont('helvetica', 'bold')
    
    // Center main titles for visual appeal
    if (isMain) {
      this.doc.text(text, this.pageWidth / 2, this.currentY, { align: 'center' })
    } else {
      this.doc.text(text, this.layout.margin, this.currentY)
    }
    
    this.currentY += this.layout.lineSpacing * 1.8
    this.doc.setFont('helvetica', 'normal')
  }

  private addInstructions(text: string, isChoiceBased: boolean = false) {
    this.doc.setFontSize(this.layout.fontSize)
    this.doc.setFont('helvetica', 'normal')
    
    if (isChoiceBased) {
      // Add choice language for ND accommodation
      const choiceText = text.replace(/\.$/, '') + '. Do what feels right today.'
      this.addWrappedText(choiceText)
    } else {
      this.addWrappedText(text)
    }
    
    this.currentY += this.layout.lineSpacing
  }

  private addWrappedText(text: string, indent: number = 0) {
    this.doc.setFontSize(this.layout.fontSize)
    const maxWidth = this.pageWidth - (this.layout.margin * 2) - indent
    const lines = this.doc.splitTextToSize(text, maxWidth)
    
    lines.forEach((line: string) => {
      this.doc.text(line, this.layout.margin + indent, this.currentY)
      this.currentY += this.layout.lineSpacing
    })
  }

  private addMovementBreak(activityName: string) {
    if (!this.layout.includeMovementBreaks) return
    
    this.currentY += this.layout.lineSpacing
    
    // Add a colored box for movement break
    this.doc.setFillColor(240, 248, 255) // Light blue background
    this.doc.rect(this.layout.margin, this.currentY - 5, this.pageWidth - (this.layout.margin * 2), 20, 'F')
    
    this.doc.setFontSize(this.layout.fontSize - 1)
    this.doc.setTextColor(70, 130, 180) // Steel blue text
    this.doc.text('Movement Break:', this.layout.margin + 5, this.currentY + 5)
    
    const breakText = this.getMovementBreakText(activityName)
    this.doc.text(breakText, this.layout.margin + 5, this.currentY + 12)
    
    this.doc.setTextColor(0) // Reset to black
    this.currentY += 25
  }

  private getMovementBreakText(activityName: string): string {
    const breaks = [
      "Stand up and spell one word in the air!",
      "Take 3 deep breaths and stretch your arms up high.",
      "Walk to a window and back to your seat.",
      "Do 5 jumping jacks or arm circles.",
      "Stretch like you're reaching for the stars!",
      "March in place while saying the alphabet."
    ]
    return breaks[Math.floor(Math.random() * breaks.length)]
  }

  // Generate Pattern Detective Activity (Visual Focus)
  private generatePatternDetectiveActivity(words: Word[], pattern: string) {
    this.addTitle('Pattern Detective')
    
    const patternDisplay = pattern.replace(/_/g, ' ').toUpperCase()
    this.addInstructions(
      `Find the ${patternDisplay} pattern and circle it in each word`,
      this.layout.choiceBasedInstructions
    )
    
    this.currentY += this.layout.lineSpacing * 2
    
    // Display words in adaptive boxes
    const wordsToShow = words.slice(0, this.config.studentProfile.attentionSpan === 'brief' ? 4 : 6)
    const cols = this.layout.wordsPerRow
    const boxWidth = this.layout.wordBoxSize.width
    const boxHeight = this.layout.wordBoxSize.height
    const spacing = (this.pageWidth - (this.layout.margin * 2) - (boxWidth * cols)) / (cols - 1)
    
    wordsToShow.forEach((word, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols
      const x = this.layout.margin + (col * (boxWidth + spacing))
      const y = this.currentY + (row * (boxHeight + 15))
      
      // Draw word box with ND-friendly styling
      this.doc.setDrawColor(180, 180, 180)
      this.doc.setLineWidth(0.5)
      this.doc.rect(x, y, boxWidth, boxHeight)
      
      // Add word with appropriate font size
      this.doc.setFontSize(this.layout.fontSize + 2)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(word.word, x + boxWidth/2, y + boxHeight/2 + 2, { align: 'center' })
      this.doc.setFont('helvetica', 'normal')
    })
    
    const rows = Math.ceil(wordsToShow.length / cols)
    this.currentY += (rows * (boxHeight + 15)) + this.layout.lineSpacing * 2
    
    this.addMovementBreak('Pattern Detective')
    
    // Success message for ND students
    this.doc.setFontSize(this.layout.fontSize - 1)
    this.doc.setTextColor(34, 139, 34) // Forest green
    this.addWrappedText('Complete what feels right today')
    this.doc.setTextColor(0)
    
    this.checkPageBreak()
  }

  // Generate Choice-Based Word Building Activity
  private generateChoiceBasedBuilding(words: Word[]) {
    this.addTitle('Choose & Build Words')
    
    const choiceCount = this.config.studentProfile.attentionSpan === 'brief' ? 3 : 
                      this.config.studentProfile.attentionSpan === 'moderate' ? 4 : 5
    
    this.addInstructions(
      `Pick your favorite ${choiceCount} words from the list below. Build each word using the letter chunks.`,
      true
    )
    
    this.currentY += this.layout.lineSpacing
    
    // Word selection area
    this.doc.setFontSize(this.layout.fontSize)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Word Choices:', this.layout.margin, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += this.layout.lineSpacing * 1.5
    
    // Display words in a choice-friendly format
    words.forEach((word, index) => {
      if (index >= 8) return // Limit choices to prevent overwhelm
      
      const checkboxSize = 5
      const x = this.layout.margin + (index % 2) * (this.pageWidth - this.layout.margin * 2) / 2
      const y = this.currentY + Math.floor(index / 2) * (this.layout.lineSpacing * 1.8)
      
      // Draw checkbox
      this.doc.rect(x, y - checkboxSize, checkboxSize, checkboxSize)
      
      // Add word
      this.doc.setFontSize(this.layout.fontSize)
      this.doc.text(word.word, x + checkboxSize + 5, y)
      
      // Show chunks in a helpful way
      this.doc.setFontSize(this.layout.fontSize - 2)
      this.doc.setTextColor(100)
      const chunks = word.chunks.length > 0 ? word.chunks : word.alternative_chunks || [word.word]
      this.doc.text(`[${chunks.join('] [')}]`, x + checkboxSize + 35, y)
      this.doc.setTextColor(0)
    })
    
    const rows = Math.ceil(Math.min(words.length, 8) / 2)
    this.currentY += (rows * this.layout.lineSpacing * 1.8) + this.layout.lineSpacing * 2
    
    // Building space with large areas for motor planning support
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Build Your Chosen Words:', this.layout.margin, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += this.layout.lineSpacing * 1.5
    
    for (let i = 0; i < choiceCount; i++) {
      // Word number
      this.doc.text(`${i + 1}.`, this.layout.margin, this.currentY)
      
      // Large writing line for motor planning support
      const lineY = this.currentY - 2
      const lineWidth = this.pageWidth - this.layout.margin * 2 - 15
      this.doc.setLineWidth(0.3)
      this.doc.line(this.layout.margin + 15, lineY, this.layout.margin + 15 + lineWidth, lineY)
      
      this.currentY += this.layout.lineSpacing * 2
      this.checkPageBreak()
    }
    
    this.addMovementBreak('Word Building')
  }

  // Generate Movement-Integrated Activity
  private generateMovementSpelling(words: Word[]) {
    if (!this.layout.includeMovementBreaks) return
    
    this.checkPageBreak(100)
    this.addTitle('Body Spelling Challenge')
    
    this.addInstructions(
      'Pick 2-3 words and spell them using your whole body! Use arms, legs, or dance moves.',
      true
    )
    
    this.currentY += this.layout.lineSpacing
    
    // Movement suggestions box
    this.doc.setFillColor(255, 248, 240) // Light orange background
    this.doc.rect(this.layout.margin, this.currentY, this.pageWidth - (this.layout.margin * 2), 50, 'F')
    
    this.doc.setFontSize(this.layout.fontSize)
    this.doc.setTextColor(205, 133, 63) // Peru color
    this.doc.text('Movement Ideas:', this.layout.margin + 5, this.currentY + 8)
    
    const ideas = [
      '• Jump for each letter',
      '• Make letter shapes with your arms',
      '• Step left and right for each sound',
      '• Clap the syllables',
      '• Point up for vowels, down for consonants'
    ]
    
    ideas.forEach((idea, index) => {
      this.doc.text(idea, this.layout.margin + 5, this.currentY + 18 + (index * 7))
    })
    
    this.doc.setTextColor(0)
    this.currentY += 60
    
    // Word selection area
    const selectedWords = words.slice(0, 5)
    selectedWords.forEach((word, index) => {
      const checkboxSize = 6
      this.doc.rect(this.layout.margin, this.currentY - checkboxSize, checkboxSize, checkboxSize)
      this.doc.setFontSize(this.layout.fontSize + 1)
      this.doc.text(word.word, this.layout.margin + checkboxSize + 8, this.currentY)
      this.currentY += this.layout.lineSpacing * 1.5
    })
    
    this.checkPageBreak()
  }

  // Generate Success-First Real World Hunt
  private generateRealWorldHunt(words: Word[]) {
    this.checkPageBreak(80)
    this.addTitle('Pattern Hunter Adventure')
    
    const patternName = this.config.selectedPattern.replace(/_/g, ' ')
    this.addInstructions(
      `Look around your space for words with the ${patternName} pattern. Find 2-5 words and write where you found them.`,
      true
    )
    
    this.currentY += this.layout.lineSpacing * 2
    
    // Success encouragement
    this.doc.setFillColor(240, 255, 240) // Light green
    this.doc.rect(this.layout.margin, this.currentY, this.pageWidth - (this.layout.margin * 2), 25, 'F')
    this.doc.setFontSize(this.layout.fontSize)
    this.doc.setTextColor(34, 139, 34)
    this.doc.text('Success Tip: ANY word with the pattern counts!', this.layout.margin + 5, this.currentY + 10)
    this.doc.text('Look in books, signs, labels, or even names!', this.layout.margin + 5, this.currentY + 18)
    this.doc.setTextColor(0)
    
    this.currentY += 35
    
    // Large, motor-friendly recording table
    const tableHeaders = ['Word I Found', 'Where I Found It']
    const colWidth = (this.pageWidth - this.layout.margin * 2) / 2
    
    // Header row
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(tableHeaders[0], this.layout.margin + 5, this.currentY)
    this.doc.text(tableHeaders[1], this.layout.margin + colWidth + 5, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += this.layout.lineSpacing
    
    // Draw header line
    this.doc.setLineWidth(0.5)
    this.doc.line(this.layout.margin, this.currentY, this.pageWidth - this.layout.margin, this.currentY)
    this.currentY += this.layout.lineSpacing
    
    // Create 5 large rows for writing
    for (let i = 0; i < 5; i++) {
      const rowHeight = 15
      
      // Draw row lines
      this.doc.setLineWidth(0.3)
      this.doc.line(this.layout.margin, this.currentY + rowHeight, this.pageWidth - this.layout.margin, this.currentY + rowHeight)
      this.doc.line(this.layout.margin + colWidth, this.currentY, this.layout.margin + colWidth, this.currentY + rowHeight)
      
      this.currentY += rowHeight
      this.checkPageBreak(20)
    }
    
    // Bonus encouragement
    this.currentY += this.layout.lineSpacing
    this.doc.setFillColor(255, 255, 240) // Light yellow
    this.doc.rect(this.layout.margin, this.currentY, this.pageWidth - (this.layout.margin * 2), 20, 'F')
    this.doc.setTextColor(184, 134, 11) // Dark goldenrod
    this.doc.text('Bonus: Can you find a word NOT on our practice list?', this.layout.margin + 5, this.currentY + 12)
    this.doc.setTextColor(0)
  }

  // Generate Student-Friendly Cover Page
  private generateStudentCoverPage(data: AdaptiveWorksheetData) {
    this.addPageNumber()
    
    // Friendly title
    const patternName = data.config.selectedPattern.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    this.addTitle(`${patternName} Detective Work`, true)
    
    this.currentY += this.layout.lineSpacing
    
    // Date in a friendly format
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    this.doc.setFontSize(this.layout.fontSize)
    this.doc.text(`Today is: ${today}`, this.pageWidth / 2, this.currentY, { align: 'center' })
    this.currentY += this.layout.lineSpacing * 2
    
    // Student-friendly introduction
    this.doc.setFontSize(this.layout.fontSize + 1)
    this.addWrappedText(`Hi! Today we're exploring the ${patternName.toLowerCase()} pattern in words. You'll be a word detective!`)
    
    this.currentY += this.layout.lineSpacing * 2
    
    // Practice words in a welcoming format
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Your Word Collection:', this.layout.margin, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += this.layout.lineSpacing * 1.5
    
    // Display words in an engaging grid
    const wordsPerRow = this.layout.wordsPerRow
    const wordBoxWidth = (this.pageWidth - this.layout.margin * 2 - (10 * (wordsPerRow - 1))) / wordsPerRow
    
    data.words.forEach((word, index) => {
      const row = Math.floor(index / wordsPerRow)
      const col = index % wordsPerRow
      const x = this.layout.margin + col * (wordBoxWidth + 10)
      const y = this.currentY + row * 25
      
      // Gentle border around each word
      this.doc.setDrawColor(200, 200, 255)
      this.doc.setFillColor(248, 248, 255)
      this.doc.rect(x, y - 3, wordBoxWidth, 18, 'FD')
      
      this.doc.setFontSize(this.layout.fontSize + 1)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(word.word, x + wordBoxWidth/2, y + 8, { align: 'center' })
      this.doc.setFont('helvetica', 'normal')
    })
    
    const rows = Math.ceil(data.words.length / wordsPerRow)
    this.currentY += (rows * 25) + this.layout.lineSpacing * 3
    
    // Encouraging message based on student profile
    this.doc.setFillColor(240, 255, 240)
    this.doc.rect(this.layout.margin, this.currentY, this.pageWidth - (this.layout.margin * 2), 60, 'F')
    
    this.doc.setFontSize(this.layout.fontSize + 1)
    this.doc.setTextColor(34, 139, 34)
    this.doc.text('Remember:', this.layout.margin + 10, this.currentY + 15)
    
    const encouragements = this.getPersonalizedEncouragements(data.config.studentProfile)
    encouragements.forEach((msg, index) => {
      this.doc.text(`• ${msg}`, this.layout.margin + 10, this.currentY + 25 + (index * 10))
    })
    
    this.doc.setTextColor(0)
    this.addNewPage()
  }

  private getPersonalizedEncouragements(profile: StudentProfile): string[] {
    const base = [
      "Do what feels right for you today",
      "Every attempt is a success",
      "Take breaks when you need them"
    ]
    
    if (profile.processingStyle === 'kinesthetic') {
      base.push("Feel free to move around while you work")
    }
    
    if (profile.socialEmotional === 'confidence_building') {
      base.push("You're doing great just by trying")
    }
    
    if (profile.attentionSpan === 'brief') {
      base.push("Work at your own pace")
    }
    
    return base.slice(0, 4)
  }

  // Generate Teacher Support Page
  private generateTeacherNotes(data: AdaptiveWorksheetData) {
    this.addTitle('Teacher & Parent Notes', true)
    
    // Student profile summary
    this.doc.setFillColor(240, 248, 255)
    this.doc.rect(this.layout.margin, this.currentY, this.pageWidth - (this.layout.margin * 2), 80, 'F')
    
    this.doc.setFontSize(this.layout.fontSize)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('This worksheet is designed for:', this.layout.margin + 5, this.currentY + 12)
    this.doc.setFont('helvetica', 'normal')
    
    const profile = data.config.studentProfile
    const profileInfo = [
      `• ${profile.processingStyle} learner`,
      `• ${profile.attentionSpan} attention span`,
      `• ${profile.motorPlanning} motor planning support`,
      `• ${data.config.energyLevel.replace('_', ' ')} energy level today`
    ]
    
    profileInfo.forEach((info, index) => {
      this.doc.text(info, this.layout.margin + 10, this.currentY + 25 + (index * 10))
    })
    
    this.currentY += 90
    
    // Adaptations made
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Adaptations Made:', this.layout.margin, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += this.layout.lineSpacing * 1.5
    
    data.adaptations.slice(0, 5).forEach((adaptation) => {
      this.addWrappedText(`• ${adaptation.modification}`, 5)
    })
    
    this.currentY += this.layout.lineSpacing
    
    // Support strategies
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Support Strategies:', this.layout.margin, this.currentY)
    this.doc.setFont('helvetica', 'normal')
    this.currentY += this.layout.lineSpacing * 1.5
    
    const strategies = [
      "Allow student to choose activity order",
      "Celebrate attempts, not just completion",
      "Provide movement breaks between activities",
      "Consider working in short sessions",
      "Use positive, encouraging language"
    ]
    
    strategies.forEach((strategy) => {
      this.addWrappedText(`• ${strategy}`, 5)
    })
    
    // Success predictors
    if (data.successPredictors) {
      this.currentY += this.layout.lineSpacing
      this.doc.setFont('helvetica', 'bold')
      this.doc.text('Expected Success Level:', this.layout.margin, this.currentY)
      this.doc.setFont('helvetica', 'normal')
      this.currentY += this.layout.lineSpacing * 1.5
      
      const confidence = Math.round(data.successPredictors.confidenceLevel * 100)
      this.addWrappedText(`Predicted success rate: ${confidence}%`, 5)
      
      if (data.successPredictors.potentialChallenges.length > 0) {
        this.addWrappedText(`Watch for: ${data.successPredictors.potentialChallenges.join(', ')}`, 5)
      }
    }
  }

  // Main generation function
  public generateAdaptiveWorksheetPDF(data: AdaptiveWorksheetData): jsPDF {
    // Generate cover page
    this.generateStudentCoverPage(data)
    
    // Generate activities based on selected modules
    data.activities.forEach((activity, index) => {
      switch (activity.id) {
        case 'pattern_detective':
          this.generatePatternDetectiveActivity(data.words, data.config.selectedPattern)
          break
        case 'word_choice_builder':
          this.generateChoiceBasedBuilding(data.words)
          break
        case 'movement_spelling':
          this.generateMovementSpelling(data.words)
          break
        case 'real_world_hunt':
          this.generateRealWorldHunt(data.words)
          break
        default:
          // Generic activity handler
          this.generateGenericActivity(activity, data.words)
      }
      
      // Add page break between activities unless it's the last one
      if (index < data.activities.length - 1) {
        this.addNewPage()
      }
    })
    
    // Add teacher notes
    this.addNewPage()
    this.generateTeacherNotes(data)
    
    return this.doc
  }

  // Fallback for unhandled activity types
  private generateGenericActivity(activity: ActivityModule, words: Word[]) {
    this.addTitle(activity.name)
    this.addInstructions(activity.description, this.layout.choiceBasedInstructions)
    
    // Simple word list
    this.currentY += this.layout.lineSpacing
    words.slice(0, 6).forEach((word, index) => {
      this.doc.text(`${index + 1}. ${word.word}`, this.layout.margin, this.currentY)
      this.currentY += this.layout.lineSpacing * 1.5
    })
    
    this.addMovementBreak(activity.name)
  }
}

// Export function for backwards compatibility and new adaptive approach
export const generateAndDownloadPDF = async (data: any) => {
  try {
    let generator: AdaptivePDFGenerator
    
    // Check if this is new adaptive data or legacy format
    if (data.config && data.config.studentProfile) {
      // New adaptive format
      generator = new AdaptivePDFGenerator(data.config)
      const pdf = generator.generateAdaptiveWorksheetPDF(data)
      
      const filename = `${data.config.selectedPattern}_adaptive_worksheet.pdf`
      pdf.save(filename)
    } else {
      // Legacy format - create basic profile
      const defaultConfig = {
        studentProfile: {
          processingStyle: 'mixed' as const,
          attentionSpan: 'moderate' as const,
          sensoryNeeds: [],
          motorPlanning: 'some_support' as const,
          socialEmotional: 'confidence_building' as const
        },
        energyLevel: 'full_focus' as const,
        learningGoal: 'pattern_recognition' as const,
        selectedPattern: data.selectedPattern || 'magic_e',
        availableTime: 20,
        preferredActivities: []
      }
      
      generator = new AdaptivePDFGenerator(defaultConfig)
      
      // Convert legacy data to adaptive format
      const adaptiveData = {
        config: defaultConfig,
        words: data.words || [],
        activities: data.activities?.map((act: any) => ({
          id: act.type || 'pattern_detective',
          name: act.title || 'Pattern Practice',
          description: act.instructions || 'Complete the activity',
          estimatedTime: 10,
          cognitiveLoad: 'medium' as const,
          sensoryDemands: ['visual_scanning'],
          canSkip: true,
          successRate: 0.8,
          type: 'recognition' as const
        })) || [],
        estimatedTime: 20,
        adaptations: [{
          reason: 'Default adaptive settings',
          modification: 'Using standard ND-friendly layout',
          targetProfile: 'general'
        }],
        successPredictors: {
          confidenceLevel: 0.8,
          engagementFactors: ['Student-centered approach'],
          potentialChallenges: [],
          supportStrategies: ['Movement breaks', 'Choice-based completion']
        }
      }
      
      const pdf = generator.generateAdaptiveWorksheetPDF(adaptiveData)
      const filename = `${data.selectedPattern || 'phonics'}_worksheet.pdf`
      pdf.save(filename)
    }
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate worksheet PDF')
  }
}