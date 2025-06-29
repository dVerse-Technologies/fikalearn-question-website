import { NextRequest, NextResponse } from 'next/server';
import { generateCBSEPaper, savePaperToDatabase, ChapterFilter } from '@/lib/paper-generator';

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Paper generation API called...');
    
    // Get the week start date and selected chapters from request body
    const body = await request.json().catch(() => ({}));
    const weekStart = body.weekStart ? new Date(body.weekStart) : getStartOfCurrentWeek();
    const selectedChapters: ChapterFilter[] = body.selectedChapters || [];
    
    console.log(`📅 Generating paper for week starting: ${weekStart.toDateString()}`);
    if (selectedChapters.length > 0) {
      console.log('📚 Selected chapters:', selectedChapters);
    }
    
    // Step 1: Generate the paper
    const paper = await generateCBSEPaper(weekStart, selectedChapters);
    
    // Step 2: Save to database
    const paperId = await savePaperToDatabase(paper);
    
    // Step 3: Return success response
    return NextResponse.json({
      success: true,
      message: `Successfully generated CBSE paper for Week ${paper.id.split('-').pop()}`,
      paper: {
        id: paper.id,
        title: paper.title,
        description: paper.description,
        totalMarks: paper.totalMarks,
        weekStart: paper.metadata.weekStart,
        weekEnd: paper.metadata.weekEnd,
        sections: Object.fromEntries(
          Object.entries(paper.sections).map(([code, section]) => [
            code,
            {
              questionCount: section.questions.length,
              marksPerQuestion: section.marksPerQuestion,
              totalMarks: section.totalMarks,
              sampleQuestion: section.questions[0]?.question.substring(0, 100) + '...'
            }
          ])
        ),
        distribution: paper.metadata.questionDistribution,
        selectedChapters: selectedChapters.length > 0 ? selectedChapters : null
      }
    });
    
  } catch (error) {
    console.error('❌ Error generating paper:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to generate paper',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Generate a paper for the current week
    const weekStart = getStartOfCurrentWeek();
    
    console.log(`📅 Quick paper generation for: ${weekStart.toDateString()}`);
    
    const paper = await generateCBSEPaper(weekStart);
    
    // Return the paper without saving (for preview)
    return NextResponse.json({
      success: true,
      message: 'Paper generated successfully (preview mode)',
      paper: {
        id: paper.id,
        title: paper.title,
        description: paper.description,
        totalMarks: paper.totalMarks,
        sections: paper.sections,
        metadata: paper.metadata
      }
    });
    
  } catch (error) {
    console.error('❌ Error generating paper preview:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to generate paper preview',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Get the start of the current week (Monday)
 */
function getStartOfCurrentWeek(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when day is Sunday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
} 