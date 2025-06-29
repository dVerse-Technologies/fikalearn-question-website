import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const sheetId = '1PfL4o_RBqm8itgwlGuZuIV6J5SyGWj6G'
  
  console.log('🧪 Testing alternative Google Sheets access methods...')
  
  const results: any[] = []
  
  // Method 1: Standard CSV export
  try {
    const url1 = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`
    console.log('Testing Method 1:', url1)
    
    const response1 = await fetch(url1, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    const result1: any = {
      method: 'Standard CSV Export',
      url: url1,
      status: response1.status,
      statusText: response1.statusText,
      headers: Object.fromEntries(response1.headers.entries())
    }
    
    if (response1.ok) {
      const text = await response1.text()
      result1.success = true
      result1.textLength = text.length
      result1.firstChars = text.substring(0, 200)
    } else {
      const errorText = await response1.text()
      result1.success = false
      result1.errorBody = errorText.substring(0, 500)
    }
    
    results.push(result1)
  } catch (error) {
    results.push({
      method: 'Standard CSV Export',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  // Method 2: Alternative CSV format
  try {
    const url2 = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&output=csv`
    console.log('Testing Method 2:', url2)
    
    const response2 = await fetch(url2)
    
    const result2: any = {
      method: 'Alternative CSV Format',
      url: url2,
      status: response2.status,
      success: response2.ok
    }
    
    if (response2.ok) {
      const text = await response2.text()
      result2.textLength = text.length
      result2.firstChars = text.substring(0, 200)
    } else {
      const errorText = await response2.text()
      result2.errorBody = errorText.substring(0, 500)
    }
    
    results.push(result2)
  } catch (error) {
    results.push({
      method: 'Alternative CSV Format',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  // Method 3: Published web version
  try {
    const url3 = `https://docs.google.com/spreadsheets/d/e/${sheetId}/pub?output=csv`
    console.log('Testing Method 3:', url3)
    
    const response3 = await fetch(url3)
    
    const result3: any = {
      method: 'Published Web Version',
      url: url3,
      status: response3.status,
      success: response3.ok
    }
    
    if (response3.ok) {
      const text = await response3.text()
      result3.textLength = text.length
      result3.firstChars = text.substring(0, 200)
    } else {
      const errorText = await response3.text()
      result3.errorBody = errorText.substring(0, 500)
    }
    
    results.push(result3)
  } catch (error) {
    results.push({
      method: 'Published Web Version',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  // Method 4: Try with different sheet tab (first sheet might not be gid=0)
  try {
    const url4 = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=1`
    console.log('Testing Method 4:', url4)
    
    const response4 = await fetch(url4)
    
    const result4: any = {
      method: 'Different Sheet Tab (gid=1)',
      url: url4,
      status: response4.status,
      success: response4.ok
    }
    
    if (response4.ok) {
      const text = await response4.text()
      result4.textLength = text.length
      result4.firstChars = text.substring(0, 200)
    } else {
      const errorText = await response4.text()
      result4.errorBody = errorText.substring(0, 500)
    }
    
    results.push(result4)
  } catch (error) {
    results.push({
      method: 'Different Sheet Tab (gid=1)',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  // Check if any method succeeded
  const successfulMethods = results.filter(r => r.success)
  
  return NextResponse.json({
    success: successfulMethods.length > 0,
    message: successfulMethods.length > 0 
      ? `Found ${successfulMethods.length} working access method(s)`
      : 'All access methods failed',
    results,
    successfulMethods,
    recommendations: generateRecommendations(results)
  })
}

function generateRecommendations(results: any[]): string[] {
  const recommendations: string[] = []
  
  const allFailed = results.every(r => !r.success)
  const has403 = results.some(r => r.status === 403)
  const has404 = results.some(r => r.status === 404)
  const has401 = results.some(r => r.status === 401)
  
  if (allFailed) {
    if (has403) {
      recommendations.push('❌ 403 Forbidden: Your sheet is not publicly accessible')
      recommendations.push('✅ Fix: Open your sheet → Share → Change to "Anyone with the link" → Viewer')
    }
    
    if (has404) {
      recommendations.push('❌ 404 Not Found: Sheet ID might be incorrect or sheet was deleted')
      recommendations.push('✅ Fix: Verify the sheet URL and ID are correct')
    }
    
    if (has401) {
      recommendations.push('❌ 401 Unauthorized: Sheet requires authentication')
      recommendations.push('✅ Fix: Publish the sheet to the web or make it publicly viewable')
    }
    
    recommendations.push('📋 General: Try going to File → Share → Publish to the web in your Google Sheet')
  }
  
  return recommendations
} 