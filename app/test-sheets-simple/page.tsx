'use client'

import { useState } from 'react'

export default function TestSheetsSimplePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testCsvAccess = async () => {
    setLoading(true)
    setError(null)

    try {
      // Use server-side CSV access (avoids CORS issues)
      console.log('Testing server-side CSV access...')
      
      const response = await fetch('/api/sheets/sync-csv', {
        method: 'GET' // This will analyze the sheet structure
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to access sheet')
      }

      // Format the response to show CSV-like data
      const sheetAnalysis = result.sheetAnalysis
      
      setData({
        method: 'Server-side CSV Export',
        success: true,
        totalRows: sheetAnalysis.totalRows,
        totalColumns: sheetAnalysis.totalColumns,
        headers: sheetAnalysis.headers,
        sampleData: sheetAnalysis.sampleData,
        suggestedMapping: sheetAnalysis.suggestedMapping,
        currentDatabase: result.currentDatabase
      })
      
    } catch (err) {
      console.error('CSV test error:', err)
      setError(`CSV Access Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const runDiagnostics = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('Running diagnostic tests...')
      
      const response = await fetch('/api/test-direct-sheets', {
        method: 'GET'
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        setError(`Diagnostic Error (${response.status}): ${result.error || 'Unknown error'}`)
        setData(result) // Show error details
      } else {
        setData(result)
      }
      
    } catch (err) {
      setError(`Diagnostic Exception: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testAlternativeMethods = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('Testing alternative access methods...')
      
      const response = await fetch('/api/test-alternative-sheets', {
        method: 'GET'
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        setError(`Alternative Methods Error (${response.status}): ${result.error || 'Unknown error'}`)
      } else {
        if (result.success) {
          setData(result)
        } else {
          setError('All alternative access methods failed')
          setData(result) // Show detailed results and recommendations
        }
      }
      
    } catch (err) {
      setError(`Alternative Methods Exception: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // JSON access is not needed anymore - we use server-side CSV access

  const testDirectAccess = async () => {
    setLoading(true)
    setError(null)

    try {
      // Test direct Google Sheets URL
      const sheetId = '1PfL4o_RBqm8itgwlGuZuIV6J5SyGWj6G'
      const directUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=0`
      
      console.log('Testing direct access:', directUrl)
      
      // This won't work due to CORS, but let's try
      const response = await fetch(directUrl)
      const text = await response.text()
      
      setData({
        method: 'Direct Access',
        response: text.substring(0, 500) + '...',
        status: response.status
      })
      
    } catch (err) {
      console.error('Direct access error:', err)
      setError(`Direct Access Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const analyzeSheetStructure = async () => {
    setLoading(true)
    setError(null)

    try {
      // Analyze sheet structure without syncing
      const response = await fetch('/api/sheets/sync-csv', {
        method: 'GET'
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze sheet')
      }

      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const syncToDatabase = async () => {
    setLoading(true)
    setError(null)

    try {
      // Use CSV-based sync (no API key needed)
      const response = await fetch('/api/sheets/sync-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to sync data')
      }

      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Simple Google Sheets Test</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Methods</h2>
        
        <div className="flex gap-4 mb-4 flex-wrap">
          <button
            onClick={testCsvAccess}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test CSV Export'}
          </button>
          
          <button
            onClick={testDirectAccess}
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Direct Access'}
          </button>

          <button
            onClick={analyzeSheetStructure}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Analyze Sheet Structure'}
          </button>
          
          <button
            onClick={syncToDatabase}
            disabled={loading}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Syncing...' : 'Sync to Database'}
          </button>

          <button
            onClick={runDiagnostics}
            disabled={loading}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? 'Diagnosing...' : 'Run Diagnostics'}
          </button>

          <button
            onClick={testAlternativeMethods}
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Try Alternative Methods'}
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Sheet Information:</h3>
          <p className="text-blue-700">
            <strong>Sheet ID:</strong> 1PfL4o_RBqm8itgwlGuZuIV6J5SyGWj6G
          </p>
          <p className="text-blue-700">
            <strong>Direct Link:</strong> 
            <a 
              href="https://docs.google.com/spreadsheets/d/1PfL4o_RBqm8itgwlGuZuIV6J5SyGWj6G/edit" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 underline ml-2"
            >
              Open in Google Sheets
            </a>
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error Details:</strong>
          <pre className="mt-2 text-sm whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      {data && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 bg-orange-50 border border-orange-200 p-4 rounded-lg">
        <h3 className="font-semibold text-orange-800 mb-2">🔧 Comprehensive Google Sheets Testing</h3>
        <p className="text-orange-700 mb-2">
          Let's test multiple ways to access your Google Sheet and find what works.
        </p>
        <ol className="list-decimal list-inside text-orange-700 space-y-1">
          <li><strong>First try "Run Diagnostics"</strong> - Basic diagnostic test</li>
          <li><strong>Then try "Try Alternative Methods"</strong> - Tests 4 different access methods</li>
          <li><strong>Check recommendations</strong> - Get specific fix instructions</li>
          <li><strong>Apply fixes</strong> - Update your sheet sharing settings</li>
        </ol>
      </div>

      <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-2">What Each Button Does:</h3>
        <ul className="list-disc list-inside text-green-700 space-y-1">
          <li><strong>Test CSV Export:</strong> Server-side analysis (currently failing)</li>
          <li><strong>Test Direct Access:</strong> Basic browser connectivity test</li>
          <li><strong>Analyze Sheet Structure:</strong> Same as CSV Export (also failing)</li>
          <li><strong>Sync to Database:</strong> Full import (won't work until access is fixed)</li>
          <li><strong>🔧 Run Diagnostics:</strong> Single method detailed debugging</li>
          <li><strong>🔄 Try Alternative Methods:</strong> <em>New!</em> Tests 4 different access approaches + gives recommendations</li>
        </ul>
      </div>
    </div>
  )
} 