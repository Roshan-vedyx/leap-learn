// src/components/worksheets/pdf/MoodPDFGenerator.ts
// Redesigned to match Canva PDF aesthetic - warm, spacious, emotionally safe

import jsPDF from 'jspdf'

interface WorksheetData {
  mood: string
  phonicsType: string
  activityType: string
  constraints: any
  words: Array<{ word: string }>
  distractors: Array<{ word: string }>
}

const MOOD_COLORS = {
  overwhelmed: { 
    bg: '#E8F4F8', 
    accent: '#5BA3BF',
    textGray: '#666666',
    traceGray: '#CCCCCC'
  },
  highEnergy: { 
    bg: '#FFF4E6', 
    accent: '#FF8C42',
    textGray: '#666666',
    traceGray: '#CCCCCC'
  },
  lowEnergy: { 
    bg: '#F3F0FF', 
    accent: '#9B7EBD',
    textGray: '#666666',
    traceGray: '#CCCCCC'
  },
}

// Font fallback since we can't embed Lexend Deca in jsPDF without custom fonts
// Using Helvetica with specific weights to approximate the feel
const FONTS = {
  title: { family: 'helvetica', weight: 'normal' as const, size: 36 },
  subtitle: { family: 'helvetica', weight: 'normal' as const, size: 18 },
  body: { family: 'helvetica', weight: 'normal' as const, size: 16 },
  traceWord: { family: 'helvetica', weight: 'normal' as const, size: 60 },
  instructions: { family: 'helvetica', weight: 'normal' as const, size: 15 },
  completion: { family: 'helvetica', weight: 'normal' as const, size: 14 },
}

export function generateMoodPDF(
  data: WorksheetData,
  mood: string,
  activityType: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })
  
  const colors = MOOD_COLORS[mood as keyof typeof MOOD_COLORS]
  
  // Fill entire page with background color - feels immersive, not form-like
  doc.setFillColor(colors.bg)
  doc.rect(0, 0, 210, 297, 'F')
  
  // Route to appropriate template
  switch (activityType) {
    case 'trace3':
      generateTrace3Words(doc, data, colors)
      break
    case 'breatheCircle':
      generateBreatheCircle(doc, data, colors)
      break
    case 'soundHunt':
      generateSoundHunt(doc, data, colors)
      break
    case 'bodyLetter':
      generateBodyLetter(doc, data, colors)
      break
    case 'pointRest':
      generatePointRest(doc, data, colors)
      break
    case 'traceOne':
      generateTraceOne(doc, data, colors)
      break
    default:
      generateTrace3Words(doc, data, colors)
  }
  
  const filename = `${mood}_${activityType}_${Date.now()}.pdf`
  doc.save(filename)
}

// Helper: Add thin decorative line (1-2pt, not heavy bar)
function addDecorativeLine(doc: jsPDF, yPos: number, color: string) {
  const rgb = hexToRgb(color)
  doc.setDrawColor(rgb.r, rgb.g, rgb.b)
  doc.setLineWidth(0.5) // Thin, elegant line
  doc.line(20, yPos, 190, yPos)
}

// Helper: Convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

// Helper: Set text color from hex
function setTextColorHex(doc: jsPDF, hex: string) {
  const rgb = hexToRgb(hex)
  doc.setTextColor(rgb.r, rgb.g, rgb.b)
}

// ============================================================================
// OVERWHELMED TEMPLATES - Maximum calm, maximum space
// ============================================================================

function generateTrace3Words(
  doc: jsPDF,
  data: WorksheetData,
  colors: any
) {
  const words = data.words.slice(0, 3)
  
  // Title - generous top margin for breathing room
  doc.setFont(FONTS.title.family, FONTS.title.weight)
  doc.setFontSize(FONTS.title.size)
  doc.setTextColor(0, 0, 0)
  doc.text('Just 3 Words', 105, 35, { align: 'center' })
  
  // Subtitle - "Today" feels personal, not institutional
  doc.setFont(FONTS.subtitle.family, FONTS.subtitle.weight)
  doc.setFontSize(FONTS.subtitle.size)
  doc.text('Today', 105, 48, { align: 'center' })
  
  // Thin decorative line - adds structure without weight
  addDecorativeLine(doc, 58, colors.accent)
  
  // Instructions - simple, affirming
  doc.setFont(FONTS.instructions.family, FONTS.instructions.weight)
  doc.setFontSize(FONTS.instructions.size)
  doc.setTextColor(0, 0, 0)
  doc.text('Trace these 3 words.', 105, 75, { align: 'center' })
  
  // Words with MASSIVE vertical spacing (90-100 units each)
  let yPos = 115
  words.forEach((wordObj) => {
    const word = wordObj.word
    
    // Word model in light gray for tracing - MUCH larger font
    doc.setFont(FONTS.traceWord.family, FONTS.traceWord.weight)
    doc.setFontSize(FONTS.traceWord.size)
    setTextColorHex(doc, colors.traceGray)
    doc.text(word, 105, yPos, { align: 'center' })
    
    // Dotted guide line below word - subtle, not demanding
    setTextColorHex(doc, colors.traceGray)
    doc.setLineDash([1, 2])
    doc.setLineWidth(0.3)
    doc.line(60, yPos + 3, 150, yPos + 3)
    doc.setLineDash([]) // Reset
    
    yPos += 48 // Generous spacing between words
  })
  
  // Completion message - integrated naturally at bottom, feels like a hug
  doc.setFont(FONTS.completion.family, FONTS.completion.weight)
  doc.setFontSize(FONTS.completion.size)
  setTextColorHex(doc, colors.textGray)
  doc.text('You traced 3 words today. That\'s the goal.', 105, 270, { align: 'center' })
}

function generateBreatheCircle(
  doc: jsPDF,
  data: WorksheetData,
  colors: any
) {
  const words = data.words.slice(0, 3)
  
  // Title
  doc.setFont(FONTS.title.family, FONTS.title.weight)
  doc.setFontSize(FONTS.title.size)
  doc.setTextColor(0, 0, 0)
  doc.text('Breathe & Circle', 105, 35, { align: 'center' })
  
  doc.setFont(FONTS.subtitle.family, FONTS.subtitle.weight)
  doc.setFontSize(FONTS.subtitle.size)
  doc.text('Today', 105, 48, { align: 'center' })
  
  addDecorativeLine(doc, 58, colors.accent)
  
  // Breathing guide box - subtle, not shouty
  doc.setFont(FONTS.instructions.family, 'normal')
  doc.setFontSize(13)
  setTextColorHex(doc, colors.textGray)
  doc.text('Breathing Guide:', 105, 75, { align: 'center' })
  doc.text('In: 1-2-3  •  Out: 1-2-3', 105, 83, { align: 'center' })
  doc.text('Now circle!', 105, 91, { align: 'center' })
  
  // Thin box around breathing guide - optional, keeps it feeling light
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.rect(50, 68, 110, 28, 'S')
  
  // Letter hunt with LOTS of space
  let yPos = 120
  const allLetters = 'abcdefghijklmnopqrstuvwxyz'.split('')
  
  // Get first letters of target words
  const targetLetters = words.map(w => w.word[0].toLowerCase())
  
  // Create mix of target and distractor letters
  const displayLetters = []
  targetLetters.forEach(t => displayLetters.push(t))
  
  // Add random distractors
  while (displayLetters.length < 15) {
    const random = allLetters[Math.floor(Math.random() * allLetters.length)]
    if (!targetLetters.includes(random)) {
      displayLetters.push(random)
    }
  }
  
  // Shuffle
  displayLetters.sort(() => Math.random() - 0.5)
  
  // Display in spacious grid
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(24)
  doc.setTextColor(0, 0, 0)
  
  let col = 0
  let row = 0
  displayLetters.forEach((letter) => {
    const x = 35 + (col * 25)
    const y = yPos + (row * 30)
    doc.text(letter, x, y)
    
    col++
    if (col >= 7) {
      col = 0
      row++
    }
  })
  
  // Target words shown at bottom for reference
  doc.setFont(FONTS.body.family, 'normal')
  doc.setFontSize(14)
  setTextColorHex(doc, colors.textGray)
  doc.text(`Find: ${words.map(w => w.word).join(', ')}`, 105, 230, { align: 'center' })
  
  // Completion message
  doc.setFont(FONTS.completion.family, FONTS.completion.weight)
  doc.setFontSize(FONTS.completion.size)
  doc.text('Good breathing = good learning 💙', 105, 270, { align: 'center' })
}

// ============================================================================
// HIGH ENERGY TEMPLATES - More items, but same spacious feel
// ============================================================================

function generateSoundHunt(
  doc: jsPDF,
  data: WorksheetData,
  colors: any
) {
  const words = data.words.slice(0, 9)
  
  doc.setFont(FONTS.title.family, FONTS.title.weight)
  doc.setFontSize(FONTS.title.size)
  doc.setTextColor(0, 0, 0)
  doc.text('Sound Hunt Around You', 105, 35, { align: 'center' })
  
  addDecorativeLine(doc, 48, colors.accent)
  
  doc.setFont(FONTS.instructions.family, FONTS.instructions.weight)
  doc.setFontSize(FONTS.instructions.size)
  doc.text('Find things that start with these sounds.', 105, 65, { align: 'center' })
  doc.text('Draw or write what you find.', 105, 75, { align: 'center' })
  
  // Create boxes for sound hunt - 2 columns
  let yPos = 95
  const cols = 2
  const boxWidth = 70
  const boxHeight = 60
  
  for (let i = 0; i < Math.min(4, words.length); i++) {
    const word = words[i]
    const sound = `/${word.word[0]}/`
    
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = 30 + (col * 80)
    const y = yPos + (row * 70)
    
    // Label
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text(`Things that start with`, x + 35, y, { align: 'center' })
    doc.text(sound, x + 35, y + 8, { align: 'center' })
    
    // Drawing box
    doc.setDrawColor(150, 150, 150)
    doc.setLineWidth(0.5)
    doc.rect(x, y + 12, boxWidth, boxHeight, 'S')
  }
  
  // Hint words at bottom
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  setTextColorHex(doc, colors.textGray)
  const hints = words.slice(0, 8).map(w => w.word).join(', ')
  doc.text(`Hints: ${hints}`, 105, 250, { align: 'center' })
  
  // Completion message
  doc.setFont(FONTS.completion.family, FONTS.completion.weight)
  doc.setFontSize(FONTS.completion.size)
  doc.text('Found even one? You\'re a sound detective!', 105, 270, { align: 'center' })
}

function generateBodyLetter(
  doc: jsPDF,
  data: WorksheetData,
  colors: any
) {
  const words = data.words.slice(0, 6)
  
  doc.setFont(FONTS.title.family, FONTS.title.weight)
  doc.setFontSize(FONTS.title.size)
  doc.setTextColor(0, 0, 0)
  doc.text('Body Letter Fun', 105, 35, { align: 'center' })
  
  addDecorativeLine(doc, 48, colors.accent)
  
  doc.setFont(FONTS.instructions.family, FONTS.instructions.weight)
  doc.setFontSize(FONTS.instructions.size)
  doc.text('Make each letter with your body. Then say the word!', 105, 65, { align: 'center' })
  
  // Words with checkboxes - generous spacing
  let yPos = 95
  words.forEach((wordObj, index) => {
    // Checkbox
    doc.setDrawColor(150, 150, 150)
    doc.setLineWidth(0.5)
    doc.rect(30, yPos - 6, 6, 6, 'S')
    
    // Word
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(24)
    doc.setTextColor(0, 0, 0)
    doc.text(wordObj.word, 42, yPos)
    
    yPos += 28 // Generous spacing for movement breaks
  })
  
  // Movement hint
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  setTextColorHex(doc, colors.textGray)
  doc.text('💃 Take a wiggle break anytime!', 105, 250, { align: 'center' })
  
  // Completion message
  doc.setFont(FONTS.completion.family, FONTS.completion.weight)
  doc.setFontSize(FONTS.completion.size)
  doc.text(`You moved through ${words.length} words. Great energy!`, 105, 270, { align: 'center' })
}

// ============================================================================
// LOW ENERGY TEMPLATES - Absolute minimum effort required
// ============================================================================

function generatePointRest(
  doc: jsPDF,
  data: WorksheetData,
  colors: any
) {
  const words = data.words.slice(0, 5)
  
  doc.setFont(FONTS.title.family, FONTS.title.weight)
  doc.setFontSize(FONTS.title.size)
  doc.setTextColor(0, 0, 0)
  doc.text('Point & Rest', 105, 35, { align: 'center' })
  
  doc.setFont(FONTS.subtitle.family, FONTS.subtitle.weight)
  doc.setFontSize(FONTS.subtitle.size)
  doc.text('Today', 105, 48, { align: 'center' })
  
  addDecorativeLine(doc, 58, colors.accent)
  
  doc.setFont(FONTS.instructions.family, FONTS.instructions.weight)
  doc.setFontSize(FONTS.instructions.size)
  doc.text('Just point to the words. No writing needed.', 105, 75, { align: 'center' })
  
  // HUGE words with MASSIVE spacing - can be done lying down
  let yPos = 110
  words.forEach((wordObj) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(40)
    doc.setTextColor(0, 0, 0)
    doc.text(wordObj.word, 105, yPos, { align: 'center' })
    
    yPos += 32 // Huge spacing
  })
  
  // Completion message
  doc.setFont(FONTS.completion.family, FONTS.completion.weight)
  doc.setFontSize(FONTS.completion.size)
  setTextColorHex(doc, colors.textGray)
  doc.text('Slow and steady. You pointed to some words.', 105, 270, { align: 'center' })
}

function generateTraceOne(
  doc: jsPDF,
  data: WorksheetData,
  colors: any
) {
  const word = data.words[0].word
  
  doc.setFont(FONTS.title.family, FONTS.title.weight)
  doc.setFontSize(FONTS.title.size)
  doc.setTextColor(0, 0, 0)
  doc.text('Trace One Sentence', 105, 35, { align: 'center' })
  
  doc.setFont(FONTS.subtitle.family, FONTS.subtitle.weight)
  doc.setFontSize(FONTS.subtitle.size)
  doc.text('Today', 105, 48, { align: 'center' })
  
  addDecorativeLine(doc, 58, colors.accent)
  
  doc.setFont(FONTS.instructions.family, FONTS.instructions.weight)
  doc.setFontSize(FONTS.instructions.size)
  doc.text('Trace this sentence one time. Take your time.', 105, 75, { align: 'center' })
  
  // Simple sentence with the word
  const sentence = `I can ${word}.`
  
  // Sentence in HUGE light gray for tracing
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(56)
  setTextColorHex(doc, colors.traceGray)
  doc.text(sentence, 105, 150, { align: 'center' })
  
  // Baseline
  setTextColorHex(doc, colors.traceGray)
  doc.setLineDash([2, 3])
  doc.setLineWidth(0.4)
  doc.line(40, 155, 170, 155)
  doc.setLineDash([])
  
  // Completion message
  doc.setFont(FONTS.completion.family, FONTS.completion.weight)
  doc.setFontSize(FONTS.completion.size)
  setTextColorHex(doc, colors.textGray)
  doc.text('One sentence traced. You did it.', 105, 270, { align: 'center' })
}

// Helper for matching activities
function getMatchingOptions(
  targetWord: string,
  distractors: Array<{ word: string }>
): string[] {
  const similar = distractors
    .filter(d => d.word.length === targetWord.length || 
                 d.word[0] === targetWord[0])
    .slice(0, 2)
    .map(d => d.word)
  
  const options = [targetWord, ...similar]
  return options.sort(() => Math.random() - 0.5).slice(0, 3)
}