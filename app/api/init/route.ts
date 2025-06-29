import { NextResponse } from 'next/server';
import { initializeCronScheduler, isCronInitialized } from '../../../lib/cron-init';
import { getSchedulerStatus } from '../../../lib/cron-scheduler';

export async function GET() {
  try {
    console.log('🏁 Application initialization requested');
    
    // Initialize CRON scheduler if not already done
    initializeCronScheduler();
    
    // Get current status
    const schedulerStatus = getSchedulerStatus();
    const isInitialized = isCronInitialized();
    
    return NextResponse.json({
      success: true,
      message: 'Application initialized successfully',
      cronScheduler: {
        initialized: isInitialized,
        status: schedulerStatus
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ Application initialization failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Application initialization failed', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Also handle POST for manual initialization
export async function POST() {
  return GET();
} 