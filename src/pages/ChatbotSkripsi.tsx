import React, { useState, useRef, useEffect } from 'react';
import { Send, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';
import SEO from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

type Mode = 'ruang_cerita' | 'asisten_akademik';

const ChatbotSkripsi = () => {
  const [currentMode, setCurrentMode] = useState<Mode>('ruang_cerita');
  const [sessionDocumentId, setSessionDocumentId] = useState<string>('');
  const [sessionId] = useState<string>(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [showUploadStatus, setShowUploadStatus] = useState(false);
  // Separate message states for each mode
  const [ruangCeritaMessages, setRuangCeritaMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Halo! Selamat datang di Ruang Cerita. Saya di sini untuk mendengarkan cerita Anda dan memberikan dukungan motivasi. Bagaimana kabar Anda hari ini?',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  
  const [asistenAkademikMessages, setAsistenAkademikMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Halo! Saya Asisten Akademik yang akan membantu menganalisis skripsi Anda. Silakan unggah dokumen skripsi terlebih dahulu untuk memulai konsultasi.',
      isBot: true,
      timestamp: new Date()
    }
  ]);

  // Get current messages based on mode
  const messages = currentMode === 'ruang_cerita' ? ruangCeritaMessages : asistenAkademikMessages;
  const setMessages = currentMode === 'ruang_cerita' ? setRuangCeritaMessages : setAsistenAkademikMessages;
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const modeDescriptions = {
    ruang_cerita: "✅ **Bisa untuk:** Berbagi cerita, mengatasi stres, & mencari motivasi. ❌ **Tidak bisa untuk:** Analisis dokumen & pertanyaan teknis.",
    asisten_akademik: "✅ **Bisa untuk:** Analisis dokumen, cari referensi, & tanya metodologi. ❌ **Wajib:** Unggah dokumen skripsi Anda terlebih dahulu."
  };

  const webhookUrls = {
    ruang_cerita: 'https://gwxwuplmjzlwnqvutkla.supabase.co/functions/v1/webhook-proxy',
    asisten_akademik: 'https://gwxwuplmjzlwnqvutkla.supabase.co/functions/v1/webhook-proxy'
  };

  const handleModeChange = (mode: Mode) => {
    setCurrentMode(mode);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(file.type) && ext !== 'pdf' && ext !== 'docx') {
      return;
    }

    // Show loading status
    setUploadStatus('Sebentar, saya baca dan proses dulu dokumennya skripsimu ya...');
    setShowUploadStatus(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading file to:', 'https://n8n.srv995808.hstgr.cloud/webhook-test/inputskripsi');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const res = await fetch('https://n8n.srv995808.hstgr.cloud/webhook-test/inputskripsi', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const documentId = data.documentId || data.document_id || data.id || '';
      setSessionDocumentId(documentId);

      // Show success status
      setUploadStatus('Skripsi berhasil saya baca!');
      
      // Hide status after 3 seconds
      setTimeout(() => {
        setShowUploadStatus(false);
      }, 3000);

      // Add welcome message to asisten akademik chat
      const welcomeMessage: Message = {
        id: `welcome_${Date.now()}`,
        content: 'Baik, Skripsi Anda sudah saya terima. Silakan ajukan pertanyaan terkait skripsi Anda.',
        isBot: true,
        timestamp: new Date()
      };
      setAsistenAkademikMessages(prev => [...prev, welcomeMessage]);

      toast({
        title: "File berhasil diunggah",
        description: `Dokumen berhasil diproses.`,
      });

    } catch (err: any) {
      console.error('Upload failed:', err);
      
      let errorMessage = "Gagal mengunggah dokumen. ";
      if (err.name === 'AbortError') {
        errorMessage += "Request timeout. Silakan coba lagi.";
      } else if (err.message?.includes('CORS')) {
        errorMessage += "Masalah koneksi dengan server. Silakan coba lagi nanti.";
      } else if (err.message?.includes('Failed to fetch')) {
        errorMessage += "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
      } else {
        errorMessage += "Silakan coba lagi.";
      }
      
      setUploadStatus(errorMessage);
      
      toast({
        title: "Gagal mengunggah file",
        description: errorMessage,
        variant: "destructive",
      });
      
      setTimeout(() => {
        setShowUploadStatus(false);
      }, 3000);
    }
  };

  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // First, try to deduct credit
    try {
      const { data, error } = await supabase.rpc('decrement_credits');
      if (error) throw error;
      
      console.log('Credits decremented, remaining:', data);
    } catch (error: any) {
      if (error.code === 'P0001') {
        toast({
          title: "Kredit Habis",
          description: "Anda tidak memiliki cukup kredit untuk mengirim pesan.",
          variant: "destructive"
        });
        return;
      }
      console.error('Error deducting credits:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memproses kredit. Silakan coba lagi.",
        variant: "destructive"
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let payload;
      
      if (currentMode === 'ruang_cerita') {
        payload = {
          webhookType: 'ruang_cerita',
          message: inputMessage,
          sessionId: sessionId
        };
      } else if (currentMode === 'asisten_akademik') {
        payload = {
          webhookType: 'asisten_akademik',
          message: inputMessage,
          documentId: sessionDocumentId
        };
      }

      const webhookUrl = webhookUrls[currentMode];
      console.log('Sending message to webhook proxy:', webhookUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: result.message || result.response || 'Maaf, terjadi kesalahan dalam memproses pesan Anda.',
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      let errorContent = "Maaf, terjadi kesalahan saat mengirim pesan. ";
      if (error.name === 'AbortError') {
        errorContent += "Request timeout. Silakan coba lagi.";
      } else if (error.message?.includes('CORS')) {
        errorContent += "Masalah koneksi dengan server. Silakan coba lagi nanti.";
      } else if (error.message?.includes('Failed to fetch')) {
        errorContent += "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
      } else {
        errorContent += "Silakan coba lagi dalam beberapa saat.";
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: errorContent,
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Gagal mengirim pesan",
        description: errorContent,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

    return (
      <div className="min-h-screen bg-gray-50 px-3 py-4">
        <SEO
          title="Asisten Skripsi AI | Pembimbingmu"
          description="Asisten Skripsi AI: Ruang Cerita dan Asisten Akademik. Unggah skripsi dan mulai konsultasi."
        />
        
        <div className="max-w-md mx-auto">
          {/* Header - Simple & Clean */}
          <div className="text-center mb-4">
            <h1 className="text-lg font-semibold text-gray-900 mb-1">Asisten Skripsi AI</h1>
            <div className="flex items-center justify-center gap-2">
              <Circle className="w-2 h-2 text-green-500 fill-green-500" />
              <span className="text-sm text-green-600">Online</span>
            </div>
          </div>

          {/* Mode Tabs - Minimal */}
          <div className="bg-white rounded-xl p-1 mb-4 shadow-sm flex">
            <button
              onClick={() => handleModeChange('ruang_cerita')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                currentMode === 'ruang_cerita'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Ruang Cerita
            </button>
            <button
              onClick={() => handleModeChange('asisten_akademik')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                currentMode === 'asisten_akademik'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Asisten Akademik
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
          <div className="bg-white rounded-xl shadow-sm flex flex-col" style={{ height: 'calc(100vh - 280px)' }}>
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

              <div ref={messagesEndRef} />
            </div>

            {/* Input - Clean & Focused */}
            <div className="p-3 border-t border-gray-100">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tulis pesan..."
                  className="flex-1 border-gray-200 text-sm focus:border-green-500 focus:ring-green-500/20 rounded-lg"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white px-3 rounded-lg"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default ChatbotSkripsi;