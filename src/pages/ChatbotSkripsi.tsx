import React, { useState, useRef, useEffect } from 'react';
import { Send, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';

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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Halo! Saya asisten AI untuk membantu perjalanan skripsi Anda. Silakan pilih mode yang sesuai dengan kebutuhan Anda.',
      isBot: true,
      timestamp: new Date()
    }
  ]);
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
    ruang_cerita: 'https://n8n.srv930432.hstgr.cloud/webhook/ruangceritaskripsi',
    asisten_akademik: 'https://n8n.srv930432.hstgr.cloud/webhook/botkonsultasiskripsi'
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

      const res = await fetch('https://n8n.srv930432.hstgr.cloud/webhook/inputskripsi', {
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

      // Add welcome message to chat
      const welcomeMessage: Message = {
        id: `welcome_${Date.now()}`,
        content: 'Baik, Skripsi Anda sudah saya terima. Silakan ajukan pertanyaan terkait skripsi Anda.',
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, welcomeMessage]);

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
    <div className="min-h-screen p-4 flex items-center justify-center" style={{ backgroundColor: '#81b59a' }}>
      <div className="w-full max-w-4xl h-[80vh] animate-fade-in">
        {/* Main Chat Widget */}
        <div className="bg-white rounded-2xl shadow-2xl h-full flex flex-col overflow-hidden">
          {/* Widget Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h1 className="text-black text-xl font-semibold">Asisten Skripsi AI</h1>
                <div className="flex items-center gap-2">
                  <Circle className="w-2 h-2 fill-green-400 text-green-400" />
                  <span className="text-green-400 text-sm">Online</span>
                </div>
              </div>
              
              {/* Mode Selector */}
              <div className="bg-gray-100 rounded-lg p-1 flex">
                <button
                  onClick={() => handleModeChange('ruang_cerita')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    currentMode === 'ruang_cerita'
                      ? 'bg-[#81b59a] text-white shadow-lg'
                      : 'text-black/70 hover:text-black'
                  }`}
                >
                  Ruang Cerita
                </button>
                <button
                  onClick={() => handleModeChange('asisten_akademik')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    currentMode === 'asisten_akademik'
                      ? 'bg-[#81b59a] text-white shadow-lg'
                      : 'text-black/70 hover:text-black'
                  }`}
                >
                  Asisten Akademik
                </button>
              </div>
            </div>
            
            {/* Mode Description Area */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-black text-sm prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                <ReactMarkdown>
                  {modeDescriptions[currentMode]}
                </ReactMarkdown>
              </div>

              {currentMode === 'asisten_akademik' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-black mb-2">
                    Unggah dokumen skripsi (.pdf atau .docx)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileUpload}
                    className="block w-full text-black text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-white file:text-black hover:file:bg-gray-100 border border-gray-200 rounded-md p-2 bg-white"
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
            </div>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} animate-fade-in`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.isBot
                      ? 'bg-gray-100 text-black border border-gray-200'
                      : 'bg-[#81b59a] text-white'
                  }`}
                >
                  {message.isBot ? (
                    <div className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4">
                      <ReactMarkdown>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
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
                    <span className="text-sm text-black/60">Sedang mengetik...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex gap-3">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik pesan Anda..."
                className="flex-1 bg-white border-gray-200 text-black placeholder:text-black/50 focus:border-[#81b59a] focus:ring-[#81b59a]/20"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-white hover:bg-gray-50 text-[#81b59a] border border-gray-200 px-4"
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