// src/services/pdfGenerator.ts
import jsPDF from 'jspdf'

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

interface WorksheetActivity {
  type: 'word_sort' | 'fill_pattern' | 'build_word'
  title: string
  instructions: string
  content: any
}

interface WorksheetData {
  selectedPattern: string
  difficulty: string
  wordCount: number
  words: Word[]
  activities: WorksheetActivity[]
}

export class PDFGenerator {
  private doc: jsPDF
  private pageHeight: number = 279.4 // A4 height in mm
  private pageWidth: number = 215.9 // A4 width in mm
  private margin: number = 20
  private currentY: number = 20
  private lineHeight: number = 7
  private pageNumber: number = 1

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4')
    this.doc.setFont('helvetica')
  }

  private addNewPage() {
    this.doc.addPage()
    this.pageNumber++
    this.currentY = 20
    this.addPageNumber()
  }

  private addPageNumber() {
    this.doc.setFontSize(8)
    this.doc.setTextColor(100)
    this.doc.text(`Page ${this.pageNumber}`, this.pageWidth - this.margin, this.pageHeight - 10, { align: 'right' })
    this.doc.setTextColor(0)
  }

  private checkPageBreak(requiredSpace: number = 30) {
    if (this.currentY + requiredSpace > this.pageHeight - 30) {
      this.addNewPage()
    }
  }

  private addTitle(text: string, fontSize: number = 16) {
    this.doc.setFontSize(fontSize)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(text, this.margin, this.currentY)
    this.currentY += this.lineHeight * 1.5
    this.doc.setFont('helvetica', 'normal')
  }

  private addSubheading(text: string, fontSize: number = 12) {
    this.doc.setFontSize(fontSize)
    this.doc.setFont('helvetica', 'bold')
    this.currentY += 5
    this.doc.text(text, this.margin, this.currentY)
    this.currentY += this.lineHeight
    this.doc.setFont('helvetica', 'normal')
  }

  private addText(text: string, fontSize: number = 10, indent: number = 0) {
    this.doc.setFontSize(fontSize)
    const lines = this.doc.splitTextToSize(text, this.pageWidth - this.margin * 2 - indent)
    lines.forEach((line: string) => {
      this.doc.text(line, this.margin + indent, this.currentY)
      this.currentY += this.lineHeight
    })
  }

  private addBox(content: string[], title?: string, cols: number = 3) {
    if (title) {
      this.addSubheading(title)
    }

    // Draw box
    const boxHeight = Math.max(40, Math.ceil(content.length / cols) * 8 + 10)
    this.doc.rect(this.margin, this.currentY, this.pageWidth - this.margin * 2, boxHeight)
    
    // Add content in columns
    const colWidth = (this.pageWidth - this.margin * 2) / cols
    let x = this.margin + 5
    let y = this.currentY + 8
    
    content.forEach((item, index) => {
      if (index > 0 && index % Math.ceil(content.length / cols) === 0) {
        x += colWidth
        y = this.currentY + 8
      }
      this.doc.setFontSize(10)
      this.doc.text(item, x, y)
      y += this.lineHeight
    })
    
    this.currentY += boxHeight + 10
  }

  private addWritingLines(count: number, label?: string, spacing: number = 12) {
    for (let i = 0; i < count; i++) {
      if (label) {
        this.doc.setFontSize(10)
        this.doc.text(`${i + 1}. ${label}:`, this.margin, this.currentY)
      }
      
      // Draw writing line
      const lineY = this.currentY + 3
      this.doc.line(this.margin + 30, lineY, this.pageWidth - this.margin, lineY)
      this.currentY += spacing
      
      this.checkPageBreak()
    }
  }

  // Page 1: Title & Word List
  private generateTitlePage(data: WorksheetData) {
    this.addPageNumber()
    
    // Title
    const patternName = data.selectedPattern.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    this.addTitle(`Phonics Practice: ${patternName}`, 18)
    
    // Date and teacher info
    this.currentY += 10
    const today = new Date().toLocaleDateString()
    this.addText(`Date: ${today}`, 10)
    this.currentY += 10
    
    this.doc.text('Teacher: ________________', this.margin, this.currentY)
    this.doc.text('Class: ________________', this.margin + 90, this.currentY)
    this.currentY += 20
    
    // Word list in highlighted box
    this.addSubheading('Words for this Activity:')
    const wordList = data.words.map(w => w.word)
    this.addBox(wordList, undefined, 4)
    
    this.currentY += 10
    this.addSubheading('Instructions for Students:')
    this.addText(`Today we're practicing ${patternName.toLowerCase()}. Look for the pattern in each word!`, 11)
    
    this.addNewPage()
  }

  // Page 2: Word Sort Activity
  private generateWordSortPage(data: WorksheetData) {
    const sortActivity = data.activities.find(a => a.type === 'word_sort')
    if (!sortActivity) return
    
    this.addTitle('Activity 1: Pattern Hunt', 14)
    this.addText('Circle the phonics pattern in each word, then sort by syllables.')
    this.currentY += 10
    
    // Create sorting columns
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(11)
    
    const colWidth = (this.pageWidth - this.margin * 2) / 3
    this.doc.text('1 Syllable', this.margin + 10, this.currentY)
    this.doc.text('2 Syllables', this.margin + colWidth + 10, this.currentY)
    this.doc.text('3+ Syllables', this.margin + colWidth * 2 + 10, this.currentY)
    this.currentY += 10
    
    // Draw sorting boxes
    const boxHeight = 80
    for (let i = 0; i < 3; i++) {
      this.doc.rect(this.margin + i * colWidth, this.currentY, colWidth, boxHeight)
    }
    this.currentY += boxHeight + 20
    
    // Word bank
    this.addSubheading('Word Bank:')
    this.addBox(sortActivity.content.wordsToSort, undefined, 5)
    
    this.addNewPage()
  }

  // Page 3: Fill in the Missing Letters
  private generateFillPatternPage(data: WorksheetData) {
    const fillActivity = data.activities.find(a => a.type === 'fill_pattern')
    if (!fillActivity) return
    
    this.addTitle('Activity 2: Complete the Pattern', 14)
    this.addText('Fill in the missing letters to complete each word.')
    this.currentY += 15
    
    fillActivity.content.words.forEach((wordData: any, index: number) => {
      const word = data.words.find(w => w.word === wordData.original)
      const hint = word?.meaning_support || 'complete the word'
      
      this.doc.setFontSize(11)
      this.doc.text(`${index + 1}. ${wordData.fillIn}`, this.margin, this.currentY)
      this.doc.setFontSize(9)
      this.doc.setTextColor(100)
      this.doc.text(`(hint: ${hint})`, this.margin + 60, this.currentY)
      this.doc.setTextColor(0)
      
      this.currentY += 12
      this.checkPageBreak()
    })
    
    this.addNewPage()
  }

  // Page 4: Build-a-Word Activity
  private generateBuildWordPage(data: WorksheetData) {
    const buildActivity = data.activities.find(a => a.type === 'build_word')
    if (!buildActivity) return
    
    this.addTitle('Activity 3: Word Building', 14)
    this.addText('Use the letter chunks below to build words. Write the complete word on the line.')
    this.currentY += 15
    
    // Collect all unique chunks
    const allChunks = new Set<string>()
    buildActivity.content.buildWords.forEach((wordData: any) => {
      wordData.chunks.forEach((chunk: string) => allChunks.add(chunk))
    })
    
    this.addSubheading('Available Letter Chunks:')
    this.addBox(Array.from(allChunks), undefined, 6)
    
    this.addSubheading('Build these words:')
    buildActivity.content.buildWords.forEach((wordData: any, index: number) => {
      this.doc.setFontSize(11)
      
      // Show chunks to arrange
      const chunksText = wordData.scrambledChunks.map((chunk: string) => `[${chunk}]`).join(' ')
      this.doc.text(`${index + 1}. Chunks: ${chunksText}`, this.margin, this.currentY)
      this.currentY += 8
      
      // Writing line
      this.doc.text('Word:', this.margin + 10, this.currentY)
      this.doc.line(this.margin + 35, this.currentY, this.margin + 120, this.currentY)
      this.currentY += 15
      
      this.checkPageBreak()
    })
    
    this.addNewPage()
  }

  // Page 5: Sentences in Context
  private generateSentencePage(data: WorksheetData) {
    this.addTitle('Activity 4: Words in Action', 14)
    this.addText('Write each word in a sentence. Make sure your sentence shows you understand the word\'s meaning.')
    this.currentY += 15
    
    const selectedWords = data.words.slice(0, 8)
    selectedWords.forEach((word, index) => {
      this.doc.setFontSize(11)
      this.doc.text(`${index + 1}. ${word.word}:`, this.margin, this.currentY)
      
      // Two writing lines per word
      this.doc.line(this.margin + 30, this.currentY, this.pageWidth - this.margin, this.currentY)
      this.currentY += 10
      this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY)
      this.currentY += 15
      
      this.checkPageBreak(25)
    })
    
    this.addNewPage()
  }

  // Page 6: Pattern Detective
  private generateDetectivePage(data: WorksheetData) {
    const patternName = data.selectedPattern.replace(/_/g, ' ')
    
    this.addTitle('Activity 5: Real World Hunt', 14)
    this.addText(`Find 5 words with the ${patternName} pattern in books, signs, or magazines around you.`)
    this.currentY += 15
    
    // Create table
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Word Found', this.margin, this.currentY)
    this.doc.text('Where I Found It', this.margin + 60, this.currentY)
    this.currentY += 8
    
    // Table lines
    for (let i = 0; i < 6; i++) {
      this.doc.line(this.margin, this.currentY, this.margin + 50, this.currentY)
      this.doc.line(this.margin + 60, this.currentY, this.pageWidth - this.margin, this.currentY)
      this.currentY += 12
    }
    
    this.currentY += 15
    this.addSubheading('Bonus Challenge:')
    this.addText(`Can you find a word with the ${patternName} pattern that's NOT on our word list?`)
    this.currentY += 5
    this.doc.text('My discovery: ________________________', this.margin, this.currentY)
    
    this.addNewPage()
  }

  // Page 7: Creative Challenge
  private generateStoryPage(data: WorksheetData) {
    this.addTitle('Activity 6: Story Builder', 14)
    this.addText('Write a short story (3-5 sentences) using at least 4 words from today\'s word list.')
    this.currentY += 15
    
    // Lined writing space
    for (let i = 0; i < 8; i++) {
      this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY)
      this.currentY += 12
      this.checkPageBreak()
    }
    
    this.currentY += 15
    this.addSubheading('Word list reminder:')
    const wordList = data.words.map(w => w.word).join(', ')
    this.addText(wordList, 10)
    
    this.addNewPage()
  }

  // Page 8: Answer Key & Teacher Notes
  private generateAnswerKey(data: WorksheetData) {
    this.addTitle('TEACHER ANSWER KEY', 16)
    this.currentY += 10
    
    // Activity 1 Answers
    const sortActivity = data.activities.find(a => a.type === 'word_sort')
    if (sortActivity) {
      this.addSubheading('Activity 1 - Word Sort Answers:')
      Object.entries(sortActivity.content.answer).forEach(([category, words]: [string, any]) => {
        this.addText(`${category}: ${words.join(', ')}`, 10, 10)
      })
      this.currentY += 10
    }
    
    // Activity 2 Answers
    const fillActivity = data.activities.find(a => a.type === 'fill_pattern')
    if (fillActivity) {
      this.addSubheading('Activity 2 - Fill Pattern Answers:')
      fillActivity.content.words.forEach((wordData: any, index: number) => {
        this.addText(`${index + 1}. ${wordData.original}`, 10, 10)
      })
      this.currentY += 10
    }
    
    // Activity 3 Answers
    const buildActivity = data.activities.find(a => a.type === 'build_word')
    if (buildActivity) {
      this.addSubheading('Activity 3 - Build Word Answers:')
      buildActivity.content.buildWords.forEach((wordData: any, index: number) => {
        this.addText(`${index + 1}. ${wordData.word}`, 10, 10)
      })
      this.currentY += 15
    }
    
    // Teaching Tips
    this.checkPageBreak(50)
    this.addSubheading('Teaching Tips:')
    const patternName = data.selectedPattern.replace(/_/g, ' ')
    this.addText(`• Emphasize the ${patternName} pattern in each word`, 10, 10)
    this.addText(`• Watch for common mistakes: confusing similar patterns`, 10, 10)
    this.addText(`• Extension ideas: Have students find more words with this pattern`, 10, 10)
    this.addText(`• Supports for struggling learners: Work in pairs, use highlighting`, 10, 10)
  }

  public generateWorksheetPDF(data: WorksheetData): jsPDF {
    this.generateTitlePage(data)
    this.generateWordSortPage(data)
    this.generateFillPatternPage(data)
    this.generateBuildWordPage(data)
    this.generateSentencePage(data)
    this.generateDetectivePage(data)
    this.generateStoryPage(data)
    this.generateAnswerKey(data)
    
    return this.doc
  }
}

// Export function to generate and download PDF
export const generateAndDownloadPDF = (data: WorksheetData) => {
  const generator = new PDFGenerator()
  const pdf = generator.generateWorksheetPDF(data)
  
  const filename = `${data.selectedPattern}_${data.difficulty}_worksheet.pdf`
  pdf.save(filename)
}