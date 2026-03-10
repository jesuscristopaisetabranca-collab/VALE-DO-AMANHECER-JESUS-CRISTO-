/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { 
  Sparkles, 
  ShieldCheck, 
  Sun, 
  Heart, 
  CheckCircle2, 
  PlayCircle,
  Award,
  BookOpen,
  Upload,
  File,
  Video,
  Image as ImageIcon,
  X,
  ChevronDown,
  Share2,
  Mail,
  Facebook,
  Twitter,
  Link as LinkIcon,
  User,
  Lock,
  LogIn,
  Send,
  MessageSquare,
  Edit2,
  RefreshCw,
  Play,
  Quote,
  Users,
  Gem,
  Download,
  Menu,
  Moon,
  ArrowUp,
  Youtube,
  ArrowRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface EditableImageProps {
  id: string;
  defaultSrc: string;
  alt: string;
  className?: string;
  isDev?: boolean;
}

const EditableImage: React.FC<EditableImageProps> = ({ id, defaultSrc, alt, className, isDev }) => {
  const [src, setSrc] = React.useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`img_${id}`) || defaultSrc;
    }
    return defaultSrc;
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSrc(base64String);
        localStorage.setItem(`img_${id}`, base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={cn("relative group", className)}>
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
      {isDev && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 bg-white rounded-full text-blue-900 shadow-lg hover:scale-110 transition-transform flex items-center gap-2 text-xs font-bold"
          >
            <Edit2 className="w-4 h-4" /> Alterar Imagem
          </button>
        </div>
      )}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageChange} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
};

interface EditableVideoProps {
  id: string;
  defaultSrc?: string;
  className?: string;
  isDev?: boolean;
}

const EditableVideo: React.FC<EditableVideoProps> = ({ id, defaultSrc, className, isDev }) => {
  const [videoSrc, setVideoSrc] = React.useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`video_${id}`);
    }
    return null;
  });
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (file) {
      // Validation: Check if it's a video
      if (!file.type.startsWith('video/')) {
        setError("Por favor, selecione apenas arquivos de vídeo.");
        setTimeout(() => setError(null), 5000);
        return;
      }

      // Optional: Check file size (e.g., 50MB limit for localStorage stability)
      if (file.size > 50 * 1024 * 1024) {
        setError("O vídeo é muito grande. O limite é de 50MB.");
        setTimeout(() => setError(null), 5000);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setVideoSrc(base64String);
        localStorage.setItem(`video_${id}`, base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className={cn("relative group w-full h-full", className)}>
      {videoSrc ? (
        <video 
          ref={videoRef}
          src={videoSrc} 
          className="w-full h-full object-cover"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      ) : (
        <div className="w-full h-full bg-blue-900/50 flex items-center justify-center">
          <Video className="w-16 h-16 text-white/20" />
        </div>
      )}
      
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-rose-500 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-lg z-30 animate-bounce">
          {error}
        </div>
      )}
      
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
        <div className="flex gap-3">
          {videoSrc && (
            <button 
              onClick={togglePlay}
              className="p-4 bg-violet-500 rounded-full text-white shadow-xl hover:scale-110 transition-transform"
            >
              {isPlaying ? <X className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
            </button>
          )}
          {isDev && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-4 bg-white rounded-full text-blue-900 shadow-xl hover:scale-110 transition-transform flex items-center gap-2 text-sm font-bold"
            >
              <Upload className="w-5 h-5" /> {videoSrc ? 'Alterar Vídeo' : 'Upload Vídeo'}
            </button>
          )}
        </div>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleVideoChange} 
        accept="video/*" 
        className="hidden" 
      />
    </div>
  );
};

const LetterTranscriber: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [image, setImage] = React.useState<string | null>(null);
  const [transcription, setTranscription] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const transcribeLetter = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = "gemini-3-flash-preview";
      
      const base64Data = image.split(',')[1];
      
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            parts: [
              { text: "Por favor, transcreva o texto desta carta. Mantenha a formatação original o máximo possível. Se houver termos específicos da Doutrina do Vale do Amanhecer, transcreva-os com cuidado. Responda apenas com a transcrição." },
              { inlineData: { mimeType: "image/jpeg", data: base64Data } }
            ]
          }
        ]
      });

      setTranscription(response.text || "Não foi possível transcrever a carta.");
    } catch (err) {
      console.error(err);
      setError("Ocorreu um erro ao transcrever a carta. Verifique sua conexão ou tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "p-8 rounded-[3rem] border shadow-xl transition-all",
      isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-pink-100"
    )}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-violet-500 rounded-2xl text-white">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className={cn(
          "text-2xl font-serif font-bold",
          isDarkMode ? "text-white" : "text-blue-900"
        )}>Assistente de Transcrição de Cartas</h3>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className={cn(
            "aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden",
            isDarkMode ? "border-slate-800 bg-slate-950" : "border-pink-100 bg-pink-50/30"
          )}>
            {image ? (
              <img src={image} alt="Carta" className="w-full h-full object-contain" />
            ) : (
              <div className="text-center p-6">
                <ImageIcon className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <p className={cn("text-sm", isDarkMode ? "text-slate-400" : "text-emerald-700")}>
                  Faça o upload da imagem da carta para transcrição
                </p>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <button 
            onClick={transcribeLetter}
            disabled={!image || loading}
            className={cn(
              "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg",
              !image || loading ? "bg-slate-300 cursor-not-allowed" : "bg-violet-500 hover:bg-violet-600 text-white"
            )}
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {loading ? "Transcrevendo..." : "Transcrever Carta"}
          </button>
        </div>

        <div className="flex flex-col h-full">
          <div className={cn(
            "flex-1 p-6 rounded-2xl border min-h-[300px] relative overflow-y-auto max-h-[500px]",
            isDarkMode ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-pink-50/50 border-pink-100 text-emerald-900"
          )}>
            {transcription ? (
              <div className="whitespace-pre-wrap font-serif leading-relaxed">
                {transcription}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                <File className="w-12 h-12 mb-4" />
                <p>O texto transcrito aparecerá aqui.</p>
              </div>
            )}
            {error && (
              <div className="absolute top-4 left-4 right-4 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-sm">
                {error}
              </div>
            )}
          </div>
          {transcription && (
            <button 
              onClick={() => {
                navigator.clipboard.writeText(transcription);
                alert("Transcrição copiada!");
              }}
              className="mt-4 flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-500 transition-colors ml-auto"
            >
              <LinkIcon className="w-4 h-4" /> Copiar Texto
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [showShareOptions, setShowShareOptions] = React.useState(false);
  const [showHeroShareOptions, setShowHeroShareOptions] = React.useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [isAcervoModalOpen, setIsAcervoModalOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [acervoPassword, setAcervoPassword] = React.useState('');
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isDarkMode') === 'true';
    }
    return false;
  });
  const [isDev, setIsDev] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isDev') === 'true';
    }
    return false;
  });
  const [loginData, setLoginData] = React.useState({ email: '', password: '' });
  const [showBackToTop, setShowBackToTop] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple logic: if email is admin@vale.com, enable dev mode
    if (loginData.email === 'admin@vale.com' && loginData.password === 'admin') {
      setIsDev(true);
      localStorage.setItem('isDev', 'true');
      setIsLoggedIn(true);
      setIsLoginModalOpen(false);
      alert("Modo Desenvolvedor Ativado!");
    } else {
      setIsLoggedIn(true);
      alert("Login realizado com sucesso!");
      setIsLoginModalOpen(false);
    }
  };

  const handleAcervoAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (acervoPassword === 'amanhecer') {
      setIsAcervoModalOpen(false);
      window.open('https://drive.google.com/drive/my-drive', '_blank');
    } else {
      alert("Senha incorreta! Solicite a senha ao seu Mestre.");
    }
  };

  const toggleDev = () => {
    const newState = !isDev;
    setIsDev(newState);
    localStorage.setItem('isDev', String(newState));
  };

  const toggleDarkMode = () => {
    const newState = !isDarkMode;
    setIsDarkMode(newState);
    localStorage.setItem('isDarkMode', String(newState));
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + D to toggle dev mode
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        toggleDev();
        alert(`Modo Desenvolvedor ${!isDev ? 'Ativado' : 'Desativado'}`);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDev]);

  React.useEffect(() => {
    const handleInternalLinks = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.hash && link.hash.startsWith('#') && link.origin === window.location.origin) {
        e.preventDefault();
        const targetElement = document.querySelector(link.hash);
        if (targetElement) {
          const offset = 80; // Header height
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('click', handleInternalLinks);
    return () => document.removeEventListener('click', handleInternalLinks);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      setUploadedFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = "O Segredo da Cura que Tia Neiva Revelou";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("Link copiado para a área de transferência!");
  };

  const resetAllImages = () => {
    if (confirm("Deseja resetar todas as imagens e vídeos para o padrão?")) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('img_') || key.startsWith('video_')) {
          localStorage.removeItem(key);
        }
      });
      window.location.reload();
    }
  };

  return (
    <div className={cn(
      "min-h-screen font-sans transition-colors duration-500",
      isDarkMode ? "bg-slate-950 text-slate-100 selection:bg-blue-900" : "bg-pink-50 text-emerald-900 selection:bg-pink-200"
    )}>
      {/* Navigation / Header */}
      <nav className={cn(
        "fixed top-0 w-full backdrop-blur-md z-50 border-b transition-colors duration-500",
        isDarkMode ? "bg-slate-900/80 border-slate-800" : "bg-pink-100/80 border-pink-200"
      )}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-50 group-hover:opacity-80 transition-opacity animate-pulse"></div>
              <img 
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=120&h=120&q=80" 
                alt="Sol do Amanhecer" 
                className="w-10 h-10 rounded-full object-cover relative z-10 border-2 border-yellow-200 shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className={cn(
                "font-serif italic text-xl font-bold tracking-tight leading-none",
                isDarkMode ? "text-white" : "text-blue-900"
              )}>
                Vale do Amanhecer
              </span>
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-violet-500 mt-1">
                Doutrina de Amor
              </span>
            </div>
          </div>
          <div className="hidden lg:flex gap-8 text-xs font-bold text-emerald-700 uppercase tracking-wider">
            <div className="group relative">
              <button className="hover:text-blue-600 transition-colors flex items-center gap-1">Doutrina <ChevronDown className="w-3 h-3" /></button>
              <div className="absolute top-full left-0 bg-white shadow-xl rounded-xl p-4 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border border-pink-100">
                <a href="#historia" className="block py-2 hover:text-blue-600">Nossa História</a>
                <a href="#falanges" className="block py-2 hover:text-blue-600">Falanges do Amanhecer</a>
                <a href="#povo-cigano" className="block py-2 hover:text-blue-600">Povo Cigano</a>
                <a href="#beneficios" className="block py-2 hover:text-blue-600">Benefícios</a>
              </div>
            </div>
            <div className="group relative">
              <button className="hover:text-blue-600 transition-colors flex items-center gap-1">Jornada <ChevronDown className="w-3 h-3" /></button>
              <div className="absolute top-full left-0 bg-white shadow-xl rounded-xl p-4 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border border-pink-100">
                <a href="#desenvolvimento" className="block py-2 hover:text-blue-600">Desenvolvimento</a>
                <a href="#emplacamento" className="block py-2 hover:text-blue-600">Emplacamento</a>
                <a href="#iniciacao" className="block py-2 hover:text-blue-600">Iniciação</a>
                <a href="#elevacao" className="block py-2 hover:text-blue-600">Elevação</a>
                <a href="#pre-centuria" className="block py-2 hover:text-blue-600">Pré Centuria</a>
              </div>
            </div>
            <div className="group relative">
              <button className="hover:text-blue-600 transition-colors flex items-center gap-1">Acervo <ChevronDown className="w-3 h-3" /></button>
              <div className="absolute top-full left-0 bg-white shadow-xl rounded-xl p-4 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border border-pink-100">
                <a href="#mantras" className="block py-2 hover:text-blue-600">Mantras</a>
                <a href="#musicas-ciganas" className="block py-2 hover:text-blue-600">Músicas Ciganas</a>
                <a href="#fotos" className="block py-2 hover:text-blue-600">Galeria de Fotos</a>
                <a href="#arquivos" className="block py-2 hover:text-blue-600">Downloads (Drive)</a>
              </div>
            </div>
            <a href="#blog" className="hover:text-blue-600 transition-colors">Blog</a>
            <a href="#assistente-ia" className="hover:text-blue-600 transition-colors">Assistente IA</a>
            <a href="#perolas" className="hover:text-blue-600 transition-colors">Só as Pérolas</a>
            <a href="#contato" className="hover:text-blue-600 transition-colors">Contato</a>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1">
              <motion.div
                animate={{ x: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="flex items-center"
              >
                <ArrowRight className="w-4 h-4 text-white bg-rose-600 rounded-full p-0.5 shadow-sm" />
              </motion.div>
              <a 
                href="https://www.youtube.com/channel/UCuXuIizz8_5nkLMWU-Vxo5g"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "p-2 rounded-full transition-all hover:scale-110",
                  isDarkMode ? "text-rose-500 hover:bg-slate-800" : "text-rose-600 hover:bg-pink-200/50"
                )}
                title="Canal Oficial no YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
            <button 
              onClick={toggleDarkMode}
              className={cn(
                "p-2 rounded-full transition-all hover:scale-110",
                isDarkMode ? "bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]" : "bg-blue-900 text-white"
              )}
              title={isDarkMode ? "Modo Dia" : "Modo Noturno"}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <a 
              href="#arquivos"
              className="flex px-4 sm:px-6 py-2 bg-violet-500 text-white text-[10px] sm:text-xs font-bold rounded-full hover:bg-violet-400 transition-all items-center gap-1 sm:gap-2 shadow-sm"
            >
              <Download className="w-3 h-3 sm:w-4 h-4" /> Downloads
            </a>
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="hidden sm:flex px-6 py-2 bg-blue-900 text-white text-xs font-bold rounded-full hover:bg-blue-800 transition-all items-center gap-2"
            >
              <User className="w-4 h-4" /> Entrar
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-blue-900 hover:bg-pink-200/50 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={isMobileMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          className={cn(
            "lg:hidden overflow-hidden transition-colors duration-500",
            isDarkMode ? "bg-slate-900 border-b border-slate-800" : "bg-white border-b border-pink-100"
          )}
        >
          <div className="px-4 py-8 space-y-8 text-sm font-bold text-emerald-700 uppercase tracking-wider">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=80&h=80&q=80" 
                alt="Sol do Amanhecer" 
                className="w-8 h-8 rounded-full object-cover border border-yellow-400 shadow-sm"
                referrerPolicy="no-referrer"
              />
              <span className={cn(
                "font-serif italic text-lg font-bold tracking-tight",
                isDarkMode ? "text-white" : "text-blue-900"
              )}>Vale do Amanhecer</span>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-pink-400 mb-1">Doutrina</p>
              <a href="#historia" className="block py-2 hover:text-blue-600">Nossa História</a>
              <a href="#falanges" className="block py-2 hover:text-blue-600">Falanges do Amanhecer</a>
              <a href="#povo-cigano" className="block py-2 hover:text-blue-600">Povo Cigano</a>
              <a href="#beneficios" className="block py-2 hover:text-blue-600">Benefícios</a>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-pink-400 mb-1">Jornada</p>
              <a href="#desenvolvimento" className="block py-2 hover:text-blue-600">Desenvolvimento</a>
              <a href="#emplacamento" className="block py-2 hover:text-blue-600">Emplacamento</a>
              <a href="#iniciacao" className="block py-2 hover:text-blue-600">Iniciação</a>
              <a href="#elevacao" className="block py-2 hover:text-blue-600">Elevação</a>
              <a href="#pre-centuria" className="block py-2 hover:text-blue-600">Pré Centuria</a>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-pink-400 mb-1">Acervo</p>
              <a href="#mantras" className="block py-2 hover:text-blue-600">Mantras</a>
              <a href="#musicas-ciganas" className="block py-2 hover:text-blue-600">Músicas Ciganas</a>
              <a href="#fotos" className="block py-2 hover:text-blue-600">Galeria de Fotos</a>
              <a href="#arquivos" className="block py-2 hover:text-blue-600">Downloads (Drive)</a>
            </div>
            <a href="#blog" className="block py-2 hover:text-blue-600">Blog</a>
            <a href="#assistente-ia" className="block py-2 hover:text-blue-600">Assistente IA</a>
            <a href="#perolas" className="block py-2 hover:text-blue-600">Só as Pérolas</a>
            <a href="#contato" className="block py-2 hover:text-blue-600">Contato</a>
            <button 
              onClick={() => { setIsLoginModalOpen(true); setIsMobileMenuOpen(false); }}
              className="w-full py-3 bg-blue-900 text-white rounded-xl flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" /> Entrar
            </button>
            <div className="pt-4 border-t border-pink-100 flex items-center gap-4">
              <a 
                href="https://www.youtube.com/channel/UCuXuIizz8_5nkLMWU-Vxo5g"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-rose-600"
              >
                <Youtube className="w-5 h-5" /> Canal Oficial
              </a>
            </div>
          </div>
        </motion.div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className={cn(
          "relative overflow-hidden pt-20 pb-32 transition-colors duration-500",
          isDarkMode ? "bg-gradient-to-b from-slate-900 to-slate-950" : "bg-gradient-to-b from-pink-200 to-pink-50"
        )}>
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className={cn(
              "absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl",
              isDarkMode ? "bg-blue-900" : "bg-pink-300"
            )} />
            <div className={cn(
              "absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl",
              isDarkMode ? "bg-indigo-900" : "bg-blue-200"
            )} />
          </div>

          <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className={cn(
                "inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase rounded-full",
                isDarkMode ? "bg-blue-900/50 text-blue-200" : "bg-emerald-100 text-emerald-800"
              )}>
                Missão Jaguar: O Chamado de Pai Seta Branca
              </span>
              <h2 className={cn(
                "text-2xl md:text-3xl font-serif font-bold mb-4 uppercase tracking-wider",
                isDarkMode ? "text-violet-500" : "text-emerald-600"
              )}>
                Vale do Amanhecer: A Luz da Nova Era
              </h2>
              <h1 className={cn(
                "text-4xl md:text-6xl font-serif font-bold leading-[1.1] mb-6",
                isDarkMode ? "text-white" : "text-blue-900"
              )}>
                Doutrinador: Domine a Ciência de Tia Neiva e <span className={isDarkMode ? "text-violet-400 italic" : "text-emerald-700 italic"}>Cumpra seu Dever Sagrado</span> — Porque Fora da Caridade não há Salvação.
              </h1>
              <p className={cn(
                "text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed",
                isDarkMode ? "text-slate-300" : "text-emerald-700"
              )}>
                Acesse o método iniciático que revela como manipular as forças espirituais com precisão para realizar curas reais e evoluir sua jornada como Jaguar.
              </p>
            </motion.div>

            {/* VSL Placeholder */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative max-w-3xl mx-auto aspect-video bg-blue-900 rounded-2xl shadow-2xl overflow-hidden group border-4 border-white"
            >
              <EditableVideo 
                id="vsl-video"
                isDev={isDev}
                className="w-full h-full"
              />
              
              {/* Overlay content - only shown if no video or on hover if we want, but let's keep it simple */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center pointer-events-none group-hover:opacity-0 transition-opacity">
                <p className="text-xl font-bold mb-2 drop-shadow-md">O Segredo da Cura que Tia Neiva Revelou</p>
                <p className="text-sm opacity-80 max-w-md">Faça o upload do vídeo da aula ou depoimento aqui.</p>
              </div>

              {/* Share Button */}
              <div className="absolute top-4 right-4 z-20">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowShareOptions(!showShareOptions);
                  }}
                  className="p-3 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full text-white transition-all shadow-lg"
                >
                  <Share2 className="w-5 h-5" />
                </button>

                {showShareOptions && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl p-4 min-w-[200px] border border-pink-100"
                  >
                    <div className="flex flex-col gap-2">
                      <a 
                        href={`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareUrl)}`}
                        className="flex items-center gap-3 p-2 hover:bg-pink-50 rounded-lg text-emerald-800 transition-colors text-sm font-medium"
                      >
                        <Mail className="w-4 h-4 text-rose-500" /> E-mail
                      </a>
                      <a 
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2 hover:bg-pink-50 rounded-lg text-emerald-800 transition-colors text-sm font-medium"
                      >
                        <Facebook className="w-4 h-4 text-blue-600" /> Facebook
                      </a>
                      <a 
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2 hover:bg-pink-50 rounded-lg text-emerald-800 transition-colors text-sm font-medium"
                      >
                        <Twitter className="w-4 h-4 text-sky-500" /> Twitter
                      </a>
                      <button 
                        onClick={copyToClipboard}
                        className="flex items-center gap-3 p-2 hover:bg-pink-50 rounded-lg text-emerald-800 transition-colors text-sm font-medium w-full text-left"
                      >
                        <LinkIcon className="w-4 h-4 text-emerald-500" /> Copiar Link
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button className="group relative px-10 py-5 bg-violet-500 hover:bg-violet-600 text-white text-xl font-bold rounded-full shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all hover:-translate-y-1 active:scale-95 w-full sm:w-auto">
                Quero ser curado!
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-violet-300 animate-pulse" />
              </button>

              <div className="relative w-full sm:w-auto">
                <button 
                  onClick={() => setShowHeroShareOptions(!showHeroShareOptions)}
                  className={cn(
                    "flex items-center justify-center gap-2 px-8 py-5 font-bold rounded-full transition-all hover:-translate-y-1 active:scale-95 w-full sm:w-auto border-2",
                    isDarkMode 
                      ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700" 
                      : "bg-white border-pink-200 text-emerald-800 hover:bg-pink-50"
                  )}
                >
                  <Share2 className="w-5 h-5" />
                  Compartilhar
                </button>

                {showHeroShareOptions && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 bg-white rounded-2xl shadow-2xl p-4 min-w-[220px] border border-pink-100 z-30"
                  >
                    <div className="flex flex-col gap-2">
                      <p className="text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-1 px-2 text-center">Compartilhar Página</p>
                      <a 
                        href={`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareUrl)}`}
                        className="flex items-center gap-3 p-3 hover:bg-pink-50 rounded-xl text-emerald-800 transition-colors text-sm font-bold"
                      >
                        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                          <Mail className="w-4 h-4 text-rose-500" />
                        </div>
                        E-mail
                      </a>
                      <a 
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 hover:bg-pink-50 rounded-xl text-emerald-800 transition-colors text-sm font-bold"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Facebook className="w-4 h-4 text-blue-600" />
                        </div>
                        Facebook
                      </a>
                      <a 
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 hover:bg-pink-50 rounded-xl text-emerald-800 transition-colors text-sm font-bold"
                      >
                        <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
                          <Twitter className="w-4 h-4 text-sky-500" />
                        </div>
                        Twitter
                      </a>
                      <button 
                        onClick={() => {
                          copyToClipboard();
                          setShowHeroShareOptions(false);
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-pink-50 rounded-xl text-emerald-800 transition-colors text-sm font-bold w-full text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                          <LinkIcon className="w-4 h-4 text-emerald-500" />
                        </div>
                        Copiar Link
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6"
            >
              <p className="text-sm text-emerald-600 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Acesso imediato ao portal de estudos
              </p>
            </motion.div>
          </div>
        </section>

        {/* História Section */}
        <section id="historia" className={cn(
          "py-24 scroll-mt-24 transition-colors duration-500",
          isDarkMode ? "bg-slate-900" : "bg-white"
        )}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className={cn(
                "text-4xl md:text-5xl font-serif font-bold mb-6",
                isDarkMode ? "text-white" : "text-blue-900"
              )}>Nossa História</h2>
              <div className="w-24 h-1 bg-violet-500 mx-auto mb-8 rounded-full"></div>
              <p className={cn(
                "max-w-3xl mx-auto text-lg leading-relaxed",
                isDarkMode ? "text-slate-400" : "text-emerald-700"
              )}>
                A trajetória de Tia Neiva e a fundação do Vale do Amanhecer é uma jornada de fé, 
                clarividência e amor incondicional que transformou a vida de milhares de pessoas.
              </p>
            </div>

            {/* Timeline Section */}
            <div className="mb-24">
              <h3 className={cn(
                "text-2xl font-serif font-bold mb-12 text-center",
                isDarkMode ? "text-violet-300" : "text-blue-800"
              )}>Marcos Históricos</h3>
              
              <div className="relative">
                {/* Vertical Line */}
                <div className={cn(
                  "absolute left-1/2 -translate-x-1/2 h-full w-0.5 hidden md:block",
                  isDarkMode ? "bg-slate-800" : "bg-pink-100"
                )}></div>

                <div className="space-y-12">
                  {[
                    {
                      year: "1959",
                      title: "O Início da Missão",
                      desc: "Tia Neiva inicia sua jornada espiritual e clarividência em Alexânia, Goiás, fundando a União Espiritualista Seta Branca (UESB).",
                      side: "left"
                    },
                    {
                      year: "1964",
                      title: "Taguatinga",
                      desc: "A comunidade se transfere para Taguatinga, onde a doutrina começa a se estruturar e atrair os primeiros médiuns.",
                      side: "right"
                    },
                    {
                      year: "1969",
                      title: "Fundação do Vale",
                      desc: "Ocupação da área atual em Planaltina, DF. Início da construção do Templo Mãe e das primeiras casas.",
                      side: "left"
                    },
                    {
                      year: "1970",
                      title: "Mário Sassi",
                      desc: "Mário Sassi (Trino Tumuchy) une-se à missão, trazendo a sistematização intelectual e escrita da doutrina.",
                      side: "right"
                    },
                    {
                      year: "1985",
                      title: "O Legado",
                      desc: "Passagem de Tia Neiva para o plano espiritual, deixando um legado consolidado e uma hierarquia estruturada.",
                      side: "left"
                    }
                  ].map((item, idx) => (
                    <div key={idx} className={cn(
                      "relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group",
                      item.side === 'left' ? "md:flex-row-reverse" : "md:flex-row"
                    )}>
                      <div className="hidden md:block w-1/2"></div>
                      <div className={cn(
                        "absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 z-10 transition-all group-hover:scale-150 hidden md:block",
                        isDarkMode ? "bg-slate-900 border-violet-500" : "bg-white border-violet-500"
                      )}></div>
                      <div className="w-full md:w-[45%]">
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          className={cn(
                            "p-8 rounded-3xl border transition-all hover:shadow-2xl",
                            isDarkMode ? "bg-slate-800/50 border-slate-700 hover:border-violet-500/50" : "bg-pink-50/50 border-pink-100 hover:border-violet-200"
                          )}
                        >
                          <span className="text-violet-500 font-bold text-xl mb-2 block">{item.year}</span>
                          <h4 className={cn(
                            "text-xl font-bold mb-3",
                            isDarkMode ? "text-white" : "text-blue-900"
                          )}>{item.title}</h4>
                          <p className={cn(
                            "text-sm leading-relaxed",
                            isDarkMode ? "text-slate-400" : "text-emerald-800"
                          )}>{item.desc}</p>
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Founders Section */}
            <div className="grid md:grid-cols-2 gap-16 items-start mb-24">
              <div className="space-y-8">
                <div className="relative">
                  <div className="absolute -top-4 -left-4 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl"></div>
                  <h3 className={cn(
                    "text-3xl font-serif font-bold relative",
                    isDarkMode ? "text-white" : "text-blue-900"
                  )}>Tia Neiva</h3>
                  <p className="text-violet-500 font-bold italic">A Clarividente do Amanhecer</p>
                </div>
                
                <div className={cn(
                  "rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[4/5] relative group",
                  isDarkMode ? "border-4 border-slate-800" : "border-8 border-white"
                )}>
                  <EditableImage 
                    id="tia-neiva-history"
                    isDev={isDev}
                    defaultSrc="https://picsum.photos/seed/tianeiva/800/1000" 
                    alt="Tia Neiva" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                    <p className="text-white text-sm italic">"O amor é a única força que pode transformar o mundo."</p>
                  </div>
                </div>

                <div className={cn(
                  "space-y-4 leading-relaxed",
                  isDarkMode ? "text-slate-300" : "text-emerald-800"
                )}>
                  <p>
                    Neiva Chaves Zelaya nasceu em 1925 e, após ficar viúva com quatro filhos, 
                    tornou-se motorista de caminhão para sustentá-los. Sua vida mudou drasticamente 
                    em 1959, quando suas faculdades mediúnicas desabrocharam com uma intensidade sem precedentes.
                  </p>
                  <p>
                    Como clarividente, ela conseguia ver o passado, o presente e o futuro, além de 
                    se comunicar com entidades de alta hierarquia espiritual, como o Pai Seta Branca. 
                    Sua missão foi fundar uma doutrina que unisse o conhecimento milenar à necessidade 
                    do homem moderno.
                  </p>
                </div>
              </div>

              <div className="space-y-8 md:mt-24">
                <div className="relative">
                  <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
                  <h3 className={cn(
                    "text-3xl font-serif font-bold relative",
                    isDarkMode ? "text-white" : "text-blue-900"
                  )}>Mário Sassi</h3>
                  <p className="text-blue-500 font-bold italic">Trino Tumuchy</p>
                </div>

                <div className={cn(
                  "rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[4/5] relative group",
                  isDarkMode ? "border-4 border-slate-800" : "border-8 border-white"
                )}>
                  <EditableImage 
                    id="mario-sassi-history"
                    isDev={isDev}
                    defaultSrc="https://picsum.photos/seed/mariosassi/800/1000" 
                    alt="Mário Sassi" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                    <p className="text-white text-sm italic">O mestre que deu voz intelectual à doutrina.</p>
                  </div>
                </div>

                <div className={cn(
                  "space-y-4 leading-relaxed",
                  isDarkMode ? "text-slate-300" : "text-emerald-800"
                )}>
                  <p>
                    Mário Sassi foi o grande companheiro de missão de Tia Neiva. Intelectual, 
                    escritor e mestre, ele foi responsável por transcrever e organizar os 
                    ensinamentos recebidos por Neiva em uma estrutura doutrinária sólida.
                  </p>
                  <p>
                    Como Trino Tumuchy, ele estabeleceu as bases filosóficas e as leis que 
                    regem o Vale do Amanhecer, permitindo que a doutrina se expandisse de 
                    forma organizada e fiel aos princípios originais.
                  </p>
                </div>
              </div>
            </div>

            {/* Historical Gallery */}
            <div className="mt-24">
              <h3 className={cn(
                "text-2xl font-serif font-bold mb-12 text-center",
                isDarkMode ? "text-violet-300" : "text-blue-800"
              )}>Acervo Fotográfico Original</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className={cn(
                    "group relative aspect-square rounded-2xl overflow-hidden cursor-pointer",
                    isDarkMode ? "bg-slate-800" : "bg-pink-100"
                  )}>
                    <EditableImage 
                      id={`history-gallery-${i}`}
                      isDev={isDev}
                      defaultSrc={`https://picsum.photos/seed/hist-gal-${i}/600/600`}
                      alt={`Foto Histórica ${i}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                ))}
              </div>
              <p className={cn(
                "mt-6 text-center text-sm italic",
                isDarkMode ? "text-slate-500" : "text-emerald-600"
              )}>
                Clique nas imagens acima (em modo desenvolvedor) para substituir por fotos originais do seu acervo.
              </p>
            </div>

            {/* Historical Documents */}
            <div className="mt-24 mb-12">
              <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                <div className="text-center md:text-left">
                  <h3 className={cn(
                    "text-2xl font-serif font-bold",
                    isDarkMode ? "text-violet-300" : "text-blue-800"
                  )}>Cartas e Documentos Originais</h3>
                  <p className={cn(
                    "text-sm mt-2",
                    isDarkMode ? "text-slate-500" : "text-emerald-700"
                  )}>Preservando a voz original da Clarividente.</p>
                </div>
                <div className="flex gap-4">
                  <div className="p-3 bg-violet-500/10 rounded-2xl text-violet-500">
                    <File className="w-6 h-6" />
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                    <Sparkles className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {[1, 2].map((i) => (
                  <div key={i} className={cn(
                    "p-6 rounded-[2rem] border flex gap-6 items-center group transition-all hover:shadow-xl",
                    isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-white border-pink-100"
                  )}>
                    <div className="w-24 h-32 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                      <EditableImage 
                        id={`doc-thumb-${i}`}
                        isDev={isDev}
                        defaultSrc={`https://picsum.photos/seed/doc-${i}/200/300`}
                        alt="Documento"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className={cn(
                        "font-bold mb-2",
                        isDarkMode ? "text-white" : "text-blue-900"
                      )}>Documento Histórico {i === 1 ? 'A' : 'B'}</h4>
                      <p className={cn(
                        "text-xs leading-relaxed mb-4",
                        isDarkMode ? "text-slate-400" : "text-emerald-700"
                      )}>
                        {i === 1 
                          ? "Transcrição de carta original recebida por Tia Neiva em 1978 sobre a conduta do mestre." 
                          : "Instruções originais para o ritual de Estrela Candente."}
                      </p>
                      <button className="text-violet-500 text-xs font-bold flex items-center gap-2 hover:underline">
                        <Download className="w-3 h-3" /> Ver Documento Completo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Content Area */}
            <div className={cn(
              "p-12 rounded-[3rem] relative overflow-hidden",
              isDarkMode ? "bg-slate-800/30 border border-slate-700" : "bg-violet-50/50 border border-violet-100"
            )}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
              
              <div className="grid md:grid-cols-3 gap-12 relative z-10">
                <div className="md:col-span-2 space-y-6">
                  <h3 className={cn(
                    "text-2xl font-serif font-bold",
                    isDarkMode ? "text-white" : "text-blue-900"
                  )}>A Missão Espiritual</h3>
                  <div className={cn(
                    "space-y-4 leading-relaxed",
                    isDarkMode ? "text-slate-300" : "text-emerald-800"
                  )}>
                    <p>
                      O Vale do Amanhecer não é apenas um local físico, mas um portal de 
                      manipulação de energias. A missão principal é a desobsessão e o 
                      encaminhamento de espíritos sofredores, além do despertar da 
                      consciência mediúnica de seus membros.
                    </p>
                    <p>
                      Através de rituais complexos e precisos, os médiuns (Doutrinadores e Aparás) 
                      trabalham em conjunto para equilibrar as forças cármicas e trazer alívio 
                      àqueles que buscam auxílio, seja no plano físico ou espiritual.
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className={cn(
                    "p-6 rounded-2xl border-l-4 italic h-full flex flex-col justify-center",
                    isDarkMode ? "bg-slate-900 border-violet-500 text-violet-200" : "bg-white border-violet-500 text-emerald-800 shadow-sm"
                  )}>
                    <Quote className="w-8 h-8 text-violet-500/20 mb-4" />
                    <p className="text-lg">"Minha missão é preparar o homem para a Nova Era, através do amor e do perdão."</p>
                    <p className="mt-4 font-bold text-sm not-italic">— Tia Neiva</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action for more content */}
            {isDev && (
              <div className="mt-12 p-6 border-2 border-dashed border-violet-300 rounded-2xl text-center">
                <p className="text-violet-500 font-bold mb-2">Área do Desenvolvedor</p>
                <p className="text-sm text-slate-500 mb-4">Você pode adicionar mais seções ou materiais originais aqui editando o código.</p>
                <button className="px-6 py-2 bg-violet-500 text-white rounded-full text-xs font-bold hover:bg-violet-600 transition-all">
                  Adicionar Novo Bloco de História
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Benefits Section */}
        <section id="beneficios" className={cn(
          "py-24 scroll-mt-24 transition-colors duration-500",
          isDarkMode ? "bg-slate-950" : "bg-pink-50"
        )}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className={cn(
                "text-3xl md:text-4xl font-serif font-bold mb-4",
                isDarkMode ? "text-white" : "text-blue-900"
              )}>
                Transformações Reais no Vale do Amanhecer
              </h2>
              <p className={isDarkMode ? "text-slate-400" : "text-emerald-700"}>Baseado nos ensinamentos iniciáticos de Tia Neiva</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Heart className={cn("w-8 h-8", isDarkMode ? "text-rose-400" : "text-rose-500")} />,
                  title: "Equilíbrio Mediúnico",
                  desc: "Alcance a estabilidade necessária para atuar com segurança nos trabalhos do Templo."
                },
                {
                  icon: <BookOpen className={cn("w-8 h-8", isDarkMode ? "text-emerald-400" : "text-emerald-500")} />,
                  title: "Leis do Amanhecer",
                  desc: "Compreensão profunda das leis que regem o Doutrinador e o Apará."
                },
                {
                  icon: <ShieldCheck className={cn("w-8 h-8", isDarkMode ? "text-blue-400" : "text-blue-500")} />,
                  title: "Proteção Espiritual",
                  desc: "Fortaleça sua aura através do conhecimento iniciático e da manipulação correta das energias."
                },
                {
                  icon: <Sun className={cn("w-8 h-8", isDarkMode ? "text-violet-400" : "text-violet-500")} />,
                  title: "Paz Interior",
                  desc: "Clareza mental e serenidade para conduzir trabalhos de desobsessão e cura."
                },
                {
                  icon: <Award className={cn("w-8 h-8", isDarkMode ? "text-purple-400" : "text-purple-500")} />,
                  title: "Maestria Doutrinária",
                  desc: "Torne-se um Jaguar preparado para os desafios da Nova Era."
                }
              ].map((benefit, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  className={cn(
                    "p-8 rounded-2xl border transition-all",
                    isDarkMode ? "bg-slate-900 border-slate-800 hover:bg-slate-800 hover:shadow-2xl" : "bg-white/50 border-pink-200 hover:bg-white hover:shadow-xl"
                  )}
                >
                  <div className="mb-4">{benefit.icon}</div>
                  <h3 className={cn(
                    "text-xl font-bold mb-2",
                    isDarkMode ? "text-white" : "text-blue-900"
                  )}>{benefit.title}</h3>
                  <p className={cn(
                    "leading-relaxed",
                    isDarkMode ? "text-slate-400" : "text-emerald-700"
                  )}>{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Falanges Section */}
        <section id="falanges" className="py-24 bg-white scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-blue-900 mb-4">Falanges do Amanhecer</h2>
              <p className="text-emerald-700 max-w-2xl mx-auto">As diversas frentes de trabalho espiritual que compõem a nossa doutrina, cada uma com sua missão e força específica.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: "Nityamas", desc: "A pureza e a força das jovens missionárias." },
                { name: "Samaritanas", desc: "O serviço de auxílio e amparo nos rituais." },
                { name: "Prisioneiros", desc: "A jornada de resgate e libertação espiritual." },
                { name: "Magos", desc: "A manipulação das forças da natureza e do cosmos." },
                { name: "Ciganas", desc: "A alegria e a intuição do povo do Oriente." },
                { name: "Franciscanos", desc: "A humildade e o amor incondicional aos irmãos." },
                { name: "Yaras", desc: "A força das águas e a purificação espiritual." },
                { name: "Muruaicy", desc: "A sabedoria ancestral e a proteção da terra." }
              ].map((falange, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-6 bg-pink-50 rounded-2xl border border-pink-100 hover:border-blue-200 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center text-white mb-4 group-hover:rotate-6 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-blue-900 mb-2">{falange.name}</h3>
                  <p className="text-sm text-emerald-700">{falange.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Povo Cigano Section */}
        <section id="povo-cigano" className="py-24 bg-pink-50 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-blue-900 mb-6">O Povo Cigano no Amanhecer</h2>
                <p className="text-emerald-800 mb-6 leading-relaxed">
                  A influência cigana no Vale do Amanhecer é uma das mais belas e vibrantes frentes de trabalho. Representando a liberdade, a alegria e a profunda conexão com as forças da natureza, os Ciganos trazem uma energia de cura e desobsessão única.
                </p>
                <div className="space-y-4">
                  {[
                    "Liberdade espiritual e desapego material.",
                    "Alegria como ferramenta de elevação vibracional.",
                    "Conexão profunda com os quatro elementos.",
                    "Sapiência milenar do Oriente e do Egito."
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center text-white">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-emerald-900 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:w-1/2 grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={cn(
                    "rounded-3xl overflow-hidden shadow-lg aspect-[4/5]",
                    i % 2 === 0 ? "mt-8" : ""
                  )}>
                    <EditableImage 
                      id={`cigano-img-${i}`}
                      isDev={isDev}
                      defaultSrc={`https://picsum.photos/seed/cigano${i}/600/800`} 
                      alt={`Povo Cigano ${i}`} 
                      className="w-full h-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Jornada do Jaguar Header */}
        <section className={cn(
          "py-12 text-center transition-colors duration-500",
          isDarkMode ? "bg-slate-950 text-white" : "bg-blue-900 text-white"
        )}>
          <h2 className={cn(
            "text-3xl md:text-5xl font-serif font-bold mb-4",
            isDarkMode ? "text-violet-500" : "text-white"
          )}>A Jornada do Jaguar</h2>
          <p className={isDarkMode ? "text-slate-400" : "text-pink-100"}>Conheça os degraus da evolução mediúnica em nossa doutrina.</p>
        </section>

        {/* Desenvolvimento Section */}
        <section id="desenvolvimento" className={cn(
          "py-24 scroll-mt-24 transition-colors duration-500",
          isDarkMode ? "bg-slate-900" : "bg-white"
        )}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <h2 className={cn(
                  "text-3xl md:text-4xl font-serif font-bold mb-6",
                  isDarkMode ? "text-white" : "text-blue-900"
                )}>Desenvolvimento Mediúnico</h2>
                <p className={cn(
                  "text-lg mb-6 leading-relaxed",
                  isDarkMode ? "text-slate-300" : "text-emerald-800"
                )}>
                  O primeiro passo na jornada do Jaguar. Aqui, o médium aprende a equilibrar suas energias e a entender a sua missão espiritual sob a orientação dos Mestres.
                </p>
                <ul className="space-y-4">
                  {[
                    "Equilíbrio dos plexos e centros nervosos.",
                    "Primeiros contatos com a espiritualidade maior.",
                    "Desenvolvimento da sensibilidade e percepção."
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className={cn("w-5 h-5 mt-1 shrink-0", isDarkMode ? "text-violet-500" : "text-violet-500")} />
                      <span className={isDarkMode ? "text-slate-400" : "text-emerald-700"}>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={cn(
                "md:w-1/2 rounded-3xl overflow-hidden shadow-2xl",
                isDarkMode ? "border-4 border-slate-800" : ""
              )}>
                <EditableImage 
                  id="dev-img"
                  isDev={isDev}
                  defaultSrc="https://picsum.photos/seed/dev/800/600" 
                  alt="Desenvolvimento" 
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Emplacamento Section */}
        <section id="emplacamento" className={cn(
          "py-24 scroll-mt-24 transition-colors duration-500",
          isDarkMode ? "bg-slate-950" : "bg-pink-50"
        )}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="md:w-1/2">
                <h2 className={cn(
                  "text-3xl md:text-4xl font-serif font-bold mb-6",
                  isDarkMode ? "text-white" : "text-blue-900"
                )}>Emplacamento</h2>
                <p className={cn(
                  "text-lg mb-6 leading-relaxed",
                  isDarkMode ? "text-slate-300" : "text-emerald-800"
                )}>
                  A confirmação da sintonia mediúnica. O momento em que o médium se firma em sua corrente e assume o compromisso de servir à caridade.
                </p>
                <div className={cn(
                  "p-6 rounded-2xl border italic",
                  isDarkMode ? "bg-slate-900 border-slate-800 text-violet-200" : "bg-white border-pink-200 shadow-sm text-emerald-700"
                )}>
                  "O emplacamento é a assinatura do seu compromisso com o Pai Seta Branca."
                </div>
              </div>
              <div className={cn(
                "md:w-1/2 rounded-3xl overflow-hidden shadow-2xl",
                isDarkMode ? "border-4 border-slate-800" : ""
              )}>
                <EditableImage 
                  id="emplacamento-img"
                  isDev={isDev}
                  defaultSrc="https://picsum.photos/seed/emplacamento/800/600" 
                  alt="Emplacamento" 
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Iniciação Section */}
        <section id="iniciacao" className="py-24 bg-white scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-blue-900 mb-6">Iniciação</h2>
            <p className="text-lg text-emerald-800 max-w-3xl mx-auto mb-12">
              O ingresso oficial nos mistérios da Doutrina. O médium recebe as primeiras chaves para a manipulação consciente das energias.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 bg-pink-50 rounded-3xl border border-pink-100">
                <h3 className="text-xl font-bold text-blue-900 mb-4">O Despertar</h3>
                <p className="text-emerald-700">Abertura dos canais para a recepção das forças iniciáticas.</p>
              </div>
              <div className="p-8 bg-pink-50 rounded-3xl border border-pink-100">
                <h3 className="text-xl font-bold text-blue-900 mb-4">O Compromisso</h3>
                <p className="text-emerald-700">Assunção da responsabilidade como porta-voz da espiritualidade.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Elevação Section */}
        <section id="elevacao" className="py-24 bg-pink-50 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-blue-900 rounded-[3rem] p-12 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-12 opacity-10">
                <Sun className="w-64 h-64" />
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-serif font-bold mb-8">Elevação de Espadas</h2>
                <p className="text-xl text-pink-100 mb-8 max-w-2xl">
                  Um dos momentos mais sublimes na vida do Jaguar. A elevação representa o amadurecimento espiritual e a prontidão para trabalhos de maior envergadura.
                </p>
                <button className="px-8 py-4 bg-violet-500 text-white font-bold rounded-full hover:bg-violet-600 transition-all">
                  Saiba mais sobre a Elevação
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Pré Centuria Section */}
        <section id="pre-centuria" className="py-24 bg-white scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-blue-900 mb-4">Pré Centuria</h2>
              <p className="text-emerald-700">A preparação final para o Mestrado.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 border border-pink-100 rounded-2xl hover:shadow-lg transition-all">
                <h3 className="font-bold text-blue-900 mb-2">Refinamento</h3>
                <p className="text-sm text-emerald-700">Ajuste fino da conduta doutrinária e moral.</p>
              </div>
              <div className="p-6 border border-pink-100 rounded-2xl hover:shadow-lg transition-all">
                <h3 className="font-bold text-blue-900 mb-2">Conhecimento</h3>
                <p className="text-sm text-emerald-700">Aprofundamento nas leis e rituais complexos.</p>
              </div>
              <div className="p-6 border border-pink-100 rounded-2xl hover:shadow-lg transition-all">
                <h3 className="font-bold text-blue-900 mb-2">Liderança</h3>
                <p className="text-sm text-emerald-700">Preparação para guiar outros irmãos na jornada.</p>
              </div>
            </div>
          </div>
        </section>



        {/* Mantras Section */}
        <section id="mantras" className={cn(
          "py-24 scroll-mt-24 transition-colors duration-500",
          isDarkMode ? "bg-slate-900" : "bg-pink-50"
        )}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className={cn(
                "text-3xl md:text-4xl font-serif font-bold mb-4",
                isDarkMode ? "text-white" : "text-blue-900"
              )}>Mantras do Vale do Amanhecer</h2>
              <p className={isDarkMode ? "text-slate-400" : "text-emerald-700"}>A força vibracional das palavras sagradas.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { title: "Prece de Simiromba", text: "Oh, Simiromba, do Grande Oriente de Oxalá! No mundo espiritual, onde tudo é luz..." },
                { title: "Pai Nosso do Amanhecer", text: "Pai Nosso que estais nos céus, na luz dos nossos plexos..." },
                { title: "Mantra da Unificação", text: "Senhor, faze com que sejamos um só pensamento, uma só vibração..." },
                { title: "Mantra de Cura", text: "Que as forças das águas e das matas tragam o alívio e a regeneração..." }
              ].map((mantra, idx) => (
                <div key={idx} className={cn(
                  "p-8 rounded-3xl border shadow-sm transition-all",
                  isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-pink-200"
                )}>
                  <h3 className={cn(
                    "text-xl font-bold mb-4 flex items-center gap-2",
                    isDarkMode ? "text-white" : "text-blue-900"
                  )}>
                    <Sun className="w-5 h-5 text-violet-500" /> {mantra.title}
                  </h3>
                  <p className={cn(
                    "italic leading-relaxed",
                    isDarkMode ? "text-slate-300" : "text-emerald-700"
                  )}>"{mantra.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Só as Pérolas Section */}
        <section id="perolas" className="py-24 bg-blue-900 text-white scroll-mt-24 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-violet-500 rounded-full blur-3xl" />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">Só as Pérolas</h2>
              <p className="text-pink-100">Ensinamentos e reflexões curtas de Tia Neiva para iluminar seu dia.</p>
            </div>

            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {[
                "Não se esqueça que o amor é a única força que pode transformar o mundo.",
                "O Jaguar é um missionário do amor e do perdão.",
                "A caridade é o dever de todo Jaguar.",
                "A humildade é a chave para o conhecimento espiritual.",
                "O perdão é a libertação da alma.",
                "A fé remove montanhas, mas o amor constrói mundos.",
                "O Jaguar não julga, o Jaguar compreende.",
                "A mediunidade é um sacerdócio de amor.",
                "Sê humilde em teu coração e grande em tua caridade.",
                "A luz que você emana é a luz que te guia.",
                "O silêncio é a voz da alma em prece.",
                "Trabalhe com amor e a espiritualidade fará o resto."
              ].map((perola, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="break-inside-avoid p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl hover:bg-white/20 transition-all group"
                >
                  <Quote className="w-8 h-8 text-violet-400 mb-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                  <p className="text-lg font-medium leading-relaxed italic">
                    "{perola}"
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-xs font-bold text-violet-300 uppercase tracking-widest">
                    <div className="w-8 h-[1px] bg-violet-300/50" />
                    Tia Neiva
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Músicas Ciganas Section */}
        <section id="musicas-ciganas" className={cn(
          "py-24 scroll-mt-24 transition-colors duration-500",
          isDarkMode ? "bg-slate-900" : "bg-white"
        )}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className={cn(
                "text-3xl md:text-4xl font-serif font-bold mb-4",
                isDarkMode ? "text-white" : "text-blue-900"
              )}>Músicas Ciganas</h2>
              <p className={isDarkMode ? "text-slate-400" : "text-emerald-700"}>A alegria e a liberdade da alma cigana na nossa doutrina.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Caminhada Cigana", duration: "4:20" },
                { title: "Festa no Acampamento", duration: "3:45" },
                { title: "Oração da Cigana", duration: "5:10" },
                { title: "Dança das Almas", duration: "4:00" },
                { title: "Luz do Oriente", duration: "3:30" },
                { title: "Vento de Liberdade", duration: "4:45" }
              ].map((music, idx) => (
                <div key={idx} className={cn(
                  "flex items-center justify-between p-6 rounded-2xl border transition-colors cursor-pointer group",
                  isDarkMode ? "bg-slate-800 border-slate-700 hover:bg-slate-700" : "bg-pink-50 border-pink-100 hover:bg-pink-100"
                )}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className={cn(
                        "font-bold",
                        isDarkMode ? "text-white" : "text-blue-900"
                      )}>{music.title}</h3>
                      <p className={isDarkMode ? "text-slate-400 text-xs" : "text-emerald-600 text-xs"}>Espiritualidade Cigana</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-emerald-500">{music.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fotos Section */}
        <section id="fotos" className={cn(
          "py-24 scroll-mt-24 transition-colors duration-500",
          isDarkMode ? "bg-slate-950" : "bg-pink-50"
        )}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className={cn(
                "text-3xl md:text-4xl font-serif font-bold mb-4",
                isDarkMode ? "text-white" : "text-blue-900"
              )}>Galeria de Fotos</h2>
              <p className={isDarkMode ? "text-slate-400" : "text-emerald-700"}>Momentos sagrados e a beleza da nossa Doutrina.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className={cn(
                  "aspect-square rounded-2xl overflow-hidden shadow-md hover:scale-105 transition-transform cursor-pointer",
                  isDarkMode ? "border-2 border-slate-800" : ""
                )}>
                  <EditableImage 
                    id={`gallery-${i}`}
                    isDev={isDev}
                    defaultSrc={`https://picsum.photos/seed/vale${i}/400/400`} 
                    alt={`Foto ${i}`} 
                    className="w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Downloads Section */}
        <section id="arquivos" className={cn(
          "py-24 scroll-mt-24 transition-colors duration-500",
          isDarkMode ? "bg-slate-900" : "bg-white"
        )}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className={cn(
                "text-3xl md:text-4xl font-serif font-bold mb-4",
                isDarkMode ? "text-white" : "text-blue-900"
              )}>Downloads e Acervo Digital</h2>
              <p className={cn(
                "max-w-2xl mx-auto",
                isDarkMode ? "text-slate-400" : "text-emerald-700"
              )}>Acesse e baixe nosso acervo completo de livros, leis, áudios e materiais de estudo.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
              <div className="space-y-8">
                {[
                  { icon: <BookOpen className="w-7 h-7" />, title: "Livros e Leis", desc: "Obras completas de Tia Neiva, leis do amanhecer e manuais de instrução para médiuns.", bg: "bg-blue-900" },
                  { icon: <PlayCircle className="w-7 h-7" />, title: "Áudios e Mantras", desc: "Gravações originais de mantras, preces e instruções sonoras para harmonização.", bg: "bg-violet-500" },
                  { icon: <File className="w-7 h-7" />, title: "Materiais de Estudo", desc: "Apostilas de desenvolvimento, iniciação, elevação e centúria para sua jornada.", bg: "bg-emerald-500" }
                ].map((item, i) => (
                  <div key={i} className={cn(
                    "flex gap-6 items-start p-6 rounded-3xl border transition-all",
                    isDarkMode ? "bg-slate-800 border-slate-700 hover:shadow-lg" : "bg-pink-50 border-pink-100 hover:shadow-lg"
                  )}>
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg",
                      item.bg
                    )}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className={cn(
                        "text-xl font-bold mb-2",
                        isDarkMode ? "text-white" : "text-blue-900"
                      )}>{item.title}</h3>
                      <p className={cn(
                        "text-sm leading-relaxed",
                        isDarkMode ? "text-slate-400" : "text-emerald-700"
                      )}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={cn(
                "rounded-[3rem] p-12 text-center text-white shadow-2xl relative overflow-hidden group",
                isDarkMode ? "bg-slate-950" : "bg-blue-900"
              )}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-all"></div>
                <div className="relative z-10">
                  <Sun className="w-16 h-16 text-violet-400 mx-auto mb-6 animate-pulse" />
                  <h3 className="text-3xl font-serif font-bold mb-4">Acesso ao Acervo Completo</h3>
                  <p className={isDarkMode ? "text-slate-300 mb-8 leading-relaxed" : "text-blue-100 mb-8 leading-relaxed"}>
                    Clique no botão abaixo para ser redirecionado ao nosso Google Drive oficial com todos os materiais da Doutrina do Amanhecer.
                  </p>
                  <button 
                    onClick={() => {
                      if (!isLoggedIn) {
                        setIsLoginModalOpen(true);
                      } else {
                        setIsAcervoModalOpen(true);
                      }
                    }}
                    className="inline-flex items-center gap-3 px-10 py-5 bg-violet-500 text-white font-bold rounded-full hover:bg-violet-400 hover:scale-105 transition-all shadow-xl"
                  >
                    <LinkIcon className="w-6 h-6" /> Acessar Google Drive
                  </button>
                  <p className={cn(
                    "mt-6 text-xs",
                    isDarkMode ? "text-slate-500" : "text-blue-300"
                  )}>
                    * Requer login e senha de acesso ao material.
                  </p>
                </div>
              </div>
            </div>

            <div id="assistente-ia" className="mt-24 scroll-mt-24">
              <LetterTranscriber isDarkMode={isDarkMode} />
            </div>

            {isDev && (
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                  <h3 className={cn(
                    "text-2xl font-serif font-bold",
                    isDarkMode ? "text-white" : "text-blue-900"
                  )}>Portal de Upload do Jaguar</h3>
                  <p className={isDarkMode ? "text-slate-400 mt-2 text-sm" : "text-emerald-700 mt-2 text-sm"}>Contribua com o acervo enviando seus próprios arquivos.</p>
                </div>
                {/* Upload Zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={cn(
                    "relative border-2 border-dashed rounded-[2rem] p-12 text-center transition-all duration-300",
                    isDragging ? "border-violet-500 bg-violet-50" : 
                      isDarkMode ? "border-slate-800 bg-slate-900/50 hover:bg-slate-900" : "border-pink-200 bg-pink-50/30 hover:bg-pink-50"
                  )}
                >
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-4">
                    <div className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center shadow-sm text-violet-500",
                      isDarkMode ? "bg-slate-800" : "bg-white"
                    )}>
                      <Upload className="w-8 h-8" />
                    </div>
                    <div>
                      <p className={cn(
                        "text-lg font-bold",
                        isDarkMode ? "text-white" : "text-blue-900"
                      )}>Arraste seus arquivos aqui</p>
                      <p className={isDarkMode ? "text-slate-400 text-sm" : "text-emerald-600 text-sm"}>Ou clique para selecionar imagens, vídeos e documentos</p>
                    </div>
                    <div className="flex gap-4 mt-2">
                      <ImageIcon className="w-5 h-5 text-pink-400" />
                      <Video className="w-5 h-5 text-blue-400" />
                      <File className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                </div>

                {/* File List */}
                {uploadedFiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 space-y-3"
                  >
                    <h3 className={cn(
                      "font-bold flex items-center gap-2",
                      isDarkMode ? "text-white" : "text-blue-900"
                    )}>
                      Arquivos Selecionados ({uploadedFiles.length})
                    </h3>
                    <div className="grid gap-3">
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className={cn(
                          "flex items-center justify-between p-4 border rounded-xl shadow-sm",
                          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-pink-100"
                        )}>
                          <div className="flex items-center gap-3 overflow-hidden">
                            {file.type.startsWith('image/') ? <ImageIcon className="w-5 h-5 text-pink-400 shrink-0" /> :
                             file.type.startsWith('video/') ? <Video className="w-5 h-5 text-blue-400 shrink-0" /> :
                             <File className="w-5 h-5 text-emerald-400 shrink-0" />}
                            <span className={cn(
                              "text-sm font-medium truncate",
                              isDarkMode ? "text-slate-200" : "text-emerald-800"
                            )}>{file.name}</span>
                            <span className="text-xs text-emerald-500 shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                          <button
                            onClick={() => removeFile(idx)}
                            className={cn(
                              "p-1 rounded-full text-rose-500 transition-colors",
                              isDarkMode ? "hover:bg-slate-800" : "hover:bg-pink-50"
                            )}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end mt-6">
                      <button className="px-8 py-3 bg-blue-900 text-white font-bold rounded-full hover:bg-blue-800 transition-all shadow-lg">
                        Enviar Arquivos para o Acervo
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Blog Section */}
        <section id="blog" className={cn(
          "py-24 scroll-mt-24 transition-colors duration-500",
          isDarkMode ? "bg-slate-950" : "bg-white"
        )}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className={cn(
                "text-3xl md:text-4xl font-serif font-bold mb-4",
                isDarkMode ? "text-white" : "text-blue-900"
              )}>
                Blog do Amanhecer
              </h2>
              <p className={isDarkMode ? "text-slate-400" : "text-emerald-700"}>Artigos e reflexões para a sua jornada espiritual</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "A Importância do Doutrinador na Nova Era",
                  excerpt: "Entenda o papel fundamental do Doutrinador no equilíbrio das forças e na condução dos trabalhos espirituais.",
                  date: "10 Mar, 2026",
                  image: "https://picsum.photos/seed/doutrina/600/400"
                },
                {
                  title: "Manipulação de Energias: O Guia Básico",
                  excerpt: "Como Tia Neiva nos ensinou a lidar com as correntes magnéticas para o auxílio e a cura.",
                  date: "08 Mar, 2026",
                  image: "https://picsum.photos/seed/energy/600/400"
                },
                {
                  title: "O Chamado do Jaguar: Missão e Compromisso",
                  excerpt: "Reflexões sobre o compromisso assumido por cada Jaguar ao ingressar na Doutrina do Amanhecer.",
                  date: "05 Mar, 2026",
                  image: "https://picsum.photos/seed/mission/600/400"
                }
              ].map((post, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  className={cn(
                    "group rounded-2xl overflow-hidden border transition-all hover:shadow-xl",
                    isDarkMode ? "bg-slate-900 border-slate-800 shadow-sm" : "bg-white border-pink-100 shadow-sm"
                  )}
                >
                  <div className="aspect-video overflow-hidden">
                    <EditableImage 
                      id={`blog-${idx}`}
                      isDev={isDev}
                      defaultSrc={post.image} 
                      alt={post.title} 
                      className={cn(
                        "w-full h-full transition-transform duration-500",
                        idx === 0 ? "object-cover group-hover:scale-105" : "group-hover:scale-105"
                      )}
                    />
                  </div>
                  <div className="p-6">
                    <span className={cn(
                      "text-xs font-bold uppercase tracking-wider",
                      isDarkMode ? "text-violet-500" : "text-emerald-600"
                    )}>{post.date}</span>
                    <h3 className={cn(
                      "text-xl font-bold mt-2 mb-3 group-hover:text-blue-600 transition-colors",
                      isDarkMode ? "text-white" : "text-blue-900"
                    )}>{post.title}</h3>
                    <p className={cn(
                      "text-sm leading-relaxed mb-4",
                      isDarkMode ? "text-slate-400" : "text-emerald-700"
                    )}>{post.excerpt}</p>
                    <a href="#" className={cn(
                      "font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all",
                      isDarkMode ? "text-violet-500" : "text-blue-600"
                    )}>
                      Ler mais <Sparkles className="w-4 h-4" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Guarantee Section */}
        <section id="garantia" className={cn(
          "py-24 scroll-mt-24 transition-colors duration-500",
          isDarkMode ? "bg-slate-900" : "bg-pink-100"
        )}>
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className={cn(
              "inline-block p-4 rounded-full shadow-sm mb-8",
              isDarkMode ? "bg-slate-800" : "bg-white"
            )}>
              <EditableImage 
                id="guarantee-seal"
                isDev={isDev}
                defaultSrc="https://cdn-icons-png.flaticon.com/512/1041/1041916.png" 
                alt="Selo de Garantia" 
                className="w-16 h-16"
              />
            </div>
            <h2 className={cn(
              "text-3xl font-serif font-bold mb-6",
              isDarkMode ? "text-white" : "text-blue-900"
            )}>Sua Missão Sem Riscos</h2>
            <p className={cn(
              "text-lg mb-8 leading-relaxed",
              isDarkMode ? "text-slate-300" : "text-emerald-800"
            )}>
              Temos tanta confiança nos estudos deixados por Tia Neiva que oferecemos uma 
              <span className="font-bold"> Garantia Incondicional de 7 Dias</span>. Se por qualquer motivo você sentir que este conhecimento não é para você, devolvemos seu investimento integralmente. Sem perguntas, sem burocracia.
            </p>
            <div className={cn(
              "flex flex-wrap justify-center gap-4 text-sm font-medium",
              isDarkMode ? "text-slate-400" : "text-blue-800"
            )}>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Satisfação Garantida</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Risco Zero</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Compromisso Espiritual</span>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contato" className={cn(
          "py-24 scroll-mt-24 transition-colors duration-500",
          isDarkMode ? "bg-slate-950" : "bg-pink-50"
        )}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className={cn(
                "text-3xl md:text-4xl font-serif font-bold mb-4",
                isDarkMode ? "text-white" : "text-blue-900"
              )}>Entre em Contato</h2>
              <p className={isDarkMode ? "text-slate-400" : "text-emerald-700"}>Dúvidas sobre a jornada ou o portal? Estamos aqui para ajudar.</p>
            </div>

            <div className={cn(
              "max-w-4xl mx-auto rounded-[3rem] shadow-xl overflow-hidden border",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-pink-100"
            )}>
              <div className="flex flex-col md:flex-row">
                {/* Contact Info */}
                <div className={cn(
                  "md:w-1/3 p-12 text-white",
                  isDarkMode ? "bg-slate-800" : "bg-blue-900"
                )}>
                  <h3 className="text-2xl font-serif font-bold mb-8">Informações</h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <Sun className="w-6 h-6 text-violet-500 shrink-0" />
                      <div>
                        <p className="font-bold text-sm">Vale do Amanhecer</p>
                        <p className="text-xs opacity-70">Planaltina, DF - Brasil</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <MessageSquare className="w-6 h-6 text-emerald-400 shrink-0" />
                      <div>
                        <p className="font-bold text-sm">Atendimento</p>
                        <p className="text-xs opacity-70">Segunda a Sexta, 9h às 18h</p>
                      </div>
                    </div>
                  </div>
                  <div className={cn(
                    "mt-12 p-6 rounded-2xl border italic text-sm",
                    isDarkMode ? "bg-white/5 border-white/5" : "bg-white/10 border-white/10"
                  )}>
                    "Salve Deus! Onde houver um Jaguar, haverá uma luz acesa."
                  </div>
                </div>

                {/* Contact Form */}
                <div className="md:w-2/3 p-12">
                  <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className={cn(
                          "text-xs font-bold uppercase tracking-wider ml-1",
                          isDarkMode ? "text-slate-500" : "text-emerald-800"
                        )}>Nome</label>
                        <input 
                          type="text" 
                          placeholder="Seu nome completo"
                          className={cn(
                            "w-full px-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all border",
                            isDarkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-pink-50 border-pink-100 text-emerald-900"
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={cn(
                          "text-xs font-bold uppercase tracking-wider ml-1",
                          isDarkMode ? "text-slate-500" : "text-emerald-800"
                        )}>E-mail</label>
                        <input 
                          type="email" 
                          placeholder="seu@email.com"
                          className={cn(
                            "w-full px-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all border",
                            isDarkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-pink-50 border-pink-100 text-emerald-900"
                          )}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={cn(
                        "text-xs font-bold uppercase tracking-wider ml-1",
                        isDarkMode ? "text-slate-500" : "text-emerald-800"
                      )}>Assunto</label>
                      <input 
                        type="text" 
                        placeholder="Como podemos ajudar?"
                        className={cn(
                          "w-full px-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all border",
                          isDarkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-pink-50 border-pink-100 text-emerald-900"
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={cn(
                        "text-xs font-bold uppercase tracking-wider ml-1",
                        isDarkMode ? "text-slate-500" : "text-emerald-800"
                      )}>Mensagem</label>
                      <textarea 
                        rows={4}
                        placeholder="Escreva sua mensagem aqui..."
                        className={cn(
                          "w-full px-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all border resize-none",
                          isDarkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-pink-50 border-pink-100 text-emerald-900"
                        )}
                      ></textarea>
                    </div>
                    <button className={cn(
                      "w-full py-4 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2",
                      isDarkMode ? "bg-violet-600 hover:bg-violet-500" : "bg-violet-500 hover:bg-violet-600"
                    )}>
                      <Send className="w-5 h-5" /> Enviar Mensagem
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className={cn(
          "py-20 text-center transition-colors duration-500",
          isDarkMode ? "bg-slate-900 text-white" : "bg-blue-900 text-white"
        )}>
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
              Jesus Cristo, o Sol da Terra, te chama.
            </h2>
            <p className={cn(
              "mb-10 text-lg",
              isDarkMode ? "text-slate-400" : "text-pink-100"
            )}>
              Não deixe para amanhã o cumprimento do seu dever espiritual. O Vale do Amanhecer espera por você.
            </p>
            <button className="px-12 py-6 bg-violet-500 hover:bg-violet-600 text-white text-2xl font-bold rounded-full shadow-lg transition-all hover:scale-105 active:scale-95">
              Quero ser curado!
            </button>
          </div>
        </section>
      </main>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsLoginModalOpen(false)}
            className="absolute inset-0 bg-blue-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={cn(
              "relative w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-pink-100"
            )}
          >
            <div className="p-8 md:p-12">
              <div className="text-center mb-8">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                  isDarkMode ? "bg-slate-800" : "bg-pink-100"
                )}>
                  <Sun className="w-8 h-8 text-violet-500" />
                </div>
                <h2 className={cn(
                  "text-2xl font-serif font-bold",
                  isDarkMode ? "text-white" : "text-blue-900"
                )}>Portal do Jaguar</h2>
                <p className={isDarkMode ? "text-slate-400" : "text-emerald-700 text-sm"}>Acesse sua jornada espiritual</p>
              </div>

              <form className="space-y-6" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <label className={cn(
                    "text-xs font-bold uppercase tracking-wider ml-1",
                    isDarkMode ? "text-slate-500" : "text-emerald-800"
                  )}>E-mail</label>
                      <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                    <input 
                      type="email" 
                      required
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                      placeholder="seu@email.com"
                      className={cn(
                        "w-full pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all border",
                        isDarkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-pink-50 border-pink-100 text-emerald-900"
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={cn(
                    "text-xs font-bold uppercase tracking-wider ml-1",
                    isDarkMode ? "text-slate-500" : "text-emerald-800"
                  )}>Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                    <input 
                      type="password" 
                      required
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      placeholder="••••••••"
                      className={cn(
                        "w-full pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all border",
                        isDarkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-pink-50 border-pink-100 text-emerald-900"
                      )}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className={cn(
                    "flex items-center gap-2 cursor-pointer",
                    isDarkMode ? "text-slate-500" : "text-emerald-700"
                  )}>
                    <input type="checkbox" className="rounded border-pink-200 text-violet-500 focus:ring-violet-500" />
                    Lembrar de mim
                  </label>
                  <a href="#" className="text-blue-600 font-bold hover:underline">Esqueceu a senha?</a>
                </div>

                <button className="w-full py-4 bg-blue-900 text-white font-bold rounded-2xl hover:bg-blue-800 transition-all shadow-lg flex items-center justify-center gap-2">
                  <LogIn className="w-5 h-5" /> Entrar no Portal
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className={cn(
                  "text-sm",
                  isDarkMode ? "text-slate-400" : "text-emerald-700"
                )}>
                  Ainda não é um Jaguar? <a href="#" className="text-violet-600 font-bold hover:underline">Inicie sua jornada</a>
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsLoginModalOpen(false)}
              className={cn(
                "absolute top-6 right-6 p-2 rounded-full text-emerald-400 transition-colors",
                isDarkMode ? "hover:bg-slate-800" : "hover:bg-pink-50"
              )}
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      )}

      {/* Acervo Password Modal */}
      {isAcervoModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsAcervoModalOpen(false)}
            className="absolute inset-0 bg-blue-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={cn(
              "relative w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-pink-100"
            )}
          >
            <div className="p-8 md:p-12">
              <div className="text-center mb-8">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                  isDarkMode ? "bg-slate-800" : "bg-pink-100"
                )}>
                  <Lock className="w-8 h-8 text-violet-500" />
                </div>
                <h2 className={cn(
                  "text-2xl font-serif font-bold",
                  isDarkMode ? "text-white" : "text-blue-900"
                )}>Senha de Acesso</h2>
                <p className={isDarkMode ? "text-slate-400" : "text-emerald-700 text-sm"}>Digite a senha para acessar o material do Drive</p>
              </div>

              <form className="space-y-6" onSubmit={handleAcervoAccess}>
                <div className="space-y-2">
                  <label className={cn(
                    "text-xs font-bold uppercase tracking-wider ml-1",
                    isDarkMode ? "text-slate-500" : "text-emerald-800"
                  )}>Senha do Acervo</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                    <input 
                      type="password" 
                      required
                      value={acervoPassword}
                      onChange={(e) => setAcervoPassword(e.target.value)}
                      placeholder="Digite a senha"
                      className={cn(
                        "w-full pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all border",
                        isDarkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-pink-50 border-pink-100 text-emerald-900"
                      )}
                    />
                  </div>
                </div>

                <button className="w-full py-4 bg-violet-500 text-white font-bold rounded-2xl hover:bg-violet-600 transition-all shadow-lg flex items-center justify-center gap-2">
                  <LogIn className="w-5 h-5" /> Acessar Material
                </button>
              </form>
            </div>
            
            <button 
              onClick={() => setIsAcervoModalOpen(false)}
              className={cn(
                "absolute top-6 right-6 p-2 rounded-full text-emerald-400 transition-colors",
                isDarkMode ? "hover:bg-slate-800" : "hover:bg-pink-50"
              )}
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      )}

      <footer className={cn(
        "py-12 transition-colors duration-500 border-t",
        isDarkMode ? "bg-slate-950 border-slate-900" : "bg-pink-50 border-pink-200"
      )}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex flex-col items-center gap-6 mb-8">
            {isDev && (
              <button 
                onClick={resetAllImages}
                className={cn(
                  "flex items-center gap-2 text-xs font-bold transition-colors uppercase tracking-widest",
                  isDarkMode ? "text-rose-400 hover:text-rose-300" : "text-emerald-600 hover:text-violet-600"
                )}
              >
                <RefreshCw className="w-4 h-4" /> Resetar Todas as Imagens do Site
              </button>
            )}
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-lg opacity-30 animate-pulse"></div>
                <img 
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=120&h=120&q=80" 
                  alt="Sol do Amanhecer" 
                  className="w-12 h-12 rounded-full object-cover relative z-10 border-2 border-yellow-200 shadow-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className={cn(
                "font-serif italic text-2xl font-bold tracking-tight",
                isDarkMode ? "text-white" : "text-blue-900"
              )}>Vale do Amanhecer</span>
            </div>
            
            <div className="flex flex-col items-center justify-center gap-4 mt-8">
              <p className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                isDarkMode ? "text-slate-500" : "text-emerald-600"
              )}>Acompanhe nosso Canal Oficial</p>
              <a 
                href="https://www.youtube.com/channel/UCuXuIizz8_5nkLMWU-Vxo5g"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-8 py-4 bg-rose-600 text-white rounded-2xl transition-all hover:scale-105 hover:bg-rose-700 shadow-xl"
                title="Canal Oficial no YouTube"
              >
                <Youtube className="w-6 h-6" />
                <span className="font-bold text-sm">YouTube Amanhecer</span>
              </a>
            </div>
          </div>
          <p className={cn(
            "text-sm mb-2",
            isDarkMode ? "text-slate-400" : "text-emerald-700"
          )}>
            "Salve Deus! Onde houver um Jaguar, haverá uma luz acesa."
          </p>
          <p className={cn(
            "text-xs",
            isDarkMode ? "text-slate-600" : "text-blue-400"
          )}>
            © {new Date().getFullYear()} Portal de Estudos Doutrinários. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Back to Top Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: showBackToTop ? 1 : 0, 
          scale: showBackToTop ? 1 : 0.5,
          pointerEvents: showBackToTop ? 'auto' : 'none'
        }}
        onClick={scrollToTop}
        className={cn(
          "fixed bottom-8 right-8 p-4 rounded-full shadow-2xl z-[60] transition-all hover:scale-110 active:scale-95",
          isDarkMode ? "bg-violet-600 text-white" : "bg-blue-900 text-white"
        )}
        title="Voltar ao Topo"
      >
        <ArrowUp className="w-6 h-6" />
      </motion.button>
    </div>
  );
}
