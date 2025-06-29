'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TestPaperGenerationPage() {
  const [generationResult, setGenerationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [chapters, setChapters] = useState<any>(null);
  const [selectedChapters, setSelectedChapters] = useState<{[key: string]: string[]}>({});
  const [chaptersLoading, setChaptersLoading] = useState(true);

  useEffect(() => {
    fetchChapters();
  }, []);

  const fetchChapters = async () => {
    try {
      const response = await fetch('/api/chapters');
      const data = await response.json();
      if (data.success) {
        setChapters(data.data);
        // Initialize with all chapters selected
        const initialSelection: {[key: string]: string[]} = {};
        Object.entries(data.data.chaptersBySubject).forEach(([subject, chapterList]: [string, any]) => {
          initialSelection[subject] = chapterList.map((ch: any) => ch.name);
        });
        setSelectedChapters(initialSelection);
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
    } finally {
      setChaptersLoading(false);
    }
  };

  const handleChapterToggle = (subject: string, chapterName: string) => {
    setSelectedChapters(prev => {
      const subjectChapters = prev[subject] || [];
      const isSelected = subjectChapters.includes(chapterName);
      
      if (isSelected) {
        return {
          ...prev,
          [subject]: subjectChapters.filter(ch => ch !== chapterName)
        };
      } else {
        return {
          ...prev,
          [subject]: [...subjectChapters, chapterName]
        };
      }
    });
  };

  const handleSubjectToggle = (subject: string) => {
    if (!chapters) return;
    
    const allChapters = chapters.chaptersBySubject[subject].map((ch: any) => ch.name);
    const currentSelected = selectedChapters[subject] || [];
    const allSelected = currentSelected.length === allChapters.length;
    
    setSelectedChapters(prev => ({
      ...prev,
      [subject]: allSelected ? [] : allChapters
    }));
  };

  const getSelectedChaptersForAPI = () => {
    return Object.entries(selectedChapters)
      .filter(([subject, chapters]) => chapters.length > 0)
      .map(([subject, chapters]) => ({
        subject,
        chapters
      }));
  };

  const handleGeneratePaper = async () => {
    setLoading(true);
    setGenerationResult(null);
    
    try {
      console.log('🎯 Starting paper generation...');
      const response = await fetch('/api/papers/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekStart: new Date().toISOString(),
          selectedChapters: getSelectedChaptersForAPI()
        })
      });
      
      const data = await response.json();
      console.log('📊 Generation result:', data);
      setGenerationResult(data);
    } catch (error) {
      setGenerationResult({
        success: false,
        message: 'Network error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewPaper = async () => {
    try {
      console.log('👁️ Generating paper preview...');
      const response = await fetch('/api/papers/generate', {
        method: 'GET'
      });
      
      const data = await response.json();
      console.log('📊 Preview result:', data);
      setPreviewResult(data);
    } catch (error) {
      setPreviewResult({
        success: false,
        message: 'Network error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            🎯 CBSE Paper Generation Test
          </h1>
          
          {/* Chapter Selection */}
          {chaptersLoading ? (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ) : chapters && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">📚 Select Chapters</h2>
              <p className="text-gray-600 mb-4">
                Choose which chapters to include in your paper. All chapters are selected by default.
              </p>
              
              <div className="space-y-4">
                {Object.entries(chapters.chaptersBySubject).map(([subject, chapterList]: [string, any]) => (
                  <div key={subject} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-800">{subject}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {selectedChapters[subject]?.length || 0} / {chapterList.length} selected
                        </span>
                        <button
                          onClick={() => handleSubjectToggle(subject)}
                          className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded transition-colors"
                        >
                          {(selectedChapters[subject]?.length || 0) === chapterList.length ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {chapterList.map((chapter: any) => (
                        <label key={chapter.name} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedChapters[subject]?.includes(chapter.name) || false}
                            onChange={() => handleChapterToggle(subject, chapter.name)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-700">{chapter.name}</span>
                            <div className="text-xs text-gray-500">
                              {chapter.questionCount} questions
                              {chapter.sections && Object.keys(chapter.sections).length > 0 && (
                                <span className="ml-1">
                                  ({Object.entries(chapter.sections).map(([sec, count]) => `${sec}:${count}`).join(', ')})
                                </span>
                              )}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-800">
                  <strong>Selected:</strong> {getSelectedChaptersForAPI().map(filter => 
                    `${filter.subject} (${filter.chapters.length})`
                  ).join(', ') || 'None'}
                </div>
              </div>
            </div>
          )}

          {/* Generation Controls */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Generate CBSE Papers</h2>
            <p className="text-gray-600 mb-4">
              Test the intelligent paper generation system that creates balanced CBSE Class 10 papers.
            </p>
            
            <div className="flex gap-4">
              <button
                onClick={handleGeneratePaper}
                disabled={loading || chaptersLoading || getSelectedChaptersForAPI().length === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {loading ? '⏳ Generating...' : '🎯 Generate & Save Paper'}
              </button>
              
              <button
                onClick={handlePreviewPaper}
                disabled={chaptersLoading || getSelectedChaptersForAPI().length === 0}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                👁️ Preview Paper
              </button>
            </div>
            
            {getSelectedChaptersForAPI().length === 0 && (
              <p className="text-red-600 text-sm mt-2">Please select at least one chapter to generate a paper.</p>
            )}
          </div>

          {/* Paper Generation Results */}
          {generationResult && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">
                {generationResult.success ? '✅ Paper Generated Successfully' : '❌ Generation Failed'}
              </h3>
              
              {generationResult.success ? (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">{generationResult.paper.title}</h4>
                    <p className="text-green-700 text-sm">{generationResult.paper.description}</p>
                    <p className="text-green-600 text-sm mt-2">
                      Total Marks: {generationResult.paper.totalMarks} | 
                      Week: {new Date(generationResult.paper.weekStart).toLocaleDateString()} - {new Date(generationResult.paper.weekEnd).toLocaleDateString()}
                    </p>
                    {generationResult.paper.selectedChapters && (
                      <div className="mt-2 text-green-700 text-sm">
                        <strong>Chapters included:</strong> {generationResult.paper.selectedChapters.map((filter: any) => 
                          `${filter.subject} (${filter.chapters.length})`
                        ).join(', ')}
                      </div>
                    )}
                  </div>
                  
                  {/* Section Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(generationResult.paper.sections).map(([sectionCode, section]: [string, any]) => (
                      <div key={sectionCode} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 className="font-medium text-blue-800">Section {sectionCode}</h5>
                        <p className="text-blue-700 text-sm">
                          {section.questionCount} questions × {section.marksPerQuestion} marks = {section.totalMarks} marks
                        </p>
                        <p className="text-blue-600 text-xs mt-2 truncate">
                          Sample: {section.sampleQuestion}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Distribution Analysis */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h5 className="font-medium text-purple-800 mb-2">By Subject:</h5>
                      <ul className="text-sm text-purple-700">
                        {Object.entries(generationResult.paper.distribution.bySubject).map(([subject, count]) => (
                          <li key={subject}>{subject}: {count as number}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h5 className="font-medium text-orange-800 mb-2">By Competency:</h5>
                      <ul className="text-sm text-orange-700">
                        {Object.entries(generationResult.paper.distribution.byCompetency).map(([competency, count]) => (
                          <li key={competency}>{competency}: {count as number}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                      <h5 className="font-medium text-teal-800 mb-2">By Topic:</h5>
                      <ul className="text-sm text-teal-700">
                        {Object.entries(generationResult.paper.distribution.byTopic).slice(0, 5).map(([topic, count]) => (
                          <li key={topic}>{topic}: {count as number}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{generationResult.message}</p>
                  {generationResult.error && (
                    <p className="text-red-600 text-sm mt-2">Error: {generationResult.error}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Paper Preview Results */}
          {previewResult && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">
                {previewResult.success ? '👁️ Paper Preview' : '❌ Preview Failed'}
              </h3>
              
              {previewResult.success ? (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">{previewResult.paper.title}</h4>
                    <p className="text-blue-700 text-sm">{previewResult.paper.description}</p>
                    <p className="text-blue-600 text-sm mt-2">Total Marks: {previewResult.paper.totalMarks}</p>
                  </div>
                  
                  {/* Show actual questions in preview */}
                  <div className="space-y-6">
                    {Object.entries(previewResult.paper.sections).map(([sectionCode, section]: [string, any]) => (
                      <div key={sectionCode} className="border rounded-lg p-4">
                        <h5 className="font-semibold text-gray-800 mb-3">
                          Section {sectionCode} - {section.questions.length} questions × {section.marksPerQuestion} marks = {section.totalMarks} marks
                        </h5>
                        
                        <div className="space-y-4">
                          {section.questions.slice(0, 2).map((question: any, index: number) => (
                            <div key={question.id} className="bg-gray-50 rounded p-3">
                              <p className="font-medium text-gray-800 mb-2">
                                Q{index + 1}. {question.question.substring(0, 150)}...
                              </p>
                              <div className="flex gap-4 text-xs text-gray-600">
                                <span className="bg-blue-100 px-2 py-1 rounded">{question.competency}</span>
                                <span className="bg-green-100 px-2 py-1 rounded">{question.subject}</span>
                                <span className="bg-purple-100 px-2 py-1 rounded">{question.topic}</span>
                              </div>
                            </div>
                          ))}
                          {section.questions.length > 2 && (
                            <p className="text-gray-500 text-sm">
                              ... and {section.questions.length - 2} more questions
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{previewResult.message}</p>
                  {previewResult.error && (
                    <p className="text-red-600 text-sm mt-2">Error: {previewResult.error}</p>
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