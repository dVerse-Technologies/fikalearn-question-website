import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    // Check database connection
    const questionCount = await prisma.question.count();
    const paperCount = await prisma.paper.count();
    
    // Check if we have data
    const hasData = questionCount > 0;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        questions: questionCount,
        papers: paperCount,
        hasData
      },
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      features: {
        questionGeneration: true,
        googleSheetsSync: true,
        cronScheduling: process.env.ENABLE_CRON === 'true',
        settings: true
      }
    });
  } catch (error: any) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
        database: {
          connected: false
        }
      },
      { status: 500 }
    );
  }
} 