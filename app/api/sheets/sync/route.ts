import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchGoogleSheetData, parseQuestionsFromSheetData, normalizeCompetency, validateSection, validateMarksForSection } from '@/lib/sheets'

export async function POST(request: NextRequest) {
  try {
    // For testing, allow API key from header, otherwise use environment variable
    const apiKey = request.headers.get('X-API-Key') || process.env.GOOGLE_SHEETS_API_KEY
    const sheetId = process.env.GOOGLE_SHEET_ID || '1PfL4o_RBqm8itgwlGuZuIV6J5SyGWj6G'

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Sheets API key missing' },
        { status: 500 }
      )
    }

    if (!sheetId) {
      return NextResponse.json(
        { error: 'Google Sheet ID missing' },
        { status: 500 }
      )
    }

    // Fetch data from Google Sheets
    console.log('Fetching data from Google Sheets...')
    const sheetData = await fetchGoogleSheetData(sheetId, 'Sheet1', apiKey)
    
    if (sheetData.length === 0) {
      return NextResponse.json(
        { error: 'No data found in Google Sheet' },
        { status: 400 }
      )
    }

    // Parse questions from sheet data
    const parsedQuestions = parseQuestionsFromSheetData(sheetData)
    console.log(`Parsed ${parsedQuestions.length} questions from sheet`)

    // Validate and clean the data
    const validQuestions = parsedQuestions.filter(q => {
      const hasValidSection = validateSection(q.section)
      const hasValidMarks = validateMarksForSection(q.section, q.marks)
      
      if (!hasValidSection) {
        console.warn(`Invalid section: ${q.section} for question: ${q.question.substring(0, 50)}...`)
        return false
      }
      
      if (!hasValidMarks) {
        console.warn(`Invalid marks: ${q.marks} for section ${q.section}`)
        return false
      }
      
      return true
    })

    console.log(`${validQuestions.length} valid questions after validation`)

    // Normalize competencies
    const normalizedQuestions = validQuestions.map(q => ({
      ...q,
      competency: normalizeCompetency(q.competency)
    }))

    // Clear existing questions (fresh sync)
    await prisma.question.deleteMany({})
    console.log('Cleared existing questions')

    // Insert new questions
    const insertResults = await prisma.question.createMany({
      data: normalizedQuestions.map(q => ({
        question: q.question,
        section: q.section,
        marks: q.marks,
        competency: q.competency,
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty,
      }))
    })

    console.log(`Inserted ${insertResults.count} questions into database`)

    // Get statistics
    const stats = await prisma.question.groupBy({
      by: ['section', 'competency'],
      _count: {
        id: true,
      }
    })

    return NextResponse.json({
      success: true,
      message: `Synced ${insertResults.count} questions from Google Sheets`,
      statistics: stats,
      breakdown: {
        total: insertResults.count,
        bySection: await getSectionBreakdown(),
        byCompetency: await getCompetencyBreakdown()
      }
    })

  } catch (error) {
    console.error('Error syncing Google Sheets:', error)
    return NextResponse.json(
      { error: 'Failed to sync data from Google Sheets', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Helper function to get section breakdown
async function getSectionBreakdown() {
  const sections = await prisma.question.groupBy({
    by: ['section'],
    _count: {
      id: true,
    }
  })

  return sections.reduce((acc, section) => {
    acc[section.section] = section._count.id
    return acc
  }, {} as Record<string, number>)
}

// Helper function to get competency breakdown
async function getCompetencyBreakdown() {
  const competencies = await prisma.question.groupBy({
    by: ['competency'],
    _count: {
      id: true,
    }
  })

  return competencies.reduce((acc, comp) => {
    acc[comp.competency] = comp._count.id
    return acc
  }, {} as Record<string, number>)
}

// GET method to check sync status
export async function GET() {
  try {
    const totalQuestions = await prisma.question.count()
    const sectionBreakdown = await getSectionBreakdown()
    const competencyBreakdown = await getCompetencyBreakdown()

    return NextResponse.json({
      success: true,
      totalQuestions,
      sectionBreakdown,
      competencyBreakdown,
      lastSync: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error getting sync status:', error)
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    )
  }
} 