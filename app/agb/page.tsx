'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AGBPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar lang="de" />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Allgemeine Geschäftsbedingungen (AGB)</h1>
        
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Geltungsbereich</h2>
            <p className="text-gray-700">
              Diese Allgemeinen Geschäftsbedingungen gelten für alle Bestellungen über die Website speisenreise.de 
              von Speisenreise GmbH.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Vertragspartner</h2>
            <p className="text-gray-700">
              Der Kaufvertrag kommt zustande zwischen Ihnen und der:<br />
              Speisenreise GmbH<br />
              Dohrerstr. 4<br />
              41238 Mönchengladbach<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Bestellvorgang</h2>
            <p className="text-gray-700">
              Sie können unsere Produkte ohne Registrierung bestellen. Die Bestellung erfolgt in folgenden Schritten:
            </p>
            <ol className="list-decimal list-inside text-gray-700 mt-2 space-y-1">
              <li>Auswahl der Produkte und Hinzufügen zum Warenkorb</li>
              <li>Überprüfung der Bestellung im Warenkorb</li>
              <li>Eingabe der Lieferadresse und Kontaktdaten</li>
              <li>Bestätigung der Bestellung durch Klick auf den Button "Bestellung aufgeben"</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Preise und Zahlungsbedingungen</h2>
            <p className="text-gray-700">
              Alle Preise sind in Euro angegeben und inklusive der gesetzlichen Mehrwertsteuer. 
              Die Lieferkosten werden separat ausgewiesen. Die Zahlung erfolgt bei Lieferung bar oder per Karte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Lieferung</h2>
            <p className="text-gray-700">
              Die Lieferung erfolgt an die von Ihnen angegebene Lieferadresse. Die durchschnittliche Lieferzeit beträgt 30-45 Minuten. 
              Wir behalten uns vor, die Lieferzeit bei hoher Nachfrage zu verlängern.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Widerrufsrecht</h2>
            <p className="text-gray-700">
              Da es sich bei unseren Produkten um verderbliche Lebensmittel handelt, ist ein Widerrufsrecht gemäß § 312b Abs. 2 Nr. 2 BGB ausgeschlossen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Gewährleistung</h2>
            <p className="text-gray-700">
              Wir haften für Mängel an unseren Produkten nach den gesetzlichen Vorschriften. 
              Bitte melden Sie Mängel unverzüglich nach Erhalt der Lieferung.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Datenschutz</h2>
            <p className="text-gray-700">
              Wir erheben und verarbeiten Ihre personenbezogenen Daten gemäß unserer Datenschutzerklärung. 
              Weitere Informationen finden Sie unter: <a href="/datenschutz" className="text-blue-600 hover:underline">Datenschutz</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Kontakt</h2>
            <p className="text-gray-700">
              Bei Fragen zu unseren AGB können Sie sich jederzeit an uns wenden:<br />
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
