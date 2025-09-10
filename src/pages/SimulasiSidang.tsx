import SEO from '@/components/SEO';

export default function SimulasiSidang() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://pembimbingmu.lovable.app/dashboard/simulasi-sidang",
    "name": "Simulasi Sidang Voicebot - Pembimbingmu",
    "description": "Simulasi sidang skripsi dengan voicebot AI untuk latihan presentasi dan tanya jawab",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Pembimbingmu",
      "url": "https://pembimbingmu.lovable.app"
    }
  };

  return (
    <>
      <SEO 
        title="Simulasi Sidang Voicebot - Coming Soon | Pembimbingmu"
        description="Fitur Simulasi Sidang dengan Voicebot AI akan segera hadir. Latih presentasi dan tanya jawab sidang skripsi Anda."
        canonical="https://pembimbingmu.lovable.app/dashboard/simulasi-sidang"
        jsonLd={structuredData}
      />
      <div className="max-w-[900px] mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Simulasi Sidang Voicebot
          </h1>
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-8 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">🚧 Coming Soon</h2>
            <p className="text-lg">
              Fitur Simulasi Sidang dengan Voicebot AI sedang dalam tahap pengembangan dan akan segera hadir!
            </p>
            <p className="mt-4 text-sm">
              Nantikan simulasi sidang interaktif dengan voice AI untuk latihan presentasi dan sesi tanya jawab.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}