
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
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import ReviewDisplay from '@/components/learning/ReviewDisplay';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentMode, setCurrentMode] = useState<'ruang_cerita' | 'asisten_akademik'>('ruang_cerita');
  const [sessionDocumentId, setSessionDocumentId] = useState<string>('');
  const [sessionId] = useState<string>(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [showUploadStatus, setShowUploadStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Message states for each mode
  const [ruangCeritaMessages, setRuangCeritaMessages] = useState<Array<{id: string, content: string, isBot: boolean, timestamp: Date}>>([
    {
      id: '1',
      content: 'Halo! Selamat datang di Ruang Cerita. Saya di sini untuk mendengarkan cerita Anda dan memberikan dukungan motivasi. Bagaimana kabar Anda hari ini?',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  
  const [asistenAkademikMessages, setAsistenAkademikMessages] = useState<Array<{id: string, content: string, isBot: boolean, timestamp: Date}>>([
    {
      id: '1',
      content: 'Halo! Saya Asisten Akademik yang akan membantu menganalisis skripsi Anda. Silakan unggah dokumen skripsi terlebih dahulu untuk memulai konsultasi.',
      isBot: true,
      timestamp: new Date()
    }
  ]);

  const [ruangCeriteCredits, setRuangCeriteCredits] = useState(5);
  const [assistantCredits, setAssistantCredits] = useState(1);
  const [inputMessage, setInputMessage] = useState('');
  
  // Database packages state
  const [dbPackages, setDbPackages] = useState<any[]>([]);
  const whatsappNumber = "6289525035845";
  const whatsappMessage = "Halo! Saya tertarik dengan layanan bimbingan skripsi Pembimbingmu";
  
  // Get current messages and setters based on mode
  const messages = currentMode === 'ruang_cerita' ? ruangCeritaMessages : asistenAkademikMessages;
  const setMessages = currentMode === 'ruang_cerita' ? setRuangCeritaMessages : setAsistenAkademikMessages;

  const webhookUrls = {
    ruang_cerita: 'https://n8n.allmanagement.id/webhook/ruangcerita',
    asisten_akademik: 'https://n8n.allmanagement.id/webhook/botkonsultasiskripsi'
  };

  const modeDescriptions = {
    ruang_cerita: "✅ **Bisa untuk:** Berbagi cerita, mengatasi stres, & mencari motivasi. ❌ **Tidak bisa untuk:** Analisis dokumen & pertanyaan teknis.",
    asisten_akademik: "✅ **Bisa untuk:** Analisis dokumen, cari referensi, & tanya metodologi. ❌ **Wajib:** Unggah dokumen skripsi Anda terlebih dahulu."
  };

  // Scroll detection for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Fetch packages from database
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data, error } = await supabase
          .from('paket_pembelajaran')
          .select('*');
        
        if (error) {
          console.error('Error fetching packages:', error);
        } else {
          // Custom ordering: Basic, Pro, Premium
          const orderedPackages = (data || []).sort((a, b) => {
            const order = ['basic', 'pro', 'premium'];
            const aIndex = order.findIndex(type => a.nama_paket.toLowerCase().includes(type));
            const bIndex = order.findIndex(type => b.nama_paket.toLowerCase().includes(type));
            
            if (aIndex === -1 && bIndex === -1) return 0;
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            
            return aIndex - bIndex;
          });
          
          setDbPackages(orderedPackages);
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
      }
    };

    fetchPackages();
  }, []);

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleModeChange = (mode: 'ruang_cerita' | 'asisten_akademik') => {
    setCurrentMode(mode);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(file.type) && ext !== 'pdf' && ext !== 'docx') {
      toast({
        title: "File tidak didukung",
        description: "Hanya file PDF dan DOCX yang diizinkan.",
        variant: "destructive"
      });
      return;
    }

    setUploadStatus('Sebentar, saya baca dan proses dulu dokumennya skripsimu ya...');
    setShowUploadStatus(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('https://n8n.allmanagement.id/webhook/inputskripsi', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      const documentId = data.documentId || data.document_id || data.id || '';
      setSessionDocumentId(documentId);

      setUploadStatus('Skripsi berhasil saya baca!');
      
      setTimeout(() => {
        setShowUploadStatus(false);
      }, 3000);

      const welcomeMessage = {
        id: `welcome_${Date.now()}`,
        content: 'Baik, Skripsi Anda sudah saya terima. Silakan ajukan pertanyaan terkait skripsi Anda.',
        isBot: true,
        timestamp: new Date()
      };
      setAsistenAkademikMessages(prev => [...prev, welcomeMessage]);

    } catch (err) {
      console.error('Upload failed', err);
      setUploadStatus('Gagal mengunggah dokumen. Silakan coba lagi.');
      setTimeout(() => {
        setShowUploadStatus(false);
      }, 3000);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Check credits
    const currentCredits = currentMode === 'ruang_cerita' ? ruangCeriteCredits : assistantCredits;
    if (currentCredits <= 0) {
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Deduct credits
    if (currentMode === 'ruang_cerita') {
      setRuangCeriteCredits(prev => prev - 1);
    } else {
      setAssistantCredits(prev => prev - 1);
    }

    try {
      let payload;
      
      if (currentMode === 'ruang_cerita') {
        payload = {
          message: inputMessage,
          sessionId: sessionId
        };
      } else {
        payload = {
          message: inputMessage,
          documentId: sessionDocumentId
        };
      }

      const response = await fetch(webhookUrls[currentMode], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      const botMessage = {
        id: (Date.now() + 1).toString(),
        content: result.message || result.response || 'Maaf, terjadi kesalahan dalam memproses pesan Anda.',
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Maaf, terjadi kesalahan koneksi. Silakan coba lagi.',
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const packages = [
    {
      name: "BASIC",
      price: "Rp400.000",
      originalPrice: "Rp400K",
      sessions: "6X Bimbingan Online",
      features: [
        "Bimbingan dan Review Proposal",
        "6 kali bimbingan via GMeet/Zoom",
        "Free bimbingan by WA Group",
        "Free E-Book Promt Master Mencari Judul yang Auto ACC (paling dicari)",
        "Free E-Book Promt Master Proposal BAB 1-3 (paling dicari)",
        "Free Template Proposal BAB 1-3 sudah rapi & siap pakai (paling dicari)",
        "Free E-Book (Skripsi? Gampang Kok!) (paling dicari)",
        "Free Template PPT",
        "Free Akses Diskusi dengan Dosen Pembimbing AI by Pembimbingmu.com",
        "Free Template Planing Skripsi (Jadwal Terstruktur Skripsi Selesai Maksimal 4 Bulan)",
        "Free cek turnitin 3X",
        "Durasi Kelas Maksimal 1 Bulan"
      ],
      popular: false
    },
    {
      name: "PRO",
      price: "Rp700.000",
      originalPrice: "Rp700K",
      sessions: "12X Bimbingan Online",
      features: [
        "Bimbingan dan Review Proposal/Full Skripsi & Tesis",
        "12 kali bimbingan via GMeet/Zoom",
        "Free bimbingan by WA Group",
        "Free E-Book Promt Master BAB 4-5 Hasil & Pembahasan (paling dicari)",
        "Free E-Book Promt Master Mencari Judul yang Auto ACC (paling dicari)",
        "Free E-Book Promt Master Proposal BAB 1-3 (paling dicari)",
        "Free Template Proposal BAB 1-3 sudah rapi & siap pakai (paling dicari)",
        "Free E-Book (Skripsi? Gampang Kok!) (paling dicari)",
        "Free ratusan template PPT",
        "Free Akses Diskusi dengan Dosen Pembimbing AI by Pembimbingmu.com",
        "Free Template Planing Skripsi (Jadwal Terstruktur Skripsi Selesai Maksimal 4 Bulan)",
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
      sessions: "18X Bimbingan Online",
      features: [
        "Bimbingan dan Review Proposal/Full Skripsi & Tesis",
        "18 kali bimbingan via GMeet/Zoom",
        "Free bimbingan by WA Group",
        "Free E-Book Promt Master BAB 4-5 Hasil & Pembahasan (paling dicari)",
        "Free E-Book Promt Master Mencari Judul yang Auto ACC (paling dicari)",
        "Free E-Book Promt Master Proposal BAB 1-3 (paling dicari)",
        "Free Template Proposal BAB 1-3 sudah rapi & siap pakai (paling dicari)",
        "Free Template Artikel & Jurnal Siap pakai (paling dicari)",
        "Free E-Book 50+ Pertanyaan Sidang & Cara Jawabnya (paling dicari)",
        "Free E-Book (Skripsi? Gampang Kok!) (paling dicari)",
        "Free ratusan template PPT",
        "Tutorial Parafrase & Turnitin",
        "Tutorial Mendeley & Zotero",
        "Free Akses Diskusi dengan Dosen Pembimbing AI by Pembimbingmu.com",
        "Free Template Planing Skripsi (Jadwal Terstruktur Skripsi Selesai Maksimal 4 Bulan)",
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
      <header className={`
        bg-white/95 backdrop-blur-md 
        sticky top-0 z-50
        transition-all duration-300 ease-in-out
        ${isScrolled 
          ? 'shadow-lg py-3' 
          : 'shadow-sm py-4'
        }
      `}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/4138f2ab-bad4-411f-9975-e8576da5b472.png" 
                alt="Pembimbingmu Logo" 
                className={`
                  w-auto transition-all duration-300 ease-in-out
                  ${isScrolled 
                    ? 'h-8 md:h-10' 
                    : 'h-10 md:h-12'
                  }
                `}
              />
              <div className={`
                hidden sm:block 
                transition-opacity duration-300
                ${isScrolled ? 'opacity-90' : 'opacity-100'}
              `}>
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

          {/* Mobile Brand Info - Outside Navigation */}
          <div className="sm:hidden mt-3 text-center">
            <h1 className="text-lg font-bold text-[#81b59a]">Pembimbingmu</h1>
            <p className="text-sm text-gray-600">Pendamping Terbaikmu Menuju Skripsi Auto ACC!</p>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t pt-4 animate-in slide-in-from-top-2 duration-300">
              <Button 
                onClick={handleLoginClick}
                className="bg-[#81b59a] hover:bg-[#6fa085] text-white font-semibold px-6 py-3 rounded-lg flex items-center justify-center space-x-2 w-full"
              >
                <LogIn className="h-4 w-4" />
                <span>Masuk</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#81b59a] via-[#6fa085] to-[#81b59a] text-white py-8 sm:py-12 md:py-16 lg:py-20 overflow-hidden">
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
        
        <div className="container mx-auto px-3 sm:px-4 text-center relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight animate-fade-in">
            Bimbingan Skripsi #1 di Indonesia
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-6 md:mb-8 max-w-3xl mx-auto px-2 leading-relaxed">
            Wujudkan impian lulus tepat waktu dengan bimbingan profesional dari mentor berpengalaman
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center max-w-md sm:max-w-none mx-auto">
            <Button 
              onClick={handleWhatsAppClick}
              size="lg" 
              className="w-full sm:w-auto bg-white text-[#81b59a] hover:bg-gray-100 font-semibold px-6 sm:px-8 py-3 sm:py-4 touch-target"
            >
              <Phone className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Konsultasi Gratis Sekarang</span>
            </Button>
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-[#81b59a] border-2 border-white text-white hover:bg-white hover:text-[#81b59a] font-semibold px-6 sm:px-8 py-3 sm:py-4 transition-all duration-300 touch-target"
              onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span className="text-sm sm:text-base">Lihat Paket Bimbingan</span>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4">Tentang Pembimbingmu</h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto px-2 leading-relaxed">
              Pembimbingmu adalah platform bimbingan skripsi profesional yang telah membantu ribuan mahasiswa 
              menyelesaikan skripsi dengan sukses. Kami berkomitmen memberikan layanan terbaik dengan mentor 
              berpengalaman dan metode pembelajaran yang terbukti efektif.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="text-center p-4 sm:p-6 rounded-xl transition-all duration-300 hover:bg-gray-50 hover:shadow-md group">
              <div className="bg-gradient-to-br from-[#81b59a] to-[#6fa085] text-white rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2">1000+ Mahasiswa</h3>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed">Telah berhasil lulus dengan bimbingan kami</p>
            </div>
            <div className="text-center p-4 sm:p-6 rounded-xl transition-all duration-300 hover:bg-gray-50 hover:shadow-md group">
              <div className="bg-gradient-to-br from-[#81b59a] to-[#6fa085] text-white rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2">Mentor Profesional</h3>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed">Tim mentor berpengalaman dan tersertifikasi</p>
            </div>
            <div className="text-center p-4 sm:p-6 rounded-xl transition-all duration-300 hover:bg-gray-50 hover:shadow-md group sm:col-span-2 md:col-span-1">
              <div className="bg-gradient-to-br from-[#81b59a] to-[#6fa085] text-white rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2">Garansi ACC</h3>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed">Jaminan ACC untuk paket premium</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Assistant Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-[#81b59a]/10 to-[#6fa085]/10">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4">Asisten AI Pembimbingmu</h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-4 sm:mb-6 md:mb-8 px-2 leading-relaxed">Dapatkan bantuan instan untuk perjalanan skripsi Anda</p>
            
            <Button 
              onClick={() => {
                setShowChatbot(!showChatbot);
                if (!showChatbot) {
                  setTimeout(() => {
                    document.getElementById('chatbot-section')?.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'start' 
                    });
                  }, 100);
                }
              }}
              size="lg"
              className="bg-[#81b59a] hover:bg-[#6fa085] text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-lg touch-target"
            >
              <span className="text-sm sm:text-base">{showChatbot ? 'Tutup Assistant' : 'Coba Sekarang'}</span>
            </Button>
          </div>
          
          {/* Chatbot Interface - Only show when toggled */}
          {showChatbot && (
            <div id="chatbot-section" className="w-full max-w-lg mx-auto px-2 sm:px-0">
              {/* Show credit exhaustion message when both credits are zero */}
              {ruangCeriteCredits <= 0 && assistantCredits <= 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 text-center mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-2">
                    Kredit uji coba kamu habis, yah
                  </h3>
                  <p className="text-red-700 mb-4 text-sm">
                    Silahkan dapatkan akses penuh untuk melanjutkan menggunakan asisten AI
                  </p>
                  <Button 
                    onClick={() => window.open('http://lynk.id/pembimbingmu/xwek5peo1noy', '_blank')}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm touch-target"
                  >
                    <Phone className="mr-2 h-3 w-3" />
                    Dapatkan Akses Disini
                  </Button>
                </div>
              )}
              
              {/* Show chatbot interface only when there are credits */}
              {(ruangCeriteCredits > 0 || assistantCredits > 0) && (
                <>
                  {/* Mode Tabs - Mobile Optimized */}
                  <div className="bg-white rounded-xl p-1 mb-4 shadow-sm flex">
                    <button
                      onClick={() => handleModeChange('ruang_cerita')}
                      disabled={ruangCeriteCredits <= 0}
                      className={`flex-1 py-2 sm:py-3 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-all touch-target ${
                        currentMode === 'ruang_cerita'
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-600 hover:text-gray-900'
                      } ${ruangCeriteCredits <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="hidden sm:inline">Ruang Cerita ({ruangCeriteCredits})</span>
                      <span className="sm:hidden">Cerita ({ruangCeriteCredits})</span>
                    </button>
                    <button
                      onClick={() => handleModeChange('asisten_akademik')}
                      disabled={assistantCredits <= 0}
                      className={`flex-1 py-2 sm:py-3 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-all touch-target ${
                        currentMode === 'asisten_akademik'
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-600 hover:text-gray-900'
                      } ${assistantCredits <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="hidden sm:inline">Asisten Akademik ({assistantCredits})</span>
                      <span className="sm:hidden">Akademik ({assistantCredits})</span>
                    </button>
                  </div>

                  {/* Info Card - Compact */}
                  <div className="bg-white rounded-xl p-3 mb-4 shadow-sm">
                    <div className="text-sm text-gray-700 space-y-1">
                      {currentMode === 'ruang_cerita' ? (
                        <div>
                          <p><span className="text-green-600 font-medium">✓</span> Berbagi cerita & motivasi</p>
                          <p><span className="text-red-500 font-medium">✗</span> Analisis dokumen</p>
                        </div>
                      ) : (
                        <div>
                          <p><span className="text-green-600 font-medium">✓</span> Analisis dokumen skripsi</p>
                          <p><span className="text-orange-500 font-medium">!</span> Wajib upload dokumen dulu</p>
                        </div>
                      )}
                    </div>

                    {/* File Upload - Only show when needed */}
                    {currentMode === 'asisten_akademik' && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <input
                          type="file"
                          accept=".pdf,.docx"
                          onChange={handleFileUpload}
                          className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 file:font-medium hover:file:bg-green-100 cursor-pointer"
                        />
                        {showUploadStatus && (
                          <p className="text-xs text-gray-500 mt-2">{uploadStatus}</p>
                        )}
                      </div>
                    )}
                  </div>

                   {/* Chat Container - Full Focus */}
                  <div className="bg-white rounded-xl shadow-md flex flex-col" style={{ height: '55vh', maxHeight: '600px' }}>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-xl px-3 py-2 ${
                              message.isBot
                                ? 'bg-gray-50 text-gray-900'
                                : 'bg-green-600 text-white'
                            }`}
                          >
                            {message.isBot ? (
                              <div className="text-sm leading-relaxed prose-sm prose-green max-w-none">
                                <div className="[&>p]:my-1 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-gray-900 [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:ml-4 [&_ol]:my-2 [&_li]:my-0.5">
                                  <ReactMarkdown 
                                    components={{
                                      strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                                      p: ({ children }) => <p className="my-1">{children}</p>,
                                    }}
                                  >
                                    {message.content}
                                  </ReactMarkdown>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm">{message.content}</p>
                            )}
                            <div className={`text-xs mt-1 ${message.isBot ? 'text-gray-500' : 'text-white/80'}`}>
                              {message.timestamp.toLocaleTimeString('id-ID', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </div>
                      ))}

                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-gray-50 rounded-xl px-3 py-2">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                              </div>
                              <span className="text-xs text-gray-500">Mengetik...</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Input - Clean & Focused */}
                    <div className="p-3 border-t border-gray-100">
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                          placeholder="Tulis pesan..."
                          className="flex-1 border-gray-200 text-sm focus:border-green-500 focus:ring-green-500/20 rounded-lg"
                          disabled={isLoading || (currentMode === 'ruang_cerita' ? ruangCeriteCredits <= 0 : assistantCredits <= 0)}
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={isLoading || !inputMessage.trim() || (currentMode === 'ruang_cerita' ? ruangCeriteCredits <= 0 : assistantCredits <= 0)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white px-3 rounded-lg"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        Kredit tersisa: {currentMode === 'ruang_cerita' ? ruangCeriteCredits : assistantCredits}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
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
      </section>

      {/* Services Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4">Layanan Bimbingan Skripsi Terbaik</h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">Pilih layanan yang sesuai dengan kebutuhan Anda</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#81b59a]">Bimbingan Proposal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Bimbingan khusus untuk penyusunan proposal skripsi yang solid dan terarah</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#81b59a]">Bimbingan Full Skripsi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Bimbingan komprehensif dari proposal hingga skripsi siap sidang</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-sm">
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

      {/* Free Materials Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">Materi Gratis! Pelajari Sekarang!</h2>
            <p className="text-base sm:text-lg text-gray-600 px-2">Akses video pembelajaran berkualitas untuk membantu perjalanan skripsi Anda</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Video 1 */}
            <Card className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border-0">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 text-center">
                  Menyusun Judul + Mencari Puluhan Jurnal Pendukung Menggunakan AI
                </h3>
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src="https://www.youtube.com/embed/3Rgxq5kdrJw"
                    title="Menyusun Judul + Mencari Puluhan Jurnal Pendukung Menggunakan AI"
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className="text-sm sm:text-base text-gray-600 mt-4 text-center">
                  Pelajari cara menyusun judul skripsi yang menarik dan temukan puluhan jurnal pendukung dengan mudah menggunakan teknologi AI
                </p>
              </CardContent>
            </Card>

            {/* Video 2 */}
            <Card className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border-0">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 text-center">
                  Menentukan Metode Penelitian yang Baik dan Benar
                </h3>
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src="https://www.youtube.com/embed/E7cBcsrtJGE"
                    title="Menentukan Metode Penelitian yang Baik dan Benar"
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className="text-sm sm:text-base text-gray-600 mt-4 text-center">
                  Pahami cara memilih metodologi penelitian yang tepat untuk skripsi Anda
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Learning Packages Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">Paket Pembelajaran</h2>
            <p className="text-base sm:text-lg text-gray-600 px-2">Pilih paket pembelajaran yang sesuai dengan kebutuhan Anda</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto">
            {dbPackages.map((pkg) => (
              <Card key={pkg.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border-0 group">
                {/* Course Thumbnail */}
                <div className="relative overflow-hidden">
                  {pkg.thumbnail_url ? (
                    <img 
                      src={pkg.thumbnail_url} 
                      alt={pkg.nama_paket}
                      className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div 
                      className="w-full h-40 sm:h-48 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${pkg.gradient_from || '#f97316'}, ${pkg.gradient_to || '#fb923c'})`
                      }}
                    >
                      <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-white opacity-80" />
                      {/* Level Badge */}
                      <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                        <span className="bg-white/20 backdrop-blur-sm text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                          All Levels
                        </span>
                      </div>
                      {/* Instructor Avatar */}
                      <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <CardContent className="p-4 sm:p-5 mobile-spacing">
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-3 h-3 sm:w-4 sm:h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700">4.84</span>
                    <span className="text-xs sm:text-sm text-gray-500">(63)</span>
                  </div>

                  {/* Course Title */}
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-tight min-h-[2.5rem] sm:min-h-[3.5rem]">
                    {pkg.nama_paket}
                  </h3>

                  {/* Stats */}
                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="font-medium">353</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="font-medium">05h 35m</span>
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="mb-3 sm:mb-4">
                    {pkg.harga && pkg.harga > 0 ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-gray-400 line-through text-xs sm:text-sm">
                          Rp{(pkg.harga * 3).toLocaleString('id-ID')}
                        </span>
                        <span className="text-lg sm:text-xl font-bold text-orange-600">
                          Rp{pkg.harga.toLocaleString('id-ID')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg sm:text-xl font-bold text-green-600">Gratis</span>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 sm:py-2.5 rounded-lg transition-all duration-200 hover:shadow-lg text-sm sm:text-base touch-target"
                    onClick={() => {
                      const pricingSection = document.getElementById('pricing-section');
                      pricingSection?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Daftar Kelas
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing-section" className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-3 sm:px-4">
          
          {/* E-Course Preview Banner */}
          <div className="bg-gradient-to-br from-[#1a1f2c] via-[#2d3748] to-[#1a1f2c] rounded-2xl mb-10 overflow-hidden shadow-2xl border border-[#81b59a]/20">
            <div className="grid md:grid-cols-2 gap-0 items-center">
              {/* Text Content */}
              <div className="p-6 sm:p-8 md:p-10 text-center md:text-left order-2 md:order-1">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-4 shadow-lg">
                  <span>🎁</span>
                  <span>BONUS EKSKLUSIF</span>
                  <span>🎁</span>
                </div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
                  Free Akses <span className="text-[#81b59a]">E-Course Skripsi</span>
                </h3>
                <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-4 leading-relaxed">
                  Senilai <span className="text-amber-400 font-bold text-lg sm:text-xl">Rp2.000.000</span>
                </p>
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                    <svg className="w-5 h-5 text-[#81b59a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-white text-sm font-medium">Ratusan Video</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                    <svg className="w-5 h-5 text-[#81b59a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-white text-sm font-medium">Materi Lengkap</span>
                  </div>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Pembelajaran lengkap untuk mengerjakan skripsi dari awal hingga selesai
                </p>
              </div>
              
              {/* Image Preview */}
              <div className="relative order-1 md:order-2 p-4 sm:p-6">
                <div className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-white/10 transform hover:scale-[1.02] transition-transform duration-300">
                  <img 
                    src="/assets/ecourse-preview.png" 
                    alt="Preview E-Course Skripsi - Daftar Kelas Pembelajaran"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs sm:text-sm font-medium text-gray-800">Akses selamanya setelah pembelian</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {packages.map((pkg, index) => (
              <Card key={index} className={`relative hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col border-0 shadow-md ${pkg.popular ? 'border-[#81b59a] border-2 scale-105' : ''}`}>
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#81b59a] to-[#6fa085] text-white shadow-lg px-3 py-1 text-xs sm:text-sm">
                    ⭐ MOST POPULAR
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-[#81b59a] mb-1">{pkg.name}</CardTitle>
                  <CardDescription className="text-sm sm:text-base md:text-lg">{pkg.sessions}</CardDescription>
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#81b59a] to-[#6fa085] bg-clip-text text-transparent mt-3 sm:mt-4">{pkg.price}</div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-2 sm:space-y-3 flex-1">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#81b59a] mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={handleWhatsAppClick}
                    className={`w-full mt-4 sm:mt-6 touch-target transition-all duration-300 ${pkg.popular ? 'bg-gradient-to-r from-[#81b59a] to-[#6fa085] hover:shadow-lg hover:scale-105' : 'bg-gray-800 hover:bg-gray-700'} text-white text-sm sm:text-base`}
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
      <section className="py-8 sm:py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 md:mb-8">Legalitas & Kepercayaan</h2>
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

      {/* Digital Products Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4">Produk Digital Kami</h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">Dapatkan panduan dan template untuk mendukung skripsi Anda</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
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
                  onClick={() => window.open('http://lynk.id/pembimbingmu/2jPD6RL', '_blank')}
                  className="w-full bg-[#81b59a] hover:bg-[#6fa085] text-white"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Beli E-Book Sekarang
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
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
                  onClick={() => window.open('http://lynk.id/pembimbingmu/djdv4e263p1g', '_blank')}
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

      <TestimonialCarousel limit={9} />


      {/* FAQ Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4">Pertanyaan yang Sering Diajukan</h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">Temukan jawaban untuk pertanyaan umum</p>
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
