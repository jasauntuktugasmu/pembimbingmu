import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Mic, FileText } from "lucide-react";
import SEO from "@/components/SEO";

export default function DashboardHome() {
  const navigate = useNavigate();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://pembimbingmu.lovable.app/dashboard",
    "name": "Dashboard Home - Pembimbingmu",
    "description": "Halaman utama dashboard dengan akses ke semua fitur: analisis CV, chatbot skripsi, dan LMS pembelajaran",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Pembimbingmu",
      "url": "https://pembimbingmu.lovable.app"
    }
  };

  const productCards = [
    {
      title: "Chatbot Konsultasi Skripsi",
      description: "Dapatkan jawaban dan bimbingan instan untuk skripsi Anda kapan saja.",
      buttonText: "Mulai Konsultasi",
      icon: MessageCircle,
      href: "chatbotskripsi", // nested route
    },
    {
      title: "Simulasi Sidang Voicebot",
      description: "Latih mental dan jawaban Anda dengan simulasi sidang yang realistis.",
      buttonText: "Coba Simulasi",
      icon: Mic,
      href: "/dashboard/simulasi", // external/non‑nested placeholder
    },
    {
      title: "Analisa CV Profesional",
      description: "Upload CV Anda dan dapatkan skor serta masukan untuk perbaikan.",
      buttonText: "Analisa Sekarang",
      icon: FileText,
      href: "cv", // nested route
    },
  ];

  return (
    <>
      <SEO 
        title="Dashboard - Pilih Fitur Terbaik | Pembimbingmu"
        description="Akses semua fitur Pembimbingmu: Analisis CV dengan AI, Chatbot Konsultasi Skripsi, dan LMS Pembelajaran Akademik. Mulai perjalanan sukses Anda!"
        canonical="https://pembimbingmu.lovable.app/dashboard"
        jsonLd={structuredData}
      />
      <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Selamat datang Nama Pengguna, silahkan coba fitur kami di bawah ini.
        </h1>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {productCards.map((product, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-[#81b59a] rounded-lg">
                  <product.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-lg font-semibold text-gray-900">{product.title}</CardTitle>
              <CardDescription className="text-sm text-gray-600 leading-relaxed">
                {product.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-[#81b59a] hover:bg-[#6fa085] text-white font-medium"
                onClick={() => navigate(product.href)}
              >
                {product.buttonText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    </>
  );
}
