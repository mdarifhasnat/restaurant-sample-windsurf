'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getRestaurantImage } from '@/lib/images';

interface HeroProps {
  lang?: 'de' | 'en';
}

const translations = {
  de: {
    title: 'Entdecken Sie die Welt der kulinarischen Reise',
    subtitle: 'Von deutschen Traditionen bis zu europäischen Köstlichkeiten – erleben Sie Geschmackserlebnisse, die Sie nie vergessen werden',
    cta: 'Jetzt entdecken',
    secondaryCta: 'Mehr erfahren',
    searchPlaceholder: 'Nach Gerichten suchen...',
  },
  en: {
    title: 'Discover the World of Culinary Journey',
    subtitle: 'From German traditions to European delicacies – experience taste sensations you will never forget',
    cta: 'Discover Now',
    secondaryCta: 'Learn More',
    searchPlaceholder: 'Search for dishes...',
  },
};

export default function Hero({ lang = 'de' }: HeroProps) {
  const [currentLang, setCurrentLang] = useState<'de' | 'en'>(lang);
  const t = translations[currentLang];

  return (
    <section className="relative pt-24 min-h-[90vh] flex items-center bg-gradient-to-b from-gray-50 via-white to-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <div className="inline-block mb-4">
              <span className="px-4 py-1.5 bg-gray-900 text-white text-xs font-semibold tracking-wider uppercase rounded-full">
                Premium German Cuisine
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6 tracking-tight">
              {t.title}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {t.subtitle}
            </p>

            {/* Search Bar */}
            <div className="mb-10 max-w-lg mx-auto lg:mx-0">
              <div className="relative group">
                <Link href="/restaurant">
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    className="w-full px-6 py-4 pr-16 rounded-2xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 placeholder-gray-400 shadow-lg transition-all group-hover:border-gray-300 cursor-pointer"
                    aria-label="Search dishes"
                    readOnly
                  />
                </Link>
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white p-3 rounded-xl hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"
                  aria-label="Search"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link href="/restaurant" className="bg-gray-900 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 text-center">
                {t.cta}
              </Link>
              <Link href="/categories" className="border-2 border-gray-900 text-gray-900 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-900 hover:text-white transition-all shadow-md hover:shadow-lg text-center">
                {t.secondaryCta}
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 sm:gap-8 max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900">30+</div>
                <div className="text-sm sm:text-base text-gray-600 mt-1 font-medium">Gerichte</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900">6</div>
                <div className="text-sm sm:text-base text-gray-600 mt-1 font-medium">Kategorien</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900">30</div>
                <div className="text-sm sm:text-base text-gray-600 mt-1 font-medium">Min</div>
              </div>
            </div>
          </div>

          {/* Right Content - Image/Illustration */}
          <div className="relative order-1 lg:order-2">
            <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl">
              {/* Food Image Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200">
                <img
                  src={getRestaurantImage('Premium German Cuisine')}
                  alt="Premium German cuisine"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              {/* Floating Cards */}
              <div className="absolute top-6 left-6 sm:top-8 sm:left-8 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Top Rated</div>
                    <div className="text-xs text-gray-500 font-medium">4.9 ★</div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Fast Delivery</div>
                    <div className="text-xs text-gray-500 font-medium">30 min</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden lg:block">
        <div className="flex flex-col items-center space-y-2">
          <span className="text-xs text-gray-400 font-medium tracking-wider uppercase">Scroll</span>
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
