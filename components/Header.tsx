'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary">
            FikaLearn Papers
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="text-gray-600 hover:text-primary">
              Home
            </Link>
            <Link href="/papers" className="text-gray-600 hover:text-primary">
              Papers
            </Link>
            <Link href="/generate-paper" className="text-gray-600 hover:text-primary">
              Generate Paper
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex space-x-3">
            <Link 
              href="/auth/signin" 
              className="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/signup" 
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
} 