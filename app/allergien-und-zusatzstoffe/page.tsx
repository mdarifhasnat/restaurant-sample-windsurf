'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AllergienPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar lang="de" />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Allergien und Zusatzstoffe</h1>
        
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Allergiehinweis</h2>
            <p className="text-gray-700">
              Bitte informieren Sie unser Personal über vorhandene Allergien oder Unverträglichkeiten vor Ihrer Bestellung. 
              Wir können keine 100%ige Garantie für die vollständige Abwesenheit von Spuren von Allergenen geben.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Allergene (gemäß EU-Verordnung)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-gray-900 mb-2">Glutenhaltiges Getreide</h3>
                <p className="text-sm text-gray-600">Weizen, Roggen, Gerste, Hafer, Dinkel</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-gray-900 mb-2">Krebstiere</h3>
                <p className="text-sm text-gray-600">Garnelen, Krabben, Hummer</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-gray-900 mb-2">Eier</h3>
                <p className="text-sm text-gray-600">Hühnereier in allen Formen</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-gray-900 mb-2">Fisch</h3>
                <p className="text-sm text-gray-600">Alle Fischsorten und Fischprodukte</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-gray-900 mb-2">Erdnüsse</h3>
                <p className="text-sm text-gray-600">Erdnüsse und Erdnussprodukte</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-gray-900 mb-2">Sojabohnen</h3>
                <p className="text-sm text-gray-600">Soja und Sojaprodukte</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-gray-900 mb-2">Milch</h3>
                <p className="text-sm text-gray-600">Kuhmilch und Milchprodukte</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-gray-900 mb-2">Schalenfrüchte</h3>
                <p className="text-sm text-gray-600">Mandeln, Haselnüsse, Walnüsse, Cashewnüsse</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-gray-900 mb-2">Sellerie</h3>
                <p className="text-sm text-gray-600">Sellerie und Sellerieprodukte</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-gray-900 mb-2">Senf</h3>
                <p className="text-sm text-gray-600">Senf und Senfprodukte</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-gray-900 mb-2">Sesamsamen</h3>
                <p className="text-sm text-gray-600">Sesam und Sesamprodukte</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-gray-900 mb-2">Schwefeldioxid</h3>
                <p className="text-sm text-gray-600">Sulfite in getrockneten Früchten</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-gray-900 mb-2">Lupinen</h3>
                <p className="text-sm text-gray-600">Lupinen und Lupinenprodukte</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-gray-900 mb-3">Weichtiere</h3>
                <p className="text-sm text-gray-600">Muscheln, Schnecken</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Zusatzstoffe</h2>
            <p className="text-gray-700">
              Wir verwenden in unseren Produkten nur zugelassene Zusatzstoffe in gesetzlich zulässigen Mengen. 
              Folgende Zusatzstoffe können in unseren Gerichten enthalten sein:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
              <li>Farbstoffe (z.B. Paprikaextrakt, Kurkuma)</li>
              <li>Konservierungsstoffe (z.B. in marinierten Produkten)</li>
              <li>Antioxidationsmittel (z.B. in Fleischprodukten)</li>
              <li>Geschmacksverstärker (z.B. Glutamat)</li>
              <li>Säuerungsmittel (z.B. Zitronensäure)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Hinweis für Allergiker</h2>
            <p className="text-gray-700">
              Personen mit schweren Allergien sollten vor dem Bestellen unser Personal persönlich kontaktieren. 
              Wir können keine Haftung für allergische Reaktionen übernehmen, wenn Sie uns nicht vorab über Ihre Allergie informieren.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Kontakt bei Fragen</h2>
            <p className="text-gray-700">
              Bei Fragen zu Allergenen oder Zusatzstoffen kontaktieren Sie uns gerne:<br />
              E-Mail: info@speisenreise.de<br />
              Telefon: +49 30 12345678
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
