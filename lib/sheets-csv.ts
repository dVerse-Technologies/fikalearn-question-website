interface QuestionData {
  question: string;
  section: string;
  marks: number;
  competency: string;
  subject?: string;
  topic?: string;
  difficulty?: string;
}

/**
 * Fetch Google Sheet data as CSV (works with public sheets without API key)
 * @param sheetId - The Google Sheet ID
 * @param gid - The sheet tab ID (default: 0 for first sheet)
 * @returns Promise of CSV text
 */
export async function fetchGoogleSheetAsCSV(sheetId: string, gid: number = 0): Promise<string> {
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  
  try {
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }
    
    const csvText = await response.text();
    return csvText;
  } catch (error) {
    console.error('Error fetching Google Sheets CSV:', error);
    throw error;
  }
}

/**
 * Parse CSV text into structured data
 * @param csvText - Raw CSV text
 * @returns Array of rows (each row is an array of cell values)
 */
export function parseCSV(csvText: string): string[][] {
  const lines = csvText.split('\n');
  const result: string[][] = [];
  
  for (const line of lines) {
    if (line.trim() === '') continue; // Skip empty lines
    
    // Simple CSV parsing (handles basic cases)
    const row = line.split(',').map(cell => {
      // Remove quotes and trim whitespace
      return cell.replace(/^"(.*)"$/, '$1').trim();
    });
    
    result.push(row);
  }
  
  return result;
}

/**
 * Advanced CSV parsing that handles quoted fields with commas
 */
export function parseCSVAdvanced(csvText: string): string[][] {
  const result: string[][] = [];
  const lines = csvText.split('\n');
  
  for (const line of lines) {
    if (line.trim() === '') continue;
    
    const row: string[] = [];
    let currentField = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
      
      i++;
    }
    
    // Add the last field
    row.push(currentField.trim());
    result.push(row);
  }
  
  return result;
}

/**
 * Parse questions from CSV data
 * Expected columns: Question, Section, Marks, Competency, Subject, Topic, Difficulty
 */
export function parseQuestionsFromCSV(csvData: string[][]): QuestionData[] {
  if (csvData.length === 0) {
    return [];
  }

  const questions: QuestionData[] = [];
  
  // Skip header row (first row)
  for (let i = 1; i < csvData.length; i++) {
    const row = csvData[i];
    
    // Skip rows with insufficient data
    if (row.length < 4) {
      console.warn(`Skipping row ${i}: insufficient columns`);
      continue;
    }

    const questionData: QuestionData = {
      question: row[0]?.trim() || '',
      section: row[1]?.trim().toUpperCase() || '',
      marks: parseInt(row[2]?.trim()) || 0,
      competency: normalizeCompetency(row[3]?.trim() || 'General'),
      subject: row[4]?.trim() || undefined,
      topic: row[5]?.trim() || undefined,
      difficulty: row[6]?.trim() || undefined,
    };

    // Validate essential fields
    if (questionData.question && 
        validateSection(questionData.section) && 
        questionData.marks > 0) {
      questions.push(questionData);
    } else {
      console.warn(`Skipping row ${i}: validation failed`, {
        hasQuestion: !!questionData.question,
        section: questionData.section,
        marks: questionData.marks
      });
    }
  }

  return questions;
}

/**
 * Normalize competency names to standard format
 */
export function normalizeCompetency(competency: string): string {
  if (!competency) return 'General';
  
  const normalized = competency.toLowerCase().trim();
  
  const competencyMap: { [key: string]: string } = {
    'remember': 'Remembering',
    'remembering': 'Remembering',
    'recall': 'Remembering',
    
    'apply': 'Applying',
    'applying': 'Applying',
    'application': 'Applying',
    
    'create': 'Creating',
    'creating': 'Creating',
    'synthesis': 'Creating',
    'synthesize': 'Creating',
    
    'evaluate': 'Evaluating',
    'evaluating': 'Evaluating',
    'evaluation': 'Evaluating',
    'analyze': 'Evaluating',
    'analyzing': 'Evaluating',
    'analysis': 'Evaluating',
    
    'understand': 'General',
    'understanding': 'General',
    'comprehension': 'General',
    'general': 'General',
  };

  return competencyMap[normalized] || 'General';
}

/**
 * Validate if section matches CBSE format
 */
export function validateSection(section: string): boolean {
  const validSections = ['B', 'C', 'D', 'E'];
  return validSections.includes(section.toUpperCase());
}

/**
 * Auto-detect sheet structure and suggest column mapping
 */
export function analyzeSheetStructure(csvData: string[][]): {
  totalRows: number;
  totalColumns: number;
  headers: string[];
  sampleData: string[][];
  suggestedMapping: { [key: string]: number };
} {
  if (csvData.length === 0) {
    return {
      totalRows: 0,
      totalColumns: 0,
      headers: [],
      sampleData: [],
      suggestedMapping: {}
    };
  }

  const headers = csvData[0];
  const sampleData = csvData.slice(1, 6); // First 5 data rows
  
  // Try to detect column purposes based on headers
  const suggestedMapping: { [key: string]: number } = {};
  
  headers.forEach((header, index) => {
    const lowerHeader = header.toLowerCase();
    
    if (lowerHeader.includes('question') || lowerHeader.includes('problem')) {
      suggestedMapping['question'] = index;
    } else if (lowerHeader.includes('section') || lowerHeader.includes('part')) {
      suggestedMapping['section'] = index;
    } else if (lowerHeader.includes('mark') || lowerHeader.includes('point')) {
      suggestedMapping['marks'] = index;
    } else if (lowerHeader.includes('competency') || lowerHeader.includes('skill') || lowerHeader.includes('hots')) {
      suggestedMapping['competency'] = index;
    } else if (lowerHeader.includes('subject') || lowerHeader.includes('course')) {
      suggestedMapping['subject'] = index;
    } else if (lowerHeader.includes('topic') || lowerHeader.includes('chapter')) {
      suggestedMapping['topic'] = index;
    } else if (lowerHeader.includes('difficulty') || lowerHeader.includes('level')) {
      suggestedMapping['difficulty'] = index;
    }
  });

  return {
    totalRows: csvData.length,
    totalColumns: headers.length,
    headers,
    sampleData,
    suggestedMapping
  };
} 