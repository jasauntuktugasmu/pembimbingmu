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
    ruang_cerita: 'https://jasauntuktugasmu.app.n8n.cloud/webhook/ruangcerita',
    asisten_akademik: 'https://jasauntuktugasmu.app.n8n.cloud/webhook/botkonsultasiskripsi'
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

      const res = await fetch('https://jasauntuktugasmu.app.n8n.cloud/webhook/inputskripsi', {
        method: 'POST',
        body: formData,
      });

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

    } catch (err) {
      console.error('Upload failed', err);
      setUploadStatus('Gagal mengunggah dokumen. Silakan coba lagi.');
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
          message: inputMessage,
          sessionId: sessionId
        };
      } else if (currentMode === 'asisten_akademik') {
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
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: result.message || result.response || 'Maaf, terjadi kesalahan dalam memproses pesan Anda.',
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

    return (
      <div className="min-h-screen bg-pembimbingmu p-4">
        <SEO
          title="Asisten Skripsi AI | Pembimbingmu"
          description="Asisten Skripsi AI: Ruang Cerita dan Asisten Akademik. Unggah skripsi dan mulai konsultasi."
        />
        <main className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
          {/* Top Controls Panel (outside chat box) */}
          <section className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <h1 className="text-black text-lg sm:text-xl font-semibold">Asisten Skripsi AI</h1>
                <div className="flex items-center gap-2">
                  <Circle className="w-2 h-2 text-[hsl(var(--pembimbingmu-green))] fill-[hsl(var(--pembimbingmu-green))]" />
                  <span className="text-[hsl(var(--pembimbingmu-green))] text-[0.79rem] sm:text-sm">Online</span>
                </div>
              </div>

              {/* Mode Selector */}
              <nav className="bg-gray-100 rounded-lg p-1 flex w-full sm:w-auto" aria-label="Pilih Mode">
                <button
                  onClick={() => handleModeChange('ruang_cerita')}
                  className={`flex-1 text-center px-4 py-2 rounded-md text-[0.79rem] sm:text-sm font-medium transition-all duration-200 ${
                    currentMode === 'ruang_cerita'
                      ? 'bg-pembimbingmu text-white shadow-lg'
                      : 'text-black/70 hover:text-black'
                  }`}
                >
                  Ruang Cerita
                </button>
                <button
                  onClick={() => handleModeChange('asisten_akademik')}
                  className={`flex-1 text-center px-4 py-2 rounded-md text-[0.79rem] sm:text-sm font-medium transition-all duration-200 ${
                    currentMode === 'asisten_akademik'
                      ? 'bg-pembimbingmu text-white shadow-lg'
                      : 'text-black/70 hover:text-black'
                  }`}
                >
                  Asisten Akademik
                </button>
              </nav>
            </header>

            {/* Mode Description + Upload */}
            <article className="bg-gray-50 rounded-lg p-4 border border-gray-200 mt-4">
              <div className="text-black text-[0.79rem] sm:text-sm prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                <ReactMarkdown>
                  {modeDescriptions[currentMode]}
                </ReactMarkdown>
              </div>

              {currentMode === 'asisten_akademik' && (
                <div className="mt-4">
                  <label className="block text-[0.79rem] sm:text-sm font-medium text-black mb-2">
                    Unggah dokumen skripsi (.pdf atau .docx)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileUpload}
                    className="block w-full text-black text-[0.79rem] sm:text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-[0.79rem] sm:file:text-sm file:font-medium file:bg-white file:text-black hover:file:bg-gray-100 border border-gray-200 rounded-md p-2 bg-white"
                  />
                  {showUploadStatus && (
                    <p className="text-xs text-black/60 mt-2">
                      {uploadStatus}
                    </p>
                  )}
                  {sessionDocumentId && !showUploadStatus && (
                    <p className="text-xs text-black/60 mt-2">
                      Dokumen terunggah. ID sesi: {sessionDocumentId}
                    </p>
                  )}
                </div>
              )}
            </article>
          </section>

          {/* Chat Widget (history + input only) */}
          <section className="bg-white rounded-2xl shadow-2xl h-[70vh] flex flex-col overflow-hidden">
            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.isBot
                        ? 'bg-gray-100 text-black border border-gray-200'
                        : 'bg-pembimbingmu text-white'
                    }`}
                  >
                    {message.isBot ? (
                      <div className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4">
                        <ReactMarkdown>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-[0.79rem] sm:text-sm">{message.content}</p>
                    )}
                    <div className={`text-xs mt-2 ${message.isBot ? 'text-black/60' : 'text-white/80'}`}>
                      {message.timestamp.toLocaleTimeString('id-ID', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-gray-100 text-black border border-gray-200 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-black/60 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-black/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-black/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <span className="text-[0.79rem] sm:text-sm text-black/60">Sedang mengetik...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 sm:p-6 border-t border-gray-200">
              <div className="flex gap-3">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ketik pesan Anda..."
                  className="flex-1 bg-white border-gray-200 text-black text-[0.9rem] sm:text-base placeholder:text-black/50 focus:border-[hsl(var(--pembimbingmu-green))] focus:ring-[hsl(var(--pembimbingmu-green))]/20"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-white hover:bg-gray-50 text-[hsl(var(--pembimbingmu-green))] border border-gray-200 px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
};

export default ChatbotSkripsi;