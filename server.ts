import express from 'express';
import { GoogleGenAI, Type, GenerateVideosOperation } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Increase payload limit to handle base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Cache for URL analysis & script generation
const agentCache = new Map<string, any>();

function parseBase64ToPart(base64Str: string) {
  const match = base64Str.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return {
      inlineData: {
        mimeType: match[1],
        data: match[2],
      }
    };
  }
  return null;
}

app.post('/api/generate-shoppable', async (req, res) => {
  try {
    const { 
      url, 
      cacheEnabled, 
      additionalImages, 
      language = 'es', 
      duration = 10,
      brandName = 'RENZA JEWELS',
      brandLink = 'www.renzajewels.com'
    } = req.body;

    if (!url && (!additionalImages || additionalImages.length === 0)) {
      return res.status(400).json({ error: 'Por favor, proporciona una URL de producto o sube al menos una imagen.' });
    }

    const cacheKey = `${url || 'img'}-${language}-${duration}-${brandName}-${brandLink}-${additionalImages && additionalImages[0] ? additionalImages[0].substring(0, 50) : 'none'}`;

    // Check cache
    if (cacheEnabled && agentCache.has(cacheKey)) {
      console.log('Serving from agent cache for key:', cacheKey);
      return res.json(agentCache.get(cacheKey));
    }

    console.log('Processing shoppable video request. URL:', url || 'None', 'Lang:', language, 'Duration:', duration, 'Brand:', brandName, 'Link:', brandLink);

    // Call Node 1 & Node 2 in a unified schema generation
    let textPrompt = '';
    if (url) {
      textPrompt += `Analyze this product source / URL: "${url}"\n`;
    } else {
      textPrompt += `No product URL provided. Analyze the attached product images to identify what the product is and deduce realistic details (title, estimated price, key features, target audience). Maintain a luxurious feel matching the jewelry context if applicable.\n`;
    }

    const languageLabel = language === 'en' ? 'English' : 'Spanish';

    textPrompt += `
    You must act as a multi-agent system:
    1. "Agente Analista": Extract or deduce the product's title, price (or realistic estimate if not clear), main features, target audience, and core pain points solved.
    2. "Agente Guionista": Craft a highly engaging, high-retention TikTok script with a length of exactly ${duration} seconds, optimized for conversions.
    
    The store brand is: "${brandName}".
    The store website is: "${brandLink}".
    
    The script MUST follow a strong Hook -> Retention -> CTA format.
    The language must be ${languageLabel}, natural, fast-paced, persuasive, matching TikTok trends.
    IMPORTANT: Make sure the final scene contains a clear Call-To-Action (CTA) mentioning the brand "${brandName}" and telling viewers to click the link or cart button for "${brandLink}".
    
    Generate exactly 3 or 4 scenes spanning from 00:00 to 00:${duration < 10 ? '0' + duration : duration}.
    
    Generate your output strictly in JSON format matching the schema requested.
    `;

    const contents: any[] = [textPrompt];

    if (additionalImages && additionalImages.length > 0) {
      for (const img of additionalImages) {
        if (img.startsWith('data:')) {
          const part = parseBase64ToPart(img);
          if (part) {
            contents.push(part);
          }
        }
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            product: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                price: { type: Type.STRING },
                description: { type: Type.STRING },
                features: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                targetAudience: { type: Type.STRING }
              },
              required: ['title', 'price', 'description', 'features', 'targetAudience']
            },
            scenes: {
              type: Type.ARRAY,
              description: "Sequential list of video scenes for TikTok",
              items: {
                type: Type.OBJECT,
                properties: {
                  timestamp: { type: Type.STRING, description: "e.g., '00:00', '00:03', '00:06', '00:10'" },
                  text: { type: Type.STRING, description: `Narration or Voiceover text in ${languageLabel}` },
                  visual: { type: Type.STRING, description: "Visual description of what appears on screen" },
                  audio_cue: { type: Type.STRING, description: "Sound effect or background music cue" }
                },
                required: ['timestamp', 'text', 'visual', 'audio_cue']
              }
            },
            voiceoverPrompt: {
              type: Type.STRING,
              description: `A continuous text paragraph combining all narration parts in ${languageLabel} for single-voice text-to-speech rendering, avoiding any metadata, bracketed cues, or timestamps. Keep it extremely punchy and ready to read.`
            }
          },
          required: ['product', 'scenes', 'voiceoverPrompt']
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('Gemini did not return any content.');
    }

    const data = JSON.parse(resultText);

    // Node 3: Motor de Audio (TTS)
    console.log('Generating voiceover TTS for:', data.voiceoverPrompt);
    let audioBase64 = '';
    let audioMimeType = 'audio/mp3';
    try {
      const voicePromptText = language === 'en' 
        ? `Read this with an enthusiastic and persuasive voice for a TikTok video in English: ${data.voiceoverPrompt}`
        : `Lee esto con voz entusiasta y persuasiva para TikTok en español: ${data.voiceoverPrompt}`;

      const ttsResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text: voicePromptText }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' }, // Clear, modern voice
            },
          },
        },
      });

      const inlineData = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      const audioPart = inlineData?.data;
      if (audioPart) {
        audioBase64 = audioPart;
        audioMimeType = inlineData?.mimeType || 'audio/mp3';
      }
    } catch (ttsErr) {
      console.error('TTS Generation failed or not available:', ttsErr);
    }

    // Assemble final response
    const finalResponse = {
      product: data.product,
      scenes: data.scenes,
      voiceoverPrompt: data.voiceoverPrompt,
      audio: audioBase64,
      audioMimeType: typeof audioMimeType === 'string' ? audioMimeType : 'audio/mp3',
      images: additionalImages && additionalImages.length > 0 ? additionalImages : []
    };

    // Save in cache if enabled
    if (cacheEnabled) {
      agentCache.set(cacheKey, finalResponse);
    }

    res.json(finalResponse);

  } catch (error: any) {
    console.error('Error generating shoppable assets:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Endpoint to proxy TTS voice synthesis for Local Agent
app.post('/api/generate-tts', async (req, res) => {
  try {
    const { text, language = 'es' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Falta el texto para la voz artificial.' });
    }
    console.log('Generating voiceover TTS for local agent. Text length:', text.length);
    
    const voicePromptText = language === 'en' 
      ? `Read this with an enthusiastic and persuasive voice for a TikTok video in English: ${text}`
      : `Lee esto con voz entusiasta y persuasiva para TikTok en español: ${text}`;

    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: voicePromptText }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' },
          },
        },
      },
    });

    const inlineData = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    const audioPart = inlineData?.data;
    const audioMimeType = inlineData?.mimeType;
    res.json({ 
      audio: audioPart || '', 
      audioMimeType: typeof audioMimeType === 'string' ? audioMimeType : 'audio/mp3' 
    });
  } catch (err: any) {
    console.error('TTS proxy error:', err);
    res.status(500).json({ error: err.message || 'TTS generation failed' });
  }
});

// Endpoint for Music Generation using Lyria
app.post('/api/generate-music', async (req, res) => {
  try {
    const { prompt, model = 'lyria-3-clip-preview' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Por favor, proporciona una descripción para generar música.' });
    }
    console.log('Generating Lyria music. Model:', model, 'Prompt:', prompt);

    const response = await ai.models.generateContentStream({
      model: model,
      contents: prompt,
    });

    let audioBase64 = "";
    let lyrics = "";
    let mimeType = "audio/wav";

    for await (const chunk of response) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;

      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
        if (part.text && !lyrics) {
          lyrics = part.text;
        }
      }
    }

    res.json({
      audio: audioBase64,
      mimeType: mimeType,
      lyrics: lyrics
    });
  } catch (err: any) {
    console.error('Lyria music generation error:', err);
    res.status(500).json({ error: err.message || 'Music generation failed' });
  }
});

// Endpoint for Video Generation using Veo (Animate Image to Video)
app.post('/api/generate-video', async (req, res) => {
  try {
    const { prompt, image, mimeType = 'image/png', aspectRatio = '9:16' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Por favor, proporciona una descripción para la animación.' });
    }
    console.log('Starting Veo video generation. AspectRatio:', aspectRatio);

    let imagePayload: any = undefined;
    if (image) {
      // Trim data URI header if present
      const match = image.match(/^data:([^;]+);base64,(.+)$/);
      const rawBase64 = match ? match[2] : image;
      const detectedMime = match ? match[1] : mimeType;

      imagePayload = {
        imageBytes: rawBase64,
        mimeType: detectedMime
      };
    }

    const operation = await ai.models.generateVideos({
      model: 'veo-3.1-lite-generate-preview',
      prompt: prompt,
      image: imagePayload,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });

    console.log('Veo operation started successfully:', operation.name);
    res.json({ operationName: operation.name });
  } catch (err: any) {
    console.error('Veo generation error:', err);
    res.status(500).json({ error: err.message || 'Video generation initiation failed' });
  }
});

// Endpoint to Poll Video Generation status
app.post('/api/video-status', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'Falta el nombre de la operación de video.' });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    
    res.json({ 
      done: updated.done,
      status: updated.response ? 'completed' : 'processing'
    });
  } catch (err: any) {
    console.error('Error polling video operation:', err);
    res.status(500).json({ error: err.message || 'Error polling status' });
  }
});

// Endpoint to download / stream completed Veo Video
app.post('/api/video-download', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'Falta el nombre de la operación de video.' });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

    if (!uri) {
      return res.status(400).json({ error: 'La animación de video aún no está disponible o falló.' });
    }

    console.log('Downloading compiled video from Gemini CDN:', uri);
    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': apiKey || '' },
    });

    if (!videoRes.ok) {
      throw new Error(`Failed to download from Gemini bucket: ${videoRes.statusText}`);
    }

    res.setHeader('Content-Type', 'video/mp4');
    const buffer = await videoRes.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err: any) {
    console.error('Error downloading video asset:', err);
    res.status(500).json({ error: err.message || 'Error downloading video file' });
  }
});

// Setup Vite Dev server or production static serving
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
