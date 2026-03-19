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
  File as FileIcon,
  Video as VideoIcon,
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
  Instagram,
  ArrowUp,
  Youtube,
  ArrowRight,
  Trash2,
  Music,
  Pause,
  Volume2,
  HeartHandshake,
  Mic2,
  Coins,
  Bell,
  Plus,
  Calendar,
  Tag,
  Trash,
  Compass,
  Star,
  Unlock,
  Edit3,
  Layout,
  ExternalLink
} from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string;
}

interface SiteConfig {
  siteName: string;
  siteSubtitle: string;
  logoUrl: string;
  contactEmail: string;
  youtubeChannel: string;
  tipaUrl: string;
  pixKey: string;
  masterKey: string;
}

interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  title: string;
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { get, set, del } from 'idb-keyval';

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

interface EditableTextProps {
  id: string;
  defaultText: string;
  className?: string;
  isDev?: boolean;
  tagName?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'div';
}

import { Routes, Route, Navigate } from 'react-router-dom';
import Admin from './components/Admin';
import Login from './components/Login';
import { db, storage } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { handleFirestoreError, OperationType } from './lib/firestore-errors';

const EditableText: React.FC<EditableTextProps> = ({ id, defaultText, className, isDev, tagName: Tag = 'span' }) => {
  const [text, setText] = React.useState(defaultText);
  const [isEditing, setIsEditing] = React.useState(false);
  const [tempText, setTempText] = React.useState(defaultText);

  React.useEffect(() => {
    const loadText = async () => {
      try {
        const docRef = doc(db, 'content', `text_${id}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setText(docSnap.data().value);
          setTempText(docSnap.data().value);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `content/text_${id}`);
      }
    };
    loadText();
  }, [id]);

  const handleSave = async () => {
    setText(tempText);
    try {
      await setDoc(doc(db, 'content', `text_${id}`), {
        value: tempText,
        type: 'text',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `content/text_${id}`);
    }
    setIsEditing(false);
  };

  if (isDev && isEditing) {
    return (
      <div className={cn("relative w-full", className)}>
        <textarea
          value={tempText}
          onChange={(e) => setTempText(e.target.value)}
          className="w-full p-2 border-2 border-blue-500 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-300 min-h-[100px]"
          autoFocus
        />
        <div className="flex gap-2 mt-2">
          <button 
            onClick={handleSave}
            className="px-4 py-1 bg-emerald-600 text-white text-xs font-bold rounded-md hover:bg-emerald-700 transition-colors"
          >
            Salvar
          </button>
          <button 
            onClick={() => { setIsEditing(false); setTempText(text); }}
            className="px-4 py-1 bg-slate-400 text-white text-xs font-bold rounded-md hover:bg-slate-500 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <Tag 
      className={cn(
        className, 
        isDev && "cursor-pointer hover:bg-blue-50/50 transition-colors rounded px-1 border border-transparent hover:border-blue-200"
      )}
      onClick={() => isDev && setIsEditing(true)}
      title={isDev ? "Clique para editar texto" : undefined}
    >
      {text}
    </Tag>
  );
};

const EditableImage: React.FC<EditableImageProps> = ({ id, defaultSrc, alt, className, isDev }) => {
  const [src, setSrc] = React.useState<string>(defaultSrc);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [aiError, setAiError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const loadImage = async () => {
      try {
        const docRef = doc(db, 'content', `img_${id}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSrc(docSnap.data().value);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `content/img_${id}`);
      }
    };
    loadImage();
  }, [id]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAiError(null);
      setUploadProgress(0);
      setIsUploading(true);
      try {
        const storageRef = ref(storage, `images/${id}_${Date.now()}`);
        const uploadTask = uploadBytes(storageRef, file);
        
        // Note: Simple uploadBytes doesn't give progress easily without uploadBytesResumable
        // but for simplicity we'll just wait
        await uploadTask;
        const url = await getDownloadURL(storageRef);
        
        setSrc(url);
        await setDoc(doc(db, 'content', `img_${id}`), {
          value: url,
          type: 'image',
          updatedAt: new Date().toISOString()
        }, { merge: true });

      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `content/img_${id}`);
      } finally {
        setIsUploading(false);
      }
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
      
      {/* Loading Overlay */}
      {isUploading && (
        <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-40 animate-in fade-in duration-300">
          <div className="relative">
            <RefreshCw className="w-10 h-10 text-white animate-spin mb-3" />
            <div className="absolute inset-0 blur-xl bg-blue-400/30 animate-pulse" />
          </div>
          <p className="text-white text-sm font-bold uppercase tracking-widest animate-pulse">
            {uploadProgress > 0 ? "Enviando Imagem" : "Verificando com IA"}
          </p>
          
          <div className="mt-4 flex flex-col items-center w-full px-6">
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mb-2">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress || 30}%` }}
                className="h-full bg-blue-400"
              />
            </div>
          </div>
        </div>
      )}

      {aiError && (
        <div className="absolute inset-0 bg-rose-600/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-50 animate-in zoom-in duration-300">
          <ShieldCheck className="w-12 h-12 text-white mb-3" />
          <h4 className="text-white font-bold uppercase tracking-tighter mb-1">Segurança Espiritual</h4>
          <p className="text-white/90 text-xs font-medium mb-4 max-w-[180px]">{aiError}</p>
          <button 
            onClick={() => setAiError(null)}
            className="px-6 py-2 bg-white text-rose-600 rounded-full text-[10px] font-bold uppercase hover:bg-rose-50 transition-colors shadow-lg"
          >
            Entendido
          </button>
        </div>
      )}

      {isDev && !isUploading && (
        <>
          <div className="absolute top-2 left-2 z-40 bg-blue-600 text-white p-1.5 rounded-lg shadow-lg animate-pulse">
            <Edit2 className="w-3 h-3" />
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-30">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-white rounded-full text-blue-900 shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 text-xs font-bold"
            >
              <Edit2 className="w-4 h-4" /> Alterar Imagem
            </button>
          </div>
        </>
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

interface EditableMediaProps {
  id: string;
  defaultSrc?: string;
  className?: string;
  isDev?: boolean;
}

const VideoPlayer: React.FC<{ title: string; id: string; description: string; isDev: boolean; isDarkMode: boolean }> = ({ title, id, description, isDev, isDarkMode }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={cn(
        "p-6 rounded-3xl border transition-all h-full flex flex-col",
        isDarkMode ? "bg-slate-900 border-slate-800 hover:bg-slate-800 hover:shadow-2xl" : "bg-white border-pink-100 hover:shadow-xl"
      )}
    >
      <div className="mb-4">
        <h3 className={cn(
          "text-xl font-bold mb-2",
          isDarkMode ? "text-white" : "text-blue-900"
        )}>{title}</h3>
        <p className={cn(
          "text-sm leading-relaxed",
          isDarkMode ? "text-slate-400" : "text-emerald-700"
        )}>{description}</p>
      </div>
      <div className="mt-auto aspect-video rounded-2xl overflow-hidden bg-black relative group border-2 border-transparent hover:border-violet-500 transition-all">
        <EditableMedia 
          id={id}
          isDev={isDev}
          className="w-full h-full"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity bg-black/20">
           <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
             <Play className="w-8 h-8 text-white fill-white ml-1" />
           </div>
        </div>
      </div>
    </motion.div>
  );
};

const EditableMedia: React.FC<EditableMediaProps> = ({ id, defaultSrc, className, isDev }) => {
  const [mediaSrc, setMediaSrc] = React.useState<string | null>(null);
  const [mediaType, setMediaType] = React.useState<'video' | 'audio' | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [uploadSpeed, setUploadSpeed] = React.useState(0);
  const [uploadedBytes, setUploadedBytes] = React.useState(0);
  const [totalBytes, setTotalBytes] = React.useState(0);
  const [timeRemaining, setTimeRemaining] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [lastFile, setLastFile] = React.useState<File | null>(null);
  const mediaRef = React.useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const loadMedia = async () => {
      setIsLoading(true);
      try {
        // Try server first
        const serverMappingResponse = await fetch('/api/media');
        if (serverMappingResponse.ok) {
          const mapping = await serverMappingResponse.json();
          if (mapping[id]) {
            setMediaSrc(mapping[id]);
            const isVideo = mapping[id].match(/\.(mp4|webm|ogg)$/i);
            setMediaType(isVideo ? 'video' : 'audio');
            setIsLoading(false);
            return;
          }
        }

        const storedMedia = await get(`media_${id}`);
        const storedType = await get(`media_type_${id}`);
        
        if (typeof Blob !== 'undefined' && storedMedia instanceof Blob) {
          setMediaSrc(URL.createObjectURL(storedMedia));
          setMediaType(storedType as 'video' | 'audio');
        } else if (typeof storedMedia === 'string') {
          // Backward compatibility for base64 strings from localStorage
          setMediaSrc(storedMedia);
          setMediaType(storedType as 'video' | 'audio');
        }
      } catch (err) {
        console.error("Error loading media:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadMedia();
    
    return () => {
      if (mediaSrc && mediaSrc.startsWith('blob:')) {
        URL.revokeObjectURL(mediaSrc);
      }
    };
  }, [id]);

  const verifyMediaWithAI = async (file: File): Promise<{ allowed: boolean; reason?: string }> => {
    if (!isDev) return { allowed: true };

    try {
      const { GoogleGenAI } = await import("@google/genai");
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key missing");
      
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `Um usuário está tentando subir um arquivo de mídia (${file.type}, nome: ${file.name}) para um portal do Vale do Amanhecer.
      O portal é sagrado e dedicado à Doutrina do Amanhecer.
      Baseado apenas no nome do arquivo e no tipo, existe algum indício de conteúdo impróprio, ofensivo ou malicioso?
      Responda estritamente em JSON: {"allowed": boolean, "reason": "explicação curta em português"}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text || '{"allowed": false, "reason": "Erro na resposta da IA"}';
      return JSON.parse(text);
    } catch (err) {
      console.error("AI Verification Error:", err);
      return { allowed: true }; // Default to allow if AI fails for media to avoid blocking legitimate large files
    }
  };

  const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement> | File) => {
    const file = (typeof File !== 'undefined' && e instanceof File) ? e : (e as React.ChangeEvent<HTMLInputElement>).target.files?.[0];
    if (!file) return;
    
    setLastFile(file);
    setError(null);
    setUploadProgress(0);
    setUploadSpeed(0);

    const isVideo = file.type.startsWith('video/');
    const isAudio = file.type.startsWith('audio/');

    if (!isVideo && !isAudio) {
      setError("Por favor, selecione apenas arquivos de vídeo ou áudio.");
      return;
    }

    if (file.size > 300 * 1024 * 1024) {
      setError("O arquivo é muito grande. O limite é de 300MB.");
      return;
    }

    setIsUploading(true);
    
    try {
      // 1. AI Verification - Only for admin curation
      if (isDev) {
        setIsVerifying(true);
        const verification = await verifyMediaWithAI(file);
        setIsVerifying(false);
        
        if (!verification.allowed) {
          setError(verification.reason || "Arquivo rejeitado pela segurança da IA.");
          setIsUploading(false);
          return;
        }
      }

      // 2. Upload with progress
      const type = isVideo ? 'video' : 'audio';
      const formData = new FormData();
      formData.append('id', id);
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      let startTime = Date.now();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
          setUploadedBytes(event.loaded);
          setTotalBytes(event.total);
          
          const currentTime = Date.now();
          const duration = (currentTime - startTime) / 1000; // seconds
          if (duration > 0) {
            const speed = event.loaded / duration; // Bytes/s
            setUploadSpeed(speed / 1024); // KB/s
            
            const remainingBytes = event.total - event.loaded;
            const remainingTime = remainingBytes / speed;
            setTimeRemaining(remainingTime);
          }
        }
      });

      const uploadPromise = new Promise<{ url: string }>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload falhou com status ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Erro de rede durante o envio'));
        xhr.ontimeout = () => reject(new Error('O envio demorou demais e expirou'));
      });

      xhr.open('POST', '/api/upload');
      xhr.send(formData);

      const data = await uploadPromise;
      
      // Save to IndexedDB as well for offline fallback and persistence
      try {
        await set(`media_${id}`, file);
        await set(`media_type_${id}`, type);
      } catch (idbErr) {
        console.warn("Could not save to IndexedDB:", idbErr);
      }

      setMediaSrc(data.url);
      setMediaType(type);
      
    } catch (err) {
      console.error("Error saving media:", err);
      setError(err instanceof Error ? err.message : "Erro ao salvar mídia. Tente novamente.");
    } finally {
      setIsUploading(false);
      setIsVerifying(false);
    }
  };

  const removeMedia = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Deseja realmente remover este arquivo de mídia?")) {
      try {
        await del(`media_${id}`);
        await del(`media_type_${id}`);
        
        // Also try to notify the server to reset this mapping if possible
        try {
          await fetch('/api/media/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
          });
        } catch (serverErr) {
          console.warn("Could not notify server of media removal:", serverErr);
        }

        if (mediaSrc && mediaSrc.startsWith('blob:')) {
          URL.revokeObjectURL(mediaSrc);
        }
        setMediaSrc(null);
        setMediaType(null);
      } catch (err) {
        console.error("Error deleting media from IndexedDB:", err);
      }
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className={cn("relative group w-full h-full", className)}>
      {isDev && !isUploading && (
        <div className="absolute top-4 left-4 z-40 bg-violet-600 text-white p-2 rounded-xl shadow-lg animate-pulse">
          <Edit2 className="w-4 h-4" />
        </div>
      )}

      {isLoading ? (
        <div className="w-full h-full bg-blue-900/40 backdrop-blur-sm flex flex-col items-center justify-center">
          <RefreshCw className="w-10 h-10 text-white animate-spin mb-2" />
          <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Carregando Mídia...</span>
        </div>
      ) : mediaSrc ? (
        mediaType === 'video' ? (
          <video 
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={mediaSrc} 
            className="w-full h-full object-cover"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-8">
            <motion.div
              animate={isPlaying ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-24 h-24 rounded-full bg-violet-500 flex items-center justify-center mb-4 shadow-2xl"
            >
              <Music className="w-12 h-12" />
            </motion.div>
            <p className="text-sm font-bold uppercase tracking-widest opacity-60">Áudio de Abertura</p>
            <audio 
              ref={mediaRef as React.RefObject<HTMLAudioElement>}
              src={mediaSrc}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        )
      ) : defaultSrc && (defaultSrc.includes('youtube.com') || defaultSrc.includes('youtu.be')) ? (
        <iframe
          src={defaultSrc}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="w-full h-full bg-blue-900/50 flex items-center justify-center">
          <VideoIcon className="w-16 h-16 text-white/20" />
        </div>
      )}
      
      {/* Loading Overlay */}
      {isUploading && (
        <div className="absolute inset-0 bg-violet-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-40 animate-in fade-in duration-300">
          <div className="relative">
            <RefreshCw className="w-12 h-12 text-white animate-spin mb-4" />
            <div className="absolute inset-0 blur-2xl bg-violet-400/40 animate-pulse" />
          </div>
          <p className="text-white text-sm font-bold uppercase tracking-widest animate-pulse">
            {isVerifying ? "Analisando Mídia" : "Enviando Arquivo"}
          </p>
          
          {!isVerifying && (
            <div className="mt-4 flex flex-col items-center w-full px-8">
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  className="h-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.5)]"
                />
              </div>
              <div className="flex justify-between w-full text-[10px] text-white/80 font-mono mb-1">
                <span>{uploadProgress}%</span>
                <span>
                  {uploadSpeed > 1024 
                    ? `${(uploadSpeed / 1024).toFixed(1)} MB/s` 
                    : `${Math.round(uploadSpeed)} KB/s`}
                </span>
              </div>
              <div className="flex justify-between w-full text-[9px] text-white/60 font-mono">
                <span>
                  {(uploadedBytes / (1024 * 1024)).toFixed(1)} / {(totalBytes / (1024 * 1024)).toFixed(1)} MB
                </span>
                {timeRemaining !== null && (
                  <span>
                    {timeRemaining > 60 
                      ? `${Math.floor(timeRemaining / 60)}m ${Math.round(timeRemaining % 60)}s` 
                      : `${Math.round(timeRemaining)}s`} restantes
                  </span>
                )}
              </div>
            </div>
          )}
          
          {isVerifying && (
            <div className="mt-6 w-40 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="w-full h-full bg-violet-400"
              />
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-rose-600/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-50 animate-in zoom-in duration-300">
          <ShieldCheck className="w-12 h-12 text-white mb-4" />
          <h4 className="text-white font-bold uppercase tracking-tighter mb-2">Falha na Segurança</h4>
          <p className="text-white/90 text-xs font-medium mb-6 max-w-[220px] leading-relaxed">{error}</p>
          <div className="flex gap-3">
            <button 
              onClick={() => setError(null)}
              className="px-6 py-2 bg-white/10 text-white border border-white/20 rounded-full text-[10px] font-bold uppercase hover:bg-white/20 transition-colors"
            >
              Fechar
            </button>
            {lastFile && (
              <button 
                onClick={() => handleMediaChange(lastFile)}
                className="px-6 py-2 bg-white text-rose-600 rounded-full text-[10px] font-bold uppercase hover:bg-rose-50 transition-colors shadow-lg flex items-center gap-2"
              >
                <RefreshCw className="w-3 h-3" /> Tentar Novamente
              </button>
            )}
          </div>
        </div>
      )}
      
      <div className={cn(
        "absolute inset-0 bg-black/40 transition-opacity flex flex-col items-center justify-center gap-4 z-20",
        isUploading ? "opacity-0 pointer-events-none" : "opacity-0 group-hover:opacity-100"
      )}>
        <div className="flex gap-3">
          {mediaSrc && (
            <button 
              onClick={togglePlay}
              className="p-4 bg-violet-500 rounded-full text-white shadow-xl hover:scale-110 transition-transform"
              title={isPlaying ? "Pausar" : "Reproduzir"}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
            </button>
          )}
          {isDev && (
            <>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="p-4 bg-white rounded-full text-blue-900 shadow-xl hover:scale-110 transition-transform flex items-center gap-2 text-sm font-bold disabled:opacity-50"
                title="Upload Mídia"
              >
                {isUploading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
                {isUploading ? 'Enviando...' : (mediaSrc ? 'Substituir' : 'Upload')}
              </button>
              {mediaSrc && (
                <button 
                  onClick={removeMedia}
                  className="p-4 bg-rose-500 rounded-full text-white shadow-xl hover:scale-110 transition-transform"
                  title="Remover Mídia"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </>
          )}
        </div>
        {!mediaSrc && isDev && (
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Vídeo ou Áudio (Máx 50MB)</p>
        )}
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleMediaChange} 
        accept="video/*,audio/*" 
        className="hidden" 
      />
    </div>
  );
};

const LetterTranscriber: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [image, setImage] = React.useState<string | null>(null);
  const [transcription, setTranscription] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const verifyImageWithAI = async (base64: string, mimeType: string): Promise<{ allowed: boolean; reason?: string }> => {
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key missing");
      
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `Analise esta imagem para um sistema de transcrição de cartas do Vale do Amanhecer. 
      A imagem deve ser uma carta manuscrita, documento antigo ou algo relacionado à Doutrina do Vale do Amanhecer (Tia Neiva, Pai Seta Branca, rituais, etc).
      REJEITE terminantemente: pornografia, violência, ódio, propaganda política, memes ofensivos ou qualquer conteúdo que não seja um documento ou imagem sagrada compatível.
      Responda estritamente em JSON: {"allowed": boolean, "reason": "explicação curta em português"}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { inlineData: { data: base64, mimeType } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text || '{"allowed": false, "reason": "Erro na resposta da IA"}';
      return JSON.parse(text);
    } catch (err) {
      console.error("AI Verification Error:", err);
      return { allowed: false, reason: "Erro de conexão com a segurança da IA." };
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      setIsVerifying(true);
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Full = reader.result as string;
        const base64Data = base64Full.split(',')[1];
        
        const verification = await verifyImageWithAI(base64Data, file.type);
        
        if (verification.allowed) {
          setImage(base64Full);
        } else {
          setError(verification.reason || "Conteúdo não permitido.");
          setImage(null);
        }
        setIsVerifying(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const transcribeLetter = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const { GoogleGenAI } = await import("@google/genai");
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
                {isVerifying ? (
                  <RefreshCw className="w-12 h-12 text-violet-500 mx-auto mb-4 animate-spin" />
                ) : (
                  <ImageIcon className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                )}
                <p className={cn("text-sm", isDarkMode ? "text-slate-400" : "text-emerald-700")}>
                  {isVerifying ? "Verificando segurança da imagem..." : "Faça o upload da imagem da carta para transcrição"}
                </p>
              </div>
            )}
            {!isVerifying && (
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            )}
          </div>
          <button 
            onClick={transcribeLetter}
            disabled={!image || loading || isVerifying}
            className={cn(
              "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg",
              !image || loading || isVerifying ? "bg-slate-300 cursor-not-allowed" : "bg-violet-500 hover:bg-violet-600 text-white"
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
                <FileIcon className="w-12 h-12 mb-4" />
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

const MediaGallerySection: React.FC<{ 
  isDarkMode: boolean; 
  isDev: boolean; 
  items: GalleryItem[]; 
  onAdd: (type: 'image' | 'video') => void;
  onDelete: (id: string) => void;
}> = ({ isDarkMode, isDev, items, onAdd, onDelete }) => {
  const [activeTab, setActiveTab] = React.useState<'all' | 'image' | 'video'>('all');
  
  const filteredItems = items.filter(item => activeTab === 'all' || item.type === activeTab);

  return (
    <section id="galeria" className={cn(
      "py-24 scroll-mt-24 transition-colors duration-500",
      isDarkMode ? "bg-slate-900" : "bg-white"
    )}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="p-2 bg-violet-500 rounded-xl text-white">
                <ImageIcon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-violet-500">Acervo Visual</span>
            </div>
            <h2 className={cn(
              "text-3xl md:text-4xl font-serif font-bold",
              isDarkMode ? "text-white" : "text-blue-900"
            )}>
              Galeria de Mídia
            </h2>
          </div>

          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            {(['all', 'image', 'video'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                  activeTab === tab 
                    ? "bg-white dark:bg-slate-700 text-violet-500 shadow-md" 
                    : "text-slate-500 hover:text-violet-400"
                )}
              >
                {tab === 'all' ? 'Tudo' : tab === 'image' ? 'Fotos' : 'Vídeos'}
              </button>
            ))}
          </div>
          
          {isDev && (
            <div className="flex gap-2">
              <button 
                onClick={() => onAdd('image')}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                <Plus className="w-5 h-5" /> Foto
              </button>
              <button 
                onClick={() => onAdd('video')}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                <Plus className="w-5 h-5" /> Vídeo
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "group relative rounded-[2rem] overflow-hidden border-4 transition-all hover:shadow-2xl",
                isDarkMode ? "bg-slate-950 border-slate-800" : "bg-white border-white shadow-xl"
              )}
            >
              <div className="aspect-square relative">
                {item.type === 'image' ? (
                  <EditableImage 
                    id={item.id}
                    isDev={isDev}
                    defaultSrc={`https://picsum.photos/seed/${item.id}/800/800`}
                    alt={item.title}
                    className="w-full h-full"
                  />
                ) : (
                  <EditableMedia 
                    id={item.id}
                    isDev={isDev}
                    className="w-full h-full"
                  />
                )}
                
                {/* Overlay Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <p className="text-white font-bold text-sm mb-1">{item.title}</p>
                  <span className="text-[10px] text-white/60 uppercase tracking-widest font-bold">
                    {item.type === 'image' ? 'Fotografia' : 'Vídeo Aula'}
                  </span>
                </div>

                {isDev && (
                  <button 
                    onClick={() => onDelete(item.id)}
                    className="absolute top-4 right-4 p-2 bg-rose-600 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700 shadow-lg z-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="py-20 text-center">
            <div className="inline-flex p-6 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 mb-4">
              <ImageIcon className="w-12 h-12" />
            </div>
            <p className={cn(
              "text-lg font-medium",
              isDarkMode ? "text-slate-500" : "text-slate-400"
            )}>Nenhum item encontrado nesta categoria.</p>
          </div>
        )}
      </div>
    </section>
  );
};

const DonationSection: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const pixKey = "jesuscristopaisetabranca@gmail.com";
  
  const copyPix = () => {
    navigator.clipboard.writeText(pixKey);
    alert("Chave PIX copiada! Que os Pretos Velhos lhe recompensem pela caridade.");
  };

  return (
    <section id="doacao" className="py-24 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className={cn(
          "p-12 rounded-[3rem] border shadow-2xl text-center relative overflow-hidden",
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-pink-100"
        )}>
          {/* Decorative Background */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-violet-500 to-blue-500" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

          <div className="inline-flex p-4 bg-rose-500/10 rounded-3xl text-rose-500 mb-8">
            <HeartHandshake className="w-10 h-10" />
          </div>

          <EditableText 
            id="doacao-title" 
            isDev={true} 
            tagName="h2"
            className={cn(
              "text-4xl font-serif font-bold mb-4 tracking-tight",
              isDarkMode ? "text-white" : "text-blue-900"
            )}
            defaultText="Mantenha este Portal de Pé" 
          />
          
          <EditableText 
            id="doacao-description" 
            isDev={true} 
            tagName="p"
            className={cn(
              "text-lg mb-10 max-w-2xl mx-auto leading-relaxed",
              isDarkMode ? "text-slate-400" : "text-emerald-800"
            )}
            defaultText='"Fora da caridade não há salvação." Este portal é mantido de forma independente para servir à nossa Doutrina. Sua contribuição ajuda a pagar os custos de servidor e IA, garantindo que a luz continue brilhando para todos os jaguares.' 
          />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="https://tipa.ai/jesuscristopaisetabranca"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold transition-all shadow-xl hover:scale-105 active:scale-95 text-lg"
            >
              <Heart className="w-5 h-5 fill-current" /> <EditableText id="doacao-btn-tipa" isDev={true} defaultText="Doar via Tipa.ai" />
            </a>
            <button 
              onClick={copyPix}
              className="flex items-center gap-2 px-8 py-4 bg-violet-500 hover:bg-violet-600 text-white rounded-2xl font-bold transition-all shadow-lg hover:scale-105 active:scale-95 text-lg"
            >
              <LinkIcon className="w-5 h-5" /> <EditableText id="doacao-btn-pix" isDev={true} defaultText="Copiar Chave PIX" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-600">
            <Coins className="w-4 h-4" />
            <EditableText id="doacao-footer" isDev={true} defaultText="Qualquer valor é uma semente de luz" />
          </div>
        </div>
      </div>
    </section>
  );
};

const HistoriaValeSection: React.FC<{ isDarkMode: boolean; isDev: boolean }> = ({ isDarkMode, isDev }) => {
  const timelineItems = [
    { id: "h1", year: "1959", title: "O Despertar", desc: "Tia Neiva inicia sua missão espiritual em Alexânia, Goiás, fundando a União Espiritualista Seta Branca (UESB).", img: "https://picsum.photos/seed/hist1/800/600" },
    { id: "h2", year: "1964", title: "Taguatinga", desc: "A comunidade se transfere para Taguatinga, onde a doutrina começa a se estruturar e atrair os primeiros médiuns.", img: "https://picsum.photos/seed/hist2/800/600" },
    { id: "h3", year: "1969", title: "Fundação do Vale", desc: "Ocupação da área atual em Planaltina, DF. Início da construção do Templo Mãe e das primeiras casas.", img: "https://picsum.photos/seed/hist3/800/600" },
    { id: "h4", year: "1970", title: "Mário Sassi", desc: "Mário Sassi (Trino Tumuchy) une-se à missão, trazendo a sistematização intelectual e escrita da doutrina.", img: "https://picsum.photos/seed/hist4/800/600" },
    { id: "h5", year: "1985", title: "O Legado", desc: "Passagem de Tia Neiva para o plano espiritual, deixando um legado consolidado e uma hierarquia estruturada.", img: "https://picsum.photos/seed/hist5/800/600" },
  ];

  return (
    <section id="historia" className={cn(
      "py-24 scroll-mt-24 transition-colors duration-500",
      isDarkMode ? "bg-slate-900" : "bg-white"
    )}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <EditableText 
            id="historia-vale-title"
            defaultText="História do Vale do Amanhecer"
            tagName="h2"
            isDev={isDev}
            className={cn(
              "text-4xl md:text-5xl font-serif font-bold mb-6",
              isDarkMode ? "text-white" : "text-blue-900"
            )}
          />
          <div className="w-24 h-1 bg-violet-500 mx-auto mb-8 rounded-full"></div>
          <EditableText 
            id="historia-vale-subtitle"
            defaultText="Uma jornada de fé, clarividência e amor incondicional que transformou a espiritualidade brasileira."
            isDev={isDev}
            tagName="p"
            className={cn(
              "max-w-3xl mx-auto text-lg leading-relaxed",
              isDarkMode ? "text-slate-400" : "text-emerald-700"
            )}
          />
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className={cn(
            "absolute left-1/2 -translate-x-1/2 h-full w-0.5 hidden md:block",
            isDarkMode ? "bg-slate-800" : "bg-violet-100"
          )}></div>

          <div className="space-y-24">
            {timelineItems.map((item, idx) => (
              <div key={item.id} className={cn(
                "relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0",
                idx % 2 === 0 ? "md:flex-row-reverse" : ""
              )}>
                {/* Timeline Dot */}
                <div className={cn(
                  "absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-4 z-10 hidden md:block",
                  isDarkMode ? "bg-slate-900 border-violet-500" : "bg-white border-violet-500"
                )}></div>

                {/* Content Side */}
                <div className="w-full md:w-[45%]">
                  <motion.div 
                    initial={{ opacity: 0, x: idx % 2 === 0 ? 50 : -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className={cn(
                      "p-8 rounded-[2.5rem] border transition-all hover:shadow-2xl",
                      isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-white border-violet-100 shadow-xl shadow-violet-500/5"
                    )}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Calendar className="w-5 h-5 text-violet-500" />
                      <span className="text-violet-500 font-bold text-xl">
                        <EditableText id={`hist-year-${item.id}`} isDev={isDev} defaultText={item.year} />
                      </span>
                    </div>
                    <h4 className={cn(
                      "text-2xl font-bold mb-4",
                      isDarkMode ? "text-white" : "text-blue-900"
                    )}>
                      <EditableText id={`hist-title-${item.id}`} isDev={isDev} defaultText={item.title} />
                    </h4>
                    <EditableText 
                      id={`hist-desc-${item.id}`} 
                      isDev={isDev} 
                      tagName="p"
                      className={cn(
                        "text-base leading-relaxed mb-6",
                        isDarkMode ? "text-slate-400" : "text-emerald-800"
                      )}
                      defaultText={item.desc} 
                    />
                    <div className="rounded-2xl overflow-hidden aspect-video relative group">
                      <EditableImage 
                        id={`hist-img-${item.id}`}
                        isDev={isDev}
                        defaultSrc={item.img}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Empty Side for Spacing */}
                <div className="hidden md:block w-[45%]"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const DoutrinaSection: React.FC<{ isDarkMode: boolean; isDev: boolean }> = ({ isDarkMode, isDev }) => {
  return (
    <section id="doutrina" className={cn(
      "py-24 scroll-mt-24 transition-colors duration-500",
      isDarkMode ? "bg-slate-950" : "bg-pink-50/30"
    )}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex p-3 bg-violet-500/10 rounded-2xl text-violet-500 mb-6">
            <BookOpen className="w-8 h-8" />
          </div>
          <EditableText 
            id="doutrina_title"
            defaultText="Doutrina e Missão"
            tagName="h2"
            isDev={isDev}
            className={cn(
              "text-4xl md:text-5xl font-serif font-bold mb-6",
              isDarkMode ? "text-white" : "text-blue-900"
            )}
          />
          <div className="w-24 h-1 bg-violet-500 mx-auto mb-8 rounded-full"></div>
          <EditableText 
            id="doutrina_desc"
            defaultText="Conheça os fundamentos da Doutrina do Amanhecer e o legado espiritual deixado por nossos mentores."
            isDev={isDev}
            tagName="p"
            className={cn(
              "max-w-3xl mx-auto text-lg leading-relaxed",
              isDarkMode ? "text-slate-400" : "text-emerald-700"
            )}
          />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {[
            {
              title: "A Doutrina",
              icon: <Sparkles className="w-6 h-6" />,
              content: "A Doutrina do Amanhecer é um sistema espiritualista cristão que integra conhecimentos de diversas eras e civilizações, focada na manipulação de energias para a cura e o auxílio ao próximo."
            },
            {
              title: "Princípios Fundamentais",
              icon: <ShieldCheck className="w-6 h-6" />,
              content: "Baseada no tripé Amor, Humildade e Tolerância. Acreditamos na Lei de Causa e Efeito e no compromisso do Jaguar em servir como um canal de luz para a humanidade."
            },
            {
              title: "A Missão Jaguar",
              icon: <Compass className="w-6 h-6" />,
              content: "O Jaguar é o médium que assume a responsabilidade de equilibrar as forças espirituais, atuando como um doutrinador ou apará na caridade desinteressada."
            },
            {
              title: "Palestra Dominical",
              icon: <Mic2 className="w-6 h-6" />,
              content: "Realizada todos os domingos, a Palestra Dominical é o momento de sintonização com as verdades evangélicas e doutrinárias, trazendo esclarecimentos para a jornada espiritual."
            }
          ].map((item, idx) => (
            <div key={idx} className={cn(
              "p-8 rounded-[2.5rem] border transition-all hover:shadow-xl",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-pink-100"
            )}>
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500 mb-6">
                {item.icon}
              </div>
              <h3 className={cn(
                "text-xl font-bold mb-4",
                isDarkMode ? "text-white" : "text-blue-900"
              )}>
                <EditableText id={`doutrina-card-title-${idx}`} isDev={isDev} defaultText={item.title} />
              </h3>
              <EditableText 
                id={`doutrina-card-content-${idx}`} 
                isDev={isDev} 
                tagName="p"
                className={cn(
                  "text-sm leading-relaxed",
                  isDarkMode ? "text-slate-400" : "text-emerald-700"
                )}
                defaultText={item.content} 
              />
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className={cn(
              "p-8 rounded-[3rem] border relative overflow-hidden",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-pink-100 shadow-xl"
            )}>
              <h3 className="text-2xl font-serif font-bold text-violet-500 mb-4">
                <EditableText id="doutrina-tianeiva-title" isDev={isDev} defaultText="Tia Neiva" />
              </h3>
              <EditableText 
                id="doutrina-tianeiva-desc" 
                isDev={isDev} 
                tagName="p"
                className={cn(
                  "text-sm leading-relaxed mb-6",
                  isDarkMode ? "text-slate-300" : "text-emerald-800"
                )}
                defaultText="Neiva Chaves Zelaya, a Clarividente, foi a enviada para materializar a Doutrina do Amanhecer no plano físico. Sua missão foi acolher os desamparados e formar uma legião de médiuns capazes de manipular as forças do universo." 
              />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-500">
                  <Heart className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
                  <EditableText id="doutrina-tianeiva-label" isDev={isDev} defaultText="A Mãe Mentora" />
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-violet-500/10 text-violet-500 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  <EditableText id="doutrina-tianeiva-tag-1" isDev={isDev} defaultText="Clarividente" />
                </span>
                <span className="px-3 py-1 bg-violet-500/10 text-violet-500 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  <EditableText id="doutrina-tianeiva-tag-2" isDev={isDev} defaultText="Fundadora" />
                </span>
              </div>
            </div>

            <div className={cn(
              "p-8 rounded-[3rem] border relative overflow-hidden",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-pink-100 shadow-xl"
            )}>
              <h3 className="text-2xl font-serif font-bold text-blue-500 mb-4">
                <EditableText id="doutrina-paisetabranca-title" isDev={isDev} defaultText="Pai Seta Branca" />
              </h3>
              <EditableText 
                id="doutrina-paisetabranca-desc" 
                isDev={isDev} 
                tagName="p"
                className={cn(
                  "text-sm leading-relaxed mb-6",
                  isDarkMode ? "text-slate-300" : "text-emerald-800"
                )}
                defaultText="O Grande Simiromba de Deus, mentor espiritual da nossa missão. Pai Seta Branca guia os Jaguares na Nova Era, trazendo a sabedoria dos planos superiores para o equilíbrio da Terra." 
              />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                  <Star className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
                  <EditableText id="doutrina-paisetabranca-label" isDev={isDev} defaultText="O Mentor Espiritual" />
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  <EditableText id="doutrina-paisetabranca-tag-1" isDev={isDev} defaultText="Simiromba" />
                </span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  <EditableText id="doutrina-paisetabranca-tag-2" isDev={isDev} defaultText="Grande Oriente" />
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white">
              <EditableImage 
                id="doutrina-main-image"
                defaultSrc="https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80"
                alt="Doutrina do Amanhecer"
                isDev={isDev}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-yellow-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-violet-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

const NewsSchema: React.FC<{ news: NewsItem[] }> = ({ news }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": news.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Article",
        "headline": item.title,
        "description": item.content.substring(0, 150),
        "datePublished": item.date,
        "author": {
          "@type": "Organization",
          "name": "Vale do Amanhecer"
        }
      }
    }))
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  );
};

const NoticiasSection: React.FC<{ 
  isDarkMode: boolean; 
  isDev: boolean; 
  news: NewsItem[]; 
  onDelete: (id: string) => void;
  onAdd: () => void;
}> = ({ isDarkMode, isDev, news, onDelete, onAdd }) => {
  return (
    <section id="noticias" className={cn(
      "py-24 scroll-mt-24 transition-colors duration-500",
      isDarkMode ? "bg-slate-900" : "bg-blue-50/30"
    )}>
      <NewsSchema news={news} />
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="p-2 bg-blue-500 rounded-xl text-white">
                <Bell className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-blue-500">Atualizações</span>
            </div>
            <h2 className={cn(
              "text-3xl md:text-4xl font-serif font-bold",
              isDarkMode ? "text-white" : "text-blue-900"
            )}>
              <EditableText id="noticias-title" isDev={isDev} defaultText="Notícias do Vale" />
            </h2>
          </div>
          
          {isDev && (
            <button 
              onClick={onAdd}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5" /> Adicionar Comunicado
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={cn(
                "p-8 rounded-[2.5rem] border transition-all hover:shadow-2xl relative group",
                isDarkMode ? "bg-slate-950 border-slate-800" : "bg-white border-blue-100"
              )}
            >
              <div className="flex items-center justify-between mb-6">
                <span className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                  isDarkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
                )}>
                  {item.category}
                </span>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Calendar className="w-3 h-3" />
                  {item.date}
                </div>
              </div>

              <h3 className={cn(
                "text-xl font-bold mb-4 leading-tight",
                isDarkMode ? "text-white" : "text-blue-900"
              )}>
                {item.title}
              </h3>
              
              <p className={cn(
                "text-sm leading-relaxed mb-6 line-clamp-4",
                isDarkMode ? "text-slate-400" : "text-emerald-800"
              )}>
                {item.content}
              </p>

              {isDev && (
                <button 
                  onClick={() => onDelete(item.id)}
                  className="absolute top-4 right-4 p-2 bg-rose-500/10 text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white"
                >
                  <Trash className="w-4 h-4" />
                </button>
              )}
              
              <div className="pt-6 border-t border-slate-500/10">
                <button className="text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-2">
                  Ler comunicado completo <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const useSEO = (isDarkMode: boolean) => {
  React.useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const sectionMeta: Record<string, { title: string; description: string }> = {
      'doutrina': {
        title: 'Doutrina do Amanhecer: Fundamentos e Missão',
        description: 'Conheça os pilares da Doutrina do Amanhecer, baseada no amor, humildade e tolerância para a cura espiritual.'
      },
      'historia': {
        title: 'História do Vale do Amanhecer: Tia Neiva e Pai Seta Branca',
        description: 'A trajetória de Tia Neiva e a fundação do Vale do Amanhecer por Pai Seta Branca. Uma jornada de fé e espiritualidade.'
      },
      'nossos-templos': {
        title: 'Templos do Amanhecer: Onde Encontrar Cura',
        description: 'Localize os Templos do Amanhecer e saiba onde encontrar auxílio espiritual e cura através da nossa doutrina.'
      },
      'falanges': {
        title: 'Falanges do Amanhecer: Organização Espiritual',
        description: 'Conheça as Falanges Missionárias e como os médiuns se organizam para servir na caridade sagrada.'
      },
      'desenvolvimento': {
        title: 'Desenvolvimento Mediúnico: A Jornada do Jaguar',
        description: 'Saiba como ingressar na Doutrina do Amanhecer e trilhar o caminho do desenvolvimento mediúnico como Jaguar.'
      },
      'noticias': {
        title: 'Notícias do Vale: Atualizações e Comunicados',
        description: 'Fique por dentro das últimas notícias, eventos e comunicados oficiais do Vale do Amanhecer.'
      },
      'doacao': {
        title: 'Apoie o Portal do Amanhecer: Caridade e Luz',
        description: 'Sua doação ajuda a manter este portal de luz ativo, servindo a todos os médiuns e jaguares da Nova Era.'
      }
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (sectionMeta[id]) {
            document.title = `${sectionMeta[id].title} - Portal do Amanhecer`;
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
              metaDesc.setAttribute('content', sectionMeta[id].description);
            }
          }
        }
      });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);
};

const EventSchema: React.FC<{ events: any[] }> = ({ events }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": events.map((event, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Event",
        "name": event.title,
        "description": event.desc,
        "startDate": `2026-${event.month === 'JAN' ? '01' : event.month === 'MAI' ? '05' : event.month === 'OUT' ? '10' : event.month === 'NOV' ? '11' : '12'}-${event.date}`,
        "location": {
          "@type": "Place",
          "name": "Templo Mãe - Vale do Amanhecer",
          "address": "Planaltina, DF"
        }
      }
    }))
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  );
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isDarkMode') === 'true';
    }
    return false;
  });
  useSEO(isDarkMode);
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [showShareOptions, setShowShareOptions] = React.useState(false);
  const [showHeroShareOptions, setShowHeroShareOptions] = React.useState(false);
  const [selectedPost, setSelectedPost] = React.useState<any>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [templeSearch, setTempleSearch] = React.useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isDev, setIsDev] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isDev') === 'true';
    }
    return false;
  });
  const [isLoggedIn, setIsLoggedIn] = React.useState(isDev);
  const [masterKey, setMasterKey] = React.useState('');
  const [showBackToTop, setShowBackToTop] = React.useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = React.useState(false);
  const [adminTab, setAdminTab] = React.useState<'actions' | 'settings'>('actions');
  const [logoClickCount, setLogoClickCount] = React.useState(0);
  const [logoClickTimer, setLogoClickTimer] = React.useState<NodeJS.Timeout | null>(null);
  const [news, setNews] = React.useState<NewsItem[]>([]);
  const [isNewsModalOpen, setIsNewsModalOpen] = React.useState(false);
  const [newNews, setNewNews] = React.useState({ title: '', content: '', category: 'Comunicado' });
  const [galleryItems, setGalleryItems] = React.useState<GalleryItem[]>([]);
  const [siteConfig, setSiteConfig] = React.useState<SiteConfig>({
    siteName: 'Vale do Amanhecer',
    siteSubtitle: 'Doutrina de Amor',
    logoUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=120&h=120&q=80',
    contactEmail: 'jesuscristopaisetabranca@gmail.com',
    youtubeChannel: 'https://www.youtube.com/channel/UCuXuIizz8_5nkLMWU-Vxo5g',
    tipaUrl: 'https://tipa.ai/jesuscristopaisetabranca',
    pixKey: 'jesuscristopaisetabranca@gmail.com',
    masterKey: 'amanhecer'
  });

  React.useEffect(() => {
    const loadData = async () => {
      // Try server first for site config
      try {
        const configResponse = await fetch('/api/content/site_config');
        if (configResponse.ok) {
          const serverConfig = await configResponse.json();
          setSiteConfig(prev => ({ ...prev, ...serverConfig }));
        } else {
          const savedConfig = await get('site_config');
          if (savedConfig) {
            setSiteConfig(prev => ({ ...prev, ...savedConfig }));
          }
        }
      } catch (err) {
        console.error("Error loading site config:", err);
      }

      // Try server first for news
      try {
        const newsResponse = await fetch('/api/content/vale_news');
        if (newsResponse.ok) {
          const serverNews = await newsResponse.json();
          setNews(serverNews);
        } else {
          const savedNews = await get('vale_news');
          if (savedNews) {
            setNews(savedNews);
          } else {
            const defaultNews = [
              {
                id: '1',
                title: 'Grande Trabalho de Estrela Candente',
                content: 'Convocamos todos os jaguares para o grande trabalho de Estrela Candente que será realizado no próximo domingo. A presença de todos é fundamental para o equilíbrio das forças.',
                date: '12 Mar, 2026',
                category: 'Comunicado'
              },
              {
                id: '2',
                title: 'Novo Templo em Formatação',
                content: 'É com muita alegria que anunciamos o início da formatação de um novo templo no interior de Minas Gerais. Que o Pai Seta Branca ilumine os mestres responsáveis.',
                date: '10 Mar, 2026',
                category: 'Notícia'
              }
            ];
            setNews(defaultNews);
            await set('vale_news', defaultNews);
          }
        }
      } catch (err) {
        console.error("Error loading news from server:", err);
      }

      // Try server first for gallery
      try {
        const galleryResponse = await fetch('/api/content/vale_gallery');
        if (galleryResponse.ok) {
          const serverGallery = await galleryResponse.json();
          setGalleryItems(serverGallery);
        } else {
          const savedGallery = await get('vale_gallery');
          if (savedGallery) {
            setGalleryItems(savedGallery);
          } else {
            const defaultGallery: GalleryItem[] = [
              { id: 'gal-1', type: 'image', title: 'Templo Mãe' },
              { id: 'gal-2', type: 'image', title: 'Estrela Candente' },
              { id: 'gal-3', type: 'video', title: 'Ritual de Cura' },
              { id: 'gal-4', type: 'image', title: 'Jaguar em Oração' }
            ];
            setGalleryItems(defaultGallery);
            await set('vale_gallery', defaultGallery);
          }
        }
      } catch (err) {
        console.error("Error loading gallery from server:", err);
      }
    };
    loadData();
  }, []);

  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: NewsItem = {
      id: Date.now().toString(),
      title: newNews.title,
      content: newNews.content,
      category: newNews.category,
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    };
    const updatedNews = [newItem, ...news];
    setNews(updatedNews);
    
    // Save to server
    try {
      await fetch('/api/content/vale_news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: updatedNews })
      });
    } catch (err) {
      console.error("Error saving news to server:", err);
    }
    
    await set('vale_news', updatedNews);
    setIsNewsModalOpen(false);
    setNewNews({ title: '', content: '', category: 'Comunicado' });
    console.log("Comunicado adicionado com sucesso!");
  };

  const handleDeleteNews = async (id: string) => {
    if (true) {
      const updatedNews = news.filter(item => item.id !== id);
      setNews(updatedNews);
      
      // Save to server
      try {
        await fetch('/api/content/vale_news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: updatedNews })
        });
      } catch (err) {
        console.error("Error deleting news from server:", err);
      }
      
      await set('vale_news', updatedNews);
    }
  };

  const handleAddGalleryItem = async (type: 'image' | 'video') => {
    const title = "Novo Item"; // Removed prompt for iframe compatibility
    if (title) {
      const newItem: GalleryItem = {
        id: `gal-${Date.now()}`,
        type,
        title
      };
      const updatedGallery = [...galleryItems, newItem];
      setGalleryItems(updatedGallery);
      
      // Save to server
      try {
        await fetch('/api/content/vale_gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: updatedGallery })
        });
      } catch (err) {
        console.error("Error saving gallery to server:", err);
      }
      
      await set('vale_gallery', updatedGallery);
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (true) {
      const updatedGallery = galleryItems.filter(item => item.id !== id);
      setGalleryItems(updatedGallery);
      
      // Save to server
      try {
        await fetch('/api/content/vale_gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: updatedGallery })
        });
      } catch (err) {
        console.error("Error deleting gallery from server:", err);
      }
      
      await set('vale_gallery', updatedGallery);
      // Also clean up from IDB
      await del(`img_${id}`);
      await del(`media_${id}`);
      await del(`media_type_${id}`);
    }
  };

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
    // Simplified access with Master Key
    if (masterKey.toLowerCase() === siteConfig.masterKey.toLowerCase()) {
      setIsDev(true);
      localStorage.setItem('isDev', 'true');
      setIsLoggedIn(true);
      setIsLoginModalOpen(false);
      console.log("Modo Mestre Ativado!");
    } else {
      console.log("Chave incorreta. Apenas o Administrador pode editar o portal.");
    }
  };

  const toggleDev = () => {
    const newState = !isDev;
    setIsDev(newState);
    localStorage.setItem('isDev', String(newState));
    if (!newState) {
      setIsLoggedIn(false);
    }
    console.log(`Modo Desenvolvedor ${newState ? 'Ativado' : 'Desativado'}`);
  };

  const resetAllImages = async () => {
    if (true) {
      try {
        // Reset server
        await fetch('/api/reset', { method: 'POST' });
        
        // Reset local
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('img_') || key.startsWith('media_') || key.startsWith('video_')) {
            localStorage.removeItem(key);
          }
        });
        
        // Clear IndexedDB
        const keys = ['img_', 'media_', 'video_'];
        // Note: idb-keyval doesn't have a clear by prefix easily without iterating
        // For simplicity, we'll just reload and the server reset will take priority
        
        window.location.reload();
      } catch (err) {
        console.error("Error resetting images:", err);
      }
    }
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

  const handleLogoClick = () => {
    // Reset timer if exists
    if (logoClickTimer) clearTimeout(logoClickTimer);

    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);

    if (newCount === 3) {
      setIsLoginModalOpen(true);
      setLogoClickCount(0);
    } else {
      // Reset count after 2 seconds of inactivity
      const timer = setTimeout(() => {
        setLogoClickCount(0);
      }, 2000);
      setLogoClickTimer(timer);
    }

    // Scroll to top as well
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateSiteConfig = async (newConfig: Partial<SiteConfig>) => {
    const updated = { ...siteConfig, ...newConfig };
    setSiteConfig(updated);
    try {
      await fetch('/api/content/site_config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: updated })
      });
    } catch (err) {
      console.error("Error saving site config:", err);
    }
    await set('site_config', updated);
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = "A Ciência Sagrada do Amanhecer: O Despertar do Jaguar";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("Link copiado para a área de transferência!");
  };

  return (
    <Routes>
      <Route path="/admin" element={<Admin />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <div className={cn(
          "min-h-screen font-sans transition-colors duration-500",
          isDarkMode ? "bg-slate-950 text-slate-100 selection:bg-blue-900" : "bg-pink-50 text-emerald-900 selection:bg-pink-200"
        )}>
      {isDev && (
        <div className="fixed top-0 left-0 right-0 z-[200] bg-blue-900 text-white py-2 px-4 flex items-center justify-between shadow-lg border-b border-blue-700 animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Modo Edição Ativo</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[9px] text-blue-200 hidden sm:inline">Clique em textos ou imagens para alterar o conteúdo</span>
            <button 
              onClick={() => setIsAdminPanelOpen(true)}
              className="px-4 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold transition-colors border border-white/20"
            >
              Painel de Controle
            </button>
            <button 
              onClick={toggleDev}
              className="px-4 py-1 bg-rose-500 hover:bg-rose-600 rounded-lg text-[10px] font-bold transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      )}

      {/* Navigation / Header */}
      <nav className={cn(
        "fixed top-0 w-full backdrop-blur-xl z-50 border-b transition-all duration-500",
        isDev && "mt-10",
        isDarkMode ? "bg-slate-900/90 border-slate-800 shadow-2xl" : "bg-white/90 border-pink-100 shadow-sm"
      )}>
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          {/* Logo Section */}
          <div 
            onClick={handleLogoClick}
            className="flex items-center gap-4 group cursor-pointer"
          >
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse"></div>
              <img 
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=120&h=120&q=80" 
                alt="Sol do Amanhecer" 
                className="w-12 h-12 rounded-full object-cover relative z-10 border-2 border-yellow-200 shadow-lg transition-transform group-hover:scale-110 duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className={cn(
                "font-serif italic text-2xl font-bold tracking-tight leading-none",
                isDarkMode ? "text-white" : "text-blue-900"
              )}>
                {siteConfig.siteName}
              </span>
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-[0.3em] mt-1.5 transition-colors",
                isDarkMode ? "text-violet-400" : "text-emerald-600"
              )}>
                {siteConfig.siteSubtitle}
              </span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className={cn(
            "hidden lg:flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest",
            isDarkMode ? "text-slate-300" : "text-emerald-800"
          )}>
            <div className="group relative px-4 py-2">
              <button className="hover:text-violet-500 transition-colors flex items-center gap-1.5 py-2 relative group">
                <EditableText id="nav-doutrina" isDev={isDev} defaultText="Doutrina" /> 
                <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-violet-500 transition-all group-hover:w-full"></span>
              </button>
              <div className={cn(
                "absolute top-full left-0 mt-1 shadow-2xl rounded-2xl p-3 min-w-[220px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform group-hover:translate-y-0 translate-y-2 border",
                isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-pink-100"
              )}>
                <a href="#doutrina" className="flex items-center gap-2 px-4 py-2.5 hover:bg-violet-500/10 rounded-xl transition-colors hover:text-violet-500">
                  <EditableText id="nav-doutrina-missao" isDev={isDev} defaultText="Doutrina e Missão" />
                </a>
                <a href="#historia" className="flex items-center gap-2 px-4 py-2.5 hover:bg-violet-500/10 rounded-xl transition-colors hover:text-violet-500">
                  <EditableText id="nav-historia" isDev={isDev} defaultText="Nossa História" />
                </a>
                <a href="#nossos-templos" className="flex items-center gap-2 px-4 py-2.5 hover:bg-violet-500/10 rounded-xl transition-colors hover:text-violet-500">
                  <EditableText id="nav-templos" isDev={isDev} defaultText="Nossos Templos" />
                </a>
                <a href="#falanges" className="flex items-center gap-2 px-4 py-2.5 hover:bg-violet-500/10 rounded-xl transition-colors hover:text-violet-500">
                  <EditableText id="nav-falanges" isDev={isDev} defaultText="Falanges do Amanhecer" />
                </a>
                <a href="#povo-cigano" className="flex items-center gap-2 px-4 py-2.5 hover:bg-violet-500/10 rounded-xl transition-colors hover:text-violet-500">
                  <EditableText id="nav-povo-cigano" isDev={isDev} defaultText="Povo Cigano" />
                </a>
                <a href="#beneficios" className="flex items-center gap-2 px-4 py-2.5 hover:bg-violet-500/10 rounded-xl transition-colors hover:text-violet-500">
                  <EditableText id="nav-beneficios" isDev={isDev} defaultText="Benefícios" />
                </a>
              </div>
            </div>

            <div className="group relative px-4 py-2">
              <button className="hover:text-violet-500 transition-colors flex items-center gap-1.5 py-2 relative group">
                <EditableText id="nav-jornada" isDev={isDev} defaultText="Jornada" /> 
                <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-violet-500 transition-all group-hover:w-full"></span>
              </button>
              <div className={cn(
                "absolute top-full left-0 mt-1 shadow-2xl rounded-2xl p-3 min-w-[220px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform group-hover:translate-y-0 translate-y-2 border",
                isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-pink-100"
              )}>
                <a href="#desenvolvimento" className="flex items-center gap-2 px-4 py-2.5 hover:bg-violet-500/10 rounded-xl transition-colors hover:text-violet-500">
                  <EditableText id="nav-desenvolvimento" isDev={isDev} defaultText="Desenvolvimento" />
                </a>
                <a href="#emplacamento" className="flex items-center gap-2 px-4 py-2.5 hover:bg-violet-500/10 rounded-xl transition-colors hover:text-violet-500">
                  <EditableText id="nav-emplacamento" isDev={isDev} defaultText="Emplacamento" />
                </a>
                <a href="#iniciacao" className="flex items-center gap-2 px-4 py-2.5 hover:bg-violet-500/10 rounded-xl transition-colors hover:text-violet-500">
                  <EditableText id="nav-iniciacao" isDev={isDev} defaultText="Iniciação" />
                </a>
                <a href="#elevacao" className="flex items-center gap-2 px-4 py-2.5 hover:bg-violet-500/10 rounded-xl transition-colors hover:text-violet-500">
                  <EditableText id="nav-elevacao" isDev={isDev} defaultText="Elevação" />
                </a>
                <a href="#pre-centuria" className="flex items-center gap-2 px-4 py-2.5 hover:bg-violet-500/10 rounded-xl transition-colors hover:text-violet-500">
                  <EditableText id="nav-pre-centuria" isDev={isDev} defaultText="Pré Centuria" />
                </a>
              </div>
            </div>

            <div className="group relative px-4 py-2">
              <button className="hover:text-violet-500 transition-colors flex items-center gap-1.5 py-2 relative group">
                <EditableText id="nav-acervo" isDev={isDev} defaultText="Acervo" /> 
                <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-violet-500 transition-all group-hover:w-full"></span>
              </button>
              <div className={cn(
                "absolute top-full left-0 mt-1 shadow-2xl rounded-2xl p-3 min-w-[220px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform group-hover:translate-y-0 translate-y-2 border",
                isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-pink-100"
              )}>
                <a href="#mantras" className="flex items-center gap-2 px-4 py-2.5 hover:bg-violet-500/10 rounded-xl transition-colors hover:text-violet-500">
                  <EditableText id="nav-mantras" isDev={isDev} defaultText="Mantras" />
                </a>
                <a href="#musicas-ciganas" className="flex items-center gap-2 px-4 py-2.5 hover:bg-violet-500/10 rounded-xl transition-colors hover:text-violet-500">
                  <EditableText id="nav-musicas-ciganas" isDev={isDev} defaultText="Músicas Ciganas" />
                </a>
                <a href="#videos-destaque" className="flex items-center gap-2 px-4 py-2.5 hover:bg-violet-500/10 rounded-xl transition-colors hover:text-violet-500">
                  <EditableText id="nav-videos-destaque" isDev={isDev} defaultText="Vídeos em Destaque" />
                </a>
                <a href="#galeria" className="flex items-center gap-2 px-4 py-2.5 hover:bg-violet-500/10 rounded-xl transition-colors hover:text-violet-500">
                  <EditableText id="nav-galeria" isDev={isDev} defaultText="Galeria de Mídia" />
                </a>
                <a href="#relacao-templos" className="flex items-center gap-2 px-4 py-2.5 hover:bg-violet-500/10 rounded-xl transition-colors hover:text-violet-500">
                  <EditableText id="nav-relacao-templos" isDev={isDev} defaultText="Relação de Templos" />
                </a>
                <a href="#calendario" className="flex items-center gap-2 px-4 py-2.5 hover:bg-violet-500/10 rounded-xl transition-colors hover:text-violet-500">
                  <EditableText id="nav-calendario" isDev={isDev} defaultText="Calendário de Eventos" />
                </a>
                <a href="#arquivos" className="flex items-center gap-2 px-4 py-2.5 hover:bg-violet-500/10 rounded-xl transition-colors hover:text-violet-500">
                  <EditableText id="nav-arquivos" isDev={isDev} defaultText="Downloads (Drive)" />
                </a>
              </div>
            </div>

            <a href="#noticias" className="px-4 py-2 hover:text-violet-500 transition-colors relative group">
              <EditableText id="nav-noticias" isDev={isDev} defaultText="Notícias" />
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-violet-500 transition-all group-hover:w-full"></span>
            </a>
            <a href="#blog" className="px-4 py-2 hover:text-violet-500 transition-colors relative group">
              <EditableText id="nav-blog" isDev={isDev} defaultText="Blog" />
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-violet-500 transition-all group-hover:w-full"></span>
            </a>
            <a href="#assistente-ia" className="px-4 py-2 hover:text-violet-500 transition-colors relative group">
              <EditableText id="nav-assistente-ia" isDev={isDev} defaultText="Assistente IA" />
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-violet-500 transition-all group-hover:w-full"></span>
            </a>
            <a href="#perolas" className="px-4 py-2 hover:text-violet-500 transition-colors relative group">
              <EditableText id="nav-perolas" isDev={isDev} defaultText="Só as Pérolas" />
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-violet-500 transition-all group-hover:w-full"></span>
            </a>
            <a href="#contato" className="px-4 py-2 hover:text-violet-500 transition-colors relative group">
              <EditableText id="nav-contato" isDev={isDev} defaultText="Contato" />
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-violet-500 transition-all group-hover:w-full"></span>
            </a>
            <a href="https://tipa.ai/jesuscristopaisetabranca" target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 flex items-center gap-2 ml-2">
              <Heart className="w-3 h-3 fill-current" /> Doação
            </a>
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 mr-2">
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
                  "p-2 rounded-xl transition-all hover:scale-110",
                  isDarkMode ? "hover:bg-slate-800" : "hover:bg-rose-50"
                )}
                title="Canal Oficial no YouTube"
              >
                <div className="bg-rose-600 rounded-lg p-1.5 flex items-center justify-center shadow-md">
                  <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                </div>
              </a>
            </div>

            <button 
              onClick={toggleDarkMode}
              className={cn(
                "p-2.5 rounded-xl transition-all hover:scale-110 flex items-center justify-center",
                isDarkMode ? "bg-slate-800 text-violet-400 border border-slate-700" : "bg-blue-50 text-blue-900 border border-blue-100"
              )}
              title={isDarkMode ? "Modo Dia" : "Modo Noturno"}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isDev && (
              <button 
                onClick={() => setIsAdminPanelOpen(true)}
                className={cn(
                  "hidden sm:flex p-2.5 rounded-xl transition-all hover:scale-110 flex items-center justify-center",
                  isDarkMode ? "bg-slate-800 text-slate-400 border border-slate-700" : "bg-slate-100 text-slate-600 border border-slate-200"
                )}
                title="Painel de Controle"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}

            {!isDev && (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="hidden sm:flex p-1 opacity-0 hover:opacity-10 transition-opacity"
                title="Acesso Administrativo"
              >
                <Lock className="w-2 h-2" />
              </button>
            )}

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "lg:hidden p-2.5 rounded-xl transition-colors",
                isDarkMode ? "text-white hover:bg-slate-800" : "text-blue-900 hover:bg-blue-50"
              )}
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
            "lg:hidden overflow-hidden transition-all duration-500",
            isDarkMode ? "bg-slate-900 border-b border-slate-800" : "bg-white border-b border-pink-100"
          )}
        >
          <div className={cn(
            "px-6 py-10 space-y-8 text-xs font-bold uppercase tracking-widest",
            isDarkMode ? "text-slate-300" : "text-emerald-800"
          )}>
            <div className="flex items-center gap-4 mb-8">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-lg opacity-30"></div>
                <img 
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=80&h=80&q=80" 
                  alt="Sol do Amanhecer" 
                  className="w-10 h-10 rounded-full object-cover relative z-10 border border-yellow-200 shadow-sm"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <span className={cn(
                  "font-serif italic text-xl font-bold tracking-tight",
                  isDarkMode ? "text-white" : "text-blue-900"
                )}>Vale do Amanhecer</span>
                <span className="text-[8px] text-violet-500 tracking-[0.2em]">Doutrina de Amor</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-[10px] text-violet-500 border-b border-violet-500/20 pb-1">Doutrina</p>
                <div className="flex flex-col gap-3">
                  <a href="#doutrina" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-violet-500 transition-colors">Doutrina e Missão</a>
                  <a href="#historia" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-violet-500 transition-colors">Nossa História</a>
                  <a href="#nossos-templos" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-violet-500 transition-colors">Nossos Templos</a>
                  <a href="#falanges" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-violet-500 transition-colors">Falanges</a>
                  <a href="#povo-cigano" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-violet-500 transition-colors">Povo Cigano</a>
                  <a href="#beneficios" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-violet-500 transition-colors">Benefícios</a>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] text-violet-500 border-b border-violet-500/20 pb-1">Jornada</p>
                <div className="flex flex-col gap-3">
                  <a href="#desenvolvimento" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-violet-500 transition-colors">Desenvolvimento</a>
                  <a href="#emplacamento" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-violet-500 transition-colors">Emplacamento</a>
                  <a href="#iniciacao" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-violet-500 transition-colors">Iniciação</a>
                  <a href="#elevacao" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-violet-500 transition-colors">Elevação</a>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] text-violet-500 border-b border-violet-500/20 pb-1">Acervo & Mais</p>
              <div className="grid grid-cols-2 gap-4">
                <a href="#mantras" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-violet-500 transition-colors">Mantras</a>
                <a href="#musicas-ciganas" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-violet-500 transition-colors">Músicas</a>
                <a href="#videos-destaque" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-violet-500 transition-colors">Vídeos</a>
                <a href="#galeria" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-violet-500 transition-colors">Galeria</a>
                <a href="#relacao-templos" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-violet-500 transition-colors">Relação</a>
                <a href="#calendario" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-violet-500 transition-colors">Calendário</a>
                <a href="#arquivos" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-violet-500 transition-colors">Downloads</a>
                <a href="#noticias" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-violet-500 transition-colors">Notícias</a>
                <a href="#blog" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-violet-500 transition-colors">Blog</a>
                <a href="#assistente-ia" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-violet-500 transition-colors">IA</a>
                <a href="#perolas" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-violet-500 transition-colors">Pérolas</a>
                <a href="#contato" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-violet-500 transition-colors">Contato</a>
                <a href="https://tipa.ai/jesuscristopaisetabranca" target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-rose-500 font-bold flex items-center gap-2">
                  <Heart className="w-4 h-4 fill-current" /> Doação
                </a>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-500/10 flex flex-col gap-4">
              {isDev ? (
                <button 
                  onClick={() => { setIsAdminPanelOpen(true); setIsMobileMenuOpen(false); }}
                  className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" /> Painel do Mestre
                </button>
              ) : (
                <button 
                  onClick={() => { setIsLoginModalOpen(true); setIsMobileMenuOpen(false); }}
                  className="w-full py-4 bg-blue-900/10 text-blue-900 dark:text-blue-300 rounded-2xl font-bold flex items-center justify-center gap-2 opacity-20"
                >
                  <Lock className="w-4 h-4" /> Acesso Mestre
                </button>
              )}
              <div className="flex items-center justify-center gap-6">
                <a href="https://www.youtube.com/channel/UCuXuIizz8_5nkLMWU-Vxo5g" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
                  <div className="bg-rose-600 rounded-xl p-2.5 flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                </a>
                <button onClick={toggleDarkMode} className={cn(
                  "p-2 rounded-xl",
                  isDarkMode ? "bg-slate-800 text-violet-400" : "bg-blue-50 text-blue-900"
                )}>
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
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
                <EditableText id="hero-badge" isDev={isDev} defaultText="Missão Jaguar: O Chamado de Pai Seta Branca" />
              </span>
              <EditableText 
                id="hero-subtitle" 
                isDev={isDev} 
                tagName="h2"
                className={cn(
                  "text-2xl md:text-3xl font-serif font-bold mb-4 uppercase tracking-wider",
                  isDarkMode ? "text-violet-500" : "text-emerald-600"
                )}
                defaultText="A Ciência Sagrada do Amanhecer" 
              />
              <EditableText 
                id="hero-title" 
                isDev={isDev} 
                tagName="h1"
                className={cn(
                  "text-4xl md:text-6xl font-serif font-bold leading-[1.1] mb-6",
                  isDarkMode ? "text-white" : "text-blue-900"
                )}
                defaultText="O Despertar do Jaguar: Domine a Manipulação de Energias e Cumpra sua Missão na Nova Era." 
              />
              <EditableText 
                id="hero-desc" 
                isDev={isDev} 
                tagName="p"
                className={cn(
                  "text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed",
                  isDarkMode ? "text-slate-300" : "text-emerald-700"
                )}
                defaultText="Descubra a nova linha de raciocínio iniciática que revela como equilibrar as forças espirituais e realizar a verdadeira caridade através da ciência deixada por Tia Neiva." 
              />
            </motion.div>

            {/* Hero Image Placeholder */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative max-w-3xl mx-auto aspect-video bg-blue-900 rounded-2xl shadow-2xl overflow-hidden group border-4 border-white"
            >
              <EditableImage 
                id="hero-image"
                isDev={isDev}
                defaultSrc="https://picsum.photos/seed/dawn/1920/1080"
                alt="Doutrina do Amanhecer"
                className="w-full h-full object-cover"
              />
              
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

              <div className="relative w-full sm:w-auto flex flex-col sm:flex-row gap-4">
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

                <a 
                  href="https://tipa.ai/jesuscristopaisetabranca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-10 py-5 bg-rose-500 hover:bg-rose-600 text-white text-xl font-bold rounded-full shadow-lg transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <Heart className="w-5 h-5 fill-current" /> Doar Agora
                </a>

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
        
        <DoutrinaSection isDarkMode={isDarkMode} isDev={isDev} />

        <HistoriaValeSection isDarkMode={isDarkMode} isDev={isDev} />

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
                <EditableText id="beneficios-title" isDev={isDev} defaultText="Transformações Reais no Vale do Amanhecer" />
              </h2>
              <EditableText 
                id="beneficios-subtitle" 
                isDev={isDev} 
                tagName="p"
                className={isDarkMode ? "text-slate-400" : "text-emerald-700"}
                defaultText="Baseado nos ensinamentos iniciáticos de Tia Neiva" 
              />
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  id: "ben-1",
                  icon: <Heart className={cn("w-8 h-8", isDarkMode ? "text-rose-400" : "text-rose-500")} />,
                  title: "Equilíbrio Mediúnico",
                  desc: "Alcance a estabilidade necessária para atuar com segurança nos trabalhos do Templo."
                },
                {
                  id: "ben-2",
                  icon: <BookOpen className={cn("w-8 h-8", isDarkMode ? "text-emerald-400" : "text-emerald-500")} />,
                  title: "Leis do Amanhecer",
                  desc: "Compreensão profunda das leis que regem o Doutrinador e o Apará."
                },
                {
                  id: "ben-3",
                  icon: <ShieldCheck className={cn("w-8 h-8", isDarkMode ? "text-blue-400" : "text-blue-500")} />,
                  title: "Proteção Espiritual",
                  desc: "Fortaleça sua aura através do conhecimento iniciático e da manipulação correta das energias."
                },
                {
                  id: "ben-4",
                  icon: <Sun className={cn("w-8 h-8", isDarkMode ? "text-violet-400" : "text-violet-500")} />,
                  title: "Paz Interior",
                  desc: "Clareza mental e serenidade para conduzir trabalhos de desobsessão e cura."
                },
                {
                  id: "ben-5",
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
                  )}>
                    <EditableText id={`benefit-title-${benefit.id}`} isDev={isDev} defaultText={benefit.title} />
                  </h3>
                  <EditableText 
                    id={`benefit-desc-${benefit.id}`} 
                    isDev={isDev} 
                    tagName="p"
                    className={cn(
                      "leading-relaxed",
                      isDarkMode ? "text-slate-400" : "text-emerald-700"
                    )}
                    defaultText={benefit.desc} 
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Videos Section */}
        <section id="videos-destaque" className={cn(
          "py-24 scroll-mt-24 transition-colors duration-500",
          isDarkMode ? "bg-slate-900" : "bg-white"
        )}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <span className={cn(
                "inline-block px-4 py-1.5 mb-4 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full",
                isDarkMode ? "bg-violet-900/50 text-violet-200" : "bg-violet-100 text-violet-800"
              )}>
                Conteúdo Audiovisual
              </span>
              <h2 className={cn(
                "text-3xl md:text-5xl font-serif font-bold mb-4",
                isDarkMode ? "text-white" : "text-blue-900"
              )}>
                <EditableText id="featured-videos-title" isDev={isDev} defaultText="Vídeos em Destaque" />
              </h2>
              <EditableText 
                id="featured-videos-subtitle" 
                isDev={isDev} 
                tagName="p"
                className={cn(
                  "max-w-2xl mx-auto",
                  isDarkMode ? "text-slate-400" : "text-emerald-700"
                )}
                defaultText="Explore as instruções em vídeo sobre a Doutrina, os processos de Cura e a Missão do Jaguar." 
              />
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <VideoPlayer 
                title="A Doutrina"
                id="video-doutrina"
                description="Entenda os fundamentos da Doutrina do Amanhecer e o papel do Doutrinador na Nova Era."
                isDev={isDev}
                isDarkMode={isDarkMode}
              />
              <VideoPlayer 
                title="O Processo de Cura"
                id="video-cura"
                description="Veja como as energias são manipuladas para promover a cura espiritual e física nos Templos."
                isDev={isDev}
                isDarkMode={isDarkMode}
              />
              <VideoPlayer 
                title="A Missão do Jaguar"
                id="video-missao"
                description="O chamado de Pai Seta Branca para os Jaguares e a responsabilidade da caridade."
                isDev={isDev}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        </section>

        {/* Falanges Section */}
        <section id="falanges" className="py-24 bg-white scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-blue-900 mb-4">
                <EditableText id="falanges-title" isDev={isDev} defaultText="Falanges do Amanhecer" />
              </h2>
              <EditableText 
                id="falanges-subtitle" 
                isDev={isDev} 
                tagName="p"
                className="text-emerald-700 max-w-2xl mx-auto"
                defaultText="As diversas frentes de trabalho espiritual que compõem a nossa doutrina, cada uma com sua missão e força específica." 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { id: "nityamas", name: "Nityamas", desc: "A pureza e a força das jovens missionárias." },
                { id: "samaritanas", name: "Samaritanas", desc: "O serviço de auxílio e amparo nos rituais." },
                { id: "prisioneiros", name: "Prisioneiros", desc: "A jornada de resgate e libertação espiritual." },
                { id: "magos", name: "Magos", desc: "A manipulação das forças da natureza e do cosmos." },
                { id: "ciganas", name: "Ciganas", desc: "A alegria e a intuição do povo do Oriente." },
                { id: "franciscanos", name: "Franciscanos", desc: "A humildade e o amor incondicional aos irmãos." },
                { id: "yaras", name: "Yaras", desc: "A força das águas e a purificação espiritual." },
                { id: "muruaicy", name: "Muruaicy", desc: "A sabedoria ancestral e a proteção da terra." }
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
                  <h3 className="font-bold text-blue-900 mb-2">
                    <EditableText id={`falange-name-${falange.id}`} isDev={isDev} defaultText={falange.name} />
                  </h3>
                  <EditableText 
                    id={`falange-desc-${falange.id}`} 
                    isDev={isDev} 
                    tagName="p"
                    className="text-sm text-emerald-700"
                    defaultText={falange.desc} 
                  />
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
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-blue-900 mb-6">
                  <EditableText id="povo-cigano-title" isDev={isDev} defaultText="O Povo Cigano no Amanhecer" />
                </h2>
                <EditableText 
                  id="povo-cigano-desc" 
                  isDev={isDev} 
                  tagName="p"
                  className="text-emerald-800 mb-6 leading-relaxed"
                  defaultText="A influência cigana no Vale do Amanhecer é uma das mais belas e vibrantes frentes de trabalho. Representando a liberdade, a alegria e a profunda conexão com as forças da natureza, os Ciganos trazem uma energia de cura e desobsessão única." 
                />
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
                      <span className="text-emerald-900 font-medium">
                        <EditableText id={`povo-cigano-item-${idx}`} isDev={isDev} defaultText={item} />
                      </span>
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
          )}>
            <EditableText id="jornada-title" isDev={isDev} defaultText="A Jornada do Jaguar" />
          </h2>
          <EditableText 
            id="jornada-subtitle" 
            isDev={isDev} 
            tagName="p"
            className={isDarkMode ? "text-slate-400" : "text-pink-100"}
            defaultText="Conheça os degraus da evolução mediúnica em nossa doutrina." 
          />
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
                )}>
                  <EditableText id="desenvolvimento-title" isDev={isDev} defaultText="Desenvolvimento Mediúnico" />
                </h2>
                <EditableText 
                  id="desenvolvimento-desc" 
                  isDev={isDev} 
                  tagName="p"
                  className={cn(
                    "text-lg mb-6 leading-relaxed",
                    isDarkMode ? "text-slate-300" : "text-emerald-800"
                  )}
                  defaultText="O primeiro passo na jornada do Jaguar. Aqui, o médium aprende a equilibrar suas energias e a entender a sua missão espiritual sob a orientação dos Mestres." 
                />
                <ul className="space-y-4">
                  {[
                    "Equilíbrio dos plexos e centros nervosos.",
                    "Primeiros contatos com a espiritualidade maior.",
                    "Desenvolvimento da sensibilidade e percepção."
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className={cn("w-5 h-5 mt-1 shrink-0", isDarkMode ? "text-violet-500" : "text-violet-500")} />
                      <span className={isDarkMode ? "text-slate-400" : "text-emerald-700"}>
                        <EditableText id={`desenvolvimento-item-${i}`} isDev={isDev} defaultText={text} />
                      </span>
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
                )}>
                  <EditableText id="emplacamento-title" isDev={isDev} defaultText="Emplacamento" />
                </h2>
                <EditableText 
                  id="emplacamento-desc" 
                  isDev={isDev} 
                  tagName="p"
                  className={cn(
                    "text-lg mb-6 leading-relaxed",
                    isDarkMode ? "text-slate-300" : "text-emerald-800"
                  )}
                  defaultText="A confirmação da sintonia mediúnica. O momento em que o médium se firma em sua corrente e assume o compromisso de servir à caridade." 
                />
                <div className={cn(
                  "p-6 rounded-2xl border italic",
                  isDarkMode ? "bg-slate-900 border-slate-800 text-violet-200" : "bg-white border-pink-200 shadow-sm text-emerald-700"
                )}>
                  <EditableText id="emplacamento-quote" isDev={isDev} defaultText='"O emplacamento é a assinatura do seu compromisso com o Pai Seta Branca."' />
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
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-blue-900 mb-6">
              <EditableText id="iniciacao-title" isDev={isDev} defaultText="Iniciação" />
            </h2>
            <EditableText 
              id="iniciacao-desc" 
              isDev={isDev} 
              tagName="p"
              className="text-lg text-emerald-800 max-w-3xl mx-auto mb-12"
              defaultText="O ingresso oficial nos mistérios da Doutrina. O médium recebe as primeiras chaves para a manipulação consciente das energias." 
            />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 bg-pink-50 rounded-3xl border border-pink-100">
                <h3 className="text-xl font-bold text-blue-900 mb-4">
                  <EditableText id="iniciacao-item-1-title" isDev={isDev} defaultText="O Despertar" />
                </h3>
                <EditableText 
                  id="iniciacao-item-1-desc" 
                  isDev={isDev} 
                  tagName="p"
                  className="text-emerald-700"
                  defaultText="Abertura dos canais para a recepção das forças iniciáticas." 
                />
              </div>
              <div className="p-8 bg-pink-50 rounded-3xl border border-pink-100">
                <h3 className="text-xl font-bold text-blue-900 mb-4">
                  <EditableText id="iniciacao-item-2-title" isDev={isDev} defaultText="O Compromisso" />
                </h3>
                <EditableText 
                  id="iniciacao-item-2-desc" 
                  isDev={isDev} 
                  tagName="p"
                  className="text-emerald-700"
                  defaultText="Assunção da responsabilidade como porta-voz da espiritualidade." 
                />
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
                <h2 className="text-3xl md:text-5xl font-serif font-bold mb-8">
                  <EditableText id="elevacao-title" isDev={isDev} defaultText="Elevação de Espadas" />
                </h2>
                <EditableText 
                  id="elevacao-desc" 
                  isDev={isDev} 
                  tagName="p"
                  className="text-xl text-pink-100 mb-8 max-w-2xl"
                  defaultText="Um dos momentos mais sublimes na vida do Jaguar. A elevação representa o amadurecimento espiritual e a prontidão para trabalhos de maior envergadura." 
                />
                <button className="px-8 py-4 bg-violet-500 text-white font-bold rounded-full hover:bg-violet-600 transition-all">
                  <EditableText id="elevacao-btn" isDev={isDev} defaultText="Saiba mais sobre a Elevação" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Pré Centuria Section */}
        <section id="pre-centuria" className="py-24 bg-white scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-blue-900 mb-4">
                <EditableText id="pre-centuria-title" isDev={isDev} defaultText="Pré Centuria" />
              </h2>
              <EditableText 
                id="pre-centuria-subtitle" 
                isDev={isDev} 
                tagName="p"
                className="text-emerald-700"
                defaultText="A preparação final para o Mestrado." 
              />
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { id: "refinamento", title: "Refinamento", desc: "Ajuste fino da conduta doutrinária e moral." },
                { id: "conhecimento", title: "Conhecimento", desc: "Aprofundamento nas leis e rituais complexos." },
                { id: "lideranca", title: "Liderança", desc: "Preparação para guiar outros irmãos na jornada." }
              ].map((item, idx) => (
                <div key={idx} className="p-6 border border-pink-100 rounded-2xl hover:shadow-lg transition-all">
                  <h3 className="font-bold text-blue-900 mb-2">
                    <EditableText id={`pre-centuria-item-title-${item.id}`} isDev={isDev} defaultText={item.title} />
                  </h3>
                  <EditableText 
                    id={`pre-centuria-item-desc-${item.id}`} 
                    isDev={isDev} 
                    tagName="p"
                    className="text-sm text-emerald-700"
                    defaultText={item.desc} 
                  />
                </div>
              ))}
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
              )}>
                <EditableText id="mantras-title" isDev={isDev} defaultText="Mantras do Vale do Amanhecer" />
              </h2>
              <EditableText 
                id="mantras-subtitle" 
                isDev={isDev} 
                tagName="p"
                className={isDarkMode ? "text-slate-400" : "text-emerald-700"}
                defaultText="A força vibracional das palavras sagradas." 
              />
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { id: "simiromba", title: "Prece de Simiromba", text: "Oh, Simiromba, do Grande Oriente de Oxalá! No mundo espiritual, onde tudo é luz..." },
                { id: "pai-nosso", title: "Pai Nosso do Amanhecer", text: "Pai Nosso que estais nos céus, na luz dos nossos plexos..." },
                { id: "unificacao", title: "Mantra da Unificação", text: "Senhor, faze com que sejamos um só pensamento, uma só vibração..." },
                { id: "cura", title: "Mantra de Cura", text: "Que as forças das águas e das matas tragam o alívio e a regeneração..." }
              ].map((mantra, idx) => (
                <div key={idx} className={cn(
                  "p-8 rounded-3xl border shadow-sm transition-all",
                  isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-pink-200"
                )}>
                  <h3 className={cn(
                    "text-xl font-bold mb-4 flex items-center gap-2",
                    isDarkMode ? "text-white" : "text-blue-900"
                  )}>
                    <Sun className="w-5 h-5 text-violet-500" /> 
                    <EditableText id={`mantra-title-${mantra.id}`} isDev={isDev} defaultText={mantra.title} />
                  </h3>
                  <EditableText 
                    id={`mantra-text-${mantra.id}`} 
                    isDev={isDev} 
                    tagName="p"
                    className={cn(
                      "italic leading-relaxed",
                      isDarkMode ? "text-slate-300" : "text-emerald-700"
                    )}
                    defaultText={`"${mantra.text}"`} 
                  />
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
              <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">
                <EditableText id="perolas-title" isDev={isDev} defaultText="Só as Pérolas" />
              </h2>
              <p className="text-pink-100">
                <EditableText id="perolas-subtitle" isDev={isDev} defaultText="Ensinamentos e reflexões curtas de Tia Neiva para iluminar seu dia." />
              </p>
            </div>

            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {[
                "Não se esqueça que o amor é a única força que pode transformar o world.",
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
                  <EditableText 
                    id={`perola-text-${idx}`} 
                    isDev={isDev} 
                    tagName="p"
                    className="text-lg font-medium leading-relaxed italic"
                    defaultText={`"${perola}"`} 
                  />
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
              )}>
                <EditableText id="musicas-title" isDev={isDev} defaultText="Músicas Ciganas" />
              </h2>
              <EditableText 
                id="musicas-subtitle" 
                isDev={isDev} 
                tagName="p"
                className={isDarkMode ? "text-slate-400" : "text-emerald-700"}
                defaultText="A alegria e a liberdade da alma cigana na nossa doutrina." 
              />
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { id: "caminhada", title: "Caminhada Cigana", duration: "4:20" },
                { id: "festa", title: "Festa no Acampamento", duration: "3:45" },
                { id: "oracao", title: "Oração da Cigana", duration: "5:10" },
                { id: "danca", title: "Dança das Almas", duration: "4:00" },
                { id: "luz", title: "Luz do Oriente", duration: "3:30" },
                { id: "vento", title: "Vento de Liberdade", duration: "4:45" }
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
                      )}>
                        <EditableText id={`music-title-${music.id}`} isDev={isDev} defaultText={music.title} />
                      </h3>
                      <p className={isDarkMode ? "text-slate-400 text-xs" : "text-emerald-600 text-xs"}>Espiritualidade Cigana</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-emerald-500">{music.duration}</span>
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
              )}>
                <EditableText id="downloads-title" isDev={isDev} defaultText="Downloads e Acervo Digital" />
              </h2>
              <EditableText 
                id="downloads-subtitle" 
                isDev={isDev} 
                tagName="p"
                className={cn(
                  "max-w-2xl mx-auto",
                  isDarkMode ? "text-slate-400" : "text-emerald-700"
                )}
                defaultText="Acesse e baixe nosso acervo completo de livros, leis, áudios e materiais de estudo." 
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
              <div className="space-y-8">
                {[
                  { id: "livros", icon: <BookOpen className="w-7 h-7" />, title: "Livros e Leis", desc: "Obras completas de Tia Neiva, leis do amanhecer e manuais de instrução para médiuns.", bg: "bg-blue-900" },
                  { id: "audios", icon: <PlayCircle className="w-7 h-7" />, title: "Áudios e Mantras", desc: "Gravações originais de mantras, preces e instruções sonoras para harmonização.", bg: "bg-violet-500" },
                  { id: "estudo", icon: <FileIcon className="w-7 h-7" />, title: "Materiais de Estudo", desc: "Apostilas de desenvolvimento, iniciação, elevação e centúria para sua jornada.", bg: "bg-emerald-500" }
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
                      )}>
                        <EditableText id={`download-item-title-${item.id}`} isDev={isDev} defaultText={item.title} />
                      </h3>
                      <EditableText 
                        id={`download-item-desc-${item.id}`} 
                        isDev={isDev} 
                        tagName="p"
                        className={cn(
                          "text-sm leading-relaxed",
                          isDarkMode ? "text-slate-400" : "text-emerald-700"
                        )}
                        defaultText={item.desc} 
                      />
                    </div>
                  </div>
                ))}
              </div>

            {isDev && (
              <div className={cn(
                "rounded-[3rem] p-12 text-center text-white shadow-2xl relative overflow-hidden group",
                isDarkMode ? "bg-slate-950" : "bg-blue-900"
              )}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-all"></div>
                <div className="relative z-10">
                  <Sun className="w-16 h-16 text-violet-400 mx-auto mb-6 animate-pulse" />
                  <h3 className="text-3xl font-serif font-bold mb-4">
                    <EditableText id="downloads-drive-title" isDev={isDev} defaultText="Acesso ao Acervo Completo" />
                  </h3>
                  <EditableText 
                    id="downloads-drive-desc" 
                    isDev={isDev} 
                    tagName="p"
                    className={isDarkMode ? "text-slate-300 mb-8 leading-relaxed" : "text-blue-100 mb-8 leading-relaxed"}
                    defaultText="Como Mestre, você tem acesso ao nosso Google Drive oficial com todos os materiais da Doutrina do Amanhecer." 
                  />
                  <a 
                    href="https://drive.google.com/drive/my-drive"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-10 py-5 bg-violet-500 text-white font-bold rounded-full hover:bg-violet-400 hover:scale-105 transition-all shadow-xl"
                  >
                    <LinkIcon className="w-6 h-6" /> <EditableText id="downloads-drive-btn" isDev={isDev} defaultText="Abrir Google Drive" />
                  </a>
                </div>
              </div>
            )}
            </div>

            {isDev && (
              <div id="assistente-ia" className="mt-24 scroll-mt-24">
                <LetterTranscriber isDarkMode={isDarkMode} />
              </div>
            )}

            <div className="mt-16 text-center">
              <p className={cn(
                "text-sm mb-6 max-w-lg mx-auto",
                isDarkMode ? "text-slate-400" : "text-emerald-700"
              )}>
                A tecnologia que move este portal e nossa IA tem custos. Ajude-nos a manter esta luz acesa para todos os jaguares.
              </p>
              <a 
                href="https://tipa.ai/jesuscristopaisetabranca"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                <Heart className="w-4 h-4 fill-current" /> Apoiar o Portal
              </a>
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
                      <VideoIcon className="w-5 h-5 text-blue-400" />
                      <FileIcon className="w-5 h-5 text-emerald-400" />
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
                             file.type.startsWith('video/') ? <VideoIcon className="w-5 h-5 text-blue-400 shrink-0" /> :
                             <FileIcon className="w-5 h-5 text-emerald-400 shrink-0" />}
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
                      <button 
                        onClick={() => {
                          window.open('https://drive.google.com/drive/my-drive', '_blank');
                          setUploadedFiles([]);
                        }}
                        className="px-8 py-3 bg-blue-900 text-white font-bold rounded-full hover:bg-blue-800 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                      >
                        <ExternalLink className="w-5 h-5" /> Enviar para o Drive do Acervo
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </section>

        <NoticiasSection 
          isDarkMode={isDarkMode} 
          isDev={isDev} 
          news={news} 
          onDelete={handleDeleteNews}
          onAdd={() => setIsNewsModalOpen(true)}
        />

        <div className="py-12 text-center">
          <a 
            href="https://tipa.ai/jesuscristopaisetabranca"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-4 bg-rose-500/10 text-rose-500 border-2 border-rose-500/20 rounded-full font-bold hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-95"
          >
            <HeartHandshake className="w-5 h-5" /> Apoie a Manutenção do Portal
          </a>
        </div>

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
                  content: "O Doutrinador é a peça fundamental no mecanismo da Doutrina do Amanhecer. Sua missão transcende o simples ato de falar; ele é o equilíbrio, a força consciente que manipula as energias em conjunto com o Apará. Na Nova Era, onde as vibrações estão cada vez mais intensas, o Doutrinador deve estar preparado, com sua mente sintonizada nos planos superiores, para servir de canal para a cura e a libertação de irmãos sofredores. Ser Doutrinador é um compromisso de amor e responsabilidade com a humanidade.",
                  date: "10 Mar, 2026",
                  image: "https://picsum.photos/seed/doutrina/600/400"
                },
                {
                  title: "Manipulação de Energias: O Guia Básico",
                  excerpt: "Como Tia Neiva nos ensinou a lidar com as correntes magnéticas para o auxílio e a cura.",
                  content: "Tia Neiva nos deixou um legado riquíssimo sobre a manipulação das correntes magnéticas. Tudo no universo é energia, e nós, como médiuns do Amanhecer, somos instrumentos para canalizar essas forças. O segredo reside na concentração, na fé e no amor incondicional. Ao abrir um trabalho, criamos um campo magnético que atrai as falanges espirituais. Aprender a direcionar essa energia com precisão é o que diferencia um trabalho eficaz de uma simples cerimônia. A prática constante e o estudo das leis espirituais são o caminho para o domínio dessa ciência.",
                  date: "08 Mar, 2026",
                  image: "https://picsum.photos/seed/energy/600/400"
                },
                {
                  title: "O Chamado do Jaguar: Missão e Compromisso",
                  excerpt: "Reflexões sobre o compromisso assumido por cada Jaguar ao ingressar na Doutrina do Amanhecer.",
                  content: "Ingressar na Doutrina do Amanhecer não é apenas uma escolha religiosa, é o despertar de uma consciência milenar. O Jaguar é um espírito que assumiu compromissos graves em encarnações passadas e agora tem a oportunidade de reajustar seu carma através da caridade. O chamado é forte e ressoa no fundo da alma. Mas com o chamado vem o compromisso: a disciplina, a obediência às leis da doutrina e, acima de tudo, a dedicação ao próximo. Ser Jaguar é viver a doutrina 24 horas por dia, sendo um exemplo de conduta e amor por onde passar.",
                  date: "05 Mar, 2026",
                  image: "https://picsum.photos/seed/mission/600/400"
                }
              ].map((post, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelectedPost(post)}
                  className={cn(
                    "group rounded-2xl overflow-hidden border transition-all hover:shadow-xl cursor-pointer",
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
                    <button className={cn(
                      "font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all",
                      isDarkMode ? "text-violet-500" : "text-blue-600"
                    )}>
                      Ler mais <Sparkles className="w-4 h-4" />
                    </button>
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

                  <div className="mt-12 flex items-center gap-4">
                    <a 
                      href="https://www.facebook.com/profile.php?id=61582420894528" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-violet-500 transition-colors"
                      title="Facebook"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a 
                      href="https://www.youtube.com/channel/UCuXuIizz8_5nkLMWU-Vxo5g" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-rose-600 transition-colors"
                      title="YouTube"
                    >
                      <Youtube className="w-5 h-5" />
                    </a>
                    <a 
                      href="https://linktr.ee/rypuradoamanhecer" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-emerald-500 transition-colors"
                      title="Linktree"
                    >
                      <LinkIcon className="w-5 h-5" />
                    </a>
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

        {/* Temples Gallery Section */}
        <section id="nossos-templos" className={cn(
          "py-24 scroll-mt-24 transition-colors duration-500",
          isDarkMode ? "bg-slate-900" : "bg-white"
        )}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className={cn(
                "text-3xl md:text-5xl font-serif font-bold mb-4",
                isDarkMode ? "text-white" : "text-blue-900"
              )}>
                <EditableText id="templos-title" isDev={isDev} defaultText="Nossos Templos" />
              </h2>
              <EditableText 
                id="templos-subtitle" 
                isDev={isDev} 
                tagName="p"
                className={cn(
                  "max-w-2xl mx-auto text-lg",
                  isDarkMode ? "text-slate-400" : "text-emerald-700"
                )}
                defaultText="Conheça alguns dos pontos de luz espalhados pelo Brasil, onde a doutrina de Tia Neiva floresce e transforma vidas através da caridade e do amor." 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
              {[
                {
                  id: "templo-mae",
                  name: "Templo Mãe",
                  location: "Planaltina, DF",
                  desc: "O berço da doutrina de Tia Neiva e centro irradiador de luz para todo o amanhecer.",
                  img: "https://images.unsplash.com/photo-1548625361-195fe5772d97?auto=format&fit=crop&w=800&h=500&q=80"
                },
                {
                  id: "templo-pelario",
                  name: "Templo Pelário do Amanhecer",
                  location: "Acesse o Facebook",
                  desc: "Trabalho espiritual e caridade constante. Siga nossas atividades e escalas pelo Facebook.",
                  img: "https://images.unsplash.com/photo-1590076175571-4b5459efb599?auto=format&fit=crop&w=800&h=500&q=80",
                  link: "https://www.facebook.com/profile.php?id=61582420894528"
                },
                {
                  id: "templo-patario",
                  name: "Templo Patário do Amanhecer",
                  location: "Crato, CE",
                  desc: "Localizado na Área Especial - Av. da Estrela - Vila Lobo, Crato - CE. Um ponto de luz no Ceará.",
                  img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&h=500&q=80"
                },
                {
                  id: "ry-purado",
                  name: "RY Purado do Amanhecer",
                  location: "Linktree",
                  desc: "Acesse nosso Linktree para informações sobre escalas, mantras e comunicações oficiais.",
                  img: "https://images.unsplash.com/photo-1565342403875-07a8dc5ed13c?auto=format&fit=crop&w=800&h=500&q=80",
                  link: "https://linktr.ee/rypuradoamanhecer"
                },
                {
                  id: "templo-olinda",
                  name: "Templo de Olinda",
                  location: "Olinda, PE",
                  desc: "Uma das primeiras ramificações, levando a cura e o conforto espiritual ao Nordeste.",
                  img: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&h=500&q=80"
                },
                {
                  id: "templo-salvador",
                  name: "Templo de Salvador",
                  location: "Salvador, BA",
                  desc: "Irradiando a força dos Orixás e a caridade constante na capital baiana.",
                  img: "https://images.unsplash.com/photo-1542332213-31f87348057f?auto=format&fit=crop&w=800&h=500&q=80"
                }
              ].map((temple, idx) => (
                <motion.div
                  key={temple.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden mb-6 shadow-2xl border border-transparent group-hover:border-violet-500 transition-all duration-500">
                    <EditableImage 
                      id={`temple-${temple.id}`}
                      defaultSrc={temple.img}
                      alt={temple.name}
                      isDev={isDev}
                      className="w-full h-full transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                      <span className="text-violet-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">{temple.location}</span>
                      {temple.link && (
                        <a 
                          href={temple.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-white text-sm font-bold hover:text-violet-400 transition-colors"
                        >
                          Acessar Site <ArrowRight className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  <h3 className={cn(
                    "text-2xl font-bold mb-2 transition-colors group-hover:text-violet-500",
                    isDarkMode ? "text-white" : "text-blue-900"
                  )}>{temple.name}</h3>
                  <p className={cn(
                    "text-sm leading-relaxed mb-6",
                    isDarkMode ? "text-slate-400" : "text-emerald-700"
                  )}>{temple.desc}</p>
                  
                  <a 
                    href={temple.link || "https://valedoamanhecer.net.br/templos.php"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all group/btn",
                      isDarkMode ? "text-violet-400 hover:text-violet-300" : "text-blue-900 hover:text-violet-600"
                    )}
                  >
                    <span>Ver Informações</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </a>
                </motion.div>
              ))}
            </div>

            <div className="mt-20 text-center">
              <a 
                href="https://valedoamanhecer.net.br/templos.php" 
                target="_blank" 
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-3 px-10 py-5 rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-xl",
                  isDarkMode ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-blue-900 text-white hover:bg-blue-800"
                )}
              >
                <LinkIcon className="w-5 h-5" /> Ver Lista Completa de Templos
              </a>
            </div>
          </div>
        </section>

        {/* Temples Relation Section */}
        <section id="relacao-templos" className={cn(
          "py-24 scroll-mt-24 transition-colors duration-500",
          isDarkMode ? "bg-slate-950" : "bg-pink-50"
        )}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className={cn(
                "text-3xl md:text-5xl font-serif font-bold mb-4",
                isDarkMode ? "text-white" : "text-blue-900"
              )}>
                <EditableText id="relacao-templos-title" isDev={isDev} defaultText="Relação de Templos" />
              </h2>
              <EditableText 
                id="relacao-templos-subtitle" 
                isDev={isDev} 
                tagName="p"
                className={cn(
                  "max-w-2xl mx-auto text-lg mb-8",
                  isDarkMode ? "text-slate-400" : "text-emerald-700"
                )}
                defaultText="Encontre o Templo do Amanhecer mais próximo de você. Uma rede de luz espalhada por todo o Brasil e exterior." 
              />
              
              <div className="max-w-md mx-auto relative">
                <input 
                  type="text" 
                  placeholder="Buscar por cidade, estado ou nome..."
                  value={templeSearch}
                  onChange={(e) => setTempleSearch(e.target.value)}
                  className={cn(
                    "w-full px-6 py-4 rounded-full border-2 focus:outline-none focus:ring-4 transition-all shadow-lg",
                    isDarkMode 
                      ? "bg-slate-900 border-slate-800 text-white focus:ring-violet-500/20 focus:border-violet-500" 
                      : "bg-white border-pink-100 text-emerald-900 focus:ring-pink-200 focus:border-pink-300"
                  )}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-violet-500">
                  <LinkIcon className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className={cn(
              "rounded-[3rem] overflow-hidden border shadow-2xl",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-pink-100"
            )}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={cn(
                      "border-b",
                      isDarkMode ? "bg-slate-800/50 border-slate-800" : "bg-pink-50/50 border-pink-100"
                    )}>
                      <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-violet-500">Templo</th>
                      <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-violet-500">Localização</th>
                      <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-violet-500">Informações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Templo Mãe", city: "Planaltina", state: "DF", info: "Sede Mundial - Vale do Amanhecer" },
                      { name: "Templo Pelário", city: "Crato", state: "CE", info: "Vila Lobo - Ativo" },
                      { name: "Templo Patário", city: "Crato", state: "CE", info: "Av. da Estrela - Vila Lobo" },
                      { name: "Templo de Olinda", city: "Olinda", state: "PE", info: "Ramificação Nordeste" },
                      { name: "Templo de Salvador", city: "Salvador", state: "BA", info: "Capital Baiana" },
                      { name: "Templo de Curitiba", city: "Curitiba", state: "PR", info: "Região Sul" },
                      { name: "Templo de Manaus", city: "Manaus", state: "AM", info: "Região Norte" },
                      { name: "Templo de Goiânia", city: "Goiânia", state: "GO", info: "Região Centro-Oeste" },
                    ].filter(t => 
                      t.name.toLowerCase().includes(templeSearch.toLowerCase()) ||
                      t.city.toLowerCase().includes(templeSearch.toLowerCase()) ||
                      t.state.toLowerCase().includes(templeSearch.toLowerCase())
                    ).map((temple, idx) => (
                      <tr 
                        key={idx}
                        className={cn(
                          "border-b last:border-0 hover:bg-violet-500/5 transition-colors",
                          isDarkMode ? "border-slate-800" : "border-pink-50"
                        )}
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500">
                              <Sun className="w-5 h-5" />
                            </div>
                            <span className={cn("font-bold", isDarkMode ? "text-white" : "text-blue-900")}>{temple.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={isDarkMode ? "text-slate-400" : "text-emerald-700"}>{temple.city} - {temple.state}</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-xs italic opacity-70">{temple.info}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <p className={cn("text-sm mb-6 italic", isDarkMode ? "text-slate-500" : "text-emerald-600")}>
                * Esta relação é atualizada periodicamente. Para informações oficiais, consulte o Templo Mãe.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a 
                  href="https://valedoamanhecer.net.br/templos.php" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-violet-500 text-white rounded-full font-bold hover:bg-violet-600 transition-all shadow-lg"
                >
                  <LinkIcon className="w-4 h-4" /> Site Oficial Geral
                </a>
                <a 
                  href="https://share.google/YlJwB2O9hfuIzd6mG" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-lg border",
                    isDarkMode ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-700" : "bg-white border-pink-100 text-blue-900 hover:bg-pink-50"
                  )}
                >
                  <FileIcon className="w-4 h-4" /> Relação Completa (Google)
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Calendar Section */}
        <section id="calendario" className={cn(
          "py-24 scroll-mt-24 transition-colors duration-500",
          isDarkMode ? "bg-slate-900" : "bg-white"
        )}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className={cn(
                "text-3xl md:text-5xl font-serif font-bold mb-4",
                isDarkMode ? "text-white" : "text-blue-900"
              )}>
                <EditableText id="calendario-title" isDev={isDev} defaultText="Calendário de Eventos" />
              </h2>
              <EditableText 
                id="calendario-subtitle" 
                isDev={isDev} 
                tagName="p"
                className={cn(
                  "max-w-2xl mx-auto text-lg",
                  isDarkMode ? "text-slate-400" : "text-emerald-700"
                )}
                defaultText="Fique por dentro das datas sagradas, celebrações e missões que compõem o ciclo espiritual do Vale do Amanhecer." 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Upcoming Events List */}
              <div className="lg:col-span-2 space-y-6">
                <EventSchema events={[
                  { date: "01", month: "MAI", title: "Dia do Doutrinador", type: "Celebração", desc: "Grande festa em homenagem aos Doutrinadores de todo o mundo no Templo Mãe." },
                  { date: "30", month: "OUT", title: "Aniversário de Tia Neiva", type: "Homenagem", desc: "Celebração da vida e obra da nossa Clarividente Neiva Zelaya." },
                  { date: "09", month: "NOV", title: "Dia do Jaguar", type: "Celebração", desc: "Data dedicada a todos os médiuns jaguares que cumprem sua missão na Terra." },
                  { date: "25", month: "DEZ", title: "Natal do Amanhecer", type: "Celebração", desc: "Trabalhos especiais de Natal com irradiação de amor e paz universal." },
                  { date: "01", month: "JAN", title: "Ano Novo Espiritual", type: "Celebração", desc: "Abertura do ciclo anual com bênçãos de Pai Seta Branca." },
                ]} />
                {[
                  { date: "01", month: "MAI", title: "Dia do Doutrinador", type: "Celebração", desc: "Grande festa em homenagem aos Doutrinadores de todo o mundo no Templo Mãe." },
                  { date: "30", month: "OUT", title: "Aniversário de Tia Neiva", type: "Homenagem", desc: "Celebração da vida e obra da nossa Clarividente Neiva Zelaya." },
                  { date: "09", month: "NOV", title: "Dia do Jaguar", type: "Celebração", desc: "Data dedicada a todos os médiuns jaguares que cumprem sua missão na Terra." },
                  { date: "25", month: "DEZ", title: "Natal do Amanhecer", type: "Celebração", desc: "Trabalhos especiais de Natal com irradiação de amor e paz universal." },
                  { date: "01", month: "JAN", title: "Ano Novo Espiritual", type: "Celebração", desc: "Abertura do ciclo anual com bênçãos de Pai Seta Branca." },
                ].map((event, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className={cn(
                      "flex items-center gap-6 p-6 rounded-[2rem] border transition-all hover:shadow-xl group",
                      isDarkMode ? "bg-slate-950 border-slate-800 hover:border-violet-500/50" : "bg-pink-50/30 border-pink-100 hover:border-pink-300"
                    )}
                  >
                    <div className={cn(
                      "flex flex-col items-center justify-center min-w-[80px] h-20 rounded-2xl shadow-inner",
                      isDarkMode ? "bg-slate-800 text-white" : "bg-white text-blue-900"
                    )}>
                      <span className="text-2xl font-bold leading-none">{event.date}</span>
                      <span className="text-[10px] font-bold tracking-widest uppercase opacity-60">{event.month}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-violet-500">{event.type}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className={cn("text-[10px] font-medium", isDarkMode ? "text-slate-500" : "text-emerald-600")}>Templo Mãe & Ramificações</span>
                      </div>
                      <h3 className={cn(
                        "text-xl font-bold mb-1 transition-colors group-hover:text-violet-500",
                        isDarkMode ? "text-white" : "text-blue-900"
                      )}>{event.title}</h3>
                      <p className={cn(
                        "text-sm leading-relaxed opacity-70",
                        isDarkMode ? "text-slate-400" : "text-emerald-700"
                      )}>{event.desc}</p>
                    </div>
                    <div className="hidden sm:block">
                      <button className={cn(
                        "p-3 rounded-full transition-all hover:scale-110",
                        isDarkMode ? "bg-slate-800 text-slate-400 hover:text-white" : "bg-white text-pink-300 hover:text-pink-500"
                      )}>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Recurring Events / Sidebar */}
              <div className="space-y-8">
                <div className={cn(
                  "p-8 rounded-[2.5rem] border shadow-lg",
                  isDarkMode ? "bg-slate-950 border-slate-800" : "bg-blue-900 text-white"
                )}>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-violet-400" /> Atividades Recorrentes
                  </h3>
                  <div className="space-y-6">
                    {[
                      { id: "sch-1", day: "Todo 3º Domingo", title: "Palestra Doutrinária", time: "10:00h" },
                      { id: "sch-2", day: "Toda 4ª Feira", title: "Missão de Cura Especial", time: "19:30h" },
                      { id: "sch-3", day: "Sábados", title: "Desenvolvimento de Médiuns", time: "15:00h" },
                      { id: "sch-4", day: "Diariamente", title: "Trabalhos de Retiro", time: "10h às 22h" },
                    ].map((item, idx) => (
                      <div key={idx} className="border-b border-white/10 last:border-0 pb-4 last:pb-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-1">
                          <EditableText id={`sch-day-${item.id}`} isDev={isDev} defaultText={item.day} />
                        </p>
                        <h4 className="font-bold mb-1">
                          <EditableText id={`sch-title-${item.id}`} isDev={isDev} defaultText={item.title} />
                        </h4>
                        <p className="text-xs opacity-60">
                          Horário de Brasília: <EditableText id={`sch-time-${item.id}`} isDev={isDev} defaultText={item.time} />
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={cn(
                  "p-8 rounded-[2.5rem] border border-dashed",
                  isDarkMode ? "border-slate-800 text-slate-400" : "border-pink-200 text-emerald-700"
                )}>
                  <Quote className="w-8 h-8 mb-4 opacity-20" />
                  <EditableText 
                    id="sch-quote" 
                    isDev={isDev} 
                    tagName="p"
                    className="text-sm italic leading-relaxed"
                    defaultText={`"O tempo é o senhor da razão, e na espiritualidade, cada data tem seu mistério e sua força de cura."`} 
                  />
                  <p className="text-xs font-bold mt-4 uppercase tracking-widest">
                    — <EditableText id="sch-quote-author" isDev={isDev} defaultText="Tia Neiva" />
                  </p>
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
            <EditableText 
              id="cta-title" 
              isDev={isDev} 
              tagName="h2"
              className="text-3xl md:text-4xl font-serif font-bold mb-6"
              defaultText="Jesus Cristo, o Sol da Terra, te chama." 
            />
            <EditableText 
              id="cta-desc" 
              isDev={isDev} 
              tagName="p"
              className={cn(
                "mb-10 text-lg",
                isDarkMode ? "text-slate-400" : "text-pink-100"
              )}
              defaultText="Não deixe para amanhã o cumprimento do seu dever espiritual. O Vale do Amanhecer espera por você." 
            />
            <button className="px-12 py-6 bg-violet-500 hover:bg-violet-600 text-white text-2xl font-bold rounded-full shadow-lg transition-all hover:scale-105 active:scale-95">
              <EditableText id="cta-btn" isDev={isDev} defaultText="Quero ser curado!" />
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
                
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-100 dark:border-blue-800 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-blue-800 dark:text-blue-200 text-left leading-relaxed">
                    <strong>Acesso de Mestre:</strong> Use o e-mail <strong>admin@vale.com</strong> e a senha <strong>admin</strong> para habilitar as ferramentas de edição do portal.
                  </p>
                </div>
              </div>

              <form className="space-y-6" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <label className={cn(
                    "text-xs font-bold uppercase tracking-wider ml-1",
                    isDarkMode ? "text-slate-500" : "text-emerald-800"
                  )}>Chave do Mestre</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                    <input 
                      type="password" 
                      required
                      value={masterKey}
                      onChange={(e) => setMasterKey(e.target.value)}
                      placeholder="Digite a chave secreta"
                      className={cn(
                        "w-full pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all border",
                        isDarkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-pink-50 border-pink-100 text-emerald-900"
                      )}
                    />
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl border border-emerald-100 dark:border-emerald-800 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-emerald-800 dark:text-emerald-200 leading-relaxed">
                    A chave de acesso é <strong>{siteConfig.masterKey}</strong>. Use-a para habilitar as ferramentas de edição.
                  </p>
                </div>

                <button className="w-full py-4 bg-blue-900 text-white font-bold rounded-2xl hover:bg-blue-800 transition-all shadow-lg flex items-center justify-center gap-2">
                  <Unlock className="w-5 h-5" /> Ativar Modo Mestre
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

      <MediaGallerySection 
        isDarkMode={isDarkMode} 
        isDev={isDev} 
        items={galleryItems}
        onAdd={handleAddGalleryItem}
        onDelete={handleDeleteGalleryItem}
      />

      <DonationSection isDarkMode={isDarkMode} />

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
              )}>Acompanhe nossas Redes Oficiais</p>
              <div className="flex items-center gap-4">
                <a 
                  href="https://www.facebook.com/profile.php?id=61582420894528"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-110 shadow-lg",
                    isDarkMode ? "bg-slate-900 text-white hover:bg-violet-600" : "bg-white text-blue-900 hover:bg-violet-500 hover:text-white"
                  )}
                  title="Facebook"
                >
                  <Facebook className="w-6 h-6" />
                </a>
                <a 
                  href="https://www.youtube.com/channel/UCuXuIizz8_5nkLMWU-Vxo5g"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-110 shadow-lg",
                    isDarkMode ? "bg-slate-900 text-white hover:bg-rose-600" : "bg-white text-rose-600 hover:bg-rose-600 hover:text-white"
                  )}
                  title="YouTube"
                >
                  <Youtube className="w-6 h-6" />
                </a>
                <a 
                  href="https://linktr.ee/rypuradoamanhecer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-110 shadow-lg",
                    isDarkMode ? "bg-slate-900 text-white hover:bg-emerald-600" : "bg-white text-emerald-600 hover:bg-emerald-600 hover:text-white"
                  )}
                  title="Linktree"
                >
                  <LinkIcon className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
            <a href="#doutrina" className="hover:text-violet-500 transition-colors">
              <EditableText 
                id="footer-nav-doutrina" 
                isDev={isDev} 
                tagName="span"
                defaultText="Doutrina" 
              />
            </a>
            <a href="#historia" className="hover:text-violet-500 transition-colors">
              <EditableText 
                id="footer-nav-historia" 
                isDev={isDev} 
                tagName="span"
                defaultText="História" 
              />
            </a>
            <a href="#nossos-templos" className="hover:text-violet-500 transition-colors">
              <EditableText 
                id="footer-nav-templos" 
                isDev={isDev} 
                tagName="span"
                defaultText="Templos" 
              />
            </a>
            <a href="#arquivos" className="hover:text-violet-500 transition-colors">
              <EditableText 
                id="footer-nav-downloads" 
                isDev={isDev} 
                tagName="span"
                defaultText="Downloads" 
              />
            </a>
            <a href="#noticias" className="hover:text-violet-500 transition-colors">
              <EditableText 
                id="footer-nav-noticias" 
                isDev={isDev} 
                tagName="span"
                defaultText="Notícias" 
              />
            </a>
            <a href="#blog" className="hover:text-violet-500 transition-colors">
              <EditableText 
                id="footer-nav-blog" 
                isDev={isDev} 
                tagName="span"
                defaultText="Blog" 
              />
            </a>
            <a href="#galeria" className="hover:text-violet-500 transition-colors">
              <EditableText 
                id="footer-nav-galeria" 
                isDev={isDev} 
                tagName="span"
                defaultText="Galeria" 
              />
            </a>
            <a href="https://tipa.ai/jesuscristopaisetabranca" target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1">
              <Heart className="w-3 h-3 fill-current" /> <EditableText 
                id="footer-nav-doacao" 
                isDev={isDev} 
                tagName="span"
                defaultText="Doação" 
              />
            </a>
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

      {/* News Modal */}
      {isNewsModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsNewsModalOpen(false)}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "relative w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-pink-100"
            )}
          >
            <form onSubmit={handleAddNews} className="p-8 sm:p-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className={cn(
                  "text-2xl font-serif font-bold",
                  isDarkMode ? "text-white" : "text-blue-900"
                )}>Novo Comunicado</h2>
                <button 
                  type="button"
                  onClick={() => setIsNewsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Título</label>
                  <input 
                    required
                    type="text"
                    value={newNews.title}
                    onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                      isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-blue-900"
                    )}
                    placeholder="Ex: Grande Trabalho de Estrela Candente"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Categoria</label>
                  <select 
                    value={newNews.category}
                    onChange={(e) => setNewNews({ ...newNews, category: e.target.value })}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                      isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-blue-900"
                    )}
                  >
                    <option value="Comunicado">Comunicado</option>
                    <option value="Notícia">Notícia</option>
                    <option value="Aviso">Aviso</option>
                    <option value="Evento">Evento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Conteúdo</label>
                  <textarea 
                    required
                    rows={4}
                    value={newNews.content}
                    onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none",
                      isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-blue-900"
                    )}
                    placeholder="Descreva os detalhes do comunicado..."
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20"
                >
                  Publicar Comunicado
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Blog Post Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setSelectedPost(null)}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={cn(
              "relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl transition-colors duration-500",
              isDarkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
            )}
          >
            <button 
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-500/20 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="aspect-video w-full overflow-hidden">
              <img 
                src={selectedPost.image} 
                alt={selectedPost.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="p-8 md:p-12">
              <span className={cn(
                "text-xs font-bold uppercase tracking-widest",
                isDarkMode ? "text-violet-400" : "text-emerald-600"
              )}>{selectedPost.date}</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mt-4 mb-8 leading-tight">
                {selectedPost.title}
              </h2>
              <div className={cn(
                "text-lg leading-relaxed space-y-6",
                isDarkMode ? "text-slate-300" : "text-slate-700"
              )}>
                <p>{selectedPost.content}</p>
                <p>A Doutrina do Amanhecer é uma jornada de autoconhecimento e serviço. Cada artigo que compartilhamos aqui visa fortalecer sua fé e seu entendimento sobre as leis espirituais que regem nosso trabalho. Continue estudando, continue praticando a caridade, e lembre-se sempre das palavras de Tia Neiva.</p>
              </div>
              
              <div className="mt-12 pt-8 border-t border-slate-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold">
                    VA
                  </div>
                  <div>
                    <p className="text-sm font-bold">Equipe Vale</p>
                    <p className="text-xs opacity-60">Portal de Estudos</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPost(null)}
                  className="px-8 py-3 bg-violet-500 text-white font-bold rounded-full hover:bg-violet-600 transition-colors"
                >
                  Fechar Artigo
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Admin & Navigation Floating Buttons */}
      <div className="fixed bottom-8 right-8 z-[60] flex flex-col gap-4">
        <motion.a
          href="https://tipa.ai/jesuscristopaisetabranca"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 bg-rose-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:bg-rose-600 border-4 border-white group"
          title="Fazer uma Doação"
        >
          <Heart className="w-6 h-6 fill-current group-hover:animate-ping absolute" />
          <Heart className="w-6 h-6 fill-current relative z-10" />
        </motion.a>

        {isDev && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => setIsAdminPanelOpen(true)}
            className={cn(
              "w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all border-4 border-white active:scale-95 bg-blue-900 text-white"
            )}
            title="Painel do Mestre"
          >
            <Unlock className="w-6 h-6" />
          </motion.button>
        )}
        
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: showBackToTop ? 1 : 0, 
            scale: showBackToTop ? 1 : 0.5,
            pointerEvents: showBackToTop ? 'auto' : 'none'
          }}
          onClick={scrollToTop}
          className={cn(
            "w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-4 border-white",
            isDarkMode ? "bg-violet-600 text-white" : "bg-pink-500 text-white"
          )}
          title="Voltar ao Topo"
        >
          <ArrowUp className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Fixed Request Access Button */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 left-6 z-[60]"
      >
        <a 
          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${siteConfig.contactEmail}&su=Solicitação de Acesso ao Acervo Digital - Vale do Amanhecer&body=Salve Deus! Gostaria de solicitar acesso ao acervo completo no Google Drive.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-6 py-4 bg-emerald-600 text-white rounded-full font-bold shadow-2xl hover:scale-105 transition-all group"
        >
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Mail className="w-4 h-4" />
          </div>
          <span className="text-sm">Solicitar Acesso ao Acervo</span>
        </a>
      </motion.div>

      {/* Admin Panel Modal */}
      {isAdminPanelOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsAdminPanelOpen(false)}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "relative w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border",
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-pink-100"
            )}
          >
            <div className="p-8 sm:p-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className={cn(
                    "text-3xl font-serif font-bold",
                    isDarkMode ? "text-white" : "text-blue-900"
                  )}>Painel do Mestre</h2>
                  <p className="text-violet-500 font-bold text-xs uppercase tracking-widest mt-1">
                    {isDev ? "Gerenciamento do Portal" : "Acesso Restrito"}
                  </p>
                </div>
                <button 
                  onClick={() => setIsAdminPanelOpen(false)}
                  className="p-3 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {isDev && (
                <div className="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-800">
                  <button 
                    onClick={() => setAdminTab('actions')}
                    className={cn(
                      "pb-4 text-xs font-bold uppercase tracking-widest transition-all relative",
                      adminTab === 'actions' ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    Ações Rápidas
                    {adminTab === 'actions' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
                  </button>
                  <button 
                    onClick={() => setAdminTab('settings')}
                    className={cn(
                      "pb-4 text-xs font-bold uppercase tracking-widest transition-all relative",
                      adminTab === 'settings' ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    Configurações
                    {adminTab === 'settings' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
                  </button>
                </div>
              )}

              {!isDev && (
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl mb-8 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 leading-relaxed">
                    <strong>Dica:</strong> Para editar o site, use o e-mail <strong>admin@vale.com</strong> e a senha <strong>admin</strong> no botão de login abaixo.
                  </p>
                </div>
              )}

              {isDev ? (
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                          <RefreshCw className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className={cn("font-bold", isDarkMode ? "text-white" : "text-blue-900")}>Sincronia Energética</h3>
                          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Editor ↔ Portal</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-bold">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        SINCRONIZADO
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                      A sincronia entre o Editor (Doutrinador) e o Portal (Apará) garante que a energia da doutrina flua sem interferências entre o servidor e o navegador.
                    </p>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => window.location.reload()}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-md active:scale-95"
                      >
                        Sincronizar Agora
                      </button>
                    </div>
                  </div>

                  {adminTab === 'actions' ? (
                    <div className="grid sm:grid-cols-2 gap-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                      <div className={cn(
                        "p-6 rounded-3xl border transition-all",
                        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-blue-50 border-blue-100"
                      )}>
                        <div className="w-12 h-12 bg-blue-900 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                        <h3 className={cn("font-bold mb-2", isDarkMode ? "text-white" : "text-blue-900")}>Editar Imagens</h3>
                        <p className="text-xs text-slate-500 mb-4">Passe o mouse sobre qualquer imagem no site para ver o botão de upload.</p>
                        <button 
                          onClick={() => { setIsAdminPanelOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="text-xs font-bold text-blue-600 hover:underline"
                        >
                          Ver Imagens
                        </button>
                      </div>

                      <div className={cn(
                        "p-6 rounded-3xl border transition-all",
                        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-amber-50 border-amber-100"
                      )}>
                        <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg">
                          <Edit3 className="w-6 h-6" />
                        </div>
                        <h3 className={cn("font-bold mb-2", isDarkMode ? "text-white" : "text-blue-900")}>Editar Textos</h3>
                        <p className="text-xs text-slate-500 mb-4">Clique em qualquer parágrafo ou título para abrir o editor de texto.</p>
                        <button 
                          onClick={() => { setIsAdminPanelOpen(false); }}
                          className="text-xs font-bold text-amber-600 hover:underline"
                        >
                          Começar a Editar
                        </button>
                      </div>

                      <div className={cn(
                        "p-6 rounded-3xl border transition-all",
                        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-indigo-50 border-indigo-100"
                      )}>
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg">
                          <Layout className="w-6 h-6" />
                        </div>
                        <h3 className={cn("font-bold mb-2", isDarkMode ? "text-white" : "text-blue-900")}>Gerenciar Galeria</h3>
                        <p className="text-xs text-slate-500 mb-4">Adicione novas fotos e vídeos na galeria de mídia do portal.</p>
                        <button 
                          onClick={() => { setIsAdminPanelOpen(false); document.getElementById('galeria')?.scrollIntoView({ behavior: 'smooth' }); }}
                          className="text-xs font-bold text-indigo-600 hover:underline"
                        >
                          Ir para Galeria
                        </button>
                      </div>

                      <div className={cn(
                        "p-6 rounded-3xl border transition-all",
                        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-emerald-50 border-emerald-100"
                      )}>
                        <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg">
                          <Download className="w-6 h-6" />
                        </div>
                        <h3 className={cn("font-bold mb-2", isDarkMode ? "text-white" : "text-blue-900")}>Acervo no Drive</h3>
                        <p className="text-xs text-slate-500 mb-4">Acesse a pasta oficial do Google Drive para gerenciar arquivos e downloads.</p>
                        <a 
                          href="https://drive.google.com/drive/my-drive"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-emerald-600 hover:underline"
                        >
                          Abrir Google Drive
                        </a>
                      </div>

                      <div className={cn(
                        "p-6 rounded-3xl border transition-all",
                        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-violet-50 border-violet-100"
                      )}>
                        <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg">
                          <VideoIcon className="w-6 h-6" />
                        </div>
                        <h3 className={cn("font-bold mb-2", isDarkMode ? "text-white" : "text-blue-900")}>Vídeo/Áudio</h3>
                        <p className="text-xs text-slate-500 mb-4">O vídeo ou áudio de abertura pode ser alterado diretamente na seção inicial.</p>
                        <button 
                          onClick={() => { setIsAdminPanelOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="text-xs font-bold text-violet-600 hover:underline"
                        >
                          Ver Abertura
                        </button>
                      </div>

                      <div className={cn(
                        "p-6 rounded-3xl border transition-all",
                        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-emerald-50 border-emerald-100"
                      )}>
                        <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg">
                          <FileIcon className="w-6 h-6" />
                        </div>
                        <h3 className={cn("font-bold mb-2", isDarkMode ? "text-white" : "text-blue-900")}>Arquivos do Acervo</h3>
                        <p className="text-xs text-slate-500 mb-4">Suba novos documentos e materiais na seção de Downloads.</p>
                        <button 
                          onClick={() => { setIsAdminPanelOpen(false); document.getElementById('arquivos')?.scrollIntoView({ behavior: 'smooth' }); }}
                          className="text-xs font-bold text-emerald-600 hover:underline"
                        >
                          Ir para Downloads
                        </button>
                      </div>

                      <div className={cn(
                        "p-6 rounded-3xl border transition-all sm:col-span-2",
                        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-emerald-50 border-emerald-100"
                      )}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                              <Trash2 className="w-5 h-5" />
                            </div>
                            <h3 className={cn("font-bold", isDarkMode ? "text-white" : "text-blue-900")}>Resetar Portal</h3>
                          </div>
                          <button 
                            onClick={resetAllImages}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-xl transition-colors shadow-lg"
                          >
                            Resetar Tudo
                          </button>
                        </div>
                        <p className="text-xs text-slate-500">Apaga todas as edições de texto, imagens e vídeos, voltando ao estado original.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Nome do Portal</label>
                          <input 
                            type="text" 
                            value={siteConfig.siteName}
                            onChange={(e) => updateSiteConfig({ siteName: e.target.value })}
                            className={cn(
                              "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                              isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"
                            )}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Subtítulo</label>
                          <input 
                            type="text" 
                            value={siteConfig.siteSubtitle}
                            onChange={(e) => updateSiteConfig({ siteSubtitle: e.target.value })}
                            className={cn(
                              "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                              isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"
                            )}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">E-mail de Contato</label>
                          <input 
                            type="email" 
                            value={siteConfig.contactEmail}
                            onChange={(e) => updateSiteConfig({ contactEmail: e.target.value })}
                            className={cn(
                              "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                              isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"
                            )}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Chave PIX (Doações)</label>
                          <input 
                            type="text" 
                            value={siteConfig.pixKey}
                            onChange={(e) => updateSiteConfig({ pixKey: e.target.value })}
                            className={cn(
                              "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                              isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"
                            )}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Chave Mestra (Admin)</label>
                          <input 
                            type="text" 
                            value={siteConfig.masterKey}
                            onChange={(e) => updateSiteConfig({ masterKey: e.target.value })}
                            className={cn(
                              "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                              isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"
                            )}
                          />
                          <p className="text-[10px] text-slate-400 mt-1 italic">Esta chave é usada para acessar o modo de edição do portal.</p>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Canal do YouTube</label>
                          <input 
                            type="url" 
                            value={siteConfig.youtubeChannel}
                            onChange={(e) => updateSiteConfig({ youtubeChannel: e.target.value })}
                            className={cn(
                              "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                              isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"
                            )}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Link Tipa.ai</label>
                          <input 
                            type="url" 
                            value={siteConfig.tipaUrl}
                            onChange={(e) => updateSiteConfig({ tipaUrl: e.target.value })}
                            className={cn(
                              "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                              isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"
                            )}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Chave do Mestre (Senha Admin)</label>
                          <input 
                            type="text" 
                            value={siteConfig.masterKey}
                            onChange={(e) => updateSiteConfig({ masterKey: e.target.value })}
                            className={cn(
                              "w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                              isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200"
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Lock className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                  <p className={cn("mb-8", isDarkMode ? "text-slate-400" : "text-slate-600")}>
                    Para habilitar as funções de upload de arquivos e edição de imagens, você precisa entrar como Administrador.
                  </p>
                  <button 
                    onClick={() => { setIsAdminPanelOpen(false); setIsLoginModalOpen(true); }}
                    className="px-10 py-4 bg-blue-900 text-white font-bold rounded-2xl shadow-xl hover:scale-105 transition-transform"
                  >
                    Fazer Login de Mestre
                  </button>
                  <p className="mt-6 text-[10px] text-slate-400 uppercase tracking-widest">Acesso exclusivo para administradores do Vale</p>
                </div>
              )}

              <div className="mt-10 pt-8 border-t border-slate-100 flex justify-between items-center">
                <button 
                  onClick={toggleDev}
                  className={cn(
                    "px-6 py-2 rounded-xl text-xs font-bold transition-all",
                    isDev ? "bg-rose-100 text-rose-600 hover:bg-rose-200" : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                  )}
                >
                  {isDev ? "Sair do Modo Edição" : "Entrar no Modo Edição"}
                </button>
                <button 
                  onClick={() => setIsAdminPanelOpen(false)}
                  className="px-8 py-3 bg-blue-900 text-white rounded-xl text-sm font-bold shadow-lg"
                >
                  Fechar Painel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  } />
  <Route path="*" element={<Navigate to="/" />} />
</Routes>
  );
}
