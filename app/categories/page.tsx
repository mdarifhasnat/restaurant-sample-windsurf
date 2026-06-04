'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { categories } from '@/src/data/categories';
import { getMenuItemsByCategory } from '@/src/data/menu-items';
import { Category } from '@/src/data/types';
import Link from 'next/link';

export default function CategoriesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar lang="de" onLanguageChange={() => {}} />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Kategorien</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category: Category) => {
            const itemCount = getMenuItemsByCategory(category.id).length;
            return (
              <Link
                key={category.id}
                href={`/restaurant#${category.id}`}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h2>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{itemCount}</div>
                    <div className="text-xs text-gray-500">Gerichte</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
