import { NextRequest, NextResponse } from 'next/server';
import { getPapersFromDatabase } from '@/lib/paper-generator';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Fetching papers from database...');
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Get papers from database
    const papers = await getPapersFromDatabase(limit);
    
    // Transform papers for response
    const transformedPapers = papers.map(paper => ({
      id: paper.id,
      title: paper.title,
      description: paper.description,
      totalMarks: paper.totalMarks,
      weekStart: paper.weekStart,
      weekEnd: paper.weekEnd,
      publishedAt: paper.publishedAt,
      isActive: paper.isActive,
      questionCount: paper.paperQuestions.length,
      sections: groupQuestionsBySection(paper.paperQuestions)
    }));
    
    return NextResponse.json({
      success: true,
      message: `Found ${papers.length} papers`,
      papers: transformedPapers,
      count: papers.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching papers:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch papers',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Group questions by section for display
 */
function groupQuestionsBySection(paperQuestions: any[]) {
  const sections: Record<string, any> = {};
  
  paperQuestions.forEach(pq => {
    const section = pq.question.section;
    if (!sections[section]) {
      sections[section] = {
        questions: [],
        totalMarks: 0,
        marksPerQuestion: pq.question.marks
      };
    }
    
    sections[section].questions.push({
      id: pq.question.id,
      question: pq.question.question,
      marks: pq.question.marks,
      competency: pq.question.competency,
      subject: pq.question.subject,
      topic: pq.question.topic,
      optionA: pq.question.optionA,
      optionB: pq.question.optionB,
      optionC: pq.question.optionC,
      optionD: pq.question.optionD,
      correctAnswer: pq.question.correctAnswer,
      explanation: pq.question.explanation,
      order: pq.order
    });
    
    sections[section].totalMarks += pq.question.marks;
  });
  
  // Sort questions within each section by order
  Object.values(sections).forEach((section: any) => {
    section.questions.sort((a: any, b: any) => a.order - b.order);
  });
  
  return sections;
} 