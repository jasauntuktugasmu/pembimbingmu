import React from 'react';
import { Phone, CheckCircle, Users, Clock, Award, Mail, MapPin, Instagram, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Index = () => {
  const whatsappNumber = "6281234567890"; // Replace with actual number
  const whatsappMessage = "Halo! Saya tertarik dengan layanan bimbingan skripsi Pembimbingmu";

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/4138f2ab-bad4-411f-9975-e8576da5b472.png" 
                alt="Pembimbingmu Logo" 
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-[#81b59a]">Pembimbingmu</h1>
                <p className="text-sm text-gray-600">Pendamping Terbaikmu Menuju Skripsi Auto ACC!</p>
              </div>
            </div>
            <Button 
              onClick={handleWhatsAppClick}
              className="bg-[#81b59a] hover:bg-[#6fa085] text-white font-semibold px-6 py-3 rounded-lg flex items-center space-x-2"
            >
              <Phone className="h-4 w-4" />
              <span>Hubungi Kami Sekarang</span>
            </Button>
          </div>
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
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-[#81b59a] px-8 py-4"
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
      <section className="py-16 bg-white">
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
                  <span className="text-3xl font-bold text-[#81b59a]">Rp30.000</span>
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
                  <span className="text-3xl font-bold text-[#81b59a]">Rp20.000</span>
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
                      <p className="text-gray-600">0812-3456-7890</p>
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
                  0812-3456-7890
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
  );
};

export default Index;
