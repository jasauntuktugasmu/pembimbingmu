import React, { useState, useRef, useEffect } from 'react';
import { Send, Circle, Mic, Camera, Video, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  const [isInputFocused, setIsInputFocused] = useState(false);
  // Separate message states for each mode
  const [ruangCeritaMessages, setRuangCeritaMessages] = useState<Message[]>([]);
  const [asistenAkademikMessages, setAsistenAkademikMessages] = useState<Message[]>([]);

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
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <SEO
        title="Asisten Skripsi AI | Pembimbingmu"
        description="Asisten Skripsi AI: Ruang Cerita dan Asisten Akademik. Unggah skripsi dan mulai konsultasi."
      />
      
      {/* Header with Tabs */}
      <header className="flex items-center justify-center p-4">
        <nav className="flex bg-gray-800 rounded-full p-1">
          <button
            onClick={() => handleModeChange('ruang_cerita')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
              currentMode === 'ruang_cerita'
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Circle className="w-4 h-4" />
            Ruang Cerita
          </button>
          <button
            onClick={() => handleModeChange('asisten_akademik')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
              currentMode === 'asisten_akademik'
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Paperclip className="w-4 h-4" />
            Asisten Akademik
          </button>
        </nav>
      </header>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Circle className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-white text-lg font-medium mb-2">
                  {currentMode === 'ruang_cerita' ? 'Ruang Cerita' : 'Asisten Akademik'}
                </h2>
                <p className="text-gray-400 text-sm">
                  {currentMode === 'ruang_cerita' 
                    ? 'Berbagi cerita dan dapatkan motivasi' 
                    : 'Upload dokumen skripsi dan mulai konsultasi'}
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} animate-fade-in`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.isBot
                    ? 'bg-gray-800 text-white'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {message.isBot ? (
                  <div className="prose prose-sm max-w-none text-white [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    <ReactMarkdown>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
                <div className="text-xs mt-2 text-white/60">
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
              <div className="bg-gray-800 text-white rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className="text-sm text-white/60">Sedang mengetik...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* File Upload for Asisten Akademik */}
        {currentMode === 'asisten_akademik' && !sessionDocumentId && (
          <div className="pb-4">
            <div className="bg-gray-800 rounded-2xl p-4">
              <label className="block text-white text-sm font-medium mb-2">
                Upload dokumen skripsi (.pdf atau .docx)
              </label>
              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileUpload}
                className="block w-full text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600 border border-gray-700 rounded-lg p-2 bg-gray-700"
              />
              {showUploadStatus && (
                <p className="text-xs text-gray-400 mt-2">
                  {uploadStatus}
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Input Area */}
      <footer className={`transition-all duration-300 ${isInputFocused ? 'pb-8' : 'pb-4'}`}>
        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-4 px-4">
          <button className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-gray-800 text-gray-400 hover:text-white transition-colors">
            <Video className="w-5 h-5" />
            <span className="text-xs">Create Videos</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-gray-800 text-gray-400 hover:text-white transition-colors">
            <Camera className="w-5 h-5" />
            <span className="text-xs">Open Camera</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-gray-800 text-gray-400 hover:text-white transition-colors">
            <Mic className="w-5 h-5" />
            <span className="text-xs">Voice Mode</span>
          </button>
        </div>

        {/* Input Area */}
        <div className="px-4 max-w-4xl mx-auto w-full">
          <div className="relative">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder="Tanya apa saja"
              className="w-full min-h-[50px] max-h-[150px] bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 rounded-2xl pr-12 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-2 px-2">
            <button className="p-1">
              <Paperclip className="w-4 h-4 text-gray-400" />
            </button>
            <div className="text-xs text-gray-400">
              Fast
            </div>
            <button className="p-1">
              <Mic className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ChatbotSkripsi;