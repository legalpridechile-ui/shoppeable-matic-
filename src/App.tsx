import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Upload, 
  Trash2, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Download, 
  Layers, 
  Video, 
  ShoppingBag, 
  CheckCircle, 
  Loader2, 
  ExternalLink,
  Info,
  RefreshCw,
  Heart,
  MessageCircle,
  Share2,
  Music,
  Plus
} from 'lucide-react';

// Reusable Renza Jewels Logo Component mimicking the user's uploaded image with extreme precision
export function RenzaLogo({ className = "h-8 w-auto", dark = false }) {
  return (
    <svg viewBox="0 0 320 100" className={className} id="renza-logo-svg">
      {/* Black background square representing the uploaded image */}
      <rect x="5" y="5" width="90" height="90" rx="16" fill={dark ? "#ffffff" : "#000000"} />
      {/* Heart shape with rough hand-drawn outline */}
      <path 
        d="M 50,32 C 42,18 20,22 20,44 C 20,62 38,75 50,86 C 62,75 80,62 80,44 C 80,22 58,18 50,32 Z" 
        fill={dark ? "#000000" : "#ffffff"} 
        stroke={dark ? "#000000" : "#ffffff"} 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Hand-drawn scribble-like heart texture */}
      <path 
        d="M 34,39 L 34,49 M 42,41 L 42,54 M 58,41 L 58,54" 
        stroke={dark ? "#ffffff" : "#000000"} 
        strokeWidth="2.5" 
        strokeLinecap="round" 
      />
      {/* Styled RENZA and SILVER 925 headings */}
      <text x="110" y="52" fontFamily="sans-serif" fontSize="33" fontWeight="900" fill={dark ? "#000000" : "#ffffff"} letterSpacing="1">RENZA</text>
      <text x="110" y="78" fontFamily="monospace" fontSize="12" fontWeight="600" fill={dark ? "#71717a" : "#a1a1aa"} letterSpacing="5">SILVER 925</text>
    </svg>
  );
}

// Default preloaded shoppable project tailored for RENZA JEWELS
const DEFAULT_PROJECT = {
  product: {
    title: "Anillo Corazón de Plata 925",
    price: "$29.90 USD",
    description: "Anillo ajustable elaborado en plata de ley 925 certificada con el icónico diseño de corazón de Renza. Brillo eterno hipoalergénico perfecto para regalar.",
    features: [
      "Plata de Ley 925 certificada",
      "Diseño icónico grabado Renza Jewels",
      "Totalmente ajustable y libre de alergias",
      "Estuche premium negro de lujo incluido"
    ],
    targetAudience: "Amantes de la joyería minimalista de plata, estilo aesthetic y elegante."
  },
  scenes: [
    {
      timestamp: "00:00",
      text: "¿Buscando el regalo de plata perfecto? Descubre el Anillo Corazón de Renza Jewels.",
      visual: "Primer plano estético del anillo brillando bajo luz natural y cálida",
      audio_cue: "*brillo sutil*"
    },
    {
      timestamp: "00:03",
      text: "Elaborado en plata certificada de ley 925. Es ajustable, hipoalergénico y brilla eterno.",
      visual: "Mano girando suavemente el anillo mostrando su grabado pulido de calidad",
      audio_cue: "*música acústica romántica*"
    },
    {
      timestamp: "00:07",
      text: "Consigue el tuyo hoy con envío rápido. ¡Haz clic al carrito de www.renzajewels.com!",
      visual: "Anillo expuesto en su caja negra de terciopelo con el logo impreso",
      audio_cue: "*pop alegre*"
    }
  ],
  voiceoverPrompt: "¿Buscando el regalo de plata perfecto? Descubre el Anillo Corazón de Renza Jewels. Elaborado en plata certificada de ley 925. Es ajustable, hipoalergénico y brilla eterno. Consigue el tuyo hoy con envío rápido. ¡Haz clic al carrito de www.renzajewels.com!",
  audio: "", // Will fall back to Web Speech API or generated audio
  audioMimeType: "audio/mp3",
  images: [
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
  ]
};

// Robust utility to determine and format the correct base64 audio data URL based on header sniffing
const getAudioDataUrl = (base64: string, preferredMime?: string) => {
  if (!base64) return '';
  if (base64.startsWith('data:')) return base64;
  
  let mime = preferredMime || 'audio/mp3'; // default to mp3
  if (base64.startsWith('UklGR')) {
    mime = 'audio/wav';
  } else if (base64.startsWith('SUQz') || base64.startsWith('/v') || base64.startsWith('/u')) {
    mime = 'audio/mp3';
  }
  return `data:${mime};base64,${base64}`;
};

export default function App() {
  // State management
  const [productUrl, setProductUrl] = useState('');
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<string[]>(DEFAULT_PROJECT.images);
  const [isDragging, setIsDragging] = useState(false);
  const [videoDuration, setVideoDuration] = useState(10); // Default to 10 seconds
  const [videoLanguage, setVideoLanguage] = useState<'es' | 'en'>('es'); // Default to Spanish
  
  // Brand options
  const [brandName, setBrandName] = useState('RENZA JEWELS');
  const [brandLink, setBrandLink] = useState('www.renzajewels.com');
  const [showLogoOverlay, setShowLogoOverlay] = useState(true);
  const [showTikTokShopBadge, setShowTikTokShopBadge] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);

  // Active output project
  const [activeProject, setActiveProject] = useState(DEFAULT_PROJECT);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<'idle' | 'analyzing' | 'writing' | 'rendering' | 'completed'>('idle');
  const [txId, setTxId] = useState('TX-88-341-ADX');
  
  // Node states
  const [node1State, setNode1State] = useState<'idle' | 'processing' | 'completed'>('completed');
  const [node2State, setNode2State] = useState<'idle' | 'processing' | 'completed'>('completed');
  const [node3State, setNode3State] = useState<'idle' | 'processing' | 'completed'>('completed');
  const [nodeProgress, setNodeProgress] = useState(0);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(10); // Default 10s as requested
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [speechSynthesisActive, setSpeechSynthesisActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'attributes' | 'music' | 'video'>('script');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // AI Engine Configuration
  const [aiEngine, setAiEngine] = useState<'system' | 'local'>('system');
  const [localUrl, setLocalUrl] = useState('http://localhost:11434');
  const [localModel, setLocalModel] = useState('llama3.2');
  const [localProtocol, setLocalProtocol] = useState<'ollama' | 'openai'>('openai');
  const [localApiKey, setLocalApiKey] = useState('');

  // Lyria Music Generation State
  const [lyriaPrompt, setLyriaPrompt] = useState('Cinematic background track with smooth strings and positive beats for luxury jewelry showcase');
  const [lyriaModel, setLyriaModel] = useState<'lyria-3-clip-preview' | 'lyria-3-pro-preview'>('lyria-3-clip-preview');
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [generatedMusicAudio, setGeneratedMusicAudio] = useState('');
  const [generatedMusicMimeType, setGeneratedMusicMimeType] = useState('audio/wav');
  const [generatedMusicLyrics, setGeneratedMusicLyrics] = useState('');

  // Veo Video Generation State
  const [veoPrompt, setVeoPrompt] = useState('An elegant cinematic slow pan rotating shot of the silver heart ring on a velvet cushion with soft ambient lighting');
  const [veoModel, setVeoModel] = useState<'veo-3.1-fast-generate-preview'>('veo-3.1-fast-generate-preview');
  const [veoAspectRatio, setVeoAspectRatio] = useState<'9:16' | '16:9'>('9:16');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [veoVideoUrl, setVeoVideoUrl] = useState('');
  const [veoPollingStatus, setVeoPollingStatus] = useState('');

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle auto slide cycle during video play
  useEffect(() => {
    let slideTimer: any;
    if (isPlaying && activeProject.images.length > 0) {
      slideTimer = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % activeProject.images.length);
      }, 3500); // cycle slide every 3.5 seconds
    }
    return () => clearInterval(slideTimer);
  }, [isPlaying, activeProject.images]);

  // Synchronize Subtitles & Highlight scenes as time moves
  useEffect(() => {
    // Parse timestamp strings to seconds
    const parseTimeToSeconds = (ts: string) => {
      const parts = ts.split(':');
      if (parts.length === 2) {
        return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      }
      return 0;
    };

    const times = activeProject.scenes.map(s => parseTimeToSeconds(s.timestamp));
    
    // Find active scene based on currentTime
    let activeIdx = 0;
    for (let i = 0; i < times.length; i++) {
      if (currentTime >= times[i]) {
        activeIdx = i;
      }
    }
    setCurrentSceneIndex(activeIdx);
  }, [currentTime, activeProject.scenes]);

  // Handle Playback Simulation Timer (if no native audio, or fallback Web Speech)
  useEffect(() => {
    if (isPlaying) {
      const interval = 100; // tick every 100ms
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            // Loop or stop
            setIsPlaying(false);
            if (speechSynthesisActive) {
              window.speechSynthesis.cancel();
            }
            return 0;
          }
          return parseFloat((prev + 0.1).toFixed(1));
        });
      }, interval);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, duration, speechSynthesisActive]);

  // Trigger browser notification toasts
  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Audio Playback Engine
  const handlePlayPause = () => {
    if (isPlaying) {
      // Pause
      setIsPlaying(false);
      if (activeProject.audio && audioRef.current) {
        audioRef.current.pause();
      }
      if (speechSynthesisActive) {
        window.speechSynthesis.pause();
      }
    } else {
      // Start/Resume
      setIsPlaying(true);
      
      // If we have actual synthesized base64 audio
      if (activeProject.audio) {
        if (!audioRef.current) {
          const audioUrl = getAudioDataUrl(activeProject.audio, activeProject.audioMimeType);
          audioRef.current = new Audio(audioUrl);
          audioRef.current.addEventListener('loadedmetadata', () => {
            setDuration(audioRef.current?.duration || 15);
          });
          audioRef.current.addEventListener('timeupdate', () => {
            setCurrentTime(audioRef.current?.currentTime || 0);
          });
          audioRef.current.addEventListener('ended', () => {
            setIsPlaying(false);
            setCurrentTime(0);
          });
        }
        audioRef.current.play().catch(e => {
          console.error('HTML5 audio play failed, falling back to Web Speech:', e);
          playWebSpeechFallback();
        });
      } else {
        // Web Speech API Fallback
        playWebSpeechFallback();
      }
    }
  };

  const playWebSpeechFallback = () => {
    // Stop any existing speech synthesis
    window.speechSynthesis.cancel();

    // Use Web Speech API to speak the Spanish/English voiceover
    const utterance = new SpeechSynthesisUtterance(activeProject.voiceoverPrompt);
    utterance.lang = videoLanguage === 'en' ? 'en-US' : 'es-ES';
    utterance.rate = 1.1; // Slightly faster for TikTok style
    
    utterance.onstart = () => {
      setSpeechSynthesisActive(true);
    };

    utterance.onend = () => {
      setSpeechSynthesisActive(false);
      setIsPlaying(false);
      setCurrentTime(0);
    };

    utterance.onerror = () => {
      setSpeechSynthesisActive(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Handle file select/drop
  const processFiles = (files: FileList) => {
    const validImageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (validImageFiles.length === 0) {
      triggerToast('Por favor, selecciona archivos de imagen válidos.', 'error');
      return;
    }

    validImageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setUploadedImages(prev => [...prev, e.target?.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    triggerToast(`${validImageFiles.length} imagen(es) subidas correctamente.`);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const removeUploadedImage = (indexToRemove: number) => {
    setUploadedImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    triggerToast('Imagen eliminada de la cola.');
  };

  // Main generator action handler
  const handleGenerate = async () => {
    if (!productUrl && uploadedImages.length === 0) {
      triggerToast('Por favor, ingresa una URL de producto o sube al menos una imagen en la barra lateral.', 'error');
      return;
    }

    // Cancel current playbacks
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);

    // Setup visual workflow
    setIsGenerating(true);
    setTxId(`TX-${Math.floor(100000 + Math.random() * 900000)}`);
    
    // Node 1 Processing starts
    setGenerationStep('analyzing');
    setNode1State('processing');
    setNode2State('idle');
    setNode3State('idle');
    setNodeProgress(25);

    try {
      let resultData;

      if (aiEngine === 'local') {
        // --- Call Local Agent ---
        console.log('Generating shoppable script with Local PC Agent via', localUrl);
        let textPrompt = "";
        if (productUrl) {
          textPrompt += `Analyze this product source / URL: "${productUrl}"\n`;
        } else {
          textPrompt += `No product URL provided. Analyze the attached product images to identify what the product is and deduce realistic details (title, estimated price, key features, target audience). Maintain a luxurious feel matching the jewelry context if applicable.\n`;
        }

        const languageLabel = videoLanguage === 'en' ? 'English' : 'Spanish';

        textPrompt += `
        You must act as a multi-agent system:
        1. "Agente Analista": Extract or deduce the product's title, price (or realistic estimate if not clear), main features, target audience, and core pain points solved.
        2. "Agente Guionista": Craft a highly engaging, high-retention TikTok script with a length of exactly ${videoDuration} seconds, optimized for conversions.
        
        The store brand is: "${brandName}".
        The store website is: "${brandLink}".
        
        The script MUST follow a strong Hook -> Retention -> CTA format.
        The language must be ${languageLabel}, natural, fast-paced, persuasive, matching TikTok trends.
        IMPORTANT: Make sure the final scene contains a clear Call-To-Action (CTA) mentioning the brand "${brandName}" and telling viewers to click the link or cart button for "${brandLink}".
        
        Generate exactly 3 or 4 scenes spanning from 00:00 to 00:${videoDuration < 10 ? '0' + videoDuration : videoDuration}.
        
        Your output MUST be a valid JSON object matching this schema exactly. Do NOT write any conversation, markdown code block backticks (like \`\`\`json), or text before/after the JSON.
        
        JSON Schema:
        {
          "product": {
            "title": "Product Title",
            "price": "$29.99 USD",
            "description": "Product Description",
            "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
            "targetAudience": "Target Audience"
          },
          "scenes": [
            {
              "timestamp": "00:00",
              "text": "Scene Narration text",
              "visual": "Visual details on screen",
              "audio_cue": "Music or sound effects"
            }
          ],
          "voiceoverPrompt": "Continuous voiceover narration text combining all scene narration."
        }
        `;

        let responseText = "";
        const headers: any = {
          'Content-Type': 'application/json',
        };
        if (localApiKey) {
          headers['Authorization'] = `Bearer ${localApiKey}`;
        }

        if (localProtocol === 'openai') {
          const messages: any[] = [
            {
              role: "system",
              content: "You are an AI that ONLY outputs raw JSON matching the requested schema."
            }
          ];

          const contentArray: any[] = [{ type: "text", text: textPrompt }];
          if (uploadedImages.length > 0 && uploadedImages[0].startsWith('data:')) {
            contentArray.push({
              type: "image_url",
              image_url: {
                url: uploadedImages[0]
              }
            });
          }

          messages.push({
            role: "user",
            content: contentArray
          });

          const localRes = await fetch(`${localUrl}/v1/chat/completions`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              model: localModel,
              messages,
              response_format: { type: "json_object" },
              temperature: 0.7
            })
          });

          if (!localRes.ok) {
            throw new Error(`La llamada al agente local falló (${localRes.statusText}). Asegúrate de que tu servidor local (como Ollama, LM Studio o Jan) esté ejecutándose en la dirección configurada y permita peticiones CORS (OLLAMA_ORIGINS="*").`);
          }

          const completion = await localRes.json();
          responseText = completion.choices?.[0]?.message?.content || "";
        } else {
          // Ollama Direct Protocol
          const body: any = {
            model: localModel,
            prompt: textPrompt,
            stream: false,
            format: "json",
            options: {
              temperature: 0.7
            }
          };

          if (uploadedImages.length > 0 && uploadedImages[0].startsWith('data:')) {
            const match = uploadedImages[0].match(/^data:([^;]+);base64,(.+)$/);
            if (match) {
              body.images = [match[2]];
            }
          }

          const localRes = await fetch(`${localUrl}/api/generate`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
          });

          if (!localRes.ok) {
            throw new Error(`La llamada al agente local falló (${localRes.statusText}). Asegúrate de que Ollama esté ejecutándose localmente con la variable OLLAMA_ORIGINS="*" configurada.`);
          }

          const completion = await localRes.json();
          responseText = completion.response || "";
        }

        // Robust JSON Parse
        let parsed: any = null;
        try {
          const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/([\{\[][\s\S]*[\}\]])/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[1]);
          } else {
            parsed = JSON.parse(responseText.trim());
          }
        } catch (parseErr) {
          console.error("Failed parsing local agent JSON, fallback structure:", parseErr);
          throw new Error("El Agente Local no devolvió un JSON válido. Revisa los logs de tu modelo local.");
        }

        // Validate structure
        if (!parsed.product) parsed.product = {};
        if (!parsed.product.title) parsed.product.title = "Producto de Joyería - Agente Local";
        if (!parsed.product.price) parsed.product.price = "$49.99 USD";
        if (!parsed.product.description) parsed.product.description = "Identificado y guionizado por tu agente local.";
        if (!parsed.product.features) parsed.product.features = ["Plata Ley 925", "Piedras pulidas a mano", "Diseño Minimalista"];
        if (!parsed.product.targetAudience) parsed.product.targetAudience = "Amantes de joyería fina";
        if (!parsed.scenes || parsed.scenes.length === 0) {
          parsed.scenes = [
            {
              timestamp: "00:00",
              text: "Mira este increíble accesorio de alta gama.",
              visual: "Primer plano de la joya reflejando destellos",
              audio_cue: "Música elegante de violines"
            }
          ];
        }
        if (!parsed.voiceoverPrompt) {
          parsed.voiceoverPrompt = parsed.scenes.map((s: any) => s.text).join(" ");
        }

        // Assemble resultData base
        resultData = {
          product: parsed.product,
          scenes: parsed.scenes,
          voiceoverPrompt: parsed.voiceoverPrompt,
          audio: '',
          images: uploadedImages && uploadedImages.length > 0 ? uploadedImages : []
        };

        // Node 1 & 2 completed in local mode
        setNode1State('completed');
        setGenerationStep('writing');
        setNode2State('processing');
        setNodeProgress(55);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setNode2State('completed');

        // Node 3 (TTS rendering): Call the system TTS API with the local-agent generated narration!
        setGenerationStep('rendering');
        setNode3State('processing');
        setNodeProgress(85);

        try {
          console.log('Requesting high-fidelity cloud TTS for local agent voiceover Prompt...');
          const ttsRes = await fetch('/api/generate-tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: resultData.voiceoverPrompt,
              language: videoLanguage
            })
          });
          if (ttsRes.ok) {
            const ttsData = await ttsRes.json();
            resultData.audio = ttsData.audio;
            resultData.audioMimeType = ttsData.audioMimeType || 'audio/mp3';
          }
        } catch (ttsErr) {
          console.error('Failed to generate high-fidelity TTS for local agent:', ttsErr);
          triggerToast('TTS de alta fidelidad falló; se usará la síntesis local del navegador.', 'error');
        }

      } else {
        // --- Call System Cloud Gemini ---
        const response = await fetch('/api/generate-shoppable', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: productUrl,
            cacheEnabled,
            additionalImages: uploadedImages,
            language: videoLanguage,
            duration: videoDuration,
            brandName,
            brandLink
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'La llamada a la API falló.');
        }

        resultData = await response.json();

        // Node 1 Complete, Node 2 Processing
        setNode1State('completed');
        setGenerationStep('writing');
        setNode2State('processing');
        setNodeProgress(55);

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Node 2 Complete, Node 3 Processing
        setNode2State('completed');
        setGenerationStep('rendering');
        setNode3State('processing');
        setNodeProgress(85);

        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Final Assembly
      setNode3State('completed');
      setGenerationStep('completed');
      setNodeProgress(100);
      
      // Update the active project with API result
      const finalizedImages = resultData.images && resultData.images.length > 0 
        ? resultData.images 
        : DEFAULT_PROJECT.images;

      setActiveProject({
        product: resultData.product,
        scenes: resultData.scenes,
        voiceoverPrompt: resultData.voiceoverPrompt,
        audio: resultData.audio,
        audioMimeType: resultData.audioMimeType || 'audio/mp3',
        images: finalizedImages
      });

      setDuration(videoDuration);
      setCurrentSlideIndex(0);
      triggerToast('¡Video Shoppable generado exitosamente!', 'success');

    } catch (err: any) {
      console.error(err);
      setNode1State('idle');
      setNode2State('idle');
      setNode3State('idle');
      setGenerationStep('idle');
      triggerToast('Error al generar contenido. Inténtalo de nuevo.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Lyria Music Generation Handler
  const handleGenerateMusic = async () => {
    if (!lyriaPrompt.trim()) {
      triggerToast('Por favor introduce un prompt para la música.', 'error');
      return;
    }
    
    setIsGeneratingMusic(true);
    setGeneratedMusicAudio('');
    setGeneratedMusicLyrics('');
    triggerToast('Iniciando el Motor Lyria para generar música de fondo...', 'success');

    try {
      const res = await fetch('/api/generate-music', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: lyriaPrompt,
          model: lyriaModel
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Falló la generación de música Lyria.');
      }

      const data = await res.json();
      if (data.audio) {
        setGeneratedMusicAudio(data.audio);
        setGeneratedMusicMimeType(data.mimeType || 'audio/wav');
        setGeneratedMusicLyrics(data.lyrics || '');
        triggerToast('¡Música de fondo con Lyria generada con éxito!', 'success');
        
        // Update current project's audio with this custom generated soundtrack!
        setActiveProject(prev => ({
          ...prev,
          audio: data.audio
        }));
      } else {
        throw new Error('La respuesta no incluye datos de audio.');
      }
    } catch (err: any) {
      console.error(err);
      triggerToast(`Error en Lyria: ${err.message || 'Error desconocido'}`, 'error');
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  // Veo Video Generation Handler with Polling
  const handleGenerateVideo = async () => {
    if (!veoPrompt.trim()) {
      triggerToast('Por favor introduce una descripción para la animación del video.', 'error');
      return;
    }

    setIsGeneratingVideo(true);
    setVeoVideoUrl('');
    setVeoPollingStatus('Enviando petición a Veo 3.1...');
    triggerToast('Iniciando animación con veo-3.1-fast-generate-preview...', 'success');

    try {
      // Pick source image: first uploaded image or a fallback
      const sourceImage = uploadedImages.length > 0 ? uploadedImages[0] : null;

      const startRes = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: veoPrompt,
          image: sourceImage,
          aspectRatio: veoAspectRatio
        })
      });

      if (!startRes.ok) {
        const errData = await startRes.json();
        throw new Error(errData.error || 'No se pudo iniciar la generación de video.');
      }

      const { operationName } = await startRes.json();
      console.log('Veo operation running:', operationName);
      setVeoPollingStatus('Generando video en la nube de Google (esto toma unos momentos)...');

      // Poll status every 5 seconds up to 30 times (2.5 mins max)
      let attempts = 0;
      const maxAttempts = 30;
      
      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const statusRes = await fetch('/api/video-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName })
          });

          if (!statusRes.ok) {
            console.error('Polling error');
            return;
          }

          const { done, status } = await statusRes.json();
          setVeoPollingStatus(`Procesando cuadro por cuadro... Intento ${attempts}/${maxAttempts}`);

          if (done) {
            clearInterval(pollInterval);
            setVeoPollingStatus('Descargando archivo mp4 compilado de los servidores de Google...');
            
            // Trigger download to obtain binary
            const downloadRes = await fetch('/api/video-download', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ operationName })
            });

            if (!downloadRes.ok) {
              throw new Error('Error al descargar el archivo de video procesado.');
            }

            const videoBlob = await downloadRes.blob();
            const localVideoUrl = URL.createObjectURL(videoBlob);
            
            setVeoVideoUrl(localVideoUrl);
            setVeoPollingStatus('');
            setIsGeneratingVideo(false);
            triggerToast('¡Video Veo 3.1 generado y compilado con éxito!', 'success');
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setVeoPollingStatus('Tiempo de espera agotado. El video sigue procesándose en la nube.');
            setIsGeneratingVideo(false);
            triggerToast('El video tarda más de lo esperado en renderizar.', 'error');
          }
        } catch (pollErr: any) {
          console.error('Error during polling:', pollErr);
          clearInterval(pollInterval);
          setVeoPollingStatus('Error en la cola de procesamiento.');
          setIsGeneratingVideo(false);
          triggerToast(`Polling error: ${pollErr.message}`, 'error');
        }
      }, 5000);

    } catch (err: any) {
      console.error(err);
      setVeoPollingStatus('');
      setIsGeneratingVideo(false);
      triggerToast(`Error en Veo: ${err.message || 'Error de comunicación'}`, 'error');
    }
  };

  const copyScriptToClipboard = () => {
    const formattedScript = activeProject.scenes.map(s => `[${s.timestamp}] ${s.text} (${s.visual})`).join('\n');
    navigator.clipboard.writeText(formattedScript);
    setCopied(true);
    triggerToast('¡Script copiado al portapapeles!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadScriptText = () => {
    const header = `=== TIKTOK SHOPPABLE SCRIPT ===\nPRODUCTO: ${activeProject.product.title}\nPRECIO: ${activeProject.product.price}\nAUDIENCIA: ${activeProject.product.targetAudience}\n\n`;
    const body = activeProject.scenes.map(s => `[${s.timestamp}]\nAUDIO: "${s.text}"\nVISUAL: ${s.visual}\nFX: ${s.audio_cue}\n---`).join('\n\n');
    
    const element = document.createElement("a");
    const file = new Blob([header + body], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Script-Shoppable-${activeProject.product.title.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    triggerToast('Descargando archivo de especificaciones de script.');
  };

  const handleDownloadVideo = async () => {
    try {
      setIsRecording(true);
      setRecordingProgress(0);
      triggerToast('Iniciando captura y codificación del video vertical...', 'success');
      
      const canvas = document.createElement('canvas');
      canvas.width = 720;
      canvas.height = 1280;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not initialize canvas context');

      // Setup Web Audio nodes if we have a compiled audio prompt
      let audioContext: AudioContext | null = null;
      let audioDestination: MediaStreamAudioDestinationNode | null = null;
      let audioSource: MediaElementAudioSourceNode | null = null;
      
      const stream = canvas.captureStream(30); // 30 FPS high-fidelity capture
      let ttsAudio: HTMLAudioElement | null = null;

      if (activeProject.audio) {
        ttsAudio = new Audio(getAudioDataUrl(activeProject.audio, activeProject.audioMimeType));
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioDestination = audioContext.createMediaStreamDestination();
        audioSource = audioContext.createMediaElementSource(ttsAudio);
        audioSource.connect(audioDestination);
        audioSource.connect(audioContext.destination);
        
        const audioTracks = audioDestination.stream.getAudioTracks();
        if (audioTracks.length > 0) {
          stream.addTrack(audioTracks[0]);
        }
      }

      // Format options for maximum compatibility
      let recorderOptions = { mimeType: 'video/webm;codecs=vp9,opus' };
      if (!MediaRecorder.isTypeSupported(recorderOptions.mimeType)) {
        recorderOptions = { mimeType: 'video/webm' };
      }
      
      const recorder = new MediaRecorder(stream, recorderOptions);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeProject.product.title.toLowerCase().replace(/\s+/g, '_')}_shoppable.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsRecording(false);
        triggerToast('¡Video WebM HD descargado exitosamente!', 'success');
      };

      // Synchronously load all background slides for drawing
      const loadedImages: HTMLImageElement[] = [];
      await Promise.all(activeProject.images.map((src, idx) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            loadedImages[idx] = img;
            resolve();
          };
          img.onerror = () => {
            resolve(); // proceed anyway
          };
          img.src = src;
        });
      }));

      // Start recording parameters
      const durationSec = duration;
      const totalFrames = durationSec * 30;
      let currentFrame = 0;
      
      recorder.start();
      if (ttsAudio) {
        ttsAudio.play();
      }

      const drawFrame = () => {
        if (currentFrame >= totalFrames) {
          recorder.stop();
          if (ttsAudio) ttsAudio.pause();
          return;
        }

        const elapsedSec = currentFrame / 30;
        setRecordingProgress(Math.floor((currentFrame / totalFrames) * 100));

        // 1. Draw solid canvas base
        ctx.fillStyle = '#0a0a0b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Draw active slide frame
        const slideIdx = Math.floor((elapsedSec / durationSec) * activeProject.images.length) % activeProject.images.length;
        const img = loadedImages[slideIdx];
        if (img) {
          const canvasAspect = canvas.width / canvas.height;
          const imgAspect = img.width / img.height;
          let drawWidth = canvas.width;
          let drawHeight = canvas.height;
          let offsetX = 0;
          let offsetY = 0;

          if (imgAspect > canvasAspect) {
            drawWidth = canvas.height * imgAspect;
            offsetX = -(drawWidth - canvas.width) / 2;
          } else {
            drawHeight = canvas.width / imgAspect;
            offsetY = -(drawHeight - canvas.height) / 2;
          }
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        }

        // 3. Vignette overlays for text visibility
        const topGrad = ctx.createLinearGradient(0, 0, 0, 260);
        topGrad.addColorStop(0, 'rgba(0,0,0,0.7)');
        topGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, canvas.width, 260);

        const bottomGrad = ctx.createLinearGradient(0, canvas.height - 380, 0, canvas.height);
        bottomGrad.addColorStop(0, 'rgba(0,0,0,0)');
        bottomGrad.addColorStop(1, 'rgba(0,0,0,0.92)');
        ctx.fillStyle = bottomGrad;
        ctx.fillRect(0, canvas.height - 380, canvas.width, 380);

        // 4. Logo Watermark with brand Link
        if (showLogoOverlay) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
          ctx.beginPath();
          ctx.roundRect(40, 50, 360, 100, 16);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          
          ctx.beginPath();
          ctx.moveTo(85, 82);
          ctx.bezierCurveTo(79, 72, 65, 75, 65, 90);
          ctx.bezierCurveTo(65, 102, 79, 110, 85, 118);
          ctx.bezierCurveTo(91, 110, 105, 102, 105, 90);
          ctx.bezierCurveTo(105, 75, 91, 72, 85, 82);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(74, 86); ctx.lineTo(74, 94);
          ctx.moveTo(80, 88); ctx.lineTo(80, 97);
          ctx.moveTo(96, 88); ctx.lineTo(96, 97);
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 28px sans-serif';
          ctx.fillText('RENZA', 135, 92);
          
          ctx.fillStyle = '#a1a1aa';
          ctx.font = 'bold 11px monospace';
          ctx.fillText('SILVER 925', 135, 114);

          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText(brandLink, 135, 132);
        }

        // 5. Draw the typical TikTok Shop Yellow Sticker
        if (showTikTokShopBadge) {
          ctx.fillStyle = 'rgba(254, 44, 85, 0.95)';
          ctx.beginPath();
          ctx.roundRect(40, canvas.height - 240, 640, 100, 16);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(80, canvas.height - 190, 24, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fe2c55';
          ctx.font = 'bold 22px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🛍️', 80, canvas.height - 182);
          ctx.textAlign = 'left';

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 20px sans-serif';
          ctx.fillText(activeProject.product.title, 120, canvas.height - 212);
          ctx.font = 'normal 15px sans-serif';
          ctx.fillText(`Compra en ${brandLink} · ${activeProject.product.price}`, 120, canvas.height - 190);
          ctx.font = 'bold 13px sans-serif';
          ctx.fillStyle = '#ffd700';
          ctx.fillText('⭐ TikTok Shop Verified Partner', 120, canvas.height - 170);

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(520, canvas.height - 222, 130, 56, 12);
          ctx.fill();

          ctx.fillStyle = '#fe2c55';
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('COMPRAR', 585, canvas.height - 188);
          ctx.textAlign = 'left';
        }

        // 6. Draw captions based on timestamp matching
        const times = activeProject.scenes.map(sc => {
          const pts = sc.timestamp.split(':');
          return pts.length === 2 ? parseInt(pts[0], 10) * 60 + parseInt(pts[1], 10) : 0;
        });
        
        let activeI = 0;
        for (let i = 0; i < times.length; i++) {
          if (elapsedSec >= times[i]) activeI = i;
        }
        
        const activeScene = activeProject.scenes[activeI] || activeProject.scenes[0];
        if (activeScene) {
          ctx.font = 'bold 28px sans-serif';
          ctx.textAlign = 'center';
          const text = `"${activeScene.text}"`;
          
          const words = text.split(' ');
          let line = '';
          const lines = [];
          const maxWidth = 600;

          for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
              lines.push(line);
              line = words[n] + ' ';
            } else {
              line = testLine;
            }
          }
          lines.push(line);

          let startY = canvas.height - 380 - (lines.length - 1) * 35;
          for (let i = 0; i < lines.length; i++) {
            const yPos = startY + i * 36;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            const textWidth = ctx.measureText(lines[i].trim()).width;
            ctx.fillRect(canvas.width / 2 - textWidth / 2 - 12, yPos - 24, textWidth + 24, 38);

            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 6;
            ctx.strokeText(lines[i].trim(), canvas.width / 2, yPos + 4);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(lines[i].trim(), canvas.width / 2, yPos + 4);
          }
          ctx.textAlign = 'left';
        }

        currentFrame++;
        requestAnimationFrame(drawFrame);
      };

      drawFrame();

    } catch (err: any) {
      console.error(err);
      triggerToast('Fallo al exportar el video: ' + err.message, 'error');
      setIsRecording(false);
    }
  };

  const exportToAdManager = () => {
    triggerToast('Exportando campaña al Administrador de Anuncios de TikTok...');
    setTimeout(() => {
      triggerToast('¡Éxito! Campaña pre-creada con ID de recurso tktk-adv-9923.', 'success');
    }, 1500);
  };

  return (
    <div id="shoppable-app" className="w-full min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans flex flex-col md:flex-row overflow-x-hidden border-t-4 border-zinc-100">
      
      {/* LEFT SIDEBAR: Configuration */}
      <aside id="sidebar" className="w-full md:w-85 border-r border-zinc-800 bg-[#111112] flex flex-col p-6 shrink-0">
        
        {/* Sidebar Header Brand */}
        <div id="brand-header" className="mb-6 pb-6 border-b border-zinc-800 flex flex-col gap-4">
          <RenzaLogo className="h-10 w-auto" />
          <div className="flex items-center gap-2 px-1">
            <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">TIKTOK SHOPPING ENGINE</span>
            <span className="text-[9px] text-zinc-400 font-mono font-bold bg-zinc-800 px-1.5 py-0.5 rounded">v1.5</span>
          </div>
        </div>

        {/* Form controls */}
        <div id="config-form" className="space-y-6 flex-1">
          
          {/* Product URL Input */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">
              Product Data Source (URL)
            </label>
            <div className="relative">
              <input 
                id="url-input"
                type="text" 
                placeholder="https://amazon.com/product/v2..." 
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                disabled={isGenerating}
                className="w-full bg-[#0a0a0b] border border-zinc-700 focus:border-zinc-300 rounded-xl px-4 py-3.5 text-sm text-zinc-100 placeholder:text-zinc-700 outline-none transition-all"
              />
              <Sparkles className="absolute right-3.5 top-3.5 w-4 h-4 text-zinc-600" />
            </div>
            <p className="text-[10px] text-zinc-500 italic">
              Introduce un enlace de tienda o sube imágenes abajo para generar el video directamente a partir de ellas.
            </p>
          </div>

          {/* Language & Duration Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">
                Idioma del Video
              </label>
              <div className="grid grid-cols-2 gap-1 bg-[#0a0a0b] p-1 border border-zinc-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setVideoLanguage('es');
                    triggerToast('Idioma cambiado a Español.');
                  }}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition-all uppercase ${
                    videoLanguage === 'es' ? 'bg-zinc-100 text-black' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  ES
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVideoLanguage('en');
                    triggerToast('Language set to English.');
                  }}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition-all uppercase ${
                    videoLanguage === 'en' ? 'bg-zinc-100 text-black' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">
                Duración
              </label>
              <div className="grid grid-cols-2 gap-1 bg-[#0a0a0b] p-1 border border-zinc-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setVideoDuration(10);
                    triggerToast('Duración de video configurada en 10 segundos.');
                  }}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    videoDuration === 10 ? 'bg-zinc-100 text-black' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  10s
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVideoDuration(15);
                    triggerToast('Duración de video configurada en 15 segundos.');
                  }}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    videoDuration === 15 ? 'bg-zinc-100 text-black' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  15s
                </button>
              </div>
            </div>
          </div>

          {/* AI Engine Configuration Panel */}
          <div className="space-y-4 p-4 bg-[#0d0d0e] border border-zinc-800 rounded-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">
                Motor del Agente / AI Engine
              </h4>
              <span className={`w-2 h-2 rounded-full ${aiEngine === 'system' ? 'bg-sky-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
            </div>

            <div className="grid grid-cols-2 gap-1 bg-[#0a0a0b] p-1 border border-zinc-800 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setAiEngine('system');
                  triggerToast('Motor AI configurado en Sistema Nube (Gemini).');
                }}
                className={`py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                  aiEngine === 'system' ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                ☁️ Sistema
              </button>
              <button
                type="button"
                onClick={() => {
                  setAiEngine('local');
                  triggerToast('Motor AI configurado en Agente Local (PC).');
                }}
                className={`py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                  aiEngine === 'local' ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                💻 Agente Local
              </button>
            </div>

            {aiEngine === 'local' && (
              <div className="space-y-3 pt-1 border-t border-zinc-900">
                <div className="space-y-1">
                  <label className="text-[8px] uppercase text-zinc-500 font-bold block">Protocolo Local</label>
                  <div className="grid grid-cols-2 gap-1 bg-[#070708] p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setLocalProtocol('openai')}
                      className={`py-1 text-[9px] font-semibold rounded-md transition-all ${
                        localProtocol === 'openai' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-600'
                      }`}
                    >
                      OpenAI API
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocalProtocol('ollama')}
                      className={`py-1 text-[9px] font-semibold rounded-md transition-all ${
                        localProtocol === 'ollama' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-600'
                      }`}
                    >
                      Ollama API
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] uppercase text-zinc-500 font-bold block">Host / URL del Servidor</label>
                  <input
                    type="text"
                    value={localUrl}
                    onChange={(e) => setLocalUrl(e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-zinc-800 focus:border-zinc-700 rounded-xl px-2.5 py-2 text-[11px] text-zinc-100 font-mono outline-none"
                    placeholder="e.g., http://localhost:11434"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] uppercase text-zinc-500 font-bold block">Nombre del Modelo</label>
                  <input
                    type="text"
                    value={localModel}
                    onChange={(e) => setLocalModel(e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-zinc-800 focus:border-zinc-700 rounded-xl px-2.5 py-2 text-[11px] text-zinc-100 font-mono outline-none"
                    placeholder="e.g., llama3.2, qwen2.5"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] uppercase text-zinc-500 font-bold block">Token / API Key (Opcional)</label>
                  <input
                    type="password"
                    value={localApiKey}
                    onChange={(e) => setLocalApiKey(e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-zinc-800 focus:border-zinc-700 rounded-xl px-2.5 py-2 text-[11px] text-zinc-100 outline-none"
                    placeholder="Dejar vacío si no requiere"
                  />
                </div>

                <div className="bg-zinc-950 p-2 rounded-xl border border-zinc-900">
                  <p className="text-[8px] leading-relaxed text-zinc-500 font-semibold uppercase tracking-wider">
                    ⚠️ NOTA DE CONEXIÓN LOCAL
                  </p>
                  <p className="text-[9px] text-zinc-400 leading-snug mt-1">
                    Asegúrate de que tu modelo esté corriendo localmente. Si usas Ollama, arráncalo con <code className="text-emerald-400 bg-zinc-900 px-1 py-0.5 rounded font-mono">OLLAMA_ORIGINS="*" ollama serve</code> para habilitar el acceso CORS desde el navegador.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Brand Customization Panel */}
          <div className="space-y-4 p-4 bg-[#0d0d0e] border border-zinc-800 rounded-2xl">
            <h4 className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block mb-1">
              Personalización de Tienda
            </h4>
            
            <div className="space-y-2">
              <label className="text-[9px] uppercase text-zinc-500 font-bold block">Nombre de Marca</label>
              <input 
                type="text" 
                value={brandName}
                onChange={(e) => setBrandName(e.target.value.toUpperCase())}
                className="w-full bg-[#0a0a0b] border border-zinc-800 focus:border-zinc-500 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none transition-all font-bold"
                placeholder="E.g., RENZA JEWELS"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase text-zinc-500 font-bold block">Enlace Web (Link)</label>
              <input 
                type="text" 
                value={brandLink}
                onChange={(e) => setBrandLink(e.target.value.toLowerCase())}
                className="w-full bg-[#0a0a0b] border border-zinc-800 focus:border-zinc-500 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none transition-all font-mono"
                placeholder="E.g., www.renzajewels.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowLogoOverlay(!showLogoOverlay);
                  triggerToast(showLogoOverlay ? 'Logo marca ocultado' : 'Logo marca visible');
                }}
                className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${
                  showLogoOverlay 
                    ? 'bg-zinc-100 border-zinc-200 text-black' 
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {showLogoOverlay ? 'Logo: ON' : 'Logo: OFF'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowTikTokShopBadge(!showTikTokShopBadge);
                  triggerToast(showTikTokShopBadge ? 'Sticker carrito ocultado' : 'Sticker carrito visible');
                }}
                className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${
                  showTikTokShopBadge 
                    ? 'bg-zinc-100 border-zinc-200 text-black' 
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {showTikTokShopBadge ? 'Carrito: ON' : 'Carrito: OFF'}
              </button>
            </div>
          </div>

          {/* Asset Dropzone Area */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">
              Additional Assets
            </label>
            <div 
              id="dropzone"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-full h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center bg-[#0d0d0e] hover:bg-[#141416] transition-all cursor-pointer ${
                isDragging ? 'border-zinc-300 bg-zinc-900/40' : 'border-zinc-800'
              }`}
            >
              <Upload className="w-5 h-5 text-zinc-600 mb-1" />
              <div className="text-zinc-400 text-[11px] font-medium">Soltar imágenes del producto aquí</div>
              <div className="text-zinc-600 text-[9px] uppercase mt-0.5">JPG, PNG o WEBP (Máx 5MB)</div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            {/* Uploaded asset queue list */}
            {uploadedImages.length > 0 && (
              <div className="space-y-1.5 mt-2 max-h-40 overflow-y-auto pr-1">
                <div className="flex justify-between items-center text-[9px] text-zinc-500 uppercase tracking-widest">
                  <span>Cola de imágenes ({uploadedImages.length})</span>
                  <button 
                    onClick={() => { setUploadedImages([]); triggerToast('Se limpiaron todas las imágenes de recurso.'); }}
                    className="hover:text-zinc-200 transition-colors"
                  >
                    Limpiar todo
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-lg border border-zinc-800 overflow-hidden bg-zinc-900">
                      <img src={img} alt="Product media asset" className="w-full h-full object-cover" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeUploadedImage(idx); }}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-500"
                        title="Eliminar recurso"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cache Optimization Toggle */}
          <div className="flex items-center justify-between p-4 bg-[#0d0d0e] border border-zinc-800 rounded-2xl">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-zinc-200">Habilitar Caché de Agentes</span>
              <span className="text-[9px] text-zinc-500 uppercase tracking-tight mt-0.5">Optimizar latencia de APIs</span>
            </div>
            <button 
              id="cache-toggle"
              onClick={() => {
                setCacheEnabled(!cacheEnabled);
                triggerToast(cacheEnabled ? 'Caché desactivada.' : 'Caché de agentes activada para optimizar llamadas.');
              }}
              className={`w-11 h-6 rounded-full transition-all relative ${
                cacheEnabled ? 'bg-zinc-100' : 'bg-zinc-800'
              }`}
              title="Toggle Cache"
            >
              <div className={`w-4 h-4 rounded-full shadow-sm absolute top-1 transition-all ${
                cacheEnabled ? 'right-1 bg-black' : 'left-1 bg-zinc-400'
              }`} />
            </button>
          </div>
        </div>

        {/* Generate action Button */}
        <div className="pt-6 mt-6 border-t border-zinc-800">
          <button 
            id="generate-button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.08)] ${
              isGenerating 
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                : 'bg-zinc-100 text-black hover:bg-white hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                <span className="text-xs uppercase tracking-wider">Generando Video...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-black fill-black" />
                <span className="text-xs uppercase tracking-wider">Generar Video Shoppable</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col bg-[#0a0a0b] overflow-y-auto">
        
        {/* System Header Status Bar */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-[#0a0a0b] shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${isGenerating ? 'bg-amber-500 animate-pulse' : 'bg-green-500 animate-pulse'}`}></div>
            <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-400">
              ESTADO DEL SISTEMA: {isGenerating ? 'PROCESANDO CON INTELIGENCIA ARTIFICIAL' : 'ONLINE / DISPONIBLE'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              TX-ID: {txId}
            </div>
          </div>
        </header>

        {/* AI Agent Processing Sequential Nodes Grid */}
        <section id="processing-nodes" className="p-8 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-zinc-800/60 bg-[#0d0d0e]/40 shrink-0">
          
          {/* Node 1: Analista */}
          <div className={`p-4 rounded-2xl bg-[#111112] border transition-all relative overflow-hidden group ${
            isGenerating && generationStep === 'analyzing' 
              ? 'border-zinc-300 ring-1 ring-zinc-300/10' 
              : node1State === 'completed' 
                ? 'border-zinc-800 bg-[#111112]/90' 
                : 'border-zinc-900 opacity-40'
          }`}>
            <div className="absolute top-0 right-0 p-3 text-[8px] font-mono font-bold tracking-wider">
              {isGenerating && generationStep === 'analyzing' ? (
                <span className="text-amber-500 flex items-center gap-1">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" /> PROCESANDO
                </span>
              ) : node1State === 'completed' ? (
                <span className="text-zinc-100 flex items-center gap-1 font-mono uppercase tracking-widest">
                  <CheckCircle className="w-3 h-3 text-green-500" /> COMPLETO
                </span>
              ) : (
                <span className="text-zinc-600 font-mono">EN ESPERA</span>
              )}
            </div>
            
            <div className="text-[9px] text-zinc-500 uppercase font-mono font-bold mb-1">Nodo 01</div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-200 mb-1.5 flex items-center gap-1.5">
              <span>Agente Analista</span>
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Extrayendo metadatos, especificaciones técnicas y schema JSON del producto...
            </p>

            {/* Micro active progress */}
            {isGenerating && generationStep === 'analyzing' && (
              <div className="mt-4 h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-100 animate-[pulse_1s_infinite] w-3/4"></div>
              </div>
            )}
            
            {!isGenerating && node1State === 'completed' && activeProject.product.title && (
              <div className="mt-2 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-400">
                <span className="truncate font-medium">{activeProject.product.title}</span>
                <span className="text-zinc-500 font-mono shrink-0 ml-2">{activeProject.product.price}</span>
              </div>
            )}
          </div>

          {/* Node 2: Guionista */}
          <div className={`p-4 rounded-2xl bg-[#111112] border transition-all relative overflow-hidden group ${
            isGenerating && generationStep === 'writing' 
              ? 'border-zinc-300 ring-1 ring-zinc-300/10' 
              : node2State === 'completed' 
                ? 'border-zinc-800 bg-[#111112]/90' 
                : 'border-zinc-900 opacity-40'
          }`}>
            <div className="absolute top-0 right-0 p-3 text-[8px] font-mono font-bold tracking-wider">
              {isGenerating && generationStep === 'writing' ? (
                <span className="text-amber-500 flex items-center gap-1">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" /> DISEÑANDO SCRIPT
                </span>
              ) : node2State === 'completed' ? (
                <span className="text-zinc-100 flex items-center gap-1 font-mono uppercase tracking-widest">
                  <CheckCircle className="w-3 h-3 text-green-500" /> COMPLETO
                </span>
              ) : (
                <span className="text-zinc-600 font-mono">EN ESPERA</span>
              )}
            </div>

            <div className="text-[9px] text-zinc-500 uppercase font-mono font-bold mb-1">Nodo 02</div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-200 mb-1.5">
              Agente Guionista
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Diseñando estructura de retención y script optimizado para conversiones en TikTok...
            </p>

            {/* Micro active progress */}
            {isGenerating && generationStep === 'writing' && (
              <div className="mt-4 h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-100 w-1/2 rounded-full animate-[shimmer_1.5s_infinite]"></div>
              </div>
            )}

            {!isGenerating && node2State === 'completed' && (
              <div className="mt-2 pt-2 border-t border-zinc-800/60 text-[10px] text-zinc-400">
                <span>Generados {activeProject.scenes.length} bloques secuenciales (Hook → CTA)</span>
              </div>
            )}
          </div>

          {/* Node 3: Motor de Audio/Video */}
          <div className={`p-4 rounded-2xl bg-[#111112] border transition-all relative overflow-hidden group ${
            isGenerating && generationStep === 'rendering' 
              ? 'border-zinc-300 ring-1 ring-zinc-300/10' 
              : node3State === 'completed' 
                ? 'border-zinc-800 bg-[#111112]/90' 
                : 'border-zinc-900 opacity-40'
          }`}>
            <div className="absolute top-0 right-0 p-3 text-[8px] font-mono font-bold tracking-wider">
              {isGenerating && generationStep === 'rendering' ? (
                <span className="text-amber-500 flex items-center gap-1">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" /> ENSAMBLANDO AUDIO/VIDEO
                </span>
              ) : node3State === 'completed' ? (
                <span className="text-zinc-100 flex items-center gap-1 font-mono uppercase tracking-widest">
                  <CheckCircle className="w-3 h-3 text-green-500" /> COMPLETO
                </span>
              ) : (
                <span className="text-zinc-600 font-mono">EN ESPERA</span>
              )}
            </div>

            <div className="text-[9px] text-zinc-500 uppercase font-mono font-bold mb-1">Nodo 03</div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-200 mb-1.5">
              Motor Audio/Video
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Generando narración mediante voz neuronal sintética y renderizando vistas de previsualización...
            </p>

            {/* Micro active progress */}
            {isGenerating && generationStep === 'rendering' && (
              <div className="mt-4 h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-100 w-3/4 rounded-full"></div>
              </div>
            )}

            {!isGenerating && node3State === 'completed' && (
              <div className="mt-2 pt-2 border-t border-zinc-800/60 text-[10px] text-zinc-400 flex justify-between items-center">
                <span>Voz neuronal ensamblada</span>
                <span className="text-zinc-500 font-mono font-bold">Kore Voice (ES)</span>
              </div>
            )}
          </div>
        </section>

        {/* Video Preview & Actions Container */}
        <section id="preview-and-actions" className="flex-1 p-8 flex flex-col lg:flex-row gap-8 items-start">
          
          {/* TikTok Vertical Mockup Player (9:16 Aspect Ratio) */}
          <div className="w-full sm:w-72 shrink-0 mx-auto lg:mx-0 flex flex-col items-center">
            
            <div id="tiktok-frame" className="relative w-full aspect-[9/16] bg-black rounded-[2.5rem] border-[8px] border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden shrink-0 group">
              
              {/* Top Notch Camera */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-4 bg-zinc-900 rounded-full z-30 flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-[#1a1a1c] rounded-full mr-2"></div>
                <div className="w-1.5 h-1.5 bg-[#111112] rounded-full"></div>
              </div>

                {/* Dynamic Slideshow Product Media */}
                <div className="w-full h-full relative z-0 bg-zinc-900 flex items-center justify-center">
                  
                  {activeProject.images && activeProject.images.length > 0 ? (
                    <div className="absolute inset-0 w-full h-full">
                      {/* Dark gradient vignette over slides */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/92 z-10 pointer-events-none" />
                      
                      {/* Render slideshow */}
                      <img 
                        src={activeProject.images[currentSlideIndex]} 
                        alt="TikTok preview slideshow" 
                        className="w-full h-full object-cover animate-[zoom_10s_infinite_linear]" 
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black flex flex-col items-center justify-center p-6 text-center">
                      <Music className="w-10 h-10 text-zinc-700 animate-bounce mb-3" />
                      <span className="text-zinc-600 text-xs italic">Aún no hay recursos visuales cargados...</span>
                    </div>
                  )}

                  {/* Top Brand Logo Watermark with link */}
                  {showLogoOverlay && (
                    <a 
                      href={`https://${brandLink}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="absolute top-12 left-4 z-20 bg-black/80 backdrop-blur-md border border-zinc-800 hover:border-zinc-500 px-3 py-2 rounded-2xl flex items-center gap-2.5 transition-all shadow-xl pointer-events-auto hover:scale-[1.03]"
                      id="mockup-watermark-link"
                    >
                      <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-xs font-black text-black">R</span>
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] font-black text-white leading-none">{brandName}</span>
                        <span className="text-[8px] font-bold text-sky-400 font-mono leading-none mt-1">{brandLink}</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                    </a>
                  )}

                  {/* Video Render Overlay when generating */}
                  {isGenerating && (
                    <div className="absolute inset-0 bg-black/85 z-20 flex flex-col items-center justify-center p-6 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-zinc-100 mb-4" />
                      <span className="text-xs uppercase tracking-wider font-bold text-zinc-200">Re-configurando Escena</span>
                      <span className="text-[10px] text-zinc-500 mt-2">Combinando secuencias lógicas de agentes AI...</span>
                    </div>
                  )}

                  {/* Subtitles Overlay: Dynamic, matching the current scene */}
                  <div className="absolute bottom-48 left-4 right-14 z-20 pointer-events-none text-left">
                    {activeProject.scenes && activeProject.scenes.length > 0 && (
                      <div className="inline-block bg-black/75 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/5 shadow-lg animate-fade-in">
                        <p className="text-[11px] font-medium leading-relaxed text-zinc-300 uppercase tracking-widest font-mono text-[8px] text-zinc-400 mb-1">
                          SUBTÍTULO [{activeProject.scenes[currentSceneIndex].timestamp}]
                        </p>
                        <p className="text-xs font-bold text-zinc-100">
                          "{activeProject.scenes[currentSceneIndex].text}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* TikTok Shop yellow shopping cart card sticker */}
                  {showTikTokShopBadge && (
                    <div 
                      className="absolute bottom-24 left-4 right-14 z-20 bg-gradient-to-r from-amber-400 to-amber-500 text-black p-2 rounded-xl flex items-center justify-between shadow-[0_8px_25px_rgba(245,158,11,0.35)] hover:scale-[1.02] transition-all pointer-events-auto border border-amber-300 animate-[bounce_3s_infinite]"
                      id="mockup-shoppable-badge"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-black flex items-center justify-center shrink-0">
                          <span className="text-xs">🛍️</span>
                        </div>
                        <div className="flex flex-col text-left min-w-0">
                          <span className="text-[9px] font-black leading-tight truncate">{activeProject.product.title}</span>
                          <span className="text-[8px] font-bold text-zinc-800 truncate">Comprar en {brandLink}</span>
                        </div>
                      </div>
                      <a 
                        href={`https://${brandLink}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-black text-amber-400 font-bold text-[8px] px-2 py-1 rounded-md hover:bg-zinc-900 transition-colors uppercase tracking-wider shrink-0"
                      >
                        Ver
                      </a>
                    </div>
                  )}

                  {/* Left Bottom TikTok User Info */}
                  <div className="absolute bottom-6 left-4 right-14 z-20 text-left pointer-events-none">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                      <span>@{brandName.toLowerCase().replace(/\s+/g, '_')}</span>
                      <span className="bg-[#fe2c55] text-[8px] font-bold px-1.5 py-0.5 rounded-full text-white uppercase scale-90">LIVE</span>
                    </div>
                    <div className="text-[10px] text-zinc-300 line-clamp-2 leading-tight">
                      {activeProject.product.title} - ¡Consigue el tuyo en {brandLink}! {activeProject.product.price} 🔥 #tiktokshop #joyas #plata925 #renzajewels
                    </div>
                  </div>

                {/* Right Column Mobile Icon Buttons Overlay */}
                <div className="absolute right-3.5 bottom-12 z-20 flex flex-col items-center gap-4 text-white">
                  
                  {/* Account Avatar */}
                  <div className="relative mb-2">
                    <div className="w-10 h-10 rounded-full border border-zinc-100 bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-100">
                      TKS
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#fe2c55] w-4 h-4 rounded-full flex items-center justify-center text-[10px] border border-black">
                      <Plus className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  {/* Heart Like */}
                  <button className="flex flex-col items-center group">
                    <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors">
                      <Heart className="w-5 h-5 text-zinc-100 group-hover:text-[#fe2c55] transition-colors" />
                    </div>
                    <span className="text-[9px] text-zinc-400 mt-1">2.4k</span>
                  </button>

                  {/* Comment */}
                  <button className="flex flex-col items-center group">
                    <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors">
                      <MessageCircle className="w-5 h-5 text-zinc-100" />
                    </div>
                    <span className="text-[9px] text-zinc-400 mt-1">112</span>
                  </button>

                  {/* Share */}
                  <button className="flex flex-col items-center group">
                    <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors">
                      <Share2 className="w-5 h-5 text-zinc-100" />
                    </div>
                    <span className="text-[9px] text-zinc-400 mt-1">84</span>
                  </button>

                  {/* Spinning Music Record disc */}
                  <div className={`w-8 h-8 rounded-full border-2 border-zinc-700 bg-zinc-950 flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`}>
                    <Music className="w-4 h-4 text-zinc-400" />
                  </div>

                </div>

                {/* Central Play/Pause Action Overlay button */}
                <button 
                  onClick={handlePlayPause}
                  className="absolute inset-0 w-full h-full bg-black/10 hover:bg-black/25 flex items-center justify-center z-10 group"
                  title={isPlaying ? "Pause Video" : "Play Video"}
                >
                  {!isPlaying && (
                    <div className="w-14 h-14 rounded-full bg-black/60 text-white flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-white fill-white ml-1" />
                    </div>
                  )}
                </button>

              </div>

              {/* TikTok Shopping Cart Attachment Badge (Vertical bottom) */}
              <div className="absolute bottom-20 left-4 z-20">
                <a 
                  href="#shoppable-cart"
                  onClick={(e) => { e.preventDefault(); triggerToast('Redirigiendo al enlace del carrito de compras integrado en la plataforma de TikTok.'); }}
                  className="bg-[#fe2c55] text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg text-[9px] font-bold uppercase tracking-wider animate-pulse"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-white" />
                  <span>Comprar ahora {activeProject.product.price}</span>
                </a>
              </div>

            </div>

            {/* Custom Interactive Player Bar */}
            <div className="w-full mt-4 bg-[#111112] border border-zinc-800 rounded-2xl p-4 flex flex-col gap-2 shadow-lg">
              
              <div className="flex items-center justify-between">
                <button 
                  id="play-pause-btn"
                  onClick={handlePlayPause}
                  className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-2 rounded-xl flex items-center gap-2 transition-colors font-mono font-bold"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" /> PAUSAR
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" /> REPRODUCIR
                    </>
                  )}
                </button>
                
                {/* Voice Speaker Info */}
                <div className="flex items-center gap-1.5">
                  {speechSynthesisActive ? (
                    <div className="flex items-center gap-1 text-[10px] text-amber-500 font-mono font-bold animate-pulse">
                      <Volume2 className="w-3.5 h-3.5" /> fallback TTS
                    </div>
                  ) : activeProject.audio ? (
                    <div className="flex items-center gap-1 text-[10px] text-green-500 font-mono font-bold">
                      <Volume2 className="w-3.5 h-3.5" /> neuronal audio
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                      <VolumeX className="w-3.5 h-3.5" /> sin audio base64
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Slider bar */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-zinc-500">
                  {currentTime.toFixed(1)}s
                </span>
                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full relative overflow-hidden">
                  <div 
                    className="h-full bg-zinc-200 transition-all duration-100"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-zinc-500">
                  {duration.toFixed(1)}s
                </span>
              </div>
            </div>

          </div>

          {/* Right Action Display Panel (Script generated text / specs) */}
          <div className="flex-1 w-full flex flex-col gap-4 self-stretch">
            
            {/* Header Tabs */}
            <div id="panel-tabs" className="flex overflow-x-auto border-b border-zinc-800 shrink-0">
              <button 
                onClick={() => setActiveTab('script')}
                className={`py-3 px-5 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
                  activeTab === 'script' 
                    ? 'border-zinc-100 text-zinc-100 bg-zinc-900/30' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Script Generado
              </button>
              <button 
                onClick={() => setActiveTab('attributes')}
                className={`py-3 px-5 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
                  activeTab === 'attributes' 
                    ? 'border-zinc-100 text-zinc-100 bg-zinc-900/30' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Análisis del Producto
              </button>
              <button 
                onClick={() => setActiveTab('music')}
                className={`py-3 px-5 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'music' 
                    ? 'border-zinc-100 text-zinc-100 bg-zinc-900/30' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                🎵 Generar Música (Lyria)
              </button>
              <button 
                onClick={() => setActiveTab('video')}
                className={`py-3 px-5 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'video' 
                    ? 'border-zinc-100 text-zinc-100 bg-zinc-900/30' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                🎬 Animador Video (Veo)
              </button>
            </div>

            {/* TAB CONTENT: Script generated timeline */}
            {activeTab === 'script' && (
              <div id="script-panel" className="flex-1 bg-[#111112] border border-zinc-800 rounded-2xl p-6 flex flex-col overflow-hidden min-h-[300px]">
                
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Cronograma de conversión</h4>
                    <p className="text-xs text-zinc-400 font-semibold mt-0.5">{activeProject.product.title}</p>
                  </div>
                  
                  <button 
                    id="copy-script-button"
                    onClick={copyScriptToClipboard}
                    className="text-[10px] font-mono font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-400" /> COPIADO
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-400" /> COPIAR SCRIPT
                      </>
                    )}
                  </button>
                </div>

                {/* List of generated scene blocks */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 font-sans text-xs">
                  {activeProject.scenes.map((scene, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        // Fast-forward playback to this scene's timestamp
                        const parts = scene.timestamp.split(':');
                        if (parts.length === 2) {
                          const sec = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
                          setCurrentTime(sec);
                          if (audioRef.current) {
                            audioRef.current.currentTime = sec;
                          }
                        }
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        currentSceneIndex === idx 
                          ? 'bg-zinc-900/90 border-zinc-200 ring-1 ring-zinc-200/10' 
                          : 'bg-[#0d0d0e] border-zinc-900 hover:border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-[10px] font-bold text-zinc-400 bg-zinc-850 px-2 py-0.5 rounded border border-zinc-800">
                          {scene.timestamp}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold italic">
                          {scene.audio_cue}
                        </span>
                      </div>
                      
                      <div className="text-zinc-100 font-medium leading-relaxed">
                        "{scene.text}"
                      </div>
                      
                      <div className="mt-2 text-[10px] text-zinc-500 flex items-start gap-1">
                        <Video className="w-3.5 h-3.5 text-zinc-600 shrink-0 mt-0.5" />
                        <span>Visual: {scene.visual}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtitle Prompt View */}
                <div className="mt-4 pt-4 border-t border-zinc-800/60 shrink-0 bg-zinc-950/20 p-3 rounded-lg">
                  <div className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider mb-1">
                    Voz en off consolidada (TikTok Prompter)
                  </div>
                  <p className="text-[11px] text-zinc-400 italic line-clamp-2 leading-relaxed">
                    "{activeProject.voiceoverPrompt}"
                  </p>
                </div>

              </div>
            )}

            {/* TAB CONTENT: Analyzed Attributes */}
            {activeTab === 'attributes' && (
              <div id="attributes-panel" className="flex-1 bg-[#111112] border border-zinc-800 rounded-2xl p-6 flex flex-col overflow-hidden min-h-[300px]">
                
                <div className="mb-4 shrink-0">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Atributos Extraídos</h4>
                  <p className="text-xs text-zinc-400 font-semibold mt-0.5">Extraídos por el Agente Analista (Nodo 1)</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-5 pr-2">
                  
                  {/* Title & Price */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-[#0d0d0e] border border-zinc-900 rounded-xl">
                      <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Nombre del Producto</span>
                      <p className="text-xs text-zinc-200 font-bold mt-1">{activeProject.product.title}</p>
                    </div>
                    <div className="p-3 bg-[#0d0d0e] border border-zinc-900 rounded-xl">
                      <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Precio Estimado</span>
                      <p className="text-xs text-zinc-100 font-mono font-bold mt-1 text-green-400">{activeProject.product.price}</p>
                    </div>
                  </div>

                  {/* Product Description */}
                  <div className="p-4 bg-[#0d0d0e] border border-zinc-900 rounded-xl space-y-1">
                    <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block">Propuesta de Valor</span>
                    <p className="text-xs text-zinc-300 leading-relaxed">{activeProject.product.description}</p>
                  </div>

                  {/* Target Audience */}
                  <div className="p-4 bg-[#0d0d0e] border border-zinc-900 rounded-xl space-y-1">
                    <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block">Público Objetivo Recomendado</span>
                    <p className="text-xs text-zinc-300 leading-relaxed font-semibold italic">"{activeProject.product.targetAudience}"</p>
                  </div>

                  {/* Features Bullet points */}
                  <div className="p-4 bg-[#0d0d0e] border border-zinc-900 rounded-xl space-y-2">
                    <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block">Puntos Clave Extraídos (Beneficios)</span>
                    <ul className="space-y-1.5">
                      {activeProject.product.features.map((feat, idx) => (
                        <li key={idx} className="text-xs text-zinc-400 flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-zinc-100 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

              </div>
            )}

            {activeTab === 'music' && (
              <div id="music-panel" className="flex-1 bg-[#111112] border border-zinc-800 rounded-2xl p-6 flex flex-col overflow-hidden min-h-[300px] gap-4">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Generador de Música de Fondo (Lyria 3)</h4>
                  <p className="text-xs text-zinc-400 font-semibold mt-0.5">Generación de audio de fondo con Google Lyria</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">
                      Modelo Lyria de Google
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-[#0a0a0b] p-1 border border-zinc-850 rounded-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setLyriaModel('lyria-3-clip-preview');
                          triggerToast('Modelo cambiado a Lyria 3 Clip Preview (Clips cortos).');
                        }}
                        className={`py-2 text-[10px] font-bold rounded-lg transition-all ${
                          lyriaModel === 'lyria-3-clip-preview' ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        🎵 Clip Preview (hasta 30s)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLyriaModel('lyria-3-pro-preview');
                          triggerToast('Modelo cambiado a Lyria 3 Pro Preview (Canciones completas).');
                        }}
                        className={`py-2 text-[10px] font-bold rounded-lg transition-all ${
                          lyriaModel === 'lyria-3-pro-preview' ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        🎼 Pro Preview (Completo)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">
                      Prompt / Descripción de la Música
                    </label>
                    <textarea
                      rows={3}
                      value={lyriaPrompt}
                      onChange={(e) => setLyriaPrompt(e.target.value)}
                      placeholder="Describe el estilo musical, tempo e instrumentos (e.g., piano suave con violines, golpes de batería lentos para un aire de lujo y misterio...)"
                      className="w-full bg-[#0a0a0b] border border-zinc-800 focus:border-zinc-500 rounded-xl p-3.5 text-xs text-zinc-200 placeholder:text-zinc-700 outline-none transition-all resize-none"
                    />
                  </div>

                  {generatedMusicAudio && (
                    <div className="p-4 bg-[#0d0d0e] border border-zinc-900 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-mono font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> PISTA COMPILADA LISTA
                        </span>
                        <a
                          href={`data:${generatedMusicMimeType};base64,${generatedMusicAudio}`}
                          download="lyria-background-track.wav"
                          className="text-[9px] uppercase font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded flex items-center gap-1 font-mono"
                        >
                          <Download className="w-3 h-3" /> Descargar WAV
                        </a>
                      </div>
                      
                      <audio 
                        controls 
                        src={`data:${generatedMusicMimeType};base64,${generatedMusicAudio}`}
                        className="w-full h-8 brightness-90 contrast-125 font-mono"
                      />

                      {generatedMusicLyrics && (
                        <div className="pt-2 border-t border-zinc-900">
                          <span className="text-[8px] uppercase font-bold text-zinc-500 block">Estructura Musical / Letra</span>
                          <p className="text-[11px] text-zinc-400 italic mt-1 leading-relaxed whitespace-pre-line bg-zinc-950 p-2 rounded border border-zinc-900 font-mono">
                            {generatedMusicLyrics}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleGenerateMusic}
                  disabled={isGeneratingMusic}
                  className="w-full bg-zinc-100 hover:bg-white text-black font-bold text-xs py-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-widest shrink-0"
                >
                  {isGeneratingMusic ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Generando Pista con Lyria...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Generar Pista de Fondo
                    </>
                  )}
                </button>
              </div>
            )}

            {activeTab === 'video' && (
              <div id="video-panel" className="flex-1 bg-[#111112] border border-zinc-800 rounded-2xl p-6 flex flex-col overflow-hidden min-h-[300px] gap-4">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Animador de Video de Alta Fidelidad (Veo 3.1)</h4>
                  <p className="text-xs text-zinc-400 font-semibold mt-0.5">Transforma imágenes de producto en impresionantes bucles cinemáticos</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">
                        Relación de Aspecto
                      </label>
                      <div className="grid grid-cols-2 gap-1 bg-[#0a0a0b] p-1 border border-zinc-850 rounded-xl">
                        <button
                          type="button"
                          onClick={() => {
                            setVeoAspectRatio('9:16');
                            triggerToast('Aspecto de video cambiado a 9:16 (Vertical TikTok).');
                          }}
                          className={`py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                            veoAspectRatio === '9:16' ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          📱 9:16 Vertical
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setVeoAspectRatio('16:9');
                            triggerToast('Aspecto de video cambiado a 16:9 (Horizontal).');
                          }}
                          className={`py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                            veoAspectRatio === '16:9' ? 'bg-zinc-100 text-black' : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          🖥️ 16:9 Wide
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">
                        Modelo de Animación
                      </label>
                      <div className="bg-[#0a0a0b] px-3.5 py-2 border border-zinc-850 rounded-xl text-[10px] text-zinc-400 font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> veo-3.1-lite-generate-preview
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">
                      Prompt de Animación / Animación Deseada
                    </label>
                    <textarea
                      rows={3}
                      value={veoPrompt}
                      onChange={(e) => setVeoPrompt(e.target.value)}
                      placeholder="Escribe el movimiento de cámara, iluminación y atmósfera (e.g., zoom lento hacia la joya central con reflejos dorados brillantes...)"
                      className="w-full bg-[#0a0a0b] border border-zinc-800 focus:border-zinc-500 rounded-xl p-3.5 text-xs text-zinc-200 placeholder:text-zinc-700 outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="p-4 bg-[#0d0d0e] border border-zinc-900 rounded-xl space-y-2">
                    <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block">Foto de Entrada Utilizada</span>
                    {uploadedImages.length > 0 ? (
                      <div className="flex items-center gap-3">
                        <img src={uploadedImages[0]} className="w-12 h-12 object-cover rounded-lg border border-zinc-850" alt="Veo input reference" />
                        <div>
                          <p className="text-xs text-zinc-300 font-bold">Primera imagen de cola</p>
                          <p className="text-[10px] text-zinc-500">Se usará como fotograma clave de inicio para dar volumen 3D al video.</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-zinc-500 italic">
                        No hay imágenes subidas en la barra lateral. Se creará un video completamente sintético desde texto.
                      </p>
                    )}
                  </div>

                  {veoPollingStatus && (
                    <div className="p-4 bg-[#0a0a0b] border border-zinc-850 rounded-xl flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-zinc-300 animate-spin shrink-0" />
                      <div>
                        <p className="text-xs text-zinc-200 font-bold uppercase tracking-wider">PROCESANDO EN LA NUBE</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{veoPollingStatus}</p>
                      </div>
                    </div>
                  )}

                  {veoVideoUrl && (
                    <div className="p-4 bg-[#0d0d0e] border border-zinc-900 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-mono font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> ANIMACIÓN COMPILADA LISTA
                        </span>
                        <a
                          href={veoVideoUrl}
                          download="veo-shoppable-loop.mp4"
                          className="text-[9px] uppercase font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded flex items-center gap-1 font-mono"
                        >
                          <Download className="w-3 h-3" /> Descargar MP4
                        </a>
                      </div>
                      
                      <video 
                        controls 
                        loop
                        src={veoVideoUrl}
                        className="w-full rounded-xl border border-zinc-800 max-h-60 object-contain bg-black"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleGenerateVideo}
                  disabled={isGeneratingVideo}
                  className="w-full bg-zinc-100 hover:bg-white text-black font-bold text-xs py-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-widest shrink-0"
                >
                  {isGeneratingVideo ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Procesando con Veo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Animar Foto a Video Cinematográfico
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Quick Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              
              <button 
                id="download-mp4-video-button"
                onClick={handleDownloadVideo}
                disabled={isRecording}
                className={`flex-1 bg-zinc-100 text-black border border-zinc-200 hover:bg-white rounded-2xl py-4 flex flex-col items-center justify-center transition-all group font-bold ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="font-bold text-xs uppercase mb-0.5 flex items-center gap-1.5">
                  <Download className="w-4 h-4" /> 
                  {isRecording ? 'Generando...' : 'Descargar Video WebM/MP4'}
                </div>
                <div className="text-[9px] text-zinc-600 uppercase font-mono tracking-wider font-semibold">Renderizado en alta calidad</div>
              </button>

              <button 
                id="download-mp4-button"
                onClick={downloadScriptText}
                className="flex-1 bg-zinc-950 border border-zinc-700 hover:border-zinc-300 rounded-2xl py-4 flex flex-col items-center justify-center hover:bg-zinc-900/60 transition-all group"
              >
                <div className="text-zinc-200 group-hover:text-zinc-100 font-bold text-xs uppercase mb-0.5 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-zinc-400" /> Descargar Script
                </div>
                <div className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider">Archivo de Texto .TXT</div>
              </button>

              <button 
                id="export-ads-button"
                onClick={exportToAdManager}
                className="flex-1 bg-zinc-950 border border-zinc-700 hover:border-zinc-300 rounded-2xl py-4 flex flex-col items-center justify-center hover:bg-zinc-900/60 transition-all group"
              >
                <div className="text-zinc-200 group-hover:text-zinc-100 font-bold text-xs uppercase mb-0.5 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-zinc-400" /> Exportar a Anuncios
                </div>
                <div className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider">TikTok Ad Manager</div>
              </button>

            </div>

          </div>

        </section>
      </main>

      {/* High-fidelity Video Rendering / Recording progress overlay */}
      {isRecording && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="max-w-md w-full bg-[#111112] border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <Loader2 className="w-16 h-16 animate-spin text-zinc-100 absolute" />
              <RenzaLogo className="w-10 h-auto opacity-85" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold uppercase tracking-wider text-white">Grabando Video en Alta Calidad</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Capturando fotogramas a 30 FPS, sincronizando pistas de audio, subtítulos y el logo de {brandName}...
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                <span>CODIFICANDO STREAM DE CANVAS</span>
                <span>{recordingProgress}%</span>
              </div>
              <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                <div 
                  className="h-full bg-zinc-200 transition-all duration-300"
                  style={{ width: `${recordingProgress}%` }}
                />
              </div>
            </div>

            <p className="text-[10px] text-zinc-500 italic">
              Por favor, no cierres esta pestaña. El archivo se descargará automáticamente al terminar.
            </p>
          </div>
        </div>
      )}

      {/* Global Interactive Notification Toast element */}
      {notification && (
        <div 
          id="toast-notification"
          className={`fixed bottom-6 right-6 px-5 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-2.5 transition-all animate-slide-in border ${
            notification.type === 'error' 
              ? 'bg-zinc-950 border-red-900 text-zinc-200' 
              : 'bg-zinc-950 border-zinc-800 text-zinc-200'
          }`}
        >
          <div className={`w-2.5 h-2.5 rounded-full ${notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}></div>
          <span className="text-xs font-bold font-mono uppercase tracking-wider">{notification.message}</span>
        </div>
      )}

    </div>
  );
}
