/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
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
  Quote
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
}

const EditableImage: React.FC<EditableImageProps> = ({ id, defaultSrc, alt, className }) => {
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
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-2 bg-white rounded-full text-blue-900 shadow-lg hover:scale-110 transition-transform flex items-center gap-2 text-xs font-bold"
        >
          <Edit2 className="w-4 h-4" /> Alterar Imagem
        </button>
      </div>
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
}

const EditableVideo: React.FC<EditableVideoProps> = ({ id, defaultSrc, className }) => {
  const [videoSrc, setVideoSrc] = React.useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`video_${id}`);
    }
    return null;
  });
  const [isPlaying, setIsPlaying] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
      
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
        <div className="flex gap-3">
          {videoSrc && (
            <button 
              onClick={togglePlay}
              className="p-4 bg-amber-500 rounded-full text-white shadow-xl hover:scale-110 transition-transform"
            >
              {isPlaying ? <X className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
            </button>
          )}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-4 bg-white rounded-full text-blue-900 shadow-xl hover:scale-110 transition-transform flex items-center gap-2 text-sm font-bold"
          >
            <Upload className="w-5 h-5" /> {videoSrc ? 'Alterar Vídeo' : 'Upload Vídeo'}
          </button>
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

export default function App() {
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [showShareOptions, setShowShareOptions] = React.useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [loginData, setLoginData] = React.useState({ email: '', password: '' });

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
    <div className="min-h-screen bg-pink-50 font-sans text-emerald-900 selection:bg-pink-200">
      {/* Navigation / Header */}
      <nav className="fixed top-0 w-full bg-pink-100/80 backdrop-blur-md z-50 border-b border-pink-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="w-8 h-8 text-amber-500 fill-amber-500/20" />
            <span className="font-serif italic text-xl font-bold tracking-tight text-blue-900">
              Vale do Amanhecer
            </span>
          </div>
          <div className="hidden lg:flex gap-8 text-xs font-bold text-emerald-700 uppercase tracking-wider">
            <div className="group relative">
              <button className="hover:text-blue-600 transition-colors flex items-center gap-1">Doutrina <ChevronDown className="w-3 h-3" /></button>
              <div className="absolute top-full left-0 bg-white shadow-xl rounded-xl p-4 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border border-pink-100">
                <a href="#historia" className="block py-2 hover:text-blue-600">Nossa História</a>
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
                <a href="#arquivos" className="block py-2 hover:text-blue-600">Portal de Arquivos</a>
              </div>
            </div>
            <a href="#blog" className="hover:text-blue-600 transition-colors">Blog</a>
            <a href="#perolas" className="hover:text-blue-600 transition-colors">Só as Pérolas</a>
            <a href="#contato" className="hover:text-blue-600 transition-colors">Contato</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="px-6 py-2 bg-blue-900 text-white text-xs font-bold rounded-full hover:bg-blue-800 transition-all flex items-center gap-2"
            >
              <User className="w-4 h-4" /> Entrar
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-pink-200 to-pink-50 pt-20 pb-32">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-300 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200 rounded-full blur-3xl" />
          </div>

          <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-emerald-100 text-emerald-800 rounded-full">
                Missão Jaguar: O Chamado de Pai Seta Branca
              </span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-emerald-600 mb-4 uppercase tracking-wider">
                Vale do Amanhecer: A Luz da Nova Era
              </h2>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-blue-900 leading-[1.1] mb-6">
                Doutrinador: Domine a Ciência de Tia Neiva e <span className="text-emerald-700 italic">Cumpra seu Dever Sagrado</span> — Porque Fora da Caridade não há Salvação.
              </h1>
              <p className="text-lg md:text-xl text-emerald-700 max-w-2xl mx-auto mb-10 leading-relaxed">
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
              className="mt-12"
            >
              <button className="group relative px-10 py-5 bg-amber-500 hover:bg-amber-600 text-white text-xl font-bold rounded-full shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all hover:-translate-y-1 active:scale-95">
                Quero ser curado!
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-300 animate-pulse" />
              </button>
              <p className="mt-4 text-sm text-emerald-600 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Acesso imediato ao portal de estudos
              </p>
            </motion.div>
          </div>
        </section>

        {/* História Section */}
        <section id="historia" className="py-24 bg-white scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-blue-900 mb-4">Nossa História</h2>
              <p className="text-emerald-700">A trajetória de Tia Neiva e a fundação do Vale do Amanhecer.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="rounded-3xl overflow-hidden shadow-xl">
                <EditableImage 
                  id="history-img"
                  defaultSrc="https://picsum.photos/seed/history/800/1000" 
                  alt="História do Vale" 
                  className="w-full h-full"
                />
              </div>
              <div className="space-y-6 text-emerald-800 leading-relaxed">
                <p>
                  Tudo começou com a clarividência de Neiva Chaves Zelaya, carinhosamente conhecida como Tia Neiva. Em 1959, ela iniciou sua missão espiritual que culminaria na fundação do Vale do Amanhecer.
                </p>
                <p>
                  A Doutrina do Amanhecer é um sistema de vida espiritual que busca o equilíbrio do ser humano através do conhecimento de si mesmo e da caridade incondicional.
                </p>
                <div className="p-6 bg-pink-50 rounded-2xl border-l-4 border-emerald-500 italic">
                  "Minha missão é preparar o homem para a Nova Era, através do amor e do perdão." - Tia Neiva
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="beneficios" className="py-24 bg-pink-50 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-blue-900 mb-4">
                Transformações Reais no Vale do Amanhecer
              </h2>
              <p className="text-emerald-700">Baseado nos ensinamentos iniciáticos de Tia Neiva</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Heart className="w-8 h-8 text-rose-500" />,
                  title: "Equilíbrio Mediúnico",
                  desc: "Alcance a estabilidade necessária para atuar com segurança nos trabalhos do Templo."
                },
                {
                  icon: <BookOpen className="w-8 h-8 text-emerald-500" />,
                  title: "Leis do Amanhecer",
                  desc: "Compreensão profunda das leis que regem o Doutrinador e o Apará."
                },
                {
                  icon: <ShieldCheck className="w-8 h-8 text-blue-500" />,
                  title: "Proteção Espiritual",
                  desc: "Fortaleça sua aura através do conhecimento iniciático e da manipulação correta das energias."
                },
                {
                  icon: <Sun className="w-8 h-8 text-amber-500" />,
                  title: "Paz Interior",
                  desc: "Clareza mental e serenidade para conduzir trabalhos de desobsessão e cura."
                },
                {
                  icon: <Award className="w-8 h-8 text-purple-500" />,
                  title: "Maestria Doutrinária",
                  desc: "Torne-se um Jaguar preparado para os desafios da Nova Era."
                }
              ].map((benefit, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-2xl border border-pink-200 bg-white/50 hover:bg-white hover:shadow-xl transition-all"
                >
                  <div className="mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2">{benefit.title}</h3>
                  <p className="text-emerald-700 leading-relaxed">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>



        {/* Jornada do Jaguar Header */}
        <section className="py-12 bg-blue-900 text-white text-center">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">A Jornada do Jaguar</h2>
          <p className="text-pink-100 max-w-2xl mx-auto">Conheça os degraus da evolução mediúnica em nossa doutrina.</p>
        </section>

        {/* Desenvolvimento Section */}
        <section id="desenvolvimento" className="py-24 bg-white scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-blue-900 mb-6">Desenvolvimento Mediúnico</h2>
                <p className="text-lg text-emerald-800 mb-6 leading-relaxed">
                  O primeiro passo na jornada do Jaguar. Aqui, o médium aprende a equilibrar suas energias e a entender a sua missão espiritual sob a orientação dos Mestres.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-emerald-700">
                    <CheckCircle2 className="w-5 h-5 text-amber-500 mt-1 shrink-0" />
                    <span>Equilíbrio dos plexos e centros nervosos.</span>
                  </li>
                  <li className="flex items-start gap-3 text-emerald-700">
                    <CheckCircle2 className="w-5 h-5 text-amber-500 mt-1 shrink-0" />
                    <span>Primeiros contatos com a espiritualidade maior.</span>
                  </li>
                  <li className="flex items-start gap-3 text-emerald-700">
                    <CheckCircle2 className="w-5 h-5 text-amber-500 mt-1 shrink-0" />
                    <span>Desenvolvimento da sensibilidade e percepção.</span>
                  </li>
                </ul>
              </div>
              <div className="md:w-1/2 rounded-3xl overflow-hidden shadow-2xl">
                <EditableImage 
                  id="dev-img"
                  defaultSrc="https://picsum.photos/seed/dev/800/600" 
                  alt="Desenvolvimento" 
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Emplacamento Section */}
        <section id="emplacamento" className="py-24 bg-pink-50 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="md:w-1/2">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-blue-900 mb-6">Emplacamento</h2>
                <p className="text-lg text-emerald-800 mb-6 leading-relaxed">
                  A confirmação da sintonia mediúnica. O momento em que o médium se firma em sua corrente e assume o compromisso de servir à caridade.
                </p>
                <div className="p-6 bg-white rounded-2xl border border-pink-200 shadow-sm italic text-emerald-700">
                  "O emplacamento é a assinatura do seu compromisso com o Pai Seta Branca."
                </div>
              </div>
              <div className="md:w-1/2 rounded-3xl overflow-hidden shadow-2xl">
                <EditableImage 
                  id="emplacamento-img"
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
                <button className="px-8 py-4 bg-amber-500 text-white font-bold rounded-full hover:bg-amber-600 transition-all">
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
        <section id="mantras" className="py-24 bg-pink-50 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-blue-900 mb-4">Mantras do Vale do Amanhecer</h2>
              <p className="text-emerald-700">A força vibracional das palavras sagradas.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { title: "Prece de Simiromba", text: "Oh, Simiromba, do Grande Oriente de Oxalá! No mundo espiritual, onde tudo é luz..." },
                { title: "Pai Nosso do Amanhecer", text: "Pai Nosso que estais nos céus, na luz dos nossos plexos..." },
                { title: "Mantra da Unificação", text: "Senhor, faze com que sejamos um só pensamento, uma só vibração..." },
                { title: "Mantra de Cura", text: "Que as forças das águas e das matas tragam o alívio e a regeneração..." }
              ].map((mantra, idx) => (
                <div key={idx} className="p-8 bg-white rounded-3xl border border-pink-200 shadow-sm">
                  <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <Sun className="w-5 h-5 text-amber-500" /> {mantra.title}
                  </h3>
                  <p className="text-emerald-700 italic leading-relaxed">"{mantra.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Só as Pérolas Section */}
        <section id="perolas" className="py-24 bg-blue-900 text-white scroll-mt-24 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-amber-500 rounded-full blur-3xl" />
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
                  <Quote className="w-8 h-8 text-amber-400 mb-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                  <p className="text-lg font-medium leading-relaxed italic">
                    "{perola}"
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-widest">
                    <div className="w-8 h-[1px] bg-amber-300/50" />
                    Tia Neiva
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Músicas Ciganas Section */}
        <section id="musicas-ciganas" className="py-24 bg-white scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-blue-900 mb-4">Músicas Ciganas</h2>
              <p className="text-emerald-700">A alegria e a liberdade da alma cigana na nossa doutrina.</p>
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
                <div key={idx} className="flex items-center justify-between p-6 bg-pink-50 rounded-2xl border border-pink-100 hover:bg-pink-100 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-900">{music.title}</h3>
                      <p className="text-xs text-emerald-600">Espiritualidade Cigana</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-emerald-500">{music.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fotos Section */}
        <section id="fotos" className="py-24 bg-pink-50 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-blue-900 mb-4">Galeria de Fotos</h2>
              <p className="text-emerald-700">Momentos sagrados e a beleza da nossa Doutrina.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-md hover:scale-105 transition-transform cursor-pointer">
                  <EditableImage 
                    id={`gallery-${i}`}
                    defaultSrc={`https://picsum.photos/seed/vale${i}/400/400`} 
                    alt={`Foto ${i}`} 
                    className="w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Portal de Arquivos Section */}
        <section id="arquivos" className="py-24 bg-white scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-blue-900 mb-4">Portal de Arquivos do Jaguar</h2>
              <p className="text-emerald-700">Compartilhe e acesse materiais de estudo, vídeos e fotos da nossa doutrina.</p>
            </div>

            <div className="max-w-3xl mx-auto">
              {/* Upload Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                  "relative border-2 border-dashed rounded-[2rem] p-12 text-center transition-all duration-300",
                  isDragging ? "border-amber-500 bg-amber-50" : "border-pink-200 bg-pink-50/30 hover:bg-pink-50"
                )}
              >
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-amber-500">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-900">Arraste seus arquivos aqui</p>
                    <p className="text-sm text-emerald-600">Ou clique para selecionar imagens, vídeos e documentos</p>
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
                  <h3 className="font-bold text-blue-900 flex items-center gap-2">
                    Arquivos Selecionados ({uploadedFiles.length})
                  </h3>
                  <div className="grid gap-3">
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white border border-pink-100 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                          {file.type.startsWith('image/') ? <ImageIcon className="w-5 h-5 text-pink-400 shrink-0" /> :
                           file.type.startsWith('video/') ? <Video className="w-5 h-5 text-blue-400 shrink-0" /> :
                           <File className="w-5 h-5 text-emerald-400 shrink-0" />}
                          <span className="text-sm font-medium text-emerald-800 truncate">{file.name}</span>
                          <span className="text-xs text-emerald-500 shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                        <button
                          onClick={() => removeFile(idx)}
                          className="p-1 hover:bg-pink-50 rounded-full text-rose-500 transition-colors"
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
          </div>
        </section>

        {/* Blog Section */}
        <section id="blog" className="py-24 bg-white scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-blue-900 mb-4">
                Blog do Amanhecer
              </h2>
              <p className="text-emerald-700">Artigos e reflexões para a sua jornada espiritual</p>
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
                  className="group rounded-2xl overflow-hidden border border-pink-100 bg-white shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="aspect-video overflow-hidden">
                    <EditableImage 
                      id={`blog-${idx}`}
                      defaultSrc={post.image} 
                      alt={post.title} 
                      className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{post.date}</span>
                    <h3 className="text-xl font-bold text-blue-900 mt-2 mb-3 group-hover:text-blue-600 transition-colors">{post.title}</h3>
                    <p className="text-emerald-700 text-sm leading-relaxed mb-4">{post.excerpt}</p>
                    <a href="#" className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                      Ler mais <Sparkles className="w-4 h-4" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Guarantee Section */}
        <section id="garantia" className="py-24 bg-pink-100 scroll-mt-24">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-block p-4 bg-white rounded-full shadow-sm mb-8">
              <EditableImage 
                id="guarantee-seal"
                defaultSrc="https://cdn-icons-png.flaticon.com/512/1041/1041916.png" 
                alt="Selo de Garantia" 
                className="w-16 h-16"
              />
            </div>
            <h2 className="text-3xl font-serif font-bold text-blue-900 mb-6">Sua Missão Sem Riscos</h2>
            <p className="text-lg text-emerald-800 mb-8 leading-relaxed">
              Temos tanta confiança nos estudos deixados por Tia Neiva que oferecemos uma 
              <span className="font-bold"> Garantia Incondicional de 7 Dias</span>. Se por qualquer motivo você sentir que este conhecimento não é para você, devolvemos seu investimento integralmente. Sem perguntas, sem burocracia.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-blue-800">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Satisfação Garantida</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Risco Zero</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Compromisso Espiritual</span>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contato" className="py-24 bg-pink-50 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-blue-900 mb-4">Entre em Contato</h2>
              <p className="text-emerald-700">Dúvidas sobre a jornada ou o portal? Estamos aqui para ajudar.</p>
            </div>

            <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-xl overflow-hidden border border-pink-100">
              <div className="flex flex-col md:flex-row">
                {/* Contact Info */}
                <div className="md:w-1/3 bg-blue-900 p-12 text-white">
                  <h3 className="text-2xl font-serif font-bold mb-8">Informações</h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <Sun className="w-6 h-6 text-amber-500 shrink-0" />
                      <div>
                        <p className="font-bold text-sm">Vale do Amanhecer</p>
                        <p className="text-xs text-pink-100 opacity-70">Planaltina, DF - Brasil</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <MessageSquare className="w-6 h-6 text-emerald-400 shrink-0" />
                      <div>
                        <p className="font-bold text-sm">Atendimento</p>
                        <p className="text-xs text-pink-100 opacity-70">Segunda a Sexta, 9h às 18h</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-12 p-6 bg-white/10 rounded-2xl border border-white/10 italic text-sm">
                    "Salve Deus! Onde houver um Jaguar, haverá uma luz acesa."
                  </div>
                </div>

                {/* Contact Form */}
                <div className="md:w-2/3 p-12">
                  <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider ml-1">Nome</label>
                        <input 
                          type="text" 
                          placeholder="Seu nome completo"
                          className="w-full px-4 py-4 bg-pink-50 border border-pink-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-emerald-900"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider ml-1">E-mail</label>
                        <input 
                          type="email" 
                          placeholder="seu@email.com"
                          className="w-full px-4 py-4 bg-pink-50 border border-pink-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-emerald-900"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider ml-1">Assunto</label>
                      <input 
                        type="text" 
                        placeholder="Como podemos ajudar?"
                        className="w-full px-4 py-4 bg-pink-50 border border-pink-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-emerald-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider ml-1">Mensagem</label>
                      <textarea 
                        rows={4}
                        placeholder="Escreva sua mensagem aqui..."
                        className="w-full px-4 py-4 bg-pink-50 border border-pink-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-emerald-900 resize-none"
                      ></textarea>
                    </div>
                    <button className="w-full py-4 bg-amber-500 text-white font-bold rounded-2xl hover:bg-amber-600 transition-all shadow-lg flex items-center justify-center gap-2">
                      <Send className="w-5 h-5" /> Enviar Mensagem
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-blue-900 text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
              Jesus Cristo, o Sol da Terra, te chama.
            </h2>
            <p className="text-pink-100 mb-10 text-lg">
              Não deixe para amanhã o cumprimento do seu dever espiritual. O Vale do Amanhecer espera por você.
            </p>
            <button className="px-12 py-6 bg-amber-500 hover:bg-amber-600 text-white text-2xl font-bold rounded-full shadow-lg transition-all hover:scale-105 active:scale-95">
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
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sun className="w-8 h-8 text-amber-500" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-blue-900">Portal do Jaguar</h2>
                <p className="text-emerald-700 text-sm">Acesse sua jornada espiritual</p>
              </div>

              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider ml-1">E-mail</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                    <input 
                      type="email" 
                      placeholder="seu@email.com"
                      className="w-full pl-12 pr-4 py-4 bg-pink-50 border border-pink-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-emerald-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider ml-1">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 bg-pink-50 border border-pink-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-emerald-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-emerald-700 cursor-pointer">
                    <input type="checkbox" className="rounded border-pink-200 text-amber-500 focus:ring-amber-500" />
                    Lembrar de mim
                  </label>
                  <a href="#" className="text-blue-600 font-bold hover:underline">Esqueceu a senha?</a>
                </div>

                <button className="w-full py-4 bg-blue-900 text-white font-bold rounded-2xl hover:bg-blue-800 transition-all shadow-lg flex items-center justify-center gap-2">
                  <LogIn className="w-5 h-5" /> Entrar no Portal
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-emerald-700">
                  Ainda não é um Jaguar? <a href="#" className="text-amber-600 font-bold hover:underline">Inicie sua jornada</a>
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-6 right-6 p-2 hover:bg-pink-50 rounded-full text-emerald-400 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      )}

      <footer className="py-12 bg-pink-50 border-t border-pink-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex flex-col items-center gap-6 mb-8">
            <button 
              onClick={resetAllImages}
              className="flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-amber-600 transition-colors uppercase tracking-widest"
            >
              <RefreshCw className="w-4 h-4" /> Resetar Todas as Imagens do Site
            </button>
            <div className="flex items-center justify-center gap-2">
              <Sun className="w-6 h-6 text-amber-500" />
              <span className="font-serif italic text-lg font-bold text-blue-900">Vale do Amanhecer</span>
            </div>
          </div>
          <p className="text-emerald-700 text-sm mb-2">
            "Salve Deus! Onde houver um Jaguar, haverá uma luz acesa."
          </p>
          <p className="text-blue-400 text-xs">
            © {new Date().getFullYear()} Portal de Estudos Doutrinários. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
