interface QuestionData {
  question: string;
  section: string;
  marks: number;
  competency: string;
  subject?: string;
  topic?: string;
  difficulty?: string;
  options?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer?: string;
  explanation?: string;
}

/**
 * Fetch Google Sheet data using the working CSV method
 * @param sheetId - The Google Sheet ID
 * @returns Promise of CSV text
 */
export async function fetchGoogleSheetWorkingMethod(sheetId: string): Promise<string> {
  // Use the working URL format discovered in testing
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&output=csv`;
  
  try {
    const response = await fetch(csvUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
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
 * Parse CSV text for the user's specific sheet format
 * Expected columns: Question_Number,Class,Subject,Chapter,Concept,Question,Option_A,Option_B,Option_C,Option_D,Correct_Answer,Explanation,Cognitive_Level,Thinking_Skills,Constraints,Generated_Date
 */
export function parseUserSheetFormat(csvText: string): QuestionData[] {
  const lines = csvText.split('\n');
  const result: QuestionData[] = [];
  
  if (lines.length === 0) {
    return result;
  }

  // Parse header row to understand column positions
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  console.log('Sheet headers:', headers);
  
  // Map column indexes
  const columnMap = {
    questionNumber: headers.indexOf('Question_Number'),
    class: headers.indexOf('Class'),
    subject: headers.indexOf('Subject'),
    chapter: headers.indexOf('Chapter'),
    concept: headers.indexOf('Concept'),
    question: headers.indexOf('Question'),
    optionA: headers.indexOf('Option_A'),
    optionB: headers.indexOf('Option_B'),
    optionC: headers.indexOf('Option_C'),
    optionD: headers.indexOf('Option_D'),
    correctAnswer: headers.indexOf('Correct_Answer'),
    explanation: headers.indexOf('Explanation'),
    cognitiveLevel: headers.indexOf('Cognitive_Level'),
    thinkingSkills: headers.indexOf('Thinking_Skills'),
    constraints: headers.indexOf('Constraints'),
    generatedDate: headers.indexOf('Generated_Date')
  };

  console.log('Column mapping:', columnMap);
  
  // Parse data rows (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Advanced CSV parsing to handle commas within quoted fields
    const row = parseCSVLine(line);
    
    if (row.length < Math.max(...Object.values(columnMap))) {
      console.warn(`Skipping row ${i}: insufficient columns`);
      continue;
    }

    // Extract data using column mapping
    const questionText = row[columnMap.question]?.trim() || '';
    const subject = row[columnMap.subject]?.trim() || '';
    const chapter = row[columnMap.chapter]?.trim() || '';
    const concept = row[columnMap.concept]?.trim() || '';
    const cognitiveLevel = row[columnMap.cognitiveLevel]?.trim() || '';
    const thinkingSkills = row[columnMap.thinkingSkills]?.trim() || '';
    const classLevel = row[columnMap.class]?.trim() || '';

    // Skip if not Class 10 or no question text
    if (classLevel !== '10' || !questionText) {
      continue;
    }

    // Determine section and marks based on cognitive level or thinking skills
    const { section, marks } = determineSectionAndMarks(cognitiveLevel, thinkingSkills, concept);
    
    // Map cognitive level to our competency system
    const competency = mapToCompetency(cognitiveLevel, thinkingSkills);

    const questionData: QuestionData = {
      question: questionText,
      section,
      marks,
      competency,
      subject,
      topic: chapter || concept,
      difficulty: cognitiveLevel,
      options: {
        A: row[columnMap.optionA]?.trim() || '',
        B: row[columnMap.optionB]?.trim() || '',
        C: row[columnMap.optionC]?.trim() || '',
        D: row[columnMap.optionD]?.trim() || ''
      },
      correctAnswer: row[columnMap.correctAnswer]?.trim() || '',
      explanation: row[columnMap.explanation]?.trim() || ''
    };

    result.push(questionData);
  }

  console.log(`Parsed ${result.length} Class 10 questions from ${lines.length - 1} total rows`);
  return result;
}

/**
 * Advanced CSV line parsing to handle quoted fields with commas
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        currentField += '"';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(currentField.trim());
      currentField = '';
      i++;
      continue;
    } else {
      currentField += char;
    }
    
    i++;
  }
  
  // Add the last field
  result.push(currentField.trim());
  return result;
}

/**
 * Determine CBSE section and marks based on cognitive level and thinking skills
 */
function determineSectionAndMarks(cognitiveLevel: string, thinkingSkills: string, concept: string): { section: string; marks: number } {
  const level = (cognitiveLevel + ' ' + thinkingSkills + ' ' + concept).toLowerCase();
  
  // CBSE Pattern:
  // Section B: 6 questions × 2 marks (Knowledge/Remembering)
  // Section C: 7 questions × 3 marks (Understanding/Applying)  
  // Section D: 3 questions × 5 marks (Application/Analysis)
  // Section E: 3 questions × 4 marks (Evaluation/Synthesis)
  
  if (level.includes('remember') || level.includes('recall') || level.includes('knowledge')) {
    return { section: 'B', marks: 2 };
  } else if (level.includes('understand') || level.includes('comprehension') || level.includes('apply')) {
    return { section: 'C', marks: 3 };
  } else if (level.includes('analy') || level.includes('application') || level.includes('problem')) {
    return { section: 'D', marks: 5 };
  } else if (level.includes('evaluat') || level.includes('synthesis') || level.includes('creat')) {
    return { section: 'E', marks: 4 };
  } else {
    // Default to Section C (most common)
    return { section: 'C', marks: 3 };
  }
}

/**
 * Map cognitive level and thinking skills to our competency system
 */
function mapToCompetency(cognitiveLevel: string, thinkingSkills: string): string {
  const combined = (cognitiveLevel + ' ' + thinkingSkills).toLowerCase();
  
  if (combined.includes('remember') || combined.includes('recall') || combined.includes('knowledge')) {
    return 'Remembering';
  } else if (combined.includes('apply') || combined.includes('application')) {
    return 'Applying';
  } else if (combined.includes('creat') || combined.includes('synthesis')) {
    return 'Creating';
  } else if (combined.includes('evaluat') || combined.includes('analy')) {
    return 'Evaluating';
  } else {
    return 'General';
  }
}

/**
 * Get statistics about the parsed data
 */
export function analyzeUserSheetData(questions: QuestionData[]): {
  totalQuestions: number;
  bySubject: Record<string, number>;
  bySection: Record<string, number>;
  byCompetency: Record<string, number>;
  sampleQuestions: QuestionData[];
} {
  const bySubject: Record<string, number> = {};
  const bySection: Record<string, number> = {};
  const byCompetency: Record<string, number> = {};

  questions.forEach(q => {
    // Count by subject
    if (q.subject) {
      bySubject[q.subject] = (bySubject[q.subject] || 0) + 1;
    }
    
    // Count by section
    bySection[q.section] = (bySection[q.section] || 0) + 1;
    
    // Count by competency
    byCompetency[q.competency] = (byCompetency[q.competency] || 0) + 1;
  });

  return {
    totalQuestions: questions.length,
    bySubject,
    bySection,
    byCompetency,
    sampleQuestions: questions.slice(0, 3) // First 3 questions as samples
  };
} 