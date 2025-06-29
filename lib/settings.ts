import { prisma } from './prisma';

// Settings interface
export interface AppSettings {
  id?: string;
  // Google Sheets Configuration
  googleSheetId: string;
  googleSheetsApiKey?: string;
  lastSyncDate?: Date;
  autoSyncEnabled: boolean;
  syncIntervalHours: number;
  
  // Paper Generation Settings
  defaultPaperDifficulty: 'Easy' | 'Medium' | 'Hard' | 'Mixed';
  questionsPerSection: {
    sectionB: number; // 2 marks each
    sectionC: number; // 3 marks each  
    sectionD: number; // 5 marks each
    sectionE: number; // 4 marks each
  };
  
  // UI/UX Settings
  defaultSubject: 'Biology' | 'Chemistry' | 'Physics' | 'All';
  showAnswersInPreview: boolean;
  enablePrintMode: boolean;
  darkModeEnabled: boolean;
  
  // Notification Settings
  emailNotifications: boolean;
  weeklyPaperReminders: boolean;
  syncFailureAlerts: boolean;
  
  // Advanced Settings
  maxQuestionsPerTopic: number;
  competencyDistribution: {
    remembering: number; // percentage
    applying: number;
    creating: number;
    evaluating: number;
  };
  
  // System Settings
  appName: string;
  schoolName?: string;
  academicYear: string;
  timezone: string;
  
  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
}

// Default settings
export const DEFAULT_SETTINGS: AppSettings = {
  // Google Sheets
  googleSheetId: '1PfL4o_RBqm8itgwlGuZuIV6J5SyGWj6G',
  autoSyncEnabled: false,
  syncIntervalHours: 24,
  
  // Paper Generation
  defaultPaperDifficulty: 'Mixed',
  questionsPerSection: {
    sectionB: 6,  // 12 marks
    sectionC: 7,  // 21 marks  
    sectionD: 3,  // 15 marks
    sectionE: 3   // 12 marks (Total: 60 marks)
  },
  
  // UI/UX
  defaultSubject: 'All',
  showAnswersInPreview: false,
  enablePrintMode: true,
  darkModeEnabled: false,
  
  // Notifications
  emailNotifications: false,
  weeklyPaperReminders: true,
  syncFailureAlerts: true,
  
  // Advanced
  maxQuestionsPerTopic: 2,
  competencyDistribution: {
    remembering: 30,
    applying: 30,
    creating: 20,
    evaluating: 20
  },
  
  // System
  appName: 'FikaLearn Question Bank',
  academicYear: '2024-25',
  timezone: 'Asia/Kolkata'
};

// Get current settings
export async function getSettings(): Promise<AppSettings> {
  try {
    const settings = await prisma.appSettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    });
    
    if (!settings) {
      // Create default settings if none exist
      return await createDefaultSettings();
    }
    
    return {
      id: settings.id,
      googleSheetId: settings.googleSheetId,
      googleSheetsApiKey: settings.googleSheetsApiKey || undefined,
      lastSyncDate: settings.lastSyncDate || undefined,
      autoSyncEnabled: settings.autoSyncEnabled,
      syncIntervalHours: settings.syncIntervalHours,
      defaultPaperDifficulty: settings.defaultPaperDifficulty as any,
      questionsPerSection: JSON.parse(settings.questionsPerSection),
      defaultSubject: settings.defaultSubject as any,
      showAnswersInPreview: settings.showAnswersInPreview,
      enablePrintMode: settings.enablePrintMode,
      darkModeEnabled: settings.darkModeEnabled,
      emailNotifications: settings.emailNotifications,
      weeklyPaperReminders: settings.weeklyPaperReminders,
      syncFailureAlerts: settings.syncFailureAlerts,
      maxQuestionsPerTopic: settings.maxQuestionsPerTopic,
      competencyDistribution: JSON.parse(settings.competencyDistribution),
      appName: settings.appName,
      schoolName: settings.schoolName || undefined,
      academicYear: settings.academicYear,
      timezone: settings.timezone,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt
    };
  } catch (error) {
    console.error('Failed to get settings:', error);
    return DEFAULT_SETTINGS;
  }
}

// Update settings
export async function updateSettings(newSettings: Partial<AppSettings>): Promise<AppSettings> {
  try {
    const currentSettings = await getSettings();
    
    const updatedSettings = {
      ...currentSettings,
      ...newSettings,
      updatedAt: new Date()
    };
    
    const result = await prisma.appSettings.upsert({
      where: { id: currentSettings.id || 'default' },
      update: {
        googleSheetId: updatedSettings.googleSheetId,
        googleSheetsApiKey: updatedSettings.googleSheetsApiKey,
        lastSyncDate: updatedSettings.lastSyncDate,
        autoSyncEnabled: updatedSettings.autoSyncEnabled,
        syncIntervalHours: updatedSettings.syncIntervalHours,
        defaultPaperDifficulty: updatedSettings.defaultPaperDifficulty,
        questionsPerSection: JSON.stringify(updatedSettings.questionsPerSection),
        defaultSubject: updatedSettings.defaultSubject,
        showAnswersInPreview: updatedSettings.showAnswersInPreview,
        enablePrintMode: updatedSettings.enablePrintMode,
        darkModeEnabled: updatedSettings.darkModeEnabled,
        emailNotifications: updatedSettings.emailNotifications,
        weeklyPaperReminders: updatedSettings.weeklyPaperReminders,
        syncFailureAlerts: updatedSettings.syncFailureAlerts,
        maxQuestionsPerTopic: updatedSettings.maxQuestionsPerTopic,
        competencyDistribution: JSON.stringify(updatedSettings.competencyDistribution),
        appName: updatedSettings.appName,
        schoolName: updatedSettings.schoolName,
        academicYear: updatedSettings.academicYear,
        timezone: updatedSettings.timezone,
        updatedAt: new Date()
      },
      create: {
        id: 'default',
        googleSheetId: updatedSettings.googleSheetId,
        googleSheetsApiKey: updatedSettings.googleSheetsApiKey,
        lastSyncDate: updatedSettings.lastSyncDate,
        autoSyncEnabled: updatedSettings.autoSyncEnabled,
        syncIntervalHours: updatedSettings.syncIntervalHours,
        defaultPaperDifficulty: updatedSettings.defaultPaperDifficulty,
        questionsPerSection: JSON.stringify(updatedSettings.questionsPerSection),
        defaultSubject: updatedSettings.defaultSubject,
        showAnswersInPreview: updatedSettings.showAnswersInPreview,
        enablePrintMode: updatedSettings.enablePrintMode,
        darkModeEnabled: updatedSettings.darkModeEnabled,
        emailNotifications: updatedSettings.emailNotifications,
        weeklyPaperReminders: updatedSettings.weeklyPaperReminders,
        syncFailureAlerts: updatedSettings.syncFailureAlerts,
        maxQuestionsPerTopic: updatedSettings.maxQuestionsPerTopic,
        competencyDistribution: JSON.stringify(updatedSettings.competencyDistribution),
        appName: updatedSettings.appName,
        schoolName: updatedSettings.schoolName,
        academicYear: updatedSettings.academicYear,
        timezone: updatedSettings.timezone,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    return updatedSettings;
  } catch (error) {
    console.error('Failed to update settings:', error);
    throw error;
  }
}

// Create default settings
async function createDefaultSettings(): Promise<AppSettings> {
  try {
    const settings = await prisma.appSettings.create({
      data: {
        id: 'default',
        googleSheetId: DEFAULT_SETTINGS.googleSheetId,
        autoSyncEnabled: DEFAULT_SETTINGS.autoSyncEnabled,
        syncIntervalHours: DEFAULT_SETTINGS.syncIntervalHours,
        defaultPaperDifficulty: DEFAULT_SETTINGS.defaultPaperDifficulty,
        questionsPerSection: JSON.stringify(DEFAULT_SETTINGS.questionsPerSection),
        defaultSubject: DEFAULT_SETTINGS.defaultSubject,
        showAnswersInPreview: DEFAULT_SETTINGS.showAnswersInPreview,
        enablePrintMode: DEFAULT_SETTINGS.enablePrintMode,
        darkModeEnabled: DEFAULT_SETTINGS.darkModeEnabled,
        emailNotifications: DEFAULT_SETTINGS.emailNotifications,
        weeklyPaperReminders: DEFAULT_SETTINGS.weeklyPaperReminders,
        syncFailureAlerts: DEFAULT_SETTINGS.syncFailureAlerts,
        maxQuestionsPerTopic: DEFAULT_SETTINGS.maxQuestionsPerTopic,
        competencyDistribution: JSON.stringify(DEFAULT_SETTINGS.competencyDistribution),
        appName: DEFAULT_SETTINGS.appName,
        academicYear: DEFAULT_SETTINGS.academicYear,
        timezone: DEFAULT_SETTINGS.timezone,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    return {
      ...DEFAULT_SETTINGS,
      id: settings.id,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt
    };
  } catch (error) {
    console.error('Failed to create default settings:', error);
    return DEFAULT_SETTINGS;
  }
}

// Trigger Google Sheets sync
export async function triggerGoogleSheetsSync(): Promise<{ success: boolean; message: string; count?: number }> {
  try {
    const settings = await getSettings();
    
    // Call the existing sheets sync API
    const response = await fetch('/api/sheets/sync-working', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        googleSheetId: settings.googleSheetId,
        forceRefresh: true 
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Update last sync date
      await updateSettings({ 
        lastSyncDate: new Date() 
      });
      
      return {
        success: true,
        message: `Successfully synced ${result.imported || 0} questions from Google Sheets`,
        count: result.imported
      };
    } else {
      return {
        success: false,
        message: result.error || 'Failed to sync with Google Sheets'
      };
    }
  } catch (error: any) {
    console.error('Google Sheets sync failed:', error);
    return {
      success: false,
      message: error.message || 'Sync failed due to technical error'
    };
  }
}

// Get sync status
export async function getSyncStatus(): Promise<{
  lastSync: Date | null;
  isOverdue: boolean;
  nextScheduledSync: Date | null;
  totalQuestions: number;
}> {
  try {
    const settings = await getSettings();
    const totalQuestions = await prisma.question.count();
    
    const lastSync = settings.lastSyncDate || null;
    const nextScheduledSync = lastSync 
      ? new Date(lastSync.getTime() + (settings.syncIntervalHours * 60 * 60 * 1000))
      : null;
    
    const isOverdue = nextScheduledSync ? new Date() > nextScheduledSync : true;
    
    return {
      lastSync,
      isOverdue,
      nextScheduledSync,
      totalQuestions
    };
  } catch (error) {
    console.error('Failed to get sync status:', error);
    return {
      lastSync: null,
      isOverdue: true,
      nextScheduledSync: null,
      totalQuestions: 0
    };
  }
} 