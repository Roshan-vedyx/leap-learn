// src/components/worksheets/pdf/MoodPDFGenerator.ts
// WHITE backgrounds with colored accents - multi-activity support

import jsPDF from 'jspdf'

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
  const targetLetter = activity.words[0]?.word[0].toUpperCase() || 'H'

  doc.setFontSize(FONTS.instructions.size)
  doc.setTextColor(0, 0, 0)
  doc.text(`Take a slow breath. Then circle the letter: ${targetLetter}`, 105, y, { align: 'center' })
  y += 8

  doc.setFontSize(12)
  doc.setTextColor(102, 102, 102)
  doc.text('Breathing Guide: In: 1-2-3  *  Out: 1-2-3  Now circle!', 105, y, { align: 'center' })
  y += 15
  
  if (activity.letterRows && activity.letterRows.length > 0) {
    const row = activity.letterRows[0]
    const letterSpacing = 15
    const startX = 105 - (row.length * letterSpacing) / 2

    row.forEach((letter, idx) => {
      const x = startX + idx * letterSpacing
    
      if (letter === targetLetter) {
      // Target letter - bigger and bold
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(36)
      } else {
      // Regular letters
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(24)
      }
    
      doc.setTextColor(0, 0, 0)
      doc.text(letter, x, y, { align: 'center' })
    })

    y += 25
  }
  
  return y + 5
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
        try {
        const img = new Image()
        img.src = wordData.icon
        await new Promise((resolve) => {
            img.onload = resolve
            img.onerror = resolve
        })
        const textWidth = doc.getTextWidth(wordData.word)
        doc.addImage(img, 'PNG', 105 + textWidth/2 + 3, wordY - 7, 10, 10)
        } catch (e) {
        console.warn('Could not load icon:', wordData.word)
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
  y += 15
  
  const words = activity.words.slice(0, 6)
  for (let i = 0; i < words.length; i++) {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = 50 + col * 70
    const wordY = y + row * 25
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(32)
    doc.setTextColor(0, 0, 0)
    doc.text(words[i].word, x, wordY)
  }
  
  return y + 80
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
  doc.text('Body Letters', 105, y, { align: 'center' })
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
  doc.text('Make letters with arms & legs - no writing!', 105, y, { align: 'center' })
  y += 15
  
  const words = activity.words.slice(0, 3)
  for (let i = 0; i < words.length; i++) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(48)
    doc.setTextColor(0, 0, 0)
    doc.text(words[i].word, 105, y + i * 30, { align: 'center' })
  }
  
  return y + 90
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
  y += 15
  
  const words = activity.words.slice(0, 5)
  for (let i = 0; i < words.length; i++) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(36)
    doc.setTextColor(0, 0, 0)
    doc.text(words[i].word, 105, y + i * 22, { align: 'center' })
  }
  
  return y + 110
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
  
  const sentence = `I read ${activity.words[0].word}`
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
  doc.text('Find 4 letters. Easy and calm.', 105, y, { align: 'center' })
  y += 15
  
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
          try {
            const img = new Image()
            img.src = item.icon
            await new Promise((resolve) => {
              img.onload = resolve
              img.onerror = resolve
            })
            doc.addImage(img, 'PNG', 30, y - 5, 10, 10)
          } catch (e) {
            console.warn('Could not load image:', item.icon)
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