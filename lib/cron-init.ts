import { startCronScheduler } from './cron-scheduler';

// Flag to ensure CRON is initialized only once
let cronInitialized = false;

/**
 * Initialize CRON scheduler on app startup
 * Should be called once when the app starts
 */
export function initializeCronScheduler() {
  // Only initialize in production or when explicitly enabled
  const shouldInit = process.env.NODE_ENV === 'production' || 
                     process.env.ENABLE_CRON === 'true';
  
  if (!shouldInit) {
    console.log('🕐 CRON scheduler disabled in development mode');
    console.log('💡 To enable, set ENABLE_CRON=true in your environment');
    return;
  }

  if (cronInitialized) {
    console.log('⚠️ CRON scheduler already initialized');
    return;
  }

  try {
    console.log('🚀 Initializing CRON scheduler on app startup...');
    startCronScheduler();
    cronInitialized = true;
    console.log('✅ CRON scheduler initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize CRON scheduler:', error);
  }
}

/**
 * Check if CRON scheduler is initialized
 */
export function isCronInitialized(): boolean {
  return cronInitialized;
} 