import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('📚 Fetching available chapters...');
    
    // Get all unique topics (chapters) with question counts
    const chaptersWithCounts = await prisma.question.groupBy({
      by: ['topic', 'subject'],
      _count: {
        id: true
      },
      orderBy: [
        { subject: 'asc' },
        { topic: 'asc' }
      ]
    });
    
    // Group by subject
    const chaptersBySubject: Record<string, any[]> = {};
    
    chaptersWithCounts.forEach(item => {
      const subject = item.subject || 'General';
      if (!chaptersBySubject[subject]) {
        chaptersBySubject[subject] = [];
      }
      
      chaptersBySubject[subject].push({
        name: item.topic || 'General',
        questionCount: item._count.id,
        subject: subject
      });
    });
    
    // Get section-wise distribution for each chapter
    const sectionDistribution = await prisma.question.groupBy({
      by: ['topic', 'subject', 'section'],
      _count: {
        id: true
      }
    });
    
    // Add section info to chapters
    Object.values(chaptersBySubject).forEach(chapters => {
      chapters.forEach(chapter => {
        const sections: Record<string, number> = {};
        sectionDistribution
          .filter(item => item.topic === chapter.name && item.subject === chapter.subject)
          .forEach(item => {
            sections[item.section] = item._count.id;
          });
        chapter.sections = sections;
      });
    });
    
    // Calculate totals
    const totalChapters = chaptersWithCounts.length;
    const totalQuestions = chaptersWithCounts.reduce((sum, item) => sum + item._count.id, 0);
    
    return NextResponse.json({
      success: true,
      message: `Found ${totalChapters} chapters with ${totalQuestions} questions`,
      data: {
        chaptersBySubject,
        totalChapters,
        totalQuestions,
        subjects: Object.keys(chaptersBySubject)
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching chapters:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch chapters',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 