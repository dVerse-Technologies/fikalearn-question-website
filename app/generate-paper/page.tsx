'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function GeneratePaperPage() {
  const [chapters, setChapters] = useState<any>(null);
  const [selectedChapters, setSelectedChapters] = useState<{[key: string]: string[]}>({});
  const [chaptersLoading, setChaptersLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

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
    setGenerating(true);
    setResult(null);
    
    try {
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
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            📝 Generate Custom CBSE Paper
          </h1>
          
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-4">
              Create a personalized CBSE Class 10 mock paper by selecting the chapters you want to focus on.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
              <p className="text-blue-800 text-sm">
                📊 <strong>Paper Structure:</strong> Section B (6×2M) + Section C (7×3M) + Section D (3×5M) + Section E (3×4M) = 60 Marks
              </p>
            </div>
          </div>

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
                Choose which chapters to include in your paper. All chapters are selected by default for a comprehensive test.
              </p>
              
              <div className="space-y-4">
                {Object.entries(chapters.chaptersBySubject).map(([subject, chapterList]: [string, any]) => (
                  <div key={subject} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                        <span className={subject === 'Biology' ? '🧬' : subject === 'Chemistry' ? '⚗️' : '📖'}></span>
                        {subject}
                      </h3>
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {chapterList.map((chapter: any) => (
                        <label key={chapter.name} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded cursor-pointer border-l-4 border-transparent hover:border-blue-200">
                          <input
                            type="checkbox"
                            checked={selectedChapters[subject]?.includes(chapter.name) || false}
                            onChange={() => handleChapterToggle(subject, chapter.name)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-700">{chapter.name}</span>
                            <div className="text-xs text-gray-500 mt-1">
                              {chapter.questionCount} questions available
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
                <div className="text-sm">
                  <div className="font-medium text-gray-800 mb-1">📋 Paper will include chapters from:</div>
                  <div className="text-gray-700">
                    {getSelectedChaptersForAPI().length > 0 ? 
                      getSelectedChaptersForAPI().map(filter => 
                        `${filter.subject} (${filter.chapters.length} chapters)`
                      ).join(' • ') 
                      : 'No chapters selected'
                    }
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Generation Button */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-center">
            <button
              onClick={handleGeneratePaper}
              disabled={generating || chaptersLoading || getSelectedChaptersForAPI().length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating Paper...
                </>
              ) : (
                <>
                  🎯 Generate Paper
                </>
              )}
            </button>
            
            {getSelectedChaptersForAPI().length === 0 && !chaptersLoading && (
              <p className="text-red-600 text-sm mt-3">Please select at least one chapter to generate a paper.</p>
            )}
          </div>

          {/* Results */}
          {result && (
            <div className="bg-white rounded-lg shadow-md p-6">
              {result.success ? (
                <div className="text-center">
                  <div className="text-green-600 text-6xl mb-4">✅</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Paper Generated Successfully!</h2>
                  <p className="text-gray-600 mb-6">{result.message}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {Object.entries(result.paper.sections).map(([sectionCode, section]: [string, any]) => (
                      <div key={sectionCode} className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                        <div className="font-semibold text-blue-800">Section {sectionCode}</div>
                        <div className="text-sm text-blue-600">
                          {section.questionCount} × {section.marksPerQuestion}M = {section.totalMarks}M
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <a
                      href="/papers"
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      📄 View Paper
                    </a>
                    <button
                      onClick={() => setResult(null)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      🔄 Generate Another
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-red-600 text-6xl mb-4">❌</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Generation Failed</h2>
                  <p className="text-red-600 mb-4">{result.message}</p>
                  {result.error && (
                    <p className="text-red-500 text-sm">{result.error}</p>
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