
import React, { useState, useEffect } from 'react';
import { Phone, CheckCircle, Users, Clock, Award, Mail, MapPin, Instagram, ExternalLink, LogIn, Menu, X, MessageCircle, BookOpen, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ruangCeriteCredits, setRuangCeriteCredits] = useState(5);
  const [assistantCredits, setAssistantCredits] = useState(1);
  const [ruangCeriteMessage, setRuangCeriteMessage] = useState('');
  const [assistantMessage, setAssistantMessage] = useState('');
  const [ruangCeriteChat, setRuangCeriteChat] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [assistantChat, setAssistantChat] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  
  const whatsappNumber = "6289525035845"; // Updated WhatsApp number
  const whatsappMessage = "Halo! Saya tertarik dengan layanan bimbingan skripsi Pembimbingmu";

  // Load credits from localStorage on component mount
  useEffect(() => {
    const savedRuangCredits = localStorage.getItem('ruangCeriteCredits');
    const savedAssistantCredits = localStorage.getItem('assistantCredits');
    
    if (savedRuangCredits !== null) {
      setRuangCeriteCredits(parseInt(savedRuangCredits));
    }
    if (savedAssistantCredits !== null) {
      setAssistantCredits(parseInt(savedAssistantCredits));
    }
  }, []);

  // Save credits to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ruangCeriteCredits', ruangCeriteCredits.toString());
  }, [ruangCeriteCredits]);

  useEffect(() => {
    localStorage.setItem('assistantCredits', assistantCredits.toString());
  }, [assistantCredits]);

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRuangCeriteSend = () => {
    if (!ruangCeriteMessage.trim()) return;
    
    if (ruangCeriteCredits <= 0) {
      toast({
        title: "Kredit habis!",
        description: "Kredit Ruang Cerita Anda sudah habis. Silakan hubungi kami untuk mendapatkan lebih banyak kredit.",
        variant: "destructive"
      });
      return;
    }

    const newChat = [...ruangCeriteChat, { role: 'user' as const, content: ruangCeriteMessage }];
    setRuangCeriteChat(newChat);
    setRuangCeriteMessage('');
    setRuangCeriteCredits(prev => prev - 1);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Saya memahami perasaan Anda. Mengerjakan skripsi memang bisa terasa overwhelming. Coba break down tugas menjadi bagian kecil dan fokus satu per satu.",
        "Wajar kalau merasa tertekan menjelang sidang. Yang penting adalah persiapan yang matang. Sudah coba latihan presentasi di depan teman atau keluarga?",
        "Perasaan takut gagal itu normal. Ingat bahwa dosen pembimbing ingin Anda berhasil. Mereka ada untuk membantu, bukan menjatuhkan.",
        "Stress itu wajar, tapi jangan sampai berlebihan. Coba atur waktu dengan baik dan jangan lupa istirahat. Self-care juga penting loh!",
        "Setiap mahasiswa pasti merasakan hal yang sama. Kamu tidak sendirian! Fokus pada progress yang sudah dicapai, bukan yang belum."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setRuangCeriteChat(prev => [...prev, { role: 'assistant', content: randomResponse }]);
    }, 1000);
  };

  const handleAssistantSend = () => {
    if (!assistantMessage.trim()) return;
    
    if (assistantCredits <= 0) {
      toast({
        title: "Kredit habis!",
        description: "Kredit Asisten Akademik Anda sudah habis. Silakan hubungi kami untuk mendapatkan lebih banyak kredit.",
        variant: "destructive"
      });
      return;
    }

    const newChat = [...assistantChat, { role: 'user' as const, content: assistantMessage }];
    setAssistantChat(newChat);
    setAssistantMessage('');
    setAssistantCredits(prev => prev - 1);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Untuk bab pendahuluan yang baik, pastikan ada latar belakang masalah yang jelas, rumusan masalah, tujuan penelitian, dan manfaat penelitian. Semuanya harus saling terhubung.",
        "Tips metodologi penelitian: Pilih metode yang sesuai dengan jenis penelitian Anda. Jelaskan populasi, sampel, teknik pengumpulan data, dan analisis data secara detail.",
        "Untuk landasan teori yang kuat, gunakan referensi terbaru (5-10 tahun terakhir), kombinasikan buku dan jurnal, dan pastikan teori mendukung variable penelitian Anda.",
        "Struktur proposal yang baik: Judul, Pendahuluan, Landasan Teori, Metodologi, Daftar Pustaka. Pastikan setiap bab memiliki alur yang logis dan berkesinambungan.",
        "Tips menghadapi dosen pembimbing: Datang dengan persiapan matang, bawa draft yang sudah dibaca berkali-kali, dan siapkan pertanyaan spesifik untuk didiskusikan."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setAssistantChat(prev => [...prev, { role: 'assistant', content: randomResponse }]);
    }, 1000);
  };

  const packages = [
    {
      name: "BASIC",
      price: "Rp400.000",
      originalPrice: "Rp400K",
      sessions: "3X Bimbingan Online",
      features: [
        "Bimbingan dan Review Proposal",
        "3 kali bimbingan via GMeet/Zoom",
        "Free konsultasi by WA Group",
        "Free E-Book (Skripsi? Gampang Kok!)",
        "Free cek turnitin 3X"
      ],
      popular: false
    },
    {
      name: "PRO",
      price: "Rp700.000",
      originalPrice: "Rp700K",
      sessions: "6X Bimbingan Online",
      features: [
        "Bimbingan dan Review Proposal/Full Skripsi",
        "6 kali bimbingan via GMeet/Zoom",
        "Free konsultasi by WA Group",
        "Free E-Book (Skripsi? Gampang Kok!)",
        "Free ratusan template PPT",
        "Tutorial Parafrase & Turnitin",
        "Durasi kelas maksimal 2 Bulan",
        "Free cek turnitin 6X"
      ],
      popular: true
    },
    {
      name: "PREMIUM",
      price: "Rp1.200.000",
      originalPrice: "Rp1.200K",
      sessions: "9X Bimbingan Online",
      features: [
        "Bimbingan dan Review Proposal/Full Skripsi",
        "9 kali bimbingan via GMeet/Zoom",
        "Free konsultasi by WA Group",
        "Free E-Book (Skripsi? Gampang Kok!)",
        "Free ratusan template PPT",
        "Tutorial Parafrase & Turnitin",
        "Tutorial Mendeley & Zotero",
        "Jadwal Fleksibel",
        "Durasi kelas maksimal 3 Bulan",
        "Free cek turnitin 12X",
        "Dijamin ACC"
      ],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      text: "Alhamdulillah berkat bimbingan dari Pembimbingmu, skripsi saya ACC dalam 2 bulan! Pelayanannya sangat profesional dan sabar.",
      rating: 5
    },
    {
      name: "Ahmad R.",
      text: "Paket Premium benar-benar worth it! Dapat bimbingan lengkap dan dijamin ACC. Terima kasih Pembimbingmu!",
      rating: 5
    },
    {
      name: "Dinda K.",
      text: "E-book dan templatenya sangat membantu. Proses bimbingan juga fleksibel sesuai jadwal kuliah saya.",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "Bagaimana cara order bimbingan?",
      answer: "Anda bisa langsung menghubungi kami melalui WhatsApp atau mengisi form konsultasi. Tim kami akan membantu memilih paket yang sesuai kebutuhan."
    },
    {
      question: "Berapa lama durasi bimbingan?",
      answer: "Durasi berbeda sesuai paket: Basic (fleksibel), Pro (maksimal 2 bulan), Premium (maksimal 3 bulan)."
    },
    {
      question: "Apakah ada garansi ACC?",
      answer: "Paket Premium dilengkapi dengan garansi ACC. Untuk paket lain, kami memberikan bimbingan maksimal hingga proposal/skripsi Anda siap."
    },
    {
      question: "Sistem pembayaran bagaimana?",
      answer: "Pembayaran dilakukan lunas di awal sebelum sesi bimbingan dimulai. Kami menerima transfer bank dan e-wallet."
    },
    {
      question: "Apakah bimbingan dilakukan online?",
      answer: "Ya, semua sesi bimbingan dilakukan secara online melalui Google Meet atau Zoom sesuai kesepakatan."
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Pembimbingmu",
    "description": "Platform bimbingan skripsi profesional yang membantu mahasiswa menyelesaikan skripsi dengan sukses",
    "url": "https://pembimbingmu.lovable.app",
    "logo": "https://pembimbingmu.lovable.app/lovable-uploads/4138f2ab-bad4-411f-9975-e8576da5b472.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+62-895-2503-5845",
      "contactType": "customer service",
      "availableLanguage": "Indonesian"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "ID"
    },
    "sameAs": [
      "https://www.instagram.com/pembimbingmu"
    ],
    "offers": packages.map(pkg => ({
      "@type": "Offer",
      "name": `Paket ${pkg.name}`,
      "description": pkg.features.join(", "),
      "price": pkg.price.replace(/[^\d]/g, ''),
      "priceCurrency": "IDR"
    }))
  };

  return (
    <>
      <SEO 
        title="Pembimbingmu - Bimbingan Skripsi #1 di Indonesia | Mentor Berpengalaman"
        description="Platform bimbingan skripsi profesional dengan mentor berpengalaman. Paket Basic, Pro & Premium. Garansi ACC untuk paket premium. Konsultasi gratis sekarang!"
        canonical="https://pembimbingmu.lovable.app"
        jsonLd={structuredData}
      />
      <div className="min-h-screen bg-white">
        {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/4138f2ab-bad4-411f-9975-e8576da5b472.png" 
                alt="Pembimbingmu Logo" 
                className="h-10 md:h-12 w-auto"
              />
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-xl font-bold text-[#81b59a]">Pembimbingmu</h1>
                <p className="text-xs md:text-sm text-gray-600">Pendamping Terbaikmu Menuju Skripsi Auto ACC!</p>
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:block">
              <Button 
                onClick={handleLoginClick}
                className="bg-[#81b59a] hover:bg-[#6fa085] text-white font-semibold px-6 py-3 rounded-lg flex items-center space-x-2"
              >
                <LogIn className="h-4 w-4" />
                <span>Masuk</span>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4">
              <div className="flex flex-col space-y-4">
                <div className="text-center">
                  <h1 className="text-lg font-bold text-[#81b59a]">Pembimbingmu</h1>
                  <p className="text-sm text-gray-600">Pendamping Terbaikmu Menuju Skripsi Auto ACC!</p>
                </div>
                <Button 
                  onClick={handleLoginClick}
                  className="bg-[#81b59a] hover:bg-[#6fa085] text-white font-semibold px-6 py-3 rounded-lg flex items-center justify-center space-x-2 w-full"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Masuk</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#81b59a] to-[#6fa085] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Bimbingan Skripsi #1 di Indonesia
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Wujudkan impian lulus tepat waktu dengan bimbingan profesional dari mentor berpengalaman
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button 
              onClick={handleWhatsAppClick}
              size="lg" 
              className="bg-white text-[#81b59a] hover:bg-gray-100 font-semibold px-8 py-4"
            >
              <Phone className="mr-2 h-5 w-5" />
              Konsultasi Gratis Sekarang
            </Button>
            <Button 
              size="lg" 
              className="bg-[#81b59a] border-2 border-white text-white hover:bg-white hover:text-[#81b59a] font-semibold px-8 py-4 transition-all duration-300"
              onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Lihat Paket Bimbingan
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Tentang Pembimbingmu</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Pembimbingmu adalah platform bimbingan skripsi profesional yang telah membantu ribuan mahasiswa 
              menyelesaikan skripsi dengan sukses. Kami berkomitmen memberikan layanan terbaik dengan mentor 
              berpengalaman dan metode pembelajaran yang terbukti efektif.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[#81b59a] text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1000+ Mahasiswa</h3>
              <p className="text-gray-600">Telah berhasil lulus dengan bimbingan kami</p>
            </div>
            <div className="text-center">
              <div className="bg-[#81b59a] text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mentor Profesional</h3>
              <p className="text-gray-600">Tim mentor berpengalaman dan tersertifikasi</p>
            </div>
            <div className="text-center">
              <div className="bg-[#81b59a] text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Garansi ACC</h3>
              <p className="text-gray-600">Jaminan ACC untuk paket premium</p>
            </div>
          </div>
        </div>
      </section>

      {/* Chatbot Products Section */}
      <section className="py-16 bg-gradient-to-br from-[#81b59a]/10 to-[#6fa085]/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Asisten AI Pembimbingmu</h2>
            <p className="text-lg text-gray-600">Dapatkan bantuan instan untuk perjalanan skripsi Anda</p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            {/* Chat Interface */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Top Controls Panel */}
              <div className="bg-white p-4 sm:p-6 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-black text-lg sm:text-xl font-semibold">Asisten Skripsi AI</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#81b59a] rounded-full"></div>
                      <span className="text-[#81b59a] text-sm">Online</span>
                    </div>
                  </div>

                  {/* Mode Selector */}
                  <div className="bg-gray-100 rounded-lg p-1 flex w-full sm:w-auto">
                    <button
                      className="flex-1 text-center px-4 py-2 rounded-md text-sm font-medium bg-[#81b59a] text-white shadow-lg"
                    >
                      Ruang Cerita ({ruangCeriteCredits})
                    </button>
                    <button
                      className="flex-1 text-center px-4 py-2 rounded-md text-sm font-medium text-black/70"
                    >
                      Asisten Akademik ({assistantCredits})
                    </button>
                  </div>
                </div>

                {/* Mode Description */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-black text-sm">
                    <p className="mb-2"><strong>Ruang Cerita:</strong> ✅ Berbagi cerita, mengatasi stres, & mencari motivasi</p>
                    <p><strong>Asisten Akademik:</strong> ✅ Tips metodologi, struktur penulisan, & panduan akademik</p>
                  </div>
                </div>
              </div>

              {/* Chat Area - Side by Side */}
              <div className="flex flex-col lg:flex-row min-h-[500px]">
                {/* Ruang Cerita Chat */}
                <div className="flex-1 flex flex-col border-r border-gray-200">
                  <div className="bg-[#81b59a] text-white p-3 text-center">
                    <h4 className="font-semibold">Ruang Cerita</h4>
                    <p className="text-xs">Tempat curhat & motivasi</p>
                  </div>
                  
                  {/* Chat Messages */}
                  <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50" style={{ maxHeight: '300px' }}>
                    {ruangCeriteChat.length === 0 ? (
                      <div className="text-center text-gray-500 mt-8">
                        <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Ceritakan keresahan skripsi Anda...</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {ruangCeriteChat.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                              msg.role === 'user' 
                                ? 'bg-[#81b59a] text-white' 
                                : 'bg-white border border-gray-200 text-gray-800'
                            }`}>
                              {msg.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Input Area */}
                  <div className="p-3 border-t bg-white">
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="Ceritakan keresahan Anda..."
                        value={ruangCeriteMessage}
                        onChange={(e) => setRuangCeriteMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleRuangCeriteSend()}
                        className="flex-1 text-sm"
                        disabled={ruangCeriteCredits <= 0}
                      />
                      <Button 
                        onClick={handleRuangCeriteSend}
                        disabled={ruangCeriteCredits <= 0 || !ruangCeriteMessage.trim()}
                        className="bg-[#81b59a] hover:bg-[#6fa085] text-white"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Kredit tersisa: {ruangCeriteCredits}</p>
                  </div>
                </div>

                {/* Asisten Akademik Chat */}
                <div className="flex-1 flex flex-col">
                  <div className="bg-[#6fa085] text-white p-3 text-center">
                    <h4 className="font-semibold">Asisten Akademik</h4>
                    <p className="text-xs">Tips & panduan skripsi</p>
                  </div>
                  
                  {/* Chat Messages */}
                  <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50" style={{ maxHeight: '300px' }}>
                    {assistantChat.length === 0 ? (
                      <div className="text-center text-gray-500 mt-8">
                        <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Tanyakan tips skripsi Anda...</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {assistantChat.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                              msg.role === 'user' 
                                ? 'bg-[#6fa085] text-white' 
                                : 'bg-white border border-gray-200 text-gray-800'
                            }`}>
                              {msg.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Input Area */}
                  <div className="p-3 border-t bg-white">
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="Tanyakan tips tentang skripsi..."
                        value={assistantMessage}
                        onChange={(e) => setAssistantMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAssistantSend()}
                        className="flex-1 text-sm"
                        disabled={assistantCredits <= 0}
                      />
                      <Button 
                        onClick={handleAssistantSend}
                        disabled={assistantCredits <= 0 || !assistantMessage.trim()}
                        className="bg-[#6fa085] hover:bg-[#81b59a] text-white"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Kredit tersisa: {assistantCredits}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <p className="text-gray-600 mb-4">Ingin kredit tambahan atau bimbingan penuh?</p>
              <Button 
                onClick={handleWhatsAppClick}
                className="bg-[#81b59a] hover:bg-[#6fa085] text-white px-6 py-3"
              >
                <Phone className="mr-2 h-4 w-4" />
                Hubungi Kami di WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Layanan Bimbingan Skripsi Terbaik</h2>
            <p className="text-lg text-gray-600">Pilih layanan yang sesuai dengan kebutuhan Anda</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-[#81b59a]">Bimbingan Proposal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Bimbingan khusus untuk penyusunan proposal skripsi yang solid dan terarah</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-[#81b59a]">Bimbingan Full Skripsi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Bimbingan komprehensif dari proposal hingga skripsi siap sidang</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-[#81b59a]">Review & Konsultasi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Layanan review mendalam dan konsultasi untuk perbaikan skripsi</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing-section" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Pricelist Paket Bimbingan Skripsi S1</h2>
            <p className="text-lg text-gray-600 mb-4">Pilih paket yang sesuai dengan kebutuhan Anda</p>
            <div className="bg-[#81b59a] text-white px-4 py-2 rounded-lg inline-block">
              <strong>NB: Harga sudah fix dan sistem pembayaran lunas di awal</strong>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <Card key={index} className={`relative hover:shadow-xl transition-shadow ${pkg.popular ? 'border-[#81b59a] border-2' : ''}`}>
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#81b59a] text-white">
                    MOST POPULAR
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-[#81b59a]">{pkg.name}</CardTitle>
                  <CardDescription className="text-lg">{pkg.sessions}</CardDescription>
                  <div className="text-3xl font-bold text-gray-800 mt-4">{pkg.price}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-[#81b59a] mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={handleWhatsAppClick}
                    className={`w-full mt-6 ${pkg.popular ? 'bg-[#81b59a] hover:bg-[#6fa085]' : 'bg-gray-800 hover:bg-gray-700'} text-white`}
                  >
                    Pilih Paket {pkg.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Legality Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">Legalitas & Kepercayaan</h2>
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Award className="h-12 w-12 text-[#81b59a] mr-4" />
              <div>
                <h3 className="text-xl font-semibold text-gray-800">CV Daya Arta Ananta</h3>
                <p className="text-gray-600">Berbadan Hukum Legal & Terdaftar</p>
              </div>
            </div>
            <p className="text-lg text-gray-700">
              <strong>Kami sudah legal di bawah naungan CV Daya Arta Ananta dan sudah memiliki izin usaha.</strong>
            </p>
            <p className="text-gray-600 mt-4">
              Kepercayaan Anda adalah prioritas utama kami. Semua layanan dilakukan secara profesional 
              dengan standar kualitas tinggi.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Apa Kata Klien Kami?</h2>
            <p className="text-lg text-gray-600">Testimoni dari mahasiswa yang telah berhasil lulus</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <div key={i} className="text-yellow-400 text-lg">★</div>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                  <div className="flex items-center">
                    <div className="bg-[#81b59a] text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">Mahasiswa S1</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Pertanyaan yang Sering Diajukan</h2>
            <p className="text-lg text-gray-600">Temukan jawaban untuk pertanyaan umum</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-semibold text-gray-800">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Digital Products Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Produk Digital Kami</h2>
            <p className="text-lg text-gray-600">Dapatkan panduan dan template untuk mendukung skripsi Anda</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="bg-[#81b59a] text-white p-8 rounded-lg text-center mb-4">
                  <h3 className="text-2xl font-bold">E-Book</h3>
                  <p className="text-lg">Skripsi? Gampang Kok!</p>
                </div>
                <CardTitle className="text-xl">E-Book Panduan Skripsi</CardTitle>
                <CardDescription>
                  Panduan lengkap dan praktis untuk menyelesaikan skripsi dengan mudah
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <span className="text-3xl font-bold text-[#81b59a]">Rp20.000</span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-[#81b59a] mr-2" />
                    <span className="text-sm">Tips & Trik Menulis Skripsi</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-[#81b59a] mr-2" />
                    <span className="text-sm">Strategi Menghadapi Dosen</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-[#81b59a] mr-2" />
                    <span className="text-sm">Template Proposal & Skripsi</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => window.open('http://lynk.id/pembimbingmu/2jPD6RL/checkout', '_blank')}
                  className="w-full bg-[#81b59a] hover:bg-[#6fa085] text-white"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Beli E-Book Sekarang
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="bg-[#81b59a] text-white p-8 rounded-lg text-center mb-4">
                  <h3 className="text-2xl font-bold">Template</h3>
                  <p className="text-lg">Work List Skripsi</p>
                </div>
                <CardTitle className="text-xl">Template Work List Skripsi</CardTitle>
                <CardDescription>
                  Template terstruktur untuk manajemen waktu dan progress skripsi Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <span className="text-3xl font-bold text-[#81b59a]">Rp15.000</span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-[#81b59a] mr-2" />
                    <span className="text-sm">Timeline Pengerjaan Skripsi</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-[#81b59a] mr-2" />
                    <span className="text-sm">Checklist Progress Harian</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-[#81b59a] mr-2" />
                    <span className="text-sm">Template Excel Siap Pakai</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => window.open('http://lynk.id/pembimbingmu/djdv4e263p1g/checkout', '_blank')}
                  className="w-full bg-[#81b59a] hover:bg-[#6fa085] text-white"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Dapatkan Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Hubungi Kami</h2>
            <p className="text-lg text-gray-600">Siap membantu Anda mencapai kesuksesan akademik</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-[#81b59a] mb-6">Informasi Kontak</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-[#81b59a] mr-3" />
                    <div>
                      <p className="font-semibold">WhatsApp</p>
                      <p className="text-gray-600">089525035845</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-[#81b59a] mr-3" />
                    <div>
                      <p className="font-semibold">Email</p>
                      <p className="text-gray-600">jasauntuktugasmu@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-[#81b59a] mr-3" />
                    <div>
                      <p className="font-semibold">Alamat</p>
                      <p className="text-gray-600">Perum Puspa Asri Blok R1 No 2<br />Plalangan Jenangan Ponorogo</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-[#81b59a] mr-3" />
                    <div>
                      <p className="font-semibold">Jam Operasional</p>
                      <p className="text-gray-600">Senin-Sabtu, 09.00 - 16.00 WIB</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-[#81b59a] mb-6">Mulai Konsultasi</h3>
                <p className="text-gray-600 mb-6">
                  Jangan biarkan skripsi menjadi penghalang kesuksesan Anda. 
                  Hubungi kami sekarang untuk konsultasi gratis!
                </p>
                <div className="space-y-4">
                  <Button 
                    onClick={handleWhatsAppClick}
                    className="w-full bg-[#81b59a] hover:bg-[#6fa085] text-white py-3"
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    Chat WhatsApp
                  </Button>
                  <Button 
                    onClick={() => window.open('https://www.instagram.com/pembimbingmu.co/', '_blank')}
                    variant="outline" 
                    className="w-full border-[#81b59a] text-[#81b59a] hover:bg-[#81b59a] hover:text-white py-3"
                  >
                    <Instagram className="mr-2 h-5 w-5" />
                    Follow Instagram
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#81b59a] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img 
                  src="/lovable-uploads/059db273-4d94-449f-a0c2-0239dda77753.png" 
                  alt="Pembimbingmu Logo" 
                  className="h-10 w-auto mr-3"
                />
                <h3 className="text-xl font-bold">Pembimbingmu</h3>
              </div>
              <p className="text-green-100 mb-4">
                Pendamping terpercaya dalam perjalanan akademik Anda menuju kesuksesan.
              </p>
              <p className="text-green-100 text-sm">
                © 2024 Pembimbingmu. All rights reserved.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Kontak Cepat</h4>
              <div className="space-y-2 text-green-100">
                <p className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  089525035845
                </p>
                <p className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  jasauntuktugasmu@gmail.com
                </p>
                <p className="flex items-center">
                  <Instagram className="h-4 w-4 mr-2" />
                  @pembimbingmu.co
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Layanan Kami</h4>
              <ul className="space-y-2 text-green-100">
                <li>Bimbingan Proposal Skripsi</li>
                <li>Bimbingan Full Skripsi</li>
                <li>Review & Konsultasi</li>
                <li>Produk Digital</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-green-400 mt-8 pt-8 text-center">
            <p className="text-green-100">
              <strong>Wujudkan impian lulus tepat waktu bersama Pembimbingmu</strong>
            </p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};

export default Index;
