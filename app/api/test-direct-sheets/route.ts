import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const sheetId = '1PfL4o_RBqm8itgwlGuZuIV6J5SyGWj6G'
  
  console.log('🧪 Testing Google Sheets access...')
  console.log('Sheet ID:', sheetId)
  
  try {
    // Test 1: Basic CSV URL construction
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`
    console.log('CSV URL:', csvUrl)
    
    // Test 2: Try to fetch the CSV
    console.log('Attempting to fetch CSV...')
    const response = await fetch(csvUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('Error response body:', errorText)
      
      return NextResponse.json({
        error: 'Failed to fetch CSV',
        status: response.status,
        statusText: response.statusText,
        responseBody: errorText.substring(0, 500),
        url: csvUrl
      }, { status: 400 })
    }
    
    // Test 3: Read the response
    const csvText = await response.text()
    console.log('CSV text length:', csvText.length)
    console.log('First 200 characters:', csvText.substring(0, 200))
    
    // Test 4: Basic parsing
    const lines = csvText.split('\n').slice(0, 5) // First 5 lines
    const parsedLines = lines.map(line => line.split(',').slice(0, 5)) // First 5 columns
    
    return NextResponse.json({
      success: true,
      message: 'Successfully accessed Google Sheet',
      details: {
        url: csvUrl,
        status: response.status,
        textLength: csvText.length,
        firstLines: parsedLines,
        headers: parsedLines[0] || []
      }
    })
    
  } catch (error) {
    console.error('❌ Error accessing Google Sheets:', error)
    
    return NextResponse.json({
      error: 'Exception while accessing Google Sheets',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined,
        name: error instanceof Error ? error.name : 'Unknown',
        sheetId,
        url: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`
      }
    }, { status: 500 })
  }
}

// Also test if the sheet is accessible via direct link
export async function POST(request: NextRequest) {
  const sheetId = '1PfL4o_RBqm8itgwlGuZuIV6J5SyGWj6G'
  
  try {
    // Test the main sheet URL
    const directUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`
    console.log('Testing direct URL:', directUrl)
    
    const response = await fetch(directUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    const text = await response.text()
    
    return NextResponse.json({
      method: 'Direct URL Test',
      status: response.status,
      hasContent: text.length > 0,
      isHtml: text.includes('<html'),
      hasSheetData: text.includes('spreadsheet'),
      title: text.match(/<title>(.*?)<\/title>/)?.[1] || 'No title found',
      firstChars: text.substring(0, 200)
    })
    
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to test direct URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 