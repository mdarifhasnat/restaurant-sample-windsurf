'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ImpressumPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar lang="de" onLanguageChange={() => {}} />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Impressum</h1>
        
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Angaben gemäß § 5 TMG</h2>
            <p className="text-gray-700">
              Speisenreise GmbH<br />
              Dohrerstr. 4<br />
              41238 Mönchengladbach<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Kontakt</h2>
            <p className="text-gray-700">
              Telefon: +49 30 12345678<br />
              E-Mail: info@speisenreise.de
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Vertreten durch</h2>
            <p className="text-gray-700">
              Geschäftsführer: Max Mustermann
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Registereintrag</h2>
            <p className="text-gray-700">
              Eingetragen im Handelsregister des Amtsgerichts Berlin<br />
              Registernummer: HRB 12345
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Umsatzsteuer-ID</h2>
            <p className="text-gray-700">
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a UStG:<br />
              DE 123 456 789
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Haftung für Inhalte</h2>
            <p className="text-gray-700">
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. 
              Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen 
              oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">EU-Streitschlichtung</h2>
            <p className="text-gray-700">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                https://ec.europa.eu/consumers/odr
              </a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
