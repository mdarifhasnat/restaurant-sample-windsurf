'use client';

import { useState } from 'react';
import Link from 'next/link';

interface NavbarProps {
  lang?: 'de' | 'en';
  onLanguageChange?: (lang: 'de' | 'en') => void;
}

const translations = {
  de: {
    home: 'Startseite',
    menu: 'Speisekarte',
  },
  en: {
    home: 'Home',
    menu: 'Menu',
  },
};

export default function Navbar({ lang = 'de', onLanguageChange }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<'de' | 'en'>(lang);
  const t = translations[currentLang];

  const handleLanguageChange = (newLang: 'de' | 'en') => {
    setCurrentLang(newLang);
    onLanguageChange?.(newLang);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center space-x-2">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900 leading-tight">Speisenreise</span>
              <span className="text-xs text-gray-500 tracking-wider">GERMAN CUISINE</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm">
              {t.home}
            </Link>
            <Link href="/restaurant" className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm">
              {t.menu}
            </Link>

            {/* Language Toggle */}
            <div className="flex items-center space-x-2 border-l border-gray-200 pl-6">
              <button
                onClick={() => handleLanguageChange('de')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  currentLang === 'de'
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                aria-label="Switch to German"
              >
                DE
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  currentLang === 'en'
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                aria-label="Switch to English"
              >
                EN
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-3">
            {/* Language Toggle Mobile */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleLanguageChange('de')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentLang === 'de'
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                aria-label="Switch to German"
              >
                DE
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentLang === 'en'
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                aria-label="Switch to English"
              >
                EN
              </button>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-gray-900 focus:outline-none p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-6 space-y-3 border-t border-gray-200">
            <Link
              href="/"
              className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              {t.home}
            </Link>
            <Link
              href="/restaurant"
              className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              {t.menu}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
