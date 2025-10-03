// src/components/worksheets/pdf/MoodPDFGenerator.ts
// WHITE backgrounds with colored accents - multi-activity support

import jsPDF from 'jspdf'

// Image cache to prevent re-embedding same images
const imageCache = new Map<string, string>()

async function loadAndCompressImage(src: string, maxWidth = 40): Promise<string> {
  if (imageCache.has(src)) return imageCache.get(src)!
  
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ratio = img.width / img.height
      canvas.width = maxWidth
      canvas.height = maxWidth / ratio
      
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      const compressed = canvas.toDataURL('image/jpeg', 0.6) // 60% quality
      imageCache.set(src, compressed)
      resolve(compressed)
    }
    img.onerror = () => resolve('')
    img.src = src
  })
}

interface ActivitySection {
  activityId: string
  words: Array<{ word: string; icon?: string }>
  letterRows?: string[][]
  wordPairs?: { left: string[], right: string[] }
  pictureSoundSections?: Array<{
    sound: string
    displaySound: string
    words: Array<{ word: string; icon?: string; startsWithSound: boolean }>
  }>
}

interface WorksheetData {
  mood: string
  phonicsType: string
  constraints: any
  activities: ActivitySection[]  // NEW: Multiple activities
  distractors: Array<{ word: string; icon?: string }>
}

const MOOD_COLORS = {
  overwhelmed: { 
    accent: '#5BA3BF',
    textGray: '#666666',
    traceGray: '#CCCCCC'
  },
  highEnergy: { 
    accent: '#FF8C42',
    textGray: '#666666',
    traceGray: '#CCCCCC'
  },
  lowEnergy: { 
    accent: '#9B7EBD',
    textGray: '#666666',
    traceGray: '#CCCCCC'
  },
}

const FONTS = {
  title: { family: 'helvetica', weight: 'normal' as const, size: 28 },
  subtitle: { family: 'helvetica', weight: 'normal' as const, size: 16 },
  body: { family: 'helvetica', weight: 'normal' as const, size: 16 },
  traceWord: { family: 'helvetica', weight: 'normal' as const, size: 50 },
  instructions: { family: 'helvetica', weight: 'normal' as const, size: 15 },
  completion: { family: 'helvetica', weight: 'normal' as const, size: 14 },
}

export async function generateMoodPDF(
  data: WorksheetData,
  mood: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })
  
  const colors = MOOD_COLORS[mood as keyof typeof MOOD_COLORS]
  let currentY = 20
  
  // WHITE background (default)
  addColoredFooterBar(doc, colors.accent)
 
  // Loop through each activity
  for (let i = 0; i < data.activities.length; i++) {
    const activity = data.activities[i]
    
    // Add new page for each activity (except first)
    if (i > 0) {
      doc.addPage()
      currentY = 20
      addColoredFooterBar(doc, colors.accent)
    }
    
    // Render activity based on type
    currentY = await renderActivity(doc, activity, colors, currentY)
  }
  
  // Add combined completion message at bottom
  addCombinedCompletionMessage(doc, data, colors, currentY)
  
  const filename = `${mood}_combined_${Date.now()}.pdf`
  doc.save(filename)
}

// ============================================================================
// ACTIVITY RENDERER
// ============================================================================

async function renderActivity(
  doc: jsPDF,
  activity: ActivitySection,
  colors: any,
  startY: number
): Promise<number> {
  let currentY = startY
  
  switch (activity.activityId) {
    case 'trace3':
      currentY = await generateTrace3Words(doc, activity, colors, currentY)
      break
    case 'breatheCircle':
      currentY = await generateBreatheCircle(doc, activity, colors, currentY)
      break
    case 'circleKnown':
      currentY = await generateCircleKnown(doc, activity, colors, currentY)
      break
    case 'soundHunt':
      currentY = await generateSoundHunt(doc, activity, colors, currentY)
      break
    case 'bodyLetter':
      currentY = await generateBodyLetter(doc, activity, colors, currentY)
      break
    case 'pointRest':
      currentY = await generatePointRest(doc, activity, colors, currentY)
      break
    case 'traceOne':
      currentY = await generateTraceOne(doc, activity, colors, currentY)
      break
    case 'bigLetterCircle':
      currentY = await generateBigLetterCircle(doc, activity, colors, currentY)
      break
    case 'connectPairs':
      currentY = await generateConnectPairs(doc, activity, colors, currentY)
      break
    case 'pictureSound':
      currentY = await generatePictureSound(doc, activity, colors, currentY)
      break
    default:
      currentY = await generateTrace3Words(doc, activity, colors, currentY)
  }
  
  return currentY
}

// ============================================================================
// HELPERS
// ============================================================================

function addCombinedCompletionMessage(
    doc: jsPDF,
    data: WorksheetData,
    colors: any,
    startY: number
  ) {
    const y = Math.max(startY + 15, 260) // Position near bottom
    
    doc.setFont(FONTS.completion.family, FONTS.completion.weight)
    doc.setFontSize(FONTS.completion.size)
    doc.setTextColor(102, 102, 102)
    
    const message = `You did ${data.activities.length} activities today. That's the goal.`
    doc.text(message, 105, y, { align: 'center' })
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 }
}

function addColoredFooterBar(doc: jsPDF, color: string) {
  const rgb = hexToRgb(color)
  doc.setFillColor(rgb.r, rgb.g, rgb.b)
  doc.rect(0, 287, 210, 10, 'F')
}

// ============================================================================
// ACTIVITY TEMPLATES (Modified to accept startY and return new Y)
// ============================================================================

async function generateTrace3Words(
  doc: jsPDF,
  activity: ActivitySection,
  colors: any,
  startY: number
): Promise<number> {
  let y = startY
  
  // Title
  doc.setFont(FONTS.title.family, FONTS.title.weight)
  doc.setFontSize(FONTS.title.size)
  doc.setTextColor(0, 0, 0)
  doc.text('Trace 3 Words', 105, y, { align: 'center' })
  y += 8
  
  doc.setFont(FONTS.subtitle.family, FONTS.subtitle.weight)
  doc.setFontSize(FONTS.subtitle.size)
  doc.setTextColor(102, 102, 102)
  doc.text('Today', 105, y, { align: 'center' })
  y += 10
  
  // Accent line
  const rgb = hexToRgb(colors.accent)
  doc.setDrawColor(rgb.r, rgb.g, rgb.b)
  doc.setLineWidth(1)
  doc.line(50, y, 160, y)
  y += 12
  
  // Instructions
  doc.setFont(FONTS.instructions.family, FONTS.instructions.weight)
  doc.setFontSize(FONTS.instructions.size)
  doc.setTextColor(0, 0, 0)
  doc.text('Trace these 3 words. Take your time.', 105, y, { align: 'center' })
  y += 45
  
  // Words
  const words = activity.words.slice(0, 3)
  for (let i = 0; i < words.length; i++) {
    // Dotted outline word
    const word = words[i].word
    const traceY = y + i * 35
    
    doc.setFont(FONTS.traceWord.family, FONTS.traceWord.weight)
    doc.setFontSize(FONTS.traceWord.size)
    doc.setTextColor(204, 204, 204)
    doc.text(word, 105, traceY, { align: 'center' })
    
    // Underline
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.3)
    doc.line(60, traceY + 3, 150, traceY + 3)
  }
  
  return y + 100
}

async function generateBreatheCircle(
  doc: jsPDF,
  activity: ActivitySection,
  colors: any,
  startY: number
): Promise<number> {
  let y = startY
  
  doc.setFont(FONTS.title.family, FONTS.title.weight)
  doc.setFontSize(FONTS.title.size)
  doc.text('Breathe & Circle', 105, y, { align: 'center' })
  y += 8
  
  doc.setFontSize(FONTS.subtitle.size)
  doc.setTextColor(102, 102, 102)
  doc.text('Today', 105, y, { align: 'center' })
  y += 10
  
  const rgb = hexToRgb(colors.accent)
  doc.setDrawColor(rgb.r, rgb.g, rgb.b)
  doc.setLineWidth(1)
  doc.line(50, y, 160, y)
  y += 12
  
  // Get target letter from first word
  doc.setFontSize(FONTS.instructions.size)
  doc.setTextColor(0, 0, 0)
  doc.text('Take a slow breath. Then circle the letter.', 105, y, { align: 'center' })
  y += 8

  doc.setFontSize(12)
  doc.setTextColor(102, 102, 102)
  doc.text('Breathing Guide: In: 1-2-3  *  Out: 1-2-3  Now circle!', 105, y, { align: 'center' })
  y += 15
  
  if (activity.letterRows && activity.letterRows.length > 0) {
    // Loop through each target letter row
    activity.letterRows.forEach((row, rowIdx) => {
      const targetLetter = row[0] // First element is the target
      const letters = row.slice(1) // Rest are the letter options
      
      // "Find the letter X:" instruction
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.text(`Find the letter ${targetLetter}:`, 105, y, { align: 'center' })
      y += 12
      
      // Render letter selection row - ALL letters same size
      const letterSpacing = 15
      const startX = 105 - (letters.length * letterSpacing) / 2
      
      letters.forEach((letter, idx) => {
        const x = startX + idx * letterSpacing
        
        // ALL letters uniform - no bold, no size difference
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(24)
        doc.setTextColor(0, 0, 0)
        doc.text(letter, x, y, { align: 'center' })
      })
      
      y += 25
    })
  }
  
  return y + 10
}

async function generateCircleKnown(
  doc: jsPDF,
  activity: ActivitySection,
  colors: any,
  startY: number
): Promise<number> {
  let y = startY
  
  doc.setFont(FONTS.title.family, FONTS.title.weight)
  doc.setFontSize(FONTS.title.size)
  doc.text('Circle Any Word You Know', 105, y, { align: 'center' })
  y += 8
  
  doc.setFontSize(FONTS.subtitle.size)
  doc.setTextColor(102, 102, 102)
  doc.text('Today', 105, y, { align: 'center' })
  y += 10
  
  const rgb = hexToRgb(colors.accent)
  doc.setDrawColor(rgb.r, rgb.g, rgb.b)
  doc.setLineWidth(1)
  doc.line(50, y, 160, y)
  y += 12
  
  doc.setFontSize(FONTS.instructions.size)
  doc.setTextColor(0, 0, 0)
  doc.text('Read what you can. Even one counts.', 105, y, { align: 'center' })
  y += 30
  
  const words = activity.words.slice(0, 4) // MAX 4 words - ND friendly
  const rowHeight = 35 // Lots of vertical breathing room

  for (let i = 0; i < words.length; i++) {
    const wordData = words[i]
    const wordY = y + i * rowHeight
    
    // Render word (centered)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(32)
    doc.setTextColor(0, 0, 0)
    doc.text(wordData.word, 105, wordY, { align: 'center' })
    
    // Render icon if present (right next to word)
    if (wordData.icon) {
        const compressed = await loadAndCompressImage(wordData.icon, 40)
        if (compressed) {
          const textWidth = doc.getTextWidth(wordData.word)
          doc.addImage(compressed, 'JPEG', 105 + textWidth/2 + 3, wordY - 7, 10, 10)
        }
    }
  }

  return y + (words.length * rowHeight) + 20
}

async function generateSoundHunt(
    doc: jsPDF,
    activity: ActivitySection,
    colors: any,
    startY: number
  ): Promise<number> {
    let y = startY
    
    doc.setFont(FONTS.title.family, FONTS.title.weight)
    doc.setFontSize(FONTS.title.size)
    doc.text('Sound Hunt', 105, y, { align: 'center' })
    y += 8
    
    doc.setFontSize(FONTS.subtitle.size)
    doc.setTextColor(102, 102, 102)
    doc.text('Today', 105, y, { align: 'center' })
    y += 10
    
    const rgb = hexToRgb(colors.accent)
    doc.setDrawColor(rgb.r, rgb.g, rgb.b)
    doc.setLineWidth(1)
    doc.line(50, y, 160, y)
    y += 12
    
    doc.setFontSize(FONTS.instructions.size)
    doc.setTextColor(0, 0, 0)
    doc.text('Circle letters you hear in these words.', 105, y, { align: 'center' })
    y += 20
    
    const words = activity.words.slice(0, 6)
    
    for (let i = 0; i < words.length; i++) {
      const col = i % 2
      const row = Math.floor(i / 2)
      const x = 50 + col * 70
      const wordY = y + row * 35
      
      const wordData = words[i]
      
      // Render word
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(28)
      doc.setTextColor(0, 0, 0)
      doc.text(wordData.word, x, wordY)
      
      // Render icon if present (next to word)
      if (wordData.icon) {
        const compressed = await loadAndCompressImage(wordData.icon, 40)
        if (compressed) {
          const textWidth = doc.getTextWidth(wordData.word)
          doc.addImage(compressed, 'JPEG', x + textWidth + 3, wordY - 7, 10, 10)
        }
      }
    }
    
    return y + 110
}

async function generateBodyLetter(
    doc: jsPDF,
    activity: ActivitySection,
    colors: any,
    startY: number
  ): Promise<number> {
    let y = startY
    
    doc.setFont(FONTS.title.family, FONTS.title.weight)
    doc.setFontSize(FONTS.title.size)
    doc.text('Body Letter Fun', 105, y, { align: 'center' })
    y += 8
    
    doc.setFontSize(FONTS.subtitle.size)
    doc.setTextColor(102, 102, 102)
    doc.text('Today', 105, y, { align: 'center' })
    y += 10
    
    const rgb = hexToRgb(colors.accent)
    doc.setDrawColor(rgb.r, rgb.g, rgb.b)
    doc.setLineWidth(1)
    doc.line(50, y, 160, y)
    y += 12
    
    doc.setFontSize(FONTS.instructions.size)
    doc.setTextColor(0, 0, 0)
    doc.text('Make these letters with your body. Move and learn!', 105, y, { align: 'center' })
    y += 20
    
    // Get first letters from first 3 words
    const targetLetters = activity.words.slice(0, 3).map(w => w.word[0].toUpperCase())
    
    // Letter-to-instruction mapping
    const letterInstructions: Record<string, string> = {
      'L': 'Stand straight. Put one arm out to the side.',
      'T': 'Stand straight. Put both arms out wide.',
      'O': 'Make a big circle with your arms above your head.',
      'C': 'Curve your arms like you\'re hugging a big ball.',
      'I': 'Stand tall and straight with arms at your sides.',
      'V': 'Put both arms up in a V shape.',
      'X': 'Cross your arms above your head.',
      'Y': 'Put both arms up and out like a Y.',
      'S': 'Stand and curve your body like a snake.',
      'P': 'Stand straight. Put one arm out front.',
      'B': 'Stand with one hand on hip, other arm curved out.',
      'H': 'Stand with arms out to sides, parallel to ground.',
      'M': 'Stand with arms up making mountain peaks.',
      'W': 'Stand with arms making a W shape.',
      'D': 'Stand with one arm curved like half a circle.',
      'R': 'Stand straight with one arm bent at elbow.',
      'K': 'Stand with one arm up, one arm out.',
      'F': 'Stand with both arms forward.',
      'N': 'Stand with arms diagonal like \\ and /.',
      'Z': 'Make a Z with your arms in the air.'
    }
    
    targetLetters.forEach((letter, idx) => {
      const letterY = y + idx * 28
      
      // "Make an X:" instruction in color
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.setTextColor(rgb.r, rgb.g, rgb.b)
      doc.text(`Make a${letter === 'O' || letter === 'I' ? 'n' : ''} ${letter}:`, 30, letterY)
      
      // Movement instruction
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(13)
      doc.setTextColor(0, 0, 0)
      const instruction = letterInstructions[letter] || 'Use your body to make this letter.'
      doc.text(instruction, 30, letterY + 7)
    })
    
    y += targetLetters.length * 28 + 15
    
    // Bonus message at bottom
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.setTextColor(102, 102, 102)
    doc.text('Bonus: Can you spell your name with your body?', 105, y, { align: 'center' })
    y += 8
    doc.text('Moving + learning = awesome!', 105, y, { align: 'center' })
    
    return y + 10
}

async function generatePointRest(
    doc: jsPDF,
    activity: ActivitySection,
    colors: any,
    startY: number
  ): Promise<number> {
    let y = startY
    
    doc.setFont(FONTS.title.family, FONTS.title.weight)
    doc.setFontSize(FONTS.title.size)
    doc.text('Point & Rest', 105, y, { align: 'center' })
    y += 8
    
    doc.setFontSize(FONTS.subtitle.size)
    doc.setTextColor(102, 102, 102)
    doc.text('Today', 105, y, { align: 'center' })
    y += 10
    
    const rgb = hexToRgb(colors.accent)
    doc.setDrawColor(rgb.r, rgb.g, rgb.b)
    doc.setLineWidth(1)
    doc.line(50, y, 160, y)
    y += 12
    
    doc.setFontSize(FONTS.instructions.size)
    doc.setTextColor(0, 0, 0)
    doc.text('Just point. No writing needed.', 105, y, { align: 'center' })
    y += 20
    
    const words = activity.words.slice(0, 5)
    
    for (let i = 0; i < words.length; i++) {
      const wordData = words[i]
      const itemY = y + i * 25
      
      // Render word (centered)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(36)
      doc.setTextColor(0, 0, 0)
      doc.text(wordData.word, 105, itemY, { align: 'center' })
      
      // Render icon if present (right next to word)
      if (wordData.icon) {
        const compressed = await loadAndCompressImage(wordData.icon, 48)
        if (compressed) {
          const textWidth = doc.getTextWidth(wordData.word)
          doc.addImage(compressed, 'JPEG', 105 + textWidth/2 + 3, itemY - 7, 12, 12)
        }
      }
    }
    
    return y + (words.length * 25) + 15
}

async function generateTraceOne(
  doc: jsPDF,
  activity: ActivitySection,
  colors: any,
  startY: number
): Promise<number> {
  let y = startY
  
  doc.setFont(FONTS.title.family, FONTS.title.weight)
  doc.setFontSize(FONTS.title.size)
  doc.text('Trace Just One', 105, y, { align: 'center' })
  y += 8
  
  doc.setFontSize(FONTS.subtitle.size)
  doc.setTextColor(102, 102, 102)
  doc.text('Today', 105, y, { align: 'center' })
  y += 10
  
  const rgb = hexToRgb(colors.accent)
  doc.setDrawColor(rgb.r, rgb.g, rgb.b)
  doc.setLineWidth(1)
  doc.line(50, y, 160, y)
  y += 12
  
  doc.setFontSize(FONTS.instructions.size)
  doc.setTextColor(0, 0, 0)
  doc.text('Trace this sentence one time. Take your time.', 105, y, { align: 'center' })
  y += 20
  
  // Pool of simple, meaningful sentences for tracing
  const sentencePool = [
    'I can read.',
    'I am learning.',
    'I am brave.',
    'I did it.',
    'I am proud.',
    'I will try.',
    'I am growing.',
    'I am here.'
  ]
  const randomIndex = Math.floor(Math.random() * sentencePool.length)
  const sentence = sentencePool[randomIndex]

  doc.setFont(FONTS.traceWord.family, FONTS.traceWord.weight)
  doc.setFontSize(40)
  doc.setTextColor(204, 204, 204)
  doc.text(sentence, 105, y, { align: 'center' })
  
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(40, y + 3, 170, y + 3)
  
  return y + 40
}

async function generateBigLetterCircle(
  doc: jsPDF,
  activity: ActivitySection,
  colors: any,
  startY: number
): Promise<number> {
  let y = startY
  
  doc.setFont(FONTS.title.family, FONTS.title.weight)
  doc.setFontSize(FONTS.title.size)
  doc.text('Big Letter Circle', 105, y, { align: 'center' })
  y += 8
  
  doc.setFontSize(FONTS.subtitle.size)
  doc.setTextColor(102, 102, 102)
  doc.text('Today', 105, y, { align: 'center' })
  y += 10
  
  const rgb = hexToRgb(colors.accent)
  doc.setDrawColor(rgb.r, rgb.g, rgb.b)
  doc.setLineWidth(1)
  doc.line(50, y, 160, y)
  y += 12
  
  doc.setFontSize(FONTS.instructions.size)
  doc.setTextColor(0, 0, 0)
  doc.text('Circle letters you know. Easy and calm.', 105, y, { align: 'center' })
  y += 45
  
  if (activity.letterRows && activity.letterRows.length > 0) {
    for (const row of activity.letterRows) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(36)
      doc.setTextColor(0, 0, 0)
      doc.text(row.join('   '), 105, y, { align: 'center' })
      y += 25
    }
  }
  
  return y + 5
}

async function generateConnectPairs(
  doc: jsPDF,
  activity: ActivitySection,
  colors: any,
  startY: number
): Promise<number> {
  let y = startY
  
  doc.setFont(FONTS.title.family, FONTS.title.weight)
  doc.setFontSize(FONTS.title.size)
  doc.text('Connect the Pairs', 105, y, { align: 'center' })
  y += 8
  
  doc.setFontSize(FONTS.subtitle.size)
  doc.setTextColor(102, 102, 102)
  doc.text('Today', 105, y, { align: 'center' })
  y += 10
  
  const rgb = hexToRgb(colors.accent)
  doc.setDrawColor(rgb.r, rgb.g, rgb.b)
  doc.setLineWidth(1)
  doc.line(50, y, 160, y)
  y += 12
  
  doc.setFontSize(FONTS.instructions.size)
  doc.setTextColor(0, 0, 0)
  doc.text('Draw a line to connect words that are exactly the same.', 105, y, { align: 'center' })
  y += 15
  
  if (activity.wordPairs) {
    const { left, right } = activity.wordPairs
    const pairCount = Math.min(left.length, right.length, 5)
    
    for (let i = 0; i < pairCount; i++) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(32)
      doc.setTextColor(0, 0, 0)
      
      doc.text(left[i], 40, y + i * 25)
      doc.text(right[i], 130, y + i * 25)
    }
    
    return y + pairCount * 25 + 10
  }
  
  return y + 60
}

async function generatePictureSound(
  doc: jsPDF,
  activity: ActivitySection,
  colors: any,
  startY: number
): Promise<number> {
  let y = startY
  
  doc.setFont(FONTS.title.family, FONTS.title.weight)
  doc.setFontSize(FONTS.title.size)
  doc.text('Picture & Sound Match', 105, y, { align: 'center' })
  y += 8
  
  doc.setFontSize(FONTS.subtitle.size)
  doc.setTextColor(102, 102, 102)
  doc.text('Today', 105, y, { align: 'center' })
  y += 10
  
  const rgb = hexToRgb(colors.accent)
  doc.setDrawColor(rgb.r, rgb.g, rgb.b)
  doc.setLineWidth(1)
  doc.line(50, y, 160, y)
  y += 12
  
  doc.setFontSize(FONTS.instructions.size)
  doc.setTextColor(0, 0, 0)
  doc.text('Look and circle Yes or No.', 105, y, { align: 'center' })
  y += 15
  
  if (activity.pictureSoundSections) {
    for (const section of activity.pictureSoundSections) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(20)
      doc.setTextColor(0, 0, 0)
      doc.text(`Does it start with ${section.displaySound}?`, 105, y, { align: 'center' })
      y += 12
      
      for (const item of section.words) {
        // Add image first (left side)
        if (item.icon) {
            const compressed = await loadAndCompressImage(item.icon, 40)
            if (compressed) {
              doc.addImage(compressed, 'JPEG', 30, y - 5, 10, 10)
            }
        }
        
        // Word next to image
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(24)
        doc.text(item.word, 45, y)
        
        // Yes/No on the right
        doc.setFontSize(16)
        doc.text('Yes     No', 130, y)
        
        y += 18
      }
      
      y += 8
    }
  }
  
  return y + 5
}