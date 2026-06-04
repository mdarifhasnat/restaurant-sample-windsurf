'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function DatenschutzPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar lang="de" onLanguageChange={() => {}} />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Datenschutzerklärung</h1>
        
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Datenschutz auf einen Blick</h2>
            <p className="text-gray-700">
              Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich 
              und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Datenerfassung auf unserer Website</h2>
            <p className="text-gray-700">
              Wenn Sie unsere Website besuchen, erheben wir automatisch bestimmte Informationen. Diese Informationen umfassen:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
              <li>IP-Adresse</li>
              <li>Browsertyp und Browserversion</li>
              <li>Verwendetes Betriebssystem</li>
              <li>Referrer URL</li>
              <li>Hostname des zugreifenden Rechners</li>
              <li>Uhrzeit der Serveranfrage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Cookies</h2>
            <p className="text-gray-700">
              Unsere Website verwendet Cookies. Das sind kleine Textdateien, die auf Ihrem Endgerät gespeichert werden. 
              Cookies helfen uns, unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Kontaktformular</h2>
            <p className="text-gray-700">
              Wenn Sie uns über unser Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular 
              inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von 
              Anschlussfragen bei uns gespeichert.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. SSL- bzw. TLS-Verschlüsselung</h2>
            <p className="text-gray-700">
              Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine SSL-bzw. 
              TLS-Verschlüsselung. Sie können eine verschlüsselte Verbindung an der Adresszeile des Browsers an der 
              Bezeichnung "https://" und dem Schloss-Symbol erkennen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Ihre Betroffenenrechte</h2>
            <p className="text-gray-700">
              Sie haben das Recht auf Auskunft, Löschung, Berichtigung, Einschränkung der Verarbeitung, 
              Datenübertragbarkeit und Widerspruch gegen die Verarbeitung Ihrer personenbezogenen Daten.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Kontakt</h2>
            <p className="text-gray-700">
              Bei Fragen zum Datenschutz können Sie sich jederzeit an uns wenden:<br />
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
