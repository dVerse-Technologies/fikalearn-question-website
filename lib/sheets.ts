interface GoogleSheetsResponse {
  values: string[][];
}

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
 * Fetch data from Google Sheets using the API
 * @param sheetId - The Google Sheet ID
 * @param range - The range to fetch (e.g., 'Sheet1!A1:Z100')
 * @param apiKey - Google Sheets API key
 * @returns Promise of sheet data
 */
export async function fetchGoogleSheetData(
  sheetId: string,
  range: string = 'Sheet1',
  apiKey: string
): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`);
    }
    
    const data: GoogleSheetsResponse = await response.json();
    return data.values || [];
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    throw error;
  }
}

/**
 * Parse Google Sheets data into structured question format
 * Expected columns: Question, Section, Marks, Competency, Subject, Topic, Difficulty
 */
export function parseQuestionsFromSheetData(sheetData: string[][]): QuestionData[] {
  if (sheetData.length === 0) {
    return [];
  }

  // Skip header row and parse data
  const questions: QuestionData[] = [];
  
  for (let i = 1; i < sheetData.length; i++) {
    const row = sheetData[i];
    
    if (row.length < 4) {
      continue; // Skip incomplete rows
    }

    const questionData: QuestionData = {
      question: row[0]?.trim() || '',
      section: row[1]?.trim().toUpperCase() || '',
      marks: parseInt(row[2]) || 0,
      competency: row[3]?.trim() || 'General',
      subject: row[4]?.trim() || undefined,
      topic: row[5]?.trim() || undefined,
      difficulty: row[6]?.trim() || undefined,
    };

    // Validate essential fields
    if (questionData.question && questionData.section && questionData.marks > 0) {
      questions.push(questionData);
    }
  }

  return questions;
}

/**
 * Validate if competency is one of the expected values
 */
export function normalizeCompetency(competency: string): string {
  const competencyMap: { [key: string]: string } = {
    'remembering': 'Remembering',
    'applying': 'Applying',
    'creating': 'Creating',
    'evaluating': 'Evaluating',
    'general': 'General',
  };

  const normalized = competency.toLowerCase();
  return competencyMap[normalized] || 'General';
}

/**
 * Validate if section matches expected CBSE format
 */
export function validateSection(section: string): boolean {
  const validSections = ['B', 'C', 'D', 'E'];
  return validSections.includes(section.toUpperCase());
}

/**
 * Validate if marks match section requirements
 */
export function validateMarksForSection(section: string, marks: number): boolean {
  const sectionMarks: { [key: string]: number } = {
    'B': 2,
    'C': 3,
    'D': 5,
    'E': 4,
  };

  return sectionMarks[section.toUpperCase()] === marks;
}

/**
 * Get paper blueprint structure
 */
export function getPaperBlueprint() {
  return {
    'B': { questions: 6, marks: 2, total: 12 },
    'C': { questions: 7, marks: 3, total: 21 },
    'D': { questions: 3, marks: 5, total: 15 },
    'E': { questions: 3, marks: 4, total: 12 },
  };
} 