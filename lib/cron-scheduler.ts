import * as cron from 'node-cron';
import { generateCBSEPaper, savePaperToDatabase, type GeneratedPaper } from './paper-generator';
import { prisma } from './prisma';

// CRON job instances
let weeklyPaperJob: cron.ScheduledTask | null = null;

// Configuration
const CRON_CONFIG = {
  // Every Sunday at 6:00 AM
  WEEKLY_PAPER_SCHEDULE: '0 6 * * 0',
  TIMEZONE: 'Asia/Kolkata'
};

// Logging utility
function log(level: 'INFO' | 'ERROR' | 'WARN', message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `[CRON ${level}] ${timestamp}: ${message}`;
  
  if (data) {
    console.log(logMessage, data);
  } else {
    console.log(logMessage);
  }
  
  // Store in database for audit trail
  storeCronLog(level, message, data).catch(console.error);
}

// Store CRON logs in database
async function storeCronLog(level: string, message: string, data?: any) {
  try {
    await prisma.cronLog.create({
      data: {
        level,
        message,
        data: data ? JSON.stringify(data) : null,
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Failed to store CRON log:', error);
  }
}

// Get next week's start date (Monday)
function getNextWeekStart(): Date {
  const now = new Date();
  const nextWeek = new Date(now);
  
  // Calculate days until next Monday
  const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
  nextWeek.setDate(now.getDate() + daysUntilMonday);
  nextWeek.setHours(0, 0, 0, 0);
  
  return nextWeek;
}

// Automated weekly paper generation
async function generateWeeklyPaper() {
  const startTime = new Date();
  log('INFO', '🚀 Starting automated weekly paper generation');
  
  try {
    const weekStartDate = getNextWeekStart();
    
    log('INFO', '📅 Generating paper for upcoming week', {
      weekStart: weekStartDate.toISOString(),
      scheduledAt: startTime.toISOString()
    });
    
    // Generate the paper
    const generatedPaper: GeneratedPaper = await generateCBSEPaper(weekStartDate);
    
    // Save paper to database
    const savedPaperId = await savePaperToDatabase(generatedPaper);
    
    log('INFO', '✅ Weekly paper generated successfully', {
      paperId: savedPaperId,
      weekStart: weekStartDate.toISOString(),
      questionsCount: Object.values(generatedPaper.sections).reduce((total, section) => total + section.questions.length, 0),
      duration: Date.now() - startTime.getTime()
    });
    
    // Update weekly schedule record
    await updateWeeklySchedule(weekStartDate, savedPaperId, 'COMPLETED');
    
  } catch (error: any) {
    log('ERROR', '❌ Failed to generate weekly paper', {
      error: error.message,
      stack: error.stack,
      duration: Date.now() - startTime.getTime()
    });
    
    // Update schedule with error status
    const weekStartDate = getNextWeekStart();
    await updateWeeklySchedule(weekStartDate, null, 'FAILED', error.message);
    
    // Could implement retry logic here
    throw error;
  }
}

// Update weekly schedule record
async function updateWeeklySchedule(
  weekStartDate: Date, 
  paperId: string | null, 
  status: 'SCHEDULED' | 'COMPLETED' | 'FAILED',
  errorMessage?: string
) {
  try {
    await prisma.weeklySchedule.upsert({
      where: {
        weekStartDate: weekStartDate
      },
      update: {
        status,
        paperId,
        errorMessage,
        updatedAt: new Date()
      },
      create: {
        weekStartDate: weekStartDate,
        status,
        paperId,
        errorMessage,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  } catch (error) {
    log('ERROR', 'Failed to update weekly schedule', { error, weekStartDate });
  }
}

// Start the CRON scheduler
export function startCronScheduler() {
  if (weeklyPaperJob) {
    log('WARN', '⚠️ CRON scheduler already running');
    return;
  }
  
  log('INFO', '🕐 Starting CRON scheduler', {
    schedule: CRON_CONFIG.WEEKLY_PAPER_SCHEDULE,
    timezone: CRON_CONFIG.TIMEZONE,
    nextRun: cron.validate(CRON_CONFIG.WEEKLY_PAPER_SCHEDULE) ? 'Valid schedule' : 'Invalid schedule'
  });
  
  // Schedule weekly paper generation
  try {
    weeklyPaperJob = cron.schedule(
      CRON_CONFIG.WEEKLY_PAPER_SCHEDULE,
      generateWeeklyPaper,
      {
        scheduled: true,
        timezone: CRON_CONFIG.TIMEZONE
      }
    );
    
    log('INFO', '✅ Weekly paper CRON job scheduled successfully');
    
    // Schedule the first upcoming week if not already scheduled
    scheduleUpcomingWeek();
    
  } catch (error: any) {
    log('ERROR', '❌ Failed to start CRON scheduler', { error: error.message });
    throw error;
  }
}

// Stop the CRON scheduler
export function stopCronScheduler() {
  if (weeklyPaperJob) {
    weeklyPaperJob.stop();
    weeklyPaperJob = null;
    log('INFO', '🛑 CRON scheduler stopped');
  }
}

// Schedule upcoming week manually if needed
async function scheduleUpcomingWeek() {
  try {
    const weekStartDate = getNextWeekStart();
    
    // Check if already scheduled
    const existing = await prisma.weeklySchedule.findUnique({
      where: { weekStartDate: weekStartDate }
    });
    
    if (!existing) {
      await updateWeeklySchedule(weekStartDate, null, 'SCHEDULED');
      log('INFO', '📋 Scheduled upcoming week', { weekStart: weekStartDate.toISOString() });
    }
  } catch (error) {
    log('ERROR', 'Failed to schedule upcoming week', { error });
  }
}

// Get scheduler status
export function getSchedulerStatus() {
  return {
    isRunning: weeklyPaperJob !== null,
    schedule: CRON_CONFIG.WEEKLY_PAPER_SCHEDULE,
    timezone: CRON_CONFIG.TIMEZONE,
    nextWeekStart: getNextWeekStart().toISOString()
  };
}

// Manual trigger for testing
export async function triggerWeeklyGeneration() {
  log('INFO', '🔧 Manual trigger for weekly paper generation');
  return await generateWeeklyPaper();
}

// Get recent CRON logs
export async function getCronLogs(limit: number = 50) {
  try {
    return await prisma.cronLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  } catch (error) {
    log('ERROR', 'Failed to fetch CRON logs', { error });
    return [];
  }
}

// Get weekly schedules
export async function getWeeklySchedules(limit: number = 20) {
  try {
    return await prisma.weeklySchedule.findMany({
      orderBy: { weekStartDate: 'desc' },
      take: limit
    });
  } catch (error) {
    log('ERROR', 'Failed to fetch weekly schedules', { error });
    return [];
  }
} 