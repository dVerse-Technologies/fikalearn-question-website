import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { 
  fetchGoogleSheetAsCSV, 
  parseCSVAdvanced, 
  parseQuestionsFromCSV, 
  analyzeSheetStructure 
} from '@/lib/sheets-csv'

export async function POST(request: NextRequest) {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID || '1PfL4o_RBqm8itgwlGuZuIV6J5SyGWj6G'

    // Fetch CSV data from Google Sheets
    console.log('Fetching CSV data from Google Sheets...')
    const csvText = await fetchGoogleSheetAsCSV(sheetId)
    
    if (!csvText.trim()) {
      return NextResponse.json(
        { error: 'No data found in Google Sheet' },
        { status: 400 }
      )
    }

    // Parse CSV data
    console.log('Parsing CSV data...')
    const csvData = parseCSVAdvanced(csvText)
    
    if (csvData.length === 0) {
      return NextResponse.json(
        { error: 'Failed to parse CSV data' },
        { status: 400 }
      )
    }

    // Analyze sheet structure
    const analysis = analyzeSheetStructure(csvData)
    console.log('Sheet analysis:', analysis)

    // Parse questions from CSV data
    const parsedQuestions = parseQuestionsFromCSV(csvData)
    console.log(`Parsed ${parsedQuestions.length} questions from CSV`)

    if (parsedQuestions.length === 0) {
      return NextResponse.json({
        error: 'No valid questions found in the sheet',
        analysis,
        rawSample: csvData.slice(0, 3), // First 3 rows for debugging
      }, { status: 400 })
    }

    // Clear existing questions (fresh sync)
    await prisma.question.deleteMany({})
    console.log('Cleared existing questions')

    // Insert new questions
    const insertResults = await prisma.question.createMany({
      data: parsedQuestions.map(q => ({
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
    const sectionBreakdown = await getSectionBreakdown()
    const competencyBreakdown = await getCompetencyBreakdown()

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${insertResults.count} questions from Google Sheets`,
      breakdown: {
        total: insertResults.count,
        bySection: sectionBreakdown,
        byCompetency: competencyBreakdown
      },
      sheetAnalysis: analysis,
      syncedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error syncing CSV data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to sync data from Google Sheets', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
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

// GET method to analyze sheet structure without syncing
export async function GET() {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID || '1PfL4o_RBqm8itgwlGuZuIV6J5SyGWj6G'

    // Fetch and analyze CSV structure
    const csvText = await fetchGoogleSheetAsCSV(sheetId)
    const csvData = parseCSVAdvanced(csvText)
    const analysis = analyzeSheetStructure(csvData)

    // Get current database stats
    const totalQuestions = await prisma.question.count()
    const sectionBreakdown = await getSectionBreakdown()
    const competencyBreakdown = await getCompetencyBreakdown()

    return NextResponse.json({
      success: true,
      sheetAnalysis: analysis,
      currentDatabase: {
        totalQuestions,
        sectionBreakdown,
        competencyBreakdown
      },
      lastChecked: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error analyzing sheet:', error)
    return NextResponse.json(
      { error: 'Failed to analyze sheet structure' },
      { status: 500 }
    )
  }
} 