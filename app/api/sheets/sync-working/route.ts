import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { fetchGoogleSheetWorkingMethod, parseUserSheetFormat, analyzeUserSheetData } from '@/lib/sheets-csv-working';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting Google Sheets sync using working method...');
    
    // Step 1: Fetch the CSV data using the working method
    const sheetId = '1PfL4o_RBqm8itgwlGuZuIV6J5SyGWj6G';
    const csvText = await fetchGoogleSheetWorkingMethod(sheetId);
    
    console.log(`📊 Fetched ${csvText.length} characters of CSV data`);
    
    // Step 2: Parse the CSV data to extract questions
    const questions = parseUserSheetFormat(csvText);
    console.log(`📝 Parsed ${questions.length} Class 10 questions`);
    
    if (questions.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No Class 10 questions found in the sheet',
        csvLength: csvText.length,
        preview: csvText.substring(0, 500)
      });
    }
    
    // Step 3: Analyze the data
    const analysis = analyzeUserSheetData(questions);
    console.log('📈 Data analysis:', analysis);
    
    // Step 4: Clear existing questions (optional - remove if you want to keep old data)
    await prisma.question.deleteMany({});
    console.log('🗑️ Cleared existing questions');
    
    // Step 5: Insert new questions into database
    let insertedCount = 0;
    const errors: string[] = [];
    
    for (const questionData of questions) {
      try {
        await prisma.question.create({
          data: {
            question: questionData.question,
            section: questionData.section,
            marks: questionData.marks,
            competency: questionData.competency,
            subject: questionData.subject || 'General',
            topic: questionData.topic || 'General',
            difficulty: questionData.difficulty || 'Medium',
            optionA: questionData.options?.A || '',
            optionB: questionData.options?.B || '',
            optionC: questionData.options?.C || '',
            optionD: questionData.options?.D || '',
            correctAnswer: questionData.correctAnswer || '',
            explanation: questionData.explanation || ''
          }
        });
        insertedCount++;
      } catch (error) {
        console.error('Error inserting question:', error);
        errors.push(`Question ${insertedCount + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        // Stop after 10 errors to avoid overwhelming the response
        if (errors.length >= 10) {
          errors.push('... (truncated after 10 errors)');
          break;
        }
      }
    }
    
    console.log(`✅ Successfully inserted ${insertedCount} questions`);
    
    // Step 6: Return success response with analysis
    return NextResponse.json({
      success: true,
      message: `Successfully synced ${insertedCount} questions from Google Sheets`,
      analysis: {
        totalQuestions: analysis.totalQuestions,
        insertedQuestions: insertedCount,
        bySubject: analysis.bySubject,
        bySection: analysis.bySection,
        byCompetency: analysis.byCompetency,
        sampleQuestions: analysis.sampleQuestions.map(q => ({
          question: q.question.substring(0, 100) + '...',
          section: q.section,
          marks: q.marks,
          competency: q.competency,
          subject: q.subject
        }))
      },
      errors: errors.length > 0 ? errors : undefined,
      csvPreview: csvText.substring(0, 500) + '...'
    });
    
  } catch (error) {
    console.error('❌ Error in Google Sheets sync:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to sync Google Sheets data',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  // GET endpoint to check sync status
  try {
    const questionCount = await prisma.question.count();
    const questionsBySection = await prisma.question.groupBy({
      by: ['section'],
      _count: true
    });
    
    const questionsByCompetency = await prisma.question.groupBy({
      by: ['competency'],
      _count: true
    });
    
    const sectionCounts = questionsBySection.reduce((acc, item) => {
      acc[item.section] = item._count;
      return acc;
    }, {} as Record<string, number>);
    
    const competencyCounts = questionsByCompetency.reduce((acc, item) => {
      acc[item.competency] = item._count;
      return acc;
    }, {} as Record<string, number>);
    
    return NextResponse.json({
      success: true,
      message: 'Database status retrieved',
      status: {
        totalQuestions: questionCount,
        bySection: sectionCounts,
        byCompetency: competencyCounts,
        lastSyncTime: new Date().toISOString()
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to get database status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 