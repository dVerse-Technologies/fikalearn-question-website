import { NextRequest, NextResponse } from 'next/server';
import { 
  startCronScheduler, 
  stopCronScheduler, 
  getSchedulerStatus, 
  triggerWeeklyGeneration,
  getCronLogs,
  getWeeklySchedules 
} from '../../../../lib/cron-scheduler';

// GET - Get scheduler status and recent activity
export async function GET() {
  try {
    const status = getSchedulerStatus();
    const recentLogs = await getCronLogs(10);
    const recentSchedules = await getWeeklySchedules(5);
    
    return NextResponse.json({
      status,
      recentLogs,
      recentSchedules
    });
  } catch (error: any) {
    console.error('❌ Error fetching scheduler status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduler status', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Control scheduler operations
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    switch (action) {
      case 'start':
        startCronScheduler();
        return NextResponse.json({ 
          success: true, 
          message: 'CRON scheduler started successfully',
          status: getSchedulerStatus()
        });
        
      case 'stop':
        stopCronScheduler();
        return NextResponse.json({ 
          success: true, 
          message: 'CRON scheduler stopped successfully',
          status: getSchedulerStatus()
        });
        
      case 'trigger':
        console.log('🔧 Manual trigger requested via API');
        await triggerWeeklyGeneration();
        return NextResponse.json({ 
          success: true, 
          message: 'Weekly paper generation triggered successfully'
        });
        
      case 'status':
        return NextResponse.json({
          success: true,
          status: getSchedulerStatus()
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: start, stop, trigger, or status' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('❌ Error controlling scheduler:', error);
    return NextResponse.json(
      { error: 'Failed to control scheduler', details: error.message },
      { status: 500 }
    );
  }
} 