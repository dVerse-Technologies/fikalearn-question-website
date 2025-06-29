import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '../components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FikaLearn Question Bank',
  description: 'AI-powered CBSE Class 10 question paper generator with automated scheduling and Google Sheets integration',
  keywords: 'CBSE, Class 10, question papers, exam preparation, education, AI',
  authors: [{ name: 'FikaLearn Team' }],
  openGraph: {
    title: 'FikaLearn Question Bank',
    description: 'Generate CBSE Class 10 question papers instantly with AI-powered selection and automated scheduling',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
          
          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  © 2025 FikaLearn. All rights reserved.
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>🚀 Powered by Next.js</span>
                  <span>•</span>
                  <span>📊 Google Sheets</span>
                  <span>•</span>
                  <span>⏰ Auto Scheduler</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
} 