'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white dark:bg-gray-900 shadow-md z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex space-x-4">
          <Link href="/clinical_cases" className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 border hover:border-blue-600 dark:hover:border-blue-400 rounded-lg transition-all">
            Casos clínicos
          </Link>
          <Link href="/patients" className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 border hover:border-blue-600 dark:hover:border-blue-400 rounded-lg transition-all">
            Pacientes
          </Link>
        </div>

        {/* Auth/Action Buttons - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          <button className="px-4 py-2 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors">
            Login
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Sign Up
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={toggleMenu} 
          className="block md:hidden text-gray-700 dark:text-gray-200 focus:outline-none bg-gray-100 dark:bg-gray-800 p-2 rounded-md z-50"
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            )}
          </svg>
        </button>
      </div>
      
      {/* Mobile Menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} px-4 pt-2 pb-4 bg-white dark:bg-gray-900 shadow-inner border-t dark:border-gray-800`}>
        <div className="flex flex-col space-y-3">
          <Link 
            href="/clinical_cases" 
            className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 border border-transparent hover:border-blue-600 dark:hover:border-blue-400 rounded-lg transition-all"
            onClick={() => setIsMenuOpen(false)}
          >
            Casos clínicos
          </Link>
          <Link 
            href="/patients" 
            className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 border border-transparent hover:border-blue-600 dark:hover:border-blue-400 rounded-lg transition-all"
            onClick={() => setIsMenuOpen(false)}
          >
            Pacientes
          </Link>
          <div className="flex flex-col space-y-3 pt-4 border-t dark:border-gray-700">
            <button className="w-full px-4 py-2 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-gray-800 text-left transition-colors">
              Login
            </button>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-left transition-colors">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}