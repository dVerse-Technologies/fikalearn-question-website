'use client'

import { useState } from 'react'

export default function TestSheetsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState('')

  const testSheetAccess = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your Google Sheets API key')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Test direct access to your sheet
      const sheetId = '1PfL4o_RBqm8itgwlGuZuIV6J5SyGWj6G'
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`
      
      const response = await fetch(url)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch sheet data')
      }

      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const syncToDatabase = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your Google Sheets API key first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Add API key to environment temporarily for testing
      const response = await fetch('/api/sheets/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey, // Pass API key in header for testing
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
      <h1 className="text-3xl font-bold mb-8">Google Sheets Test Page</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Google Sheets API Key:
          </label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Google Sheets API key"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={testSheetAccess}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Sheet Access'}
          </button>
          
          <button
            onClick={syncToDatabase}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Syncing...' : 'Sync to Database'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {data && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Sheet Data</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside text-yellow-700 space-y-1">
          <li>Get your Google Sheets API key from Google Cloud Console</li>
          <li>Make sure your Google Sheet is public (shareable link)</li>
          <li>Enter the API key above and click "Test Sheet Access"</li>
          <li>If successful, click "Sync to Database" to import the questions</li>
        </ol>
      </div>
    </div>
  )
} 