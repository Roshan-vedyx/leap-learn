// src/components/worksheets/pdf/MoodPDFGenerator.ts

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
  overwhelmed: { bg: '#E8F4F8', accent: '#5BA3BF', bar: '#B8D8E8' },
  highEnergy: { bg: '#FFF4E6', accent: '#FF8C42', bar: '#FFD4A3' },
  lowEnergy: { bg: '#F3F0FF', accent: '#9B7EBD', bar: '#D4C5F9' },
}

export function generateMoodPDF(
  data: WorksheetData,
  mood: string,
  activityType: string
) {
  const doc = new jsPDF()
  const colors = MOOD_COLORS[mood as keyof typeof MOOD_COLORS]
  
  // Fill background
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
  
  // Download
  const filename = `${mood}_${activityType}_${Date.now()}.pdf`
  doc.save(filename)
}

// OVERWHELMED TEMPLATES

function generateTrace3Words(
  doc: jsPDF,
  data: WorksheetData,
  colors: any
) {
  const words = data.words.slice(0, 3)
  
  // Title bar
  doc.setFillColor(colors.bar)
  doc.rect(0, 0, 210, 25, 'F')
  
  // Title
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Trace 3 Words', 105, 15, { align: 'center' })
  
  // Decorative line
  doc.setDrawColor(colors.accent)
  doc.setLineWidth(1)
  doc.line(20, 30, 190, 30)
  
  // Instructions
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text('Trace each word one time. Just 3 is perfect.', 105, 45, { align: 'center' })
  
  // Words with tracing guides
  let yPos = 70
  words.forEach((wordObj, index) => {
    const word = wordObj.word
    
    // Word in large, light gray for tracing
    doc.setFontSize(48)
    doc.setTextColor(200, 200, 200)
    doc.text(word, 105, yPos, { align: 'center' })
    
    // Dotted baseline
    doc.setDrawColor(180, 180, 180)
    doc.setLineDash([2, 2])
    doc.line(40, yPos + 2, 170, yPos + 2)
    doc.setLineDash([])
    
    yPos += 60
  })
  
  // Completion message at bottom
  doc.setFillColor(colors.bar)
  doc.rect(0, 260, 210, 37, 'F')
  doc.setFontSize(14)
  doc.setTextColor(60, 60, 60)
  doc.text('You traced 3 words today. That\'s the goal.', 105, 280, { align: 'center' })
  
  // Reset colors
  doc.setTextColor(0, 0, 0)
}

function generateBreatheCircle(
  doc: jsPDF,
  data: WorksheetData,
  colors: any
) {
  const words = data.words.slice(0, 3)
  
  // Title bar
  doc.setFillColor(colors.bar)
  doc.rect(0, 0, 210, 25, 'F')
  
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Breathe and Circle', 105, 15, { align: 'center' })
  
  doc.setDrawColor(colors.accent)
  doc.setLineWidth(1)
  doc.line(20, 30, 190, 30)
  
  // Instructions with breathing reminder
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text('Take a breath. Find the word. Circle it.', 105, 45, { align: 'center' })
  
  doc.setFontSize(11)
  doc.setTextColor(100, 100, 100)
  doc.text('💙 Breathe in... breathe out... then look', 105, 55, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  
  // Word matching rows
  let yPos = 80
  words.forEach((wordObj) => {
    const word = wordObj.word
    
    // Target word in color
    doc.setFontSize(28)
    doc.setTextColor(colors.accent)
    doc.text(word, 40, yPos)
    
    // Matching options (target + 2 distractors)
    doc.setFontSize(20)
    doc.setTextColor(0, 0, 0)
    const options = getMatchingOptions(word, data.distractors)
    
    let xPos = 110
    options.forEach((opt) => {
      doc.text(opt, xPos, yPos)
      xPos += 30
    })
    
    yPos += 50
  })
  
  // Completion message
  doc.setFillColor(colors.bar)
  doc.rect(0, 260, 210, 37, 'F')
  doc.setFontSize(14)
  doc.setTextColor(60, 60, 60)
  doc.text('3 matches found. That\'s enough for today.', 105, 280, { align: 'center' })
  
  doc.setTextColor(0, 0, 0)
}

// HIGH ENERGY TEMPLATES

function generateSoundHunt(
  doc: jsPDF,
  data: WorksheetData,
  colors: any
) {
  const words = data.words.slice(0, 9)
  
  // Title bar
  doc.setFillColor(colors.bar)
  doc.rect(0, 0, 210, 25, 'F')
  
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Sound Hunt', 105, 15, { align: 'center' })
  
  doc.setDrawColor(colors.accent)
  doc.setLineWidth(1)
  doc.line(20, 30, 190, 30)
  
  // Instructions
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text('Circle all the words you can find. Go fast!', 105, 45, { align: 'center' })
  
  // Grid of words (3x3)
  let yPos = 70
  for (let row = 0; row < 3; row++) {
    let xPos = 40
    for (let col = 0; col < 3; col++) {
      const index = row * 3 + col
      if (index < words.length) {
        doc.setFontSize(20)
        doc.text(words[index].word, xPos, yPos)
      }
      xPos += 50
    }
    yPos += 40
  }
  
  // Movement break reminder
  doc.setFontSize(12)
  doc.setTextColor(100, 100, 100)
  doc.text('🏃 Take a wiggle break halfway through!', 105, 210, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  
  // Completion message
  doc.setFillColor(colors.bar)
  doc.rect(0, 260, 210, 37, 'F')
  doc.setFontSize(14)
  doc.setTextColor(60, 60, 60)
  doc.text(`You found ${words.length} words. Good focus today.`, 105, 280, { align: 'center' })
  
  doc.setTextColor(0, 0, 0)
}

function generateBodyLetter(
  doc: jsPDF,
  data: WorksheetData,
  colors: any
) {
  const words = data.words.slice(0, 5)
  
  // Title bar
  doc.setFillColor(colors.bar)
  doc.rect(0, 0, 210, 25, 'F')
  
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Body Letter Fun', 105, 15, { align: 'center' })
  
  doc.setDrawColor(colors.accent)
  doc.setLineWidth(1)
  doc.line(20, 30, 190, 30)
  
  // Instructions
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text('Make each letter with your body. Then say the word!', 105, 45, { align: 'center' })
  
  // Words with space for movement
  let yPos = 80
  words.forEach((wordObj, index) => {
    doc.setFontSize(32)
    doc.setFont('helvetica', 'bold')
    doc.text(`${index + 1}. ${wordObj.word}`, 60, yPos)
    
    // Movement instruction
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text('(make letters, say word, jump!)', 65, yPos + 8)
    doc.setTextColor(0, 0, 0)
    
    yPos += 40
  })
  
  // Completion message
  doc.setFillColor(colors.bar)
  doc.rect(0, 260, 210, 37, 'F')
  doc.setFontSize(14)
  doc.setTextColor(60, 60, 60)
  doc.text(`You moved through ${words.length} words. Great energy!`, 105, 280, { align: 'center' })
  
  doc.setTextColor(0, 0, 0)
}

// LOW ENERGY TEMPLATES

function generatePointRest(
  doc: jsPDF,
  data: WorksheetData,
  colors: any
) {
  const words = data.words.slice(0, 5)
  
  // Title bar
  doc.setFillColor(colors.bar)
  doc.rect(0, 0, 210, 25, 'F')
  
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Point & Rest', 105, 15, { align: 'center' })
  
  doc.setDrawColor(colors.accent)
  doc.setLineWidth(1)
  doc.line(20, 30, 190, 30)
  
  // Instructions
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text('Just point to the words. No writing needed.', 105, 45, { align: 'center' })
  
  // Large, spaced words
  let yPos = 85
  words.forEach((wordObj) => {
    doc.setFontSize(36)
    doc.text(wordObj.word, 105, yPos, { align: 'center' })
    
    yPos += 45
  })
  
  // Completion message
  doc.setFillColor(colors.bar)
  doc.rect(0, 260, 210, 37, 'F')
  doc.setFontSize(14)
  doc.setTextColor(60, 60, 60)
  doc.text('Slow and steady. You pointed to some words.', 105, 280, { align: 'center' })
  
  doc.setTextColor(0, 0, 0)
}

function generateTraceOne(
  doc: jsPDF,
  data: WorksheetData,
  colors: any
) {
  const word = data.words[0].word
  
  // Title bar
  doc.setFillColor(colors.bar)
  doc.rect(0, 0, 210, 25, 'F')
  
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Trace Just One', 105, 15, { align: 'center' })
  
  doc.setDrawColor(colors.accent)
  doc.setLineWidth(1)
  doc.line(20, 30, 190, 30)
  
  // Instructions
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text('Trace this word one time. Take your time.', 105, 45, { align: 'center' })
  
  // Single large word for tracing
  doc.setFontSize(72)
  doc.setTextColor(200, 200, 200)
  doc.text(word, 105, 150, { align: 'center' })
  
  // Baseline
  doc.setDrawColor(180, 180, 180)
  doc.setLineDash([3, 3])
  doc.line(30, 153, 180, 153)
  doc.setLineDash([])
  
  // Completion message
  doc.setFillColor(colors.bar)
  doc.rect(0, 260, 210, 37, 'F')
  doc.setFontSize(14)
  doc.setTextColor(60, 60, 60)
  doc.text('One word traced. You did it.', 105, 280, { align: 'center' })
  
  doc.setTextColor(0, 0, 0)
}

// Helper function
function getMatchingOptions(
  targetWord: string,
  distractors: Array<{ word: string }>
): string[] {
  // Get 2 distractors similar to target
  const similar = distractors
    .filter(d => d.word.length === targetWord.length)
    .slice(0, 2)
    .map(d => d.word)
  
  // Mix target with distractors and shuffle
  const options = [targetWord, ...similar].sort(() => Math.random() - 0.5)
  return options.slice(0, 3)
}