import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// CBSE Paper Structure (60 marks total)
export const CBSE_PAPER_STRUCTURE = {
  B: { questionsNeeded: 6, marksPerQuestion: 2, totalMarks: 12 },
  C: { questionsNeeded: 7, marksPerQuestion: 3, totalMarks: 21 },
  D: { questionsNeeded: 3, marksPerQuestion: 5, totalMarks: 15 },
  E: { questionsNeeded: 3, marksPerQuestion: 4, totalMarks: 12 }
} as const;

export interface GeneratedPaper {
  id: string;
  title: string;
  description: string;
  totalMarks: number;
  sections: {
    [key: string]: {
      questions: QuestionWithDetails[];
      marksPerQuestion: number;
      totalMarks: number;
    };
  };
  metadata: {
    generatedAt: Date;
    weekStart: Date;
    weekEnd: Date;
    questionDistribution: {
      bySubject: Record<string, number>;
      byCompetency: Record<string, number>;
      byTopic: Record<string, number>;
    };
  };
}

export interface QuestionWithDetails {
  id: string;
  question: string;
  section: string;
  marks: number;
  competency: string;
  subject: string;
  topic: string;
  difficulty: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
}

export interface ChapterFilter {
  subject: string;
  chapters: string[];
}

/**
 * Generate a complete CBSE paper with balanced question selection
 */
export async function generateCBSEPaper(
  weekStart: Date, 
  selectedChapters?: ChapterFilter[]
): Promise<GeneratedPaper> {
  try {
    console.log('🎯 Starting CBSE paper generation...');
    
    // Calculate week end (7 days later)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    // Step 1: Get available questions by section
    const availableQuestions = await getAvailableQuestionsBySection();
    
    // Step 2: Handle Section E creation (convert some Section D to Section E)
    await ensureSectionEQuestions();
    
    // Step 3: Generate paper sections
    const sections: GeneratedPaper['sections'] = {};
    
    for (const [sectionCode, config] of Object.entries(CBSE_PAPER_STRUCTURE)) {
      console.log(`📝 Generating Section ${sectionCode}...`);
      
      const sectionQuestions = await selectQuestionsForSection(
        sectionCode as keyof typeof CBSE_PAPER_STRUCTURE,
        config.questionsNeeded,
        selectedChapters
      );
      
      sections[sectionCode] = {
        questions: sectionQuestions,
        marksPerQuestion: config.marksPerQuestion,
        totalMarks: config.totalMarks
      };
    }
    
    // Step 4: Generate metadata
    const metadata = generatePaperMetadata(sections, weekStart, weekEnd);
    
    // Step 5: Create paper object
    const isCustomPaper = selectedChapters && selectedChapters.length > 0;
    const paper: GeneratedPaper = {
      id: generatePaperId(weekStart, isCustomPaper),
      title: isCustomPaper 
        ? `Custom CBSE Paper - ${selectedChapters.map(c => c.subject).join(', ')}`
        : `CBSE Class 10 Mock Paper - Week ${getWeekNumber(weekStart)}`,
      description: isCustomPaper
        ? `Custom paper from selected chapters: ${selectedChapters.map(c => c.chapters.join(', ')).join(' | ')}`
        : `Weekly practice paper covering multiple competencies and topics`,
      totalMarks: 60,
      sections,
      metadata
    };
    
    console.log('✅ Paper generation completed successfully');
    return paper;
    
  } catch (error) {
    console.error('❌ Error generating paper:', error);
    throw error;
  }
}

/**
 * Get available questions grouped by section
 */
async function getAvailableQuestionsBySection() {
  const questionsBySection = await prisma.question.groupBy({
    by: ['section'],
    _count: true
  });
  
  const counts = questionsBySection.reduce((acc, item) => {
    acc[item.section] = item._count;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('📊 Available questions by section:', counts);
  return counts;
}

/**
 * Ensure we have Section E questions by converting some Section D questions
 */
async function ensureSectionEQuestions() {
  const sectionECount = await prisma.question.count({
    where: { section: 'E' }
  });
  
  if (sectionECount < 10) { // Need at least 10 Section E questions for variety
    console.log('🔄 Creating Section E questions from Section D...');
    
    // Find Section D questions that can become Section E (4 marks)
    // Choose questions with higher cognitive levels (Creating, Evaluating)
    const candidateQuestions = await prisma.question.findMany({
      where: {
        section: 'D',
        competency: {
          in: ['Creating', 'Evaluating', 'Applying']
        }
      },
      take: 50, // Get 50 candidates
      orderBy: [
        { competency: 'desc' }, // Higher competency first
        { id: 'asc' }
      ]
    });
    
    // Convert first 20 to Section E
    const questionsToConvert = candidateQuestions.slice(0, 20);
    
    for (const question of questionsToConvert) {
      await prisma.question.update({
        where: { id: question.id },
        data: { 
          section: 'E',
          marks: 4
        }
      });
    }
    
    console.log(`✅ Converted ${questionsToConvert.length} questions to Section E`);
  }
}

/**
 * Select questions for a specific section with smart balancing
 */
async function selectQuestionsForSection(
  section: keyof typeof CBSE_PAPER_STRUCTURE,
  count: number,
  selectedChapters?: ChapterFilter[]
): Promise<QuestionWithDetails[]> {
  
  // Build chapter filter if provided
  let chapterFilter: any = {};
  if (selectedChapters && selectedChapters.length > 0) {
    const allowedChapters: string[] = [];
    selectedChapters.forEach(filter => {
      allowedChapters.push(...filter.chapters);
    });
    chapterFilter = {
      topic: {
        in: allowedChapters
      }
    };
    console.log(`📚 Filtering Section ${section} by chapters:`, allowedChapters);
  }

  // Get questions for this section with smart ordering
  const questions = await prisma.question.findMany({
    where: { 
      section,
      ...chapterFilter
    },
    orderBy: [
      { competency: 'asc' },     // Mix competencies
      { subject: 'asc' },       // Mix subjects  
      { topic: 'asc' },         // Mix topics
      { id: 'asc' }             // Consistent ordering
    ],
    take: count * 3 // Get 3x more for better selection
  });
  
  if (questions.length < count) {
    throw new Error(`Not enough questions for Section ${section}. Need ${count}, have ${questions.length}`);
  }
  
  // Smart selection algorithm
  const selectedQuestions = smartQuestionSelection(questions, count);
  
  return selectedQuestions.map(q => ({
    id: q.id,
    question: q.question,
    section: q.section,
    marks: q.marks,
    competency: q.competency,
    subject: q.subject || 'General',
    topic: q.topic || 'General',
    difficulty: q.difficulty || 'Medium',
    optionA: q.optionA || '',
    optionB: q.optionB || '',
    optionC: q.optionC || '',
    optionD: q.optionD || '',
    correctAnswer: q.correctAnswer || '',
    explanation: q.explanation || ''
  }));
}

/**
 * Smart question selection to ensure variety
 */
function smartQuestionSelection(questions: any[], count: number): any[] {
  const selected: any[] = [];
  const usedCompetencies = new Set();
  const usedSubjects = new Set();
  const usedTopics = new Set();
  
  // First pass: Try to get variety in competencies
  for (const question of questions) {
    if (selected.length >= count) break;
    
    if (!usedCompetencies.has(question.competency)) {
      selected.push(question);
      usedCompetencies.add(question.competency);
      usedSubjects.add(question.subject);
      usedTopics.add(question.topic);
    }
  }
  
  // Second pass: Fill remaining slots with variety in subjects
  for (const question of questions) {
    if (selected.length >= count) break;
    if (selected.includes(question)) continue;
    
    if (!usedSubjects.has(question.subject) || usedSubjects.size < 2) {
      selected.push(question);
      usedSubjects.add(question.subject);
      usedTopics.add(question.topic);
    }
  }
  
  // Third pass: Fill any remaining slots
  for (const question of questions) {
    if (selected.length >= count) break;
    if (selected.includes(question)) continue;
    
    selected.push(question);
  }
  
  return selected.slice(0, count);
}

/**
 * Generate paper metadata with statistics
 */
function generatePaperMetadata(
  sections: GeneratedPaper['sections'], 
  weekStart: Date, 
  weekEnd: Date
): GeneratedPaper['metadata'] {
  const bySubject: Record<string, number> = {};
  const byCompetency: Record<string, number> = {};
  const byTopic: Record<string, number> = {};
  
  // Count distributions across all sections
  Object.values(sections).forEach(section => {
    section.questions.forEach(q => {
      bySubject[q.subject] = (bySubject[q.subject] || 0) + 1;
      byCompetency[q.competency] = (byCompetency[q.competency] || 0) + 1;
      byTopic[q.topic] = (byTopic[q.topic] || 0) + 1;
    });
  });
  
  return {
    generatedAt: new Date(),
    weekStart,
    weekEnd,
    questionDistribution: {
      bySubject,
      byCompetency,
      byTopic
    }
  };
}

/**
 * Generate unique paper ID based on week and type
 */
function generatePaperId(weekStart: Date, isCustomPaper: boolean = false): string {
  const year = weekStart.getFullYear();
  const week = getWeekNumber(weekStart);
  const timestamp = Date.now().toString(36); // Short timestamp for uniqueness
  
  if (isCustomPaper) {
    return `custom-${year}-${timestamp}`;
  } else {
    return `cbse-class10-${year}-week${week.toString().padStart(2, '0')}`;
  }
}

/**
 * Get ISO week number
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Save generated paper to database
 */
export async function savePaperToDatabase(paper: GeneratedPaper): Promise<string> {
  try {
    let paperId = paper.id;
    let attempt = 0;
    let createdPaper;
    
    // Try to create the paper, with fallback for duplicate IDs
    while (attempt < 3) {
      try {
        createdPaper = await prisma.paper.create({
          data: {
            id: paperId,
            title: paper.title,
            description: paper.description,
            totalMarks: paper.totalMarks,
            weekStart: paper.metadata.weekStart,
            weekEnd: paper.metadata.weekEnd,
            publishedAt: new Date(),
            isActive: true
          }
        });
        break; // Success, exit loop
      } catch (error: any) {
        if (error.code === 'P2002' && attempt < 2) {
          // Unique constraint violation, try with modified ID
          attempt++;
          paperId = `${paper.id}-${attempt}`;
          console.log(`🔄 ID collision, trying with: ${paperId}`);
        } else {
          throw error; // Re-throw if not a unique constraint error or max attempts reached
        }
      }
    }
    
    if (!createdPaper) {
      throw new Error('Failed to create paper after multiple attempts');
    }
    
    // Create paper-question relationships
    let order = 1;
    for (const [sectionCode, section] of Object.entries(paper.sections)) {
      for (const question of section.questions) {
        await prisma.paperQuestion.create({
          data: {
            paperId: createdPaper.id,
            questionId: question.id,
            order: order++
          }
        });
      }
    }
    
    console.log(`✅ Paper saved to database with ID: ${createdPaper.id}`);
    return createdPaper.id;
    
  } catch (error) {
    console.error('❌ Error saving paper to database:', error);
    throw error;
  }
}

/**
 * Get papers from database with questions
 */
export async function getPapersFromDatabase(limit: number = 10) {
  return await prisma.paper.findMany({
    include: {
      paperQuestions: {
        include: {
          question: true
        },
        orderBy: {
          order: 'asc'
        }
      }
    },
    where: {
      isActive: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  });
} 