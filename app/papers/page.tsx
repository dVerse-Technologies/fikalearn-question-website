'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Question {
  id: string;
  question: string;
  marks: number;
  competency: string;
  subject: string;
  topic: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
}

interface Paper {
  id: string;
  title: string;
  description: string;
  totalMarks: number;
  weekStart: string;
  weekEnd: string;
  publishedAt: string;
  questionCount: number;
  sections: {
    [key: string]: {
      questions: Question[];
      totalMarks: number;
      marksPerQuestion: number;
    };
  };
}

export default function PapersPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const response = await fetch('/api/papers');
      const data = await response.json();
      if (data.success) {
        setPapers(data.papers);
      }
    } catch (error) {
      console.error('Error fetching papers:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCompetencyColor = (competency: string) => {
    const colors = {
      'Remembering': 'text-blue-700 bg-blue-50 border-blue-200',
      'Applying': 'text-green-700 bg-green-50 border-green-200',
      'Creating': 'text-purple-700 bg-purple-50 border-purple-200',
      'Evaluating': 'text-orange-700 bg-orange-50 border-orange-200',
      'General': 'text-gray-700 bg-gray-50 border-gray-200'
    };
    return colors[competency as keyof typeof colors] || colors.General;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading papers...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            📚 CBSE Class 10 Mock Papers
          </h1>
          
          {papers.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 mb-4">No papers have been generated yet.</p>
              <p className="text-sm text-gray-500">
                Papers will appear here once the automatic generation system creates them.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Papers List */}
              {!selectedPaper && (
                <div className="grid gap-6">
                  {papers.map((paper) => (
                    <div key={paper.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">{paper.title}</h2>
                            <p className="text-gray-600 text-sm">{paper.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              {paper.totalMarks} Marks
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {Object.entries(paper.sections).map(([sectionCode, section]) => (
                            <div key={sectionCode} className="bg-gray-50 rounded p-3 text-center">
                              <div className="font-semibold text-gray-800">Section {sectionCode}</div>
                              <div className="text-sm text-gray-600">
                                {section.questions.length} × {section.marksPerQuestion}M = {section.totalMarks}M
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            Week: {formatDate(paper.weekStart)} - {formatDate(paper.weekEnd)} | 
                            Published: {formatDate(paper.publishedAt)}
                          </div>
                          <button
                            onClick={() => setSelectedPaper(paper)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            📄 Open Paper
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Individual Paper View */}
              {selectedPaper && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-blue-600 text-white p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">{selectedPaper.title}</h2>
                        <p className="text-blue-100">{selectedPaper.description}</p>
                        <p className="text-blue-200 text-sm mt-2">
                          Time: 3 Hours | Maximum Marks: {selectedPaper.totalMarks}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowAnswers(!showAnswers)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          {showAnswers ? '🙈 Hide Answers' : '👁️ Show Answers'}
                        </button>
                        <button
                          onClick={() => setSelectedPaper(null)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          ← Back
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {/* Instructions */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <h3 className="font-semibold text-yellow-800 mb-2">General Instructions:</h3>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Read all instructions carefully before answering.</li>
                        <li>• All questions are compulsory.</li>
                        <li>• Answer all questions in the given sections.</li>
                        <li>• Use diagrams wherever necessary.</li>
                      </ul>
                    </div>

                    {/* Sections */}
                    {Object.entries(selectedPaper.sections)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([sectionCode, section]) => (
                      <div key={sectionCode} className="mb-8">
                        <div className="bg-gray-100 rounded-lg p-4 mb-4">
                          <h3 className="text-lg font-semibold text-gray-800">
                            Section {sectionCode}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Answer all questions. Each question carries {section.marksPerQuestion} marks. 
                            Total: {section.totalMarks} marks
                          </p>
                        </div>
                        
                        <div className="space-y-6">
                          {section.questions.map((question, index) => (
                            <div key={question.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-3">
                                <h4 className="font-semibold text-gray-800">
                                  Question {index + 1}. ({section.marksPerQuestion} marks)
                                </h4>
                                <div className="flex gap-2">
                                  <span className={`text-xs px-2 py-1 rounded border ${getCompetencyColor(question.competency)}`}>
                                    {question.competency}
                                  </span>
                                  <span className="text-xs px-2 py-1 rounded border text-gray-600 bg-gray-50 border-gray-200">
                                    {question.subject}
                                  </span>
                                </div>
                              </div>
                              
                              <p className="text-gray-700 mb-4 leading-relaxed">
                                {question.question}
                              </p>
                              
                              {(question.optionA || question.optionB || question.optionC || question.optionD) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                                  {question.optionA && (
                                    <div className="p-2 border rounded bg-gray-50">
                                      <strong>A)</strong> {question.optionA}
                                    </div>
                                  )}
                                  {question.optionB && (
                                    <div className="p-2 border rounded bg-gray-50">
                                      <strong>B)</strong> {question.optionB}
                                    </div>
                                  )}
                                  {question.optionC && (
                                    <div className="p-2 border rounded bg-gray-50">
                                      <strong>C)</strong> {question.optionC}
                                    </div>
                                  )}
                                  {question.optionD && (
                                    <div className="p-2 border rounded bg-gray-50">
                                      <strong>D)</strong> {question.optionD}
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {showAnswers && (question.correctAnswer || question.explanation) && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                                  {question.correctAnswer && (
                                    <p className="font-semibold text-green-800 mb-2">
                                      Answer: {question.correctAnswer}
                                    </p>
                                  )}
                                  {question.explanation && (
                                    <p className="text-green-700 text-sm">
                                      <strong>Explanation:</strong> {question.explanation}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
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