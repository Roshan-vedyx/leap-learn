// src/components/worksheets/pdf/MoodPDFGenerator.ts
// White backgrounds with colored accents - matches Canva PDF aesthetic

import jsPDF from 'jspdf'

interface WorksheetData {
  mood: string
  phonicsType: string
  activityType: string
  constraints: any
  words: Array<{ word: string; icon?: string }>
  distractors: Array<{ word: string; icon?: string }>
  familyRows?: string[][]
}

// Color scheme: WHITE backgrounds with colored ACCENTS only
const MOOD_COLORS = {
  overwhelmed: { 
    accent: '#5BA3BF',  // Blue accent for lines/bars
    textGray: '#666666',
    traceGray: '#CCCCCC'
  },
  highEnergy: { 
    accent: '#FF8C42',  // Orange accent
    textGray: '#666666',
    traceGray: '#CCCCCC'
  },
  lowEnergy: { 
    accent: '#9B7EBD',  // Purple accent
    textGray: '#666666',
    traceGray: '#CCCCCC'
  },
}

const FONTS = {
  title: { family: 'helvetica', weight: 'normal' as const, size: 36 },
  subtitle: { family: 'helvetica', weight: 'normal' as const, size: 18 },
  body: { family: 'helvetica', weight: 'normal' as const, size: 16 },
  traceWord: { family: 'helvetica', weight: 'normal' as const, size: 60 },
  instructions: { family: 'helvetica', weight: 'normal' as const, size: 15 },
  completion: { family: 'helvetica', weight: 'normal' as const, size: 14 },
}

export async function generateMoodPDF(
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
  
  // WHITE background (default) - just add colored footer bar
  addColoredFooterBar(doc, colors.accent)
  
  // Route to appropriate template
  switch (activityType) {
    case 'trace3':
      await generateTrace3Words(doc, data, colors)
      break
    case 'breatheCircle':
      await generateBreatheCircle(doc, data, colors)
      break
    case 'soundHunt':
      await generateSoundHunt(doc, data, colors)
      break
    case 'bodyLetter':
      await generateBodyLetter(doc, data, colors)
      break
    case 'pointRest':
      await generatePointRest(doc, data, colors)
      break
    case 'traceOne':
      await generateTraceOne(doc, data, colors)
      break
    default:
      await generateTrace3Words(doc, data, colors)
  }
  
  const filename = `${mood}_${activityType}_${Date.now()}.pdf`
  doc.save(filename)
}

// ============================================================================
// HELPERS
// ============================================================================

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

function setTextColorHex(doc: jsPDF, hex: string) {
  const rgb = hexToRgb(hex)
  doc.setTextColor(rgb.r, rgb.g, rgb.b)
}

function addDecorativeLine(doc: jsPDF, yPos: number, color: string) {
  const rgb = hexToRgb(color)
  doc.setDrawColor(rgb.r, rgb.g, rgb.b)
  doc.setLineWidth(0.8) // Thin accent line
  doc.line(20, yPos, 190, yPos)
}

function addColoredFooterBar(doc: jsPDF, color: string) {
  const rgb = hexToRgb(color)
  doc.setFillColor(rgb.r, rgb.g, rgb.b)
  doc.rect(0, 287, 210, 10, 'F') // Colored bar at bottom
}

/**
 * Add icon placeholder above word
 * Simple circle with first letter until SVGs are implemented
 */
async function addWordIcon(doc: jsPDF, word: string, iconPath: string | undefined, x: number, y: number) {
    if (iconPath) {
      try {
        // Load the image
        const img = new Image()
        img.src = iconPath
        await new Promise((resolve) => { img.onload = resolve })
        
        // Add to PDF (x, y, width, height)
        doc.addImage(img, 'PNG', x - 8, y - 8, 16, 16)
        return
      } catch (err) {
        // Fall through to placeholder if image fails
      }
    }
    
    // Fallback: circle with letter (existing code)
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.3)
    doc.circle(x, y, 8, 'S')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(100, 100, 100)
    doc.text(word[0].toUpperCase(), x, y + 2, { align: 'center' })
}

// ============================================================================
// TEMPLATE: TRACE 3 WORDS
// ============================================================================

async function generateTrace3Words(
  doc: jsPDF,
  data: WorksheetData,
  colors: any
) {
  const words = data.words.slice(0, 3)
  
  // Title
  doc.setFont(FONTS.title.family, FONTS.title.weight)
  doc.setFontSize(FONTS.title.size)
  doc.setTextColor(0, 0, 0)
  doc.text('Just 3 Words', 105, 35, { align: 'center' })
  
  // Subtitle
  doc.setFont(FONTS.subtitle.family, FONTS.subtitle.weight)
  doc.setFontSize(FONTS.subtitle.size)
  doc.text('Today', 105, 48, { align: 'center' })
  
  // Colored accent line
  addDecorativeLine(doc, 58, colors.accent)
  
  // Instructions
  doc.setFont(FONTS.instructions.family, FONTS.instructions.weight)
  doc.setFontSize(FONTS.instructions.size)
  doc.setTextColor(0, 0, 0)
  doc.text('Trace these 3 words.', 105, 75, { align: 'center' })
  
  // Words with icons and tracing guides
  let yPos = 115
  for (const wordObj of words) {
    const word = wordObj.word
    
    // Icon placeholder (left side)
    await addWordIcon(doc, wordObj.word, wordObj.icon, 60, yPos - 5)
    
    // Word in light gray for tracing
    doc.setFont(FONTS.traceWord.family, FONTS.traceWord.weight)
    doc.setFontSize(FONTS.traceWord.size)
    setTextColorHex(doc, colors.traceGray)
    doc.text(word, 105, yPos, { align: 'center' })
    
    // Dotted guide line below word
    setTextColorHex(doc, colors.traceGray)
    doc.setLineDash([1, 2])
    doc.setLineWidth(0.3)
    doc.line(60, yPos + 3, 150, yPos + 3)
    doc.setLineDash([])
    
    yPos += 48 // Generous spacing
  }
  
  // Completion message
  doc.setFont(FONTS.completion.family, FONTS.completion.weight)
  doc.setFontSize(FONTS.completion.size)
  setTextColorHex(doc, colors.textGray)
  doc.text('You traced 3 words today. That\'s the goal.', 105, 250, { align: 'center' })
}

// ============================================================================
// TEMPLATE: BREATHE & CIRCLE
// ============================================================================

async function generateBreatheCircle(
    doc: jsPDF,
    data: WorksheetData,
    colors: any
  ) {
    // Title
    doc.setFont(FONTS.title.family, FONTS.title.weight)
    doc.setFontSize(FONTS.title.size)
    doc.setTextColor(0, 0, 0)
    doc.text('Breathe & Circle', 105, 35, { align: 'center' })
    
    doc.setFont(FONTS.subtitle.family, FONTS.subtitle.weight)
    doc.setFontSize(FONTS.subtitle.size)
    doc.text('Today', 105, 48, { align: 'center' })
    
    addDecorativeLine(doc, 58, colors.accent)
    
    // Instructions
    doc.setFont(FONTS.instructions.family, FONTS.instructions.weight)
    doc.setFontSize(FONTS.instructions.size)
    doc.setTextColor(0, 0, 0)
    doc.text('Take a slow breath. Then circle the letter.', 105, 75, { align: 'center' })
    
    // Breathing guide
    doc.setFont(FONTS.instructions.family, 'normal')
    doc.setFontSize(13)
    setTextColorHex(doc, colors.textGray)
    doc.text('Breathing Guide: In: 1-2-3  *  Out: 1-2-3  Now circle!', 105, 88, { align: 'center' })
    
    // Letter finding rows
    let yPos = 110
    
    if (data.letterRows) {
      data.letterRows.forEach((row, index) => {
        const targetLetter = row[0]
        const letterArray = row.slice(1)
        
        // "Find the letter X:" instruction
        doc.setFont(FONTS.body.family, FONTS.body.weight)
        doc.setFontSize(FONTS.body.size)
        doc.setTextColor(0, 0, 0)
        doc.text(`Find the letter ${targetLetter}:`, 105, yPos, { align: 'center' })
        
        // Letter array
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(24)
        doc.setTextColor(0, 0, 0)
        doc.text(letterArray.join('   '), 105, yPos + 15, { align: 'center' })
        
        yPos += 45
      })
    }
    
    // Completion message
    doc.setFont(FONTS.completion.family, FONTS.completion.weight)
    doc.setFontSize(FONTS.completion.size)
    setTextColorHex(doc, colors.textGray)
    doc.text('Good breathing = good learning 💙', 105, 270, { align: 'center' })
}

// ============================================================================
// TEMPLATE: SOUND HUNT
// ============================================================================

async function generateSoundHunt(
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
  
  // Grid of sound boxes
  let yPos = 100
  let col = 0
  for (const wordObj of words) {
    const xPos = 35 + (col * 60)
    
    // Box for drawing/writing
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.5)
    doc.rect(xPos, yPos, 50, 50, 'S')
    
    // Icon placeholder
    await addWordIcon(doc, wordObj.word, wordObj.icon, xPos + 25, yPos + 15)
    
    // Sound label
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text(wordObj.word[0], xPos + 25, yPos + 45, { align: 'center' })
    
    col++
    if (col >= 3) {
      col = 0
      yPos += 60
    }
  }
  
  // Completion message
  doc.setFont(FONTS.completion.family, FONTS.completion.weight)
  doc.setFontSize(FONTS.completion.size)
  setTextColorHex(doc, colors.textGray)
  doc.text(`You moved through ${words.length} words. Great energy!`, 105, 270, { align: 'center' })
}

// ============================================================================
// TEMPLATE: BODY LETTER
// ============================================================================

async function generateBodyLetter(
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
  doc.text('Make these letters with your body!', 105, 65, { align: 'center' })
  doc.text('Stand up, move around, have fun!', 105, 75, { align: 'center' })
  
  // Letter list
  let yPos = 100
  for (const wordObj of words) {
    // Large letter to make with body
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(48)
    doc.setTextColor(0, 0, 0)
    doc.text(wordObj.word[0].toUpperCase(), 105, yPos, { align: 'center' })
    
    // Word reference
    doc.setFontSize(16)
    setTextColorHex(doc, colors.textGray)
    doc.text(`(${wordObj.word})`, 105, yPos + 10, { align: 'center' })
    
    yPos += 35
  }
  
  // Completion message
  doc.setFont(FONTS.completion.family, FONTS.completion.weight)
  doc.setFontSize(FONTS.completion.size)
  setTextColorHex(doc, colors.textGray)
  doc.text('You moved! That helps your brain learn.', 105, 270, { align: 'center' })
}

// ============================================================================
// TEMPLATE: POINT & REST
// ============================================================================

async function generatePointRest(
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
  for (const wordObj of words) {
    // Icon placeholder
    await addWordIcon(doc, wordObj.word, wordObj.icon, 50, yPos - 5)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(40)
    doc.setTextColor(0, 0, 0)
    doc.text(wordObj.word, 105, yPos, { align: 'center' })
    
    yPos += 35 // Huge spacing
  }
  
  // Completion message
  doc.setFont(FONTS.completion.family, FONTS.completion.weight)
  doc.setFontSize(FONTS.completion.size)
  setTextColorHex(doc, colors.textGray)
  doc.text('Slow and steady. You pointed to some words.', 105, 270, { align: 'center' })
}

// ============================================================================
// TEMPLATE: TRACE ONE
// ============================================================================

async function generateTraceOne(
  doc: jsPDF,
  data: WorksheetData,
  colors: any
) {
  const word = data.words[0].word
  const sentence = `I can ${word}.`
  
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
  
  // Icon for the word
  await addWordIcon(doc, word, data.words[0].icon, 105, 110)
  
  // Sentence in large trace font
  doc.setFont(FONTS.traceWord.family, FONTS.traceWord.weight)
  doc.setFontSize(48)
  setTextColorHex(doc, colors.traceGray)
  doc.text(sentence, 105, 150, { align: 'center' })
  
  // Dotted guide line
  doc.setLineDash([1, 2])
  doc.setLineWidth(0.3)
  doc.line(40, 155, 170, 155)
  doc.setLineDash([])
  
  // Completion message
  doc.setFont(FONTS.completion.family, FONTS.completion.weight)
  doc.setFontSize(FONTS.completion.size)
  setTextColorHex(doc, colors.textGray)
  doc.text('One sentence traced. You did it.', 105, 270, { align: 'center' })
}