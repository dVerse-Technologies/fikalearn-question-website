import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings, triggerGoogleSheetsSync, getSyncStatus } from '../../../lib/settings';

// GET - Get current settings
export async function GET() {
  try {
    console.log('⚙️ Fetching app settings...');
    
    const settings = await getSettings();
    const syncStatus = await getSyncStatus();
    
    return NextResponse.json({
      success: true,
      settings,
      syncStatus
    });
  } catch (error: any) {
    console.error('❌ Error fetching settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch settings', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  try {
    const updates = await request.json();
    console.log('⚙️ Updating app settings...', updates);
    
    const updatedSettings = await updateSettings(updates);
    
    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: updatedSettings
    });
  } catch (error: any) {
    console.error('❌ Error updating settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update settings', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// POST - Trigger actions (sync, reset, etc.)
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    console.log('⚙️ Settings action requested:', action);
    
    switch (action) {
      case 'sync_sheets':
        const syncResult = await triggerGoogleSheetsSync();
        return NextResponse.json({
          success: syncResult.success,
          message: syncResult.message,
          count: syncResult.count
        });
        
      case 'reset_settings':
        // Reset to default settings
        const defaultSettings = await updateSettings({
          autoSyncEnabled: false,
          syncIntervalHours: 24,
          defaultPaperDifficulty: 'Mixed',
          questionsPerSection: {
            sectionB: 6,
            sectionC: 7,
            sectionD: 3,
            sectionE: 3
          },
          showAnswersInPreview: false,
          enablePrintMode: true,
          darkModeEnabled: false,
          maxQuestionsPerTopic: 2,
          competencyDistribution: {
            remembering: 30,
            applying: 30,
            creating: 20,
            evaluating: 20
          }
        });
        
        return NextResponse.json({
          success: true,
          message: 'Settings reset to defaults',
          settings: defaultSettings
        });
        
      case 'test_connection':
        // Test Google Sheets connection
        try {
          const settings = await getSettings();
          const testUrl = `https://docs.google.com/spreadsheets/d/${settings.googleSheetId}/export?format=csv&output=csv`;
          const response = await fetch(testUrl);
          
          if (response.ok) {
            const csvData = await response.text();
            const lines = csvData.split('\n').length - 1;
            
            return NextResponse.json({
              success: true,
              message: `Connection successful! Found ${lines} rows in the sheet.`,
              details: {
                sheetId: settings.googleSheetId,
                rowCount: lines,
                status: response.status
              }
            });
          } else {
            return NextResponse.json({
              success: false,
              message: `Failed to connect to Google Sheets (Status: ${response.status})`,
              details: {
                sheetId: settings.googleSheetId,
                status: response.status,
                statusText: response.statusText
              }
            });
          }
        } catch (error: any) {
          return NextResponse.json({
            success: false,
            message: 'Connection test failed: ' + error.message
          });
        }
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('❌ Error processing settings action:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process action', 
        details: error.message 
      },
      { status: 500 }
    );
  }
} 