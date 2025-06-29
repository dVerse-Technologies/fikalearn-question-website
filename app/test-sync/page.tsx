'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TestSyncPage() {
  const [syncResult, setSyncResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<any>(null);

  const handleSync = async () => {
    console.log('🔄 Starting sync process...');
    setLoading(true);
    setSyncResult(null);
    
    try {
      console.log('📡 Making API request to /api/sheets/sync-working');
      const response = await fetch('/api/sheets/sync-working', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📊 Response data:', data);
      setSyncResult(data);
    } catch (error) {
      console.error('❌ Error during sync:', error);
      setSyncResult({
        success: false,
        message: 'Network error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkDatabase = async () => {
    try {
      const response = await fetch('/api/sheets/sync-working', {
        method: 'GET',
      });
      
      const data = await response.json();
      setDbStatus(data);
    } catch (error) {
      setDbStatus({
        success: false,
        message: 'Failed to check database status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            🔄 Google Sheets Sync Test
          </h1>
          
          {/* Sync Button */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Sync Your Question Database</h2>
            <p className="text-gray-600 mb-4">
              This will fetch questions from your Google Sheet and store them in the database.
            </p>
            
            <div className="flex gap-4">
              <button
                onClick={() => {
                  console.log('🖱️ Sync button clicked!');
                  handleSync();
                }}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {loading ? '⏳ Syncing...' : '🔄 Start Sync'}
              </button>
              
              <button
                onClick={checkDatabase}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                📊 Check Database
              </button>
            </div>
          </div>

          {/* Database Status */}
          {dbStatus && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">📊 Database Status</h3>
              {dbStatus.success ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800">Total Questions: {dbStatus.status.totalQuestions}</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">By Section:</h4>
                      <ul className="text-sm text-blue-700">
                        {Object.entries(dbStatus.status.bySection).map(([section, count]) => (
                          <li key={section}>Section {section}: {count as number} questions</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-medium text-purple-800 mb-2">By Competency:</h4>
                      <ul className="text-sm text-purple-700">
                        {Object.entries(dbStatus.status.byCompetency).map(([competency, count]) => (
                          <li key={competency}>{competency}: {count as number} questions</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{dbStatus.message}</p>
                  {dbStatus.error && (
                    <p className="text-red-600 text-sm mt-2">Error: {dbStatus.error}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Sync Results */}
          {syncResult && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">
                {syncResult.success ? '✅ Sync Results' : '❌ Sync Failed'}
              </h3>
              
              {syncResult.success ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium">{syncResult.message}</p>
                  </div>
                  
                  {syncResult.analysis && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-800 mb-2">Analysis:</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>Total Questions: {syncResult.analysis.totalQuestions}</li>
                          <li>Inserted: {syncResult.analysis.insertedQuestions}</li>
                        </ul>
                      </div>
                      
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-medium text-purple-800 mb-2">By Subject:</h4>
                        <ul className="text-sm text-purple-700">
                          {Object.entries(syncResult.analysis.bySubject).slice(0, 5).map(([subject, count]) => (
                            <li key={subject}>{subject}: {count as number}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {syncResult.analysis?.sampleQuestions && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">Sample Questions:</h4>
                      <div className="space-y-2">
                        {syncResult.analysis.sampleQuestions.map((q: any, index: number) => (
                          <div key={index} className="text-sm bg-white p-2 rounded border">
                            <p className="font-medium">Section {q.section} ({q.marks} marks) - {q.competency}</p>
                            <p className="text-gray-600">{q.question}</p>
                            <p className="text-xs text-gray-500">{q.subject}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {syncResult.errors && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-2">Errors:</h4>
                      <ul className="text-sm text-yellow-700">
                        {syncResult.errors.map((error: string, index: number) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{syncResult.message}</p>
                  {syncResult.error && (
                    <p className="text-red-600 text-sm mt-2">Error: {syncResult.error}</p>
                  )}
                  {syncResult.csvPreview && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-red-700 font-medium">CSV Preview</summary>
                      <pre className="text-xs bg-gray-100 p-2 mt-2 overflow-auto max-h-40">
                        {syncResult.csvPreview}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 