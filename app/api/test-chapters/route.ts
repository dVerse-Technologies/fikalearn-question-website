import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const selectedChapters = body.selectedChapters || [];
    
    console.log('🧪 Testing chapter filtering with:', selectedChapters);
    
    if (selectedChapters.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No chapters selected for testing'
      });
    }
    
    // Build chapter filter
    const allowedChapters: string[] = [];
    selectedChapters.forEach((filter: any) => {
      allowedChapters.push(...filter.chapters);
    });
    
    // Test each section
    const results: any = {};
    
    for (const section of ['B', 'C', 'D', 'E']) {
      const questions = await prisma.question.findMany({
        where: {
          section,
          topic: {
            in: allowedChapters
          }
        },
        select: {
          id: true,
          topic: true,
          subject: true,
          competency: true,
          question: true
        },
        take: 10 // Limit for testing
      });
      
      results[section] = {
        availableQuestions: questions.length,
        sampleQuestions: questions.slice(0, 3).map(q => ({
          topic: q.topic,
          subject: q.subject,
          competency: q.competency,
          questionPreview: q.question.substring(0, 100) + '...'
        }))
      };
    }
    
    const totalFilteredQuestions = Object.values(results).reduce((sum: number, section: any) => sum + section.availableQuestions, 0);
    
    return NextResponse.json({
      success: true,
      message: `Found ${totalFilteredQuestions} questions matching selected chapters`,
      selectedChapters: allowedChapters,
      results,
      canGeneratePaper: {
        sectionB: results.B.availableQuestions >= 6,
        sectionC: results.C.availableQuestions >= 7,
        sectionD: results.D.availableQuestions >= 3,
        sectionE: results.E.availableQuestions >= 3,
        overall: results.B.availableQuestions >= 6 && 
                results.C.availableQuestions >= 7 && 
                results.D.availableQuestions >= 3 && 
                results.E.availableQuestions >= 3
      }
    });
    
  } catch (error) {
    console.error('❌ Error testing chapters:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to test chapter filtering',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 