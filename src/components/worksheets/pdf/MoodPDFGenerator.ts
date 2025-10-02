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
  wordPairs?: { left: string[], right: string[] }
  pictureSoundSections?: Array<{  // NEW PROPERTY
    sound: string
    displaySound: string
    words: Array<{ word: string; icon?: string; startsWithSound: boolean }>
  }>
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
    case 'circleKnown':  
      await generateCircleKnown(doc, data, colors)
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
    case 'bigLetterCircle':  
      await generateBigLetterCircle(doc, data, colors)
      break
    case 'connectPairs':  
      await generateConnectPairs(doc, data, colors)
      break
    case 'pictureSound':  
      await generatePictureSound(doc, data, colors)
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
async function addWordIcon(
    doc: jsPDF, 
    word: string, 
    iconPath: string | undefined, 
    x: number, 
    y: number
  ) {
    if (iconPath) {
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = iconPath
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
        })
        
        // Scale down to reduce file size
        const canvas = document.createElement('canvas')
        const maxSize = 64
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
        
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        // PNG format preserves transparency but is larger than JPEG
        const pngData = canvas.toDataURL('image/png')
        
        doc.addImage(pngData, 'PNG', x - 8, y - 8, 16, 16)
        return
      } catch (err) {
        console.warn('Icon load failed, using fallback:', err)
      }
    }
    
    // Fallback
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
        doc.text(letterArray.join('   '), 105, yPos + 25, { align: 'center' })
        
        yPos += 70
      })
    }
    
    // Completion message
    doc.setFont(FONTS.completion.family, FONTS.completion.weight)
    doc.setFontSize(FONTS.completion.size)
    setTextColorHex(doc, colors.textGray)
    doc.text('Good breathing = good learning.', 105, 270, { align: 'center' })
}

// ============================================================================
// TEMPLATE: SOUND HUNT
// ============================================================================

async function generateSoundHunt(
  doc: jsPDF,
  data: WorksheetData,
  colors: any
) {
  const words = data.words.slice(0, 4)
  
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
   const xPos = 45 + (col * 55)
    
    // Box for drawing/writing
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.5)
    doc.rect(xPos, yPos, 50, 50, 'S')
    
    // Sound label at TOP of empty box (no icon)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.setTextColor(0, 0, 0)
    doc.text(wordObj.word[0].toUpperCase(), xPos + 25, yPos + 15, { align: 'center' })
    
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
  doc.text('Found even one? You\'re a sound detective!', 105, 270, { align: 'center' })
}

// ============================================================================
// TEMPLATE: BODY LETTER
// ============================================================================

async function generateBodyLetter(
  doc: jsPDF,
  data: WorksheetData,
  colors: any
) {
  const words = data.words.slice(0, 4)
  
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
    doc.setFontSize(60)
    doc.setTextColor(0, 0, 0)
    doc.text(wordObj.word[0].toUpperCase(), 105, yPos, { align: 'center' })

    yPos += 50
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
  // Create meaningful sentence based on word type
let sentence = `I can ${word}.`

// Override with meaningful sentences for common words
const meaningfulSentences: Record<string, string> = {
  'cat': 'I see a cat.',
  'dog': 'I pet the dog.',
  'sun': 'The sun is up.',
  'run': 'I can run.',
  'sit': 'I can sit.',
  'hat': 'I like this hat.',
  'bed': 'I go to bed.',
  'top': 'I am on top.',
  'red': 'I see red.',
  'map': 'I have a map.',
  'cup': 'I fill the cup.',
  'bus': 'I ride the bus.',
  'hop': 'I can hop.',
  'dig': 'I can dig.',
}

sentence = meaningfulSentences[word] || `I see ${word}.`  
  
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

async function generateCircleKnown(
    doc: jsPDF,
    data: WorksheetData,
    colors: any
  ) {
    // Title
    doc.setFont(FONTS.title.family, FONTS.title.weight)
    doc.setFontSize(FONTS.title.size)
    doc.setTextColor(0, 0, 0)
    doc.text('Circle the Word You Know', 105, 35, { align: 'center' })
    
    // Subtitle
    doc.setFont(FONTS.subtitle.family, FONTS.subtitle.weight)
    doc.setFontSize(FONTS.subtitle.size)
    doc.text('Today', 105, 48, { align: 'center' })
    
    addDecorativeLine(doc, 58, colors.accent)
    
    // Instructions
    doc.setFont(FONTS.instructions.family, FONTS.instructions.weight)
    doc.setFontSize(FONTS.instructions.size)
    doc.setTextColor(0, 0, 0)
    doc.text('Look at each line. Circle any word you can read. Even one is', 105, 75, { align: 'center' })
    doc.text('great.', 105, 85, { align: 'center' })
    
    // Display 5 rows of 3 words each (using first 15 words)
    const words = data.words.slice(0, 15)
    let yPos = 120
    
    for (let row = 0; row < 5; row++) {
      const rowWords = words.slice(row * 3, row * 3 + 3)
      
      // Position words with huge spacing (approx 60mm apart)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(48) // Very large font
      doc.setTextColor(0, 0, 0)
      
      // Word 1 - left
      doc.text(rowWords[0]?.word || '', 45, yPos, { align: 'center' })
      
      // Word 2 - center
      doc.text(rowWords[1]?.word || '', 105, yPos, { align: 'center' })
      
      // Word 3 - right
      doc.text(rowWords[2]?.word || '', 165, yPos, { align: 'center' })
      
      yPos += 36 // Generous vertical spacing between rows
    }
    
    // Completion message at bottom
    doc.setFont(FONTS.completion.family, FONTS.completion.weight)
    doc.setFontSize(FONTS.completion.size)
    setTextColorHex(doc, colors.textGray)
    doc.text('You read some words today. Good.', 105, 270, { align: 'center' })
}

async function generateBigLetterCircle(
    doc: jsPDF,
    data: WorksheetData,
    colors: any
  ) {
    // Title
    doc.setFont(FONTS.title.family, FONTS.title.weight)
    doc.setFontSize(FONTS.title.size)
    doc.setTextColor(0, 0, 0)
    doc.text('Big Letter Circle', 105, 35, { align: 'center' })
    
    addDecorativeLine(doc, 48, colors.accent)
    
    // Instructions
    doc.setFont(FONTS.instructions.family, FONTS.instructions.weight)
    doc.setFontSize(FONTS.instructions.size)
    doc.setTextColor(0, 0, 0)
    doc.text('Circle the letter shown. Take your time.', 105, 70, { align: 'center' })
    
    // Get letter rows (4 rows, each with [targetLetter, ...4 shuffled letters])
    const letterRows = data.letterRows || []
    let yPos = 100
    
    for (let i = 0; i < Math.min(4, letterRows.length); i++) {
      const row = letterRows[i]
      const targetLetter = row[0] // First element is the target
      const shuffledLetters = row.slice(1) // Rest are the shuffled letters (including target)
      
      // Instruction line: "Circle the X:"
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(20)
      setTextColorHex(doc, colors.accent) // Use mood color
      doc.text(`Circle the ${targetLetter}:`, 30, yPos)
      
      // Display 4 letters with huge spacing
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(52) // Very large font
      doc.setTextColor(0, 0, 0)
      
      const letterSpacing = 35 // mm between letters
      const startX = 50
      
      for (let j = 0; j < 4; j++) {
        const letter = shuffledLetters[j]
        const xPos = startX + (j * letterSpacing)
        doc.text(letter, xPos, yPos + 10)
      }
      
      yPos += 50 // Generous spacing between rows
    }
    
    // Completion message
    doc.setFont(FONTS.completion.family, FONTS.completion.weight)
    doc.setFontSize(FONTS.completion.size)
    setTextColorHex(doc, colors.textGray)
    doc.text('2 letters found. That\'s all we needed.', 105, 270, { align: 'center' })
}

async function generateConnectPairs(
    doc: jsPDF,
    data: WorksheetData,
    colors: any
  ) {
    // Title
    doc.setFont(FONTS.title.family, FONTS.title.weight)
    doc.setFontSize(FONTS.title.size)
    doc.setTextColor(0, 0, 0)
    doc.text('Connect the Pairs', 105, 35, { align: 'center' })
    
    addDecorativeLine(doc, 48, colors.accent)
    
    // Instructions
    doc.setFont(FONTS.instructions.family, FONTS.instructions.weight)
    doc.setFontSize(FONTS.instructions.size)
    doc.setTextColor(0, 0, 0)
    doc.text('Draw a line to connect words that are exactly the same.', 105, 70, { align: 'center' })
    
    // Get word pairs
    const pairs = data.wordPairs || { left: [], right: [] }
    const leftColumn = pairs.left.slice(0, 5)
    const rightColumn = pairs.right.slice(0, 5)
    
    // Display two columns with generous spacing
    const leftX = 50
    const rightX = 145
    let yPos = 110
    const rowHeight = 28
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(40) // Large clear font
    doc.setTextColor(0, 0, 0)
    
    for (let i = 0; i < 5; i++) {
      // Left column word
      if (leftColumn[i]) {
        doc.text(leftColumn[i], leftX, yPos)
      }
      
      // Right column word
      if (rightColumn[i]) {
        doc.text(rightColumn[i], rightX, yPos)
      }
      
      yPos += rowHeight
    }
    
    // Completion message
    doc.setFont(FONTS.completion.family, FONTS.completion.weight)
    doc.setFontSize(FONTS.completion.size)
    setTextColorHex(doc, colors.textGray)
    doc.text('5 connections made. That\'s the task done.', 105, 270, { align: 'center' })
}

async function generatePictureSound(
    doc: jsPDF,
    data: WorksheetData,
    colors: any
  ) {
    // Title
    doc.setFont(FONTS.title.family, FONTS.title.weight)
    doc.setFontSize(FONTS.title.size)
    doc.setTextColor(0, 0, 0)
    doc.text('Picture and Sound Match', 105, 30, { align: 'center' })
    
    addDecorativeLine(doc, 42, colors.accent)
    
    // Instructions
    doc.setFont(FONTS.instructions.family, FONTS.instructions.weight)
    doc.setFontSize(FONTS.instructions.size)
    doc.setTextColor(0, 0, 0)
    doc.text('Look at each picture. Circle YES if it starts with the sound.', 105, 58, { align: 'center' })
    doc.text('Circle NO if it doesn\'t.', 105, 68, { align: 'center' })
    
    // Get sections
    const sections = data.pictureSoundSections || []
    
    // DEBUG: Log sections
    console.log('PDF Sections:', sections.length, sections)
    
    // SECTION 1: /s/ sound
    let yPos = 90
    
    if (sections[0]) {
      const section1 = sections[0]
      
      // Section header
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      setTextColorHex(doc, colors.accent)
      doc.text(`Sound Focus: ${section1.displaySound}`, 30, yPos)
      
      yPos += 12
      
      // 4 pictures in a row
      const words1 = section1.words.slice(0, 4)
      
      for (let i = 0; i < 4; i++) {
        const word = words1[i]
        if (!word) continue
        
        const xPos = 40 + (i * 40)
        
        // Icon placeholder (centered)
        if (word.icon) {
          await addWordIcon(doc, word.word, word.icon, xPos, yPos)
        } else {
          // Draw placeholder box
          doc.setDrawColor(200, 200, 200)
          doc.setLineWidth(0.5)
          doc.rect(xPos, yPos, 20, 20)
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(10)
          doc.setTextColor(100, 100, 100)
          doc.text(word.word, xPos + 10, yPos + 12, { align: 'center' })
        }
        
        // Yes/No options (centered below)
        const optionX = xPos + 10
        const optionY = yPos + 28
        
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(11)
        doc.setTextColor(0, 0, 0)
        doc.setDrawColor(100, 100, 100)
        doc.setLineWidth(0.5)
        
        // YES
        doc.circle(optionX - 5, optionY, 2.5)
        doc.text('YES', optionX + 1, optionY + 1.5)
        
        // NO
        doc.circle(optionX - 5, optionY + 7, 2.5)
        doc.text('NO', optionX + 1, optionY + 8.5)
      }
    }
    
    // SECTION 2: /b/ sound
    yPos = 155 // Fixed position for second section
    
    if (sections[1]) {
      const section2 = sections[1]
      
      // Section header
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      setTextColorHex(doc, colors.accent)
      doc.text(`Sound Focus: ${section2.displaySound}`, 30, yPos)
      
      yPos += 12
      
      // 4 pictures in a row
      const words2 = section2.words.slice(0, 4)
      
      for (let i = 0; i < 4; i++) {
        const word = words2[i]
        if (!word) continue
        
        const xPos = 40 + (i * 40)
        
        // Icon placeholder (centered)
        if (word.icon) {
          await addWordIcon(doc, word.word, word.icon, xPos, yPos)
        } else {
          // Draw placeholder box
          doc.setDrawColor(200, 200, 200)
          doc.setLineWidth(0.5)
          doc.rect(xPos, yPos, 20, 20)
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(10)
          doc.setTextColor(100, 100, 100)
          doc.text(word.word, xPos + 10, yPos + 12, { align: 'center' })
        }
        
        // Yes/No options (centered below)
        const optionX = xPos + 10
        const optionY = yPos + 28
        
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(11)
        doc.setTextColor(0, 0, 0)
        doc.setDrawColor(100, 100, 100)
        doc.setLineWidth(0.5)
        
        // YES
        doc.circle(optionX - 5, optionY, 2.5)
        doc.text('YES', optionX + 1, optionY + 1.5)
        
        // NO
        doc.circle(optionX - 5, optionY + 7, 2.5)
        doc.text('NO', optionX + 1, optionY + 8.5)
      }
    }
    
    // Completion message - FIXED with proper font
    doc.setFont(FONTS.completion.family, FONTS.completion.weight)
    doc.setFontSize(FONTS.completion.size)
    setTextColorHex(doc, colors.textGray)
    doc.text('You checked 8 pictures. Quiet thinking is powerful thinking', 105, 265, { align: 'center' })
}