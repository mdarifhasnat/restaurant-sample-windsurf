'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';

export default function Home() {
  const [lang, setLang] = useState<'de' | 'en'>('de');

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar lang={lang} onLanguageChange={setLang} />
      <Hero lang={lang} />
      <Footer />
    </div>
  );
}
