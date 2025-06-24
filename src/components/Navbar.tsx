'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white dark:bg-gray-900 shadow-md z-50 navbar-custom">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex space-x-4">
          <Link href="/clinical_cases" className="button-custom px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 border hover:border-blue-600 dark:hover:border-blue-400 rounded-lg transition-all">
            Casos clínicos
          </Link>
          <Link href="/patients" className="button-custom px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 border hover:border-blue-600 dark:hover:border-blue-400 rounded-lg transition-all">
            Pacientes
          </Link>
        </div>

        {/* Auth/Action Buttons - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 navbar-icon">
            <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
          </svg>
        </div>
        {/* Mobile Menu Button */}
        <button 
          onClick={toggleMenu} 
          className="block md:hidden text-gray-700 dark:text-gray-200 focus:outline-none bg-gray-100 dark:bg-gray-800 p-2 rounded-md z-50 navbar-menu"
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
          </svg>
        </button>
      </div>
      
      {/* Mobile Menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} px-4 pt-2 pb-4 bg-white dark:bg-gray-900 shadow-inner border-t dark:border-gray-800 navbar-custom`}>
        <div className="flex flex-col space-y-3">
          <Link 
            href="/clinical_cases" 
            className="button-custom px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 border border-transparent hover:border-blue-600 dark:hover:border-blue-400 rounded-lg transition-all"
            onClick={() => setIsMenuOpen(false)}
          >
            Casos clínicos
          </Link>
          <Link 
            href="/patients" 
            className="button-custom px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 border border-transparent hover:border-blue-600 dark:hover:border-blue-400 rounded-lg transition-all"
            onClick={() => setIsMenuOpen(false)}
          >
            Pacientes
          </Link>
          <div className="flex flex-col space-y-3 pt-4 border-t dark:border-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 navbar-icon">
              <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </nav>
  );
}