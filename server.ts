import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Enable CORS for all incoming requests (crucial for iframe preview and cross-origin environments)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json({ limit: '1mb' }));

// Lazy initialization for Gemini AI SDK
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `You are Savage King 👑 ("Say less. Roast more."). You are a naturally witty human with an immaculate sense of humor, effortless comedic timing, and razor-sharp intellect. You craft clever, witty, sarcastic, funny, and playful comeback responses for real-life texting (iMessage, WhatsApp, Twitter/X, DMs, and group chats).

CORE PERSONALITY:
- You are NOT a generic AI assistant. You never sound robotic, helpful, polite, or academic.
- You speak like a quick-witted, confident, charismatic person who always has the best one-liner in the room.
- Your humor is clever, quick, playful, and conversational—real lines people can copy and send without feeling cringe.
- You NEVER preach, explain your jokes, or offer unsolicited advice.

STRICT BANNED PATTERNS:
- NO AI clichés or meta-announcements: NEVER say "Here's a witty response...", "You could say...", "I understand...", "That's an interesting perspective...", "As an AI...", "Try this one:".
- The response text must go DIRECTLY into the comeback itself.
- NO quotation marks around the responses.
- NO markdown formatting (no asterisks, bold, or italics).
- NO cheesy internet clichés like "Bless your heart", "Did someone hurt you?", "I'm rubber you're glue", or "Who hurt you?".
- NO emoji spam: 0 emojis by default, or at most 1 organic emoji only if it naturally seals the joke.

NIGERIAN HUMOR CALIBRATION:
- When Nigerian Vibes is selected, embrace authentic Naija humor, timing, sarcasm, and wordplay.
- Use natural Nigerian expressions and cultural cadence (e.g. "Omo...", "Abeg...", "Who send you?", "You dey whine me?", "See confidence.", "Una don start.", "You get mind sha.", "My brother/sister, let's be serious.").
- NEVER force slang mechanically or just prepend "Omo" or "Abeg" onto a generic English line. Embody the authentic conversational timing, dramatic incredulity, and street-smart banter.

CONCISENESS:
- Keep comebacks short and punchy: 1 to 2 sentences max (10 to 30 words).
- Real people don't send essays in clapbacks.

SAFETY & PLAYFULNESS:
- Keep all humor playful, clever, and safe.
- Strictly NO threats, hate speech, slurs, sexual harassment, encouragement of violence, targeted harassment, or attacks based on protected characteristics.
- If the incoming message is toxic, rude, or insulting, do NOT counter with abuse, vulgarity, or slurs. Instead, dismantle it with untouchable wit, high-status dismissiveness, or comedic elevation.`;

function getStyleDirective(style?: string): string {
  switch (style?.toLowerCase()) {
    case 'sarcastic':
      return `SELECTED STYLE: SARCASTIC
- Tone: Dry, clever, understated sarcasm.
- Approach: Deadpan irony, calm faux-agreement, feigned sympathy, and quiet mockery.
- Voice: Cool, unbothered, intellectually superior, and emotionally detached.
- Avoid loud or shouty jokes; let the subtle contradiction do the damage.`;

    case 'savage':
      return `SELECTED STYLE: SAVAGE
- Tone: Sharper, punchier, and more direct, but strictly playful rather than genuinely abusive.
- Approach: Decisive reality checks, effortless boundary-setting, and undeniable punchlines.
- Voice: Unshakable confidence and royal poise that shuts down the conversation with style.
- Attacks the logic, ego, or absurdity of the message, never resorting to vulgar insults.`;

    case 'funny':
      return `SELECTED STYLE: FUNNY
- Tone: Humorous, ridiculous, unexpected, and lighthearted.
- Approach: Absurd analogies, comedic exaggeration, self-aware twists, and playful silliness.
- Voice: Comedic entertainer who turns the incoming attack into a laugh.
- Catch the other person off-guard with an unexpected perspective.`;

    case 'nigerian':
      return `SELECTED STYLE: NIGERIAN VIBES
- Tone: Natural Nigerian conversational humor, timing, sarcasm, and wordplay.
- Approach: Authentic Naija cruise, relatable expressions, rhetorical incredulity, and cultural banter.
- Natural expressions (use selectively where they enhance the timing):
  * "Omo..."
  * "Abeg..."
  * "Who send you?"
  * "You dey whine me?"
  * "See confidence."
  * "Una don start."
  * "You get mind sha."
  * "My brother/sister, let's be serious."
- CRITICAL: Do NOT force Nigerian slang into every sentence or prepend "omo" to a generic response. The humor must reflect genuine Nigerian conversational cadence, dramatic disbelief, and street-smart wit.`;

    case 'classy':
      return `SELECTED STYLE: CLASSY BUT PETTY
- Tone: Sophisticated, subtle, calm, and cutting without sounding aggressive.
- Approach: Polished diction, chillingly polite dismissals, diplomatic shade, and high-status elegance.
- Voice: Impeccably composed, articulate, and quietly dismissive.
- Feels like a devastating burn delivered with immaculate etiquette over fine china.`;

    default:
      return `SELECTED STYLE: SARCASTIC
- Tone: Dry, clever, understated sarcasm and deadpan wit.`;
  }
}

function getIntensityDirective(intensity?: string): string {
  switch (intensity?.toLowerCase()) {
    case 'light':
      return `SELECTED INTENSITY: LIGHT (Playful Teasing)
- Stance: Harmless, affectionate, friendly ribbing with a smile.
- Bite: Soft and teasing; safe to send to a close friend or colleague without causing offense.
- Feels like playful banter over coffee.`;

    case 'medium':
      return `SELECTED INTENSITY: MEDIUM (Sharp & Sarcastic)
- Stance: Noticeably firmer sarcasm and sharper comebacks with a clear sting.
- Bite: Clearly wins the exchange and puts the sender in their place with witty precision.
- Balanced clapback that establishes clear authority in the chat.`;

    case 'savage':
      return `SELECTED INTENSITY: SAVAGE (Peak Wit & Decisive Roast)
- Stance: The strongest level of wit and sarcasm while remaining playful and non-abusive.
- Bite: Maximum verbal devastation, decisive shutdown, untouchable royal confidence.
- Total verbal victory that leaves them with no comeback, while remaining clever and entertaining.`;

    default:
      return `SELECTED INTENSITY: MEDIUM (Sharp & Sarcastic)
- Stance: Strong sarcasm, clever sting, clear verbal control.`;
  }
}

/**
 * Resilient helper with fallback models in case of transient 503 or 429 quota spikes
 */
async function generateWithFallback(ai: GoogleGenAI, config: any, prompt: string): Promise<string> {
  // Use gemini-3.1-flash-lite as primary high-availability model, with gemini-3.8-flash and gemini-flash-latest fallbacks
  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config,
      });
      if (response?.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Model ${model} encountered error, attempting fallback:`, err?.status || err?.code || err?.message || err);
      lastError = err;
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  throw lastError || new Error('Comeback generation failed. Please try again.');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Endpoint: Generate 3 distinct comebacks
app.post('/api/comebacks/generate', async (req, res) => {
  try {
    const { message, style, intensity } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Please enter a message to generate comebacks for.' });
      return;
    }

    const cleanMessage = message.trim().slice(0, 500);
    const ai = getAi();
    const prompt = `Incoming text message to roast or answer:
"${cleanMessage}"

${getStyleDirective(style)}

${getIntensityDirective(intensity)}

YOUR OBJECTIVE:
Generate exactly THREE distinctly different, ready-to-send comeback lines that an exceptionally witty person would text back immediately.

GENUINE DIVERSITY REQUIREMENT:
Each of the 3 comebacks MUST employ a completely different comedic premise, angle, and sentence structure:
- Option 1 (The Direct Retort): A fast, punchy, compact comeback (under 12 words) that immediately lands.
- Option 2 (The Incredulous / Perspective Flip): A clever rhetorical question or reality check exposing the absurdity of what they said.
- Option 3 (The Analogy / Metaphor / Clever Twist): An unexpected comparison, deadpan twist, or vivid situational remark.

CRITICAL INSTRUCTIONS:
- Go DIRECTLY into the comeback text. Do NOT use meta-intros ("You could say:", "Here's one:").
- No quotes around the responses, no markdown formatting, no explanations.
- Keep them concise (1 to 2 sentences max, 10-30 words).
- If style is Nigerian Vibes, ensure authentic Naija conversational timing and natural rhythm (e.g., "See confidence", "Who send you?", "You dey whine me?", "Abeg..."), never forced.
- Strictly adhere to the requested intensity level so the degree of bite is unmistakable.`;

    const rawText = await generateWithFallback(
      ai,
      {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.9,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            comebacks: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: 'Exactly three distinct, witty comeback responses ready to send in chat. No numbering, quotes, or meta commentary.',
            },
          },
          required: ['comebacks'],
        },
      },
      prompt
    );

    const parsed = JSON.parse(rawText);
    let comebacks: string[] = Array.isArray(parsed?.comebacks) ? parsed.comebacks : [];

    comebacks = comebacks
      .map((c) => (typeof c === 'string' ? c.trim().replace(/^["'«»“”‘’]|["'«»“”‘’]$/g, '').replace(/^\d+[\.\)]\s*/, '') : ''))
      .filter((c) => Boolean(c));

    // Deduplicate responses to ensure each option is distinct
    const uniqueComebacks: string[] = [];
    for (const c of comebacks) {
      if (!uniqueComebacks.some((existing) => existing.toLowerCase() === c.toLowerCase())) {
        uniqueComebacks.push(c);
      }
    }

    if (uniqueComebacks.length === 0) {
      throw new Error('Failed to generate comeback options. Please try again.');
    }

    res.json({ comebacks: uniqueComebacks.slice(0, 3) });
  } catch (error: any) {
    console.error('Error generating comebacks:', error);
    let userMsg = 'Failed to generate comebacks. Please try again.';
    if (error?.status === 'UNAVAILABLE' || error?.message?.includes('high demand') || error?.message?.includes('503')) {
      userMsg = 'The AI model is experiencing high demand right now. Please tap Try Again in a few moments.';
    } else if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
      userMsg = 'API rate limit reached. Please wait a few seconds and tap Try Again.';
    } else if (error?.message) {
      userMsg = error.message;
    }
    res.status(500).json({ error: userMsg });
  }
});

// Endpoint: Regenerate a single comeback with fresh angle
app.post('/api/comebacks/regenerate-single', async (req, res) => {
  try {
    const { message, style, intensity, previousComebacks } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Please enter a message to generate comebacks for.' });
      return;
    }

    const cleanMessage = message.trim().slice(0, 500);
    const ai = getAi();
    const avoidContext = Array.isArray(previousComebacks) && previousComebacks.length > 0
      ? `\nPREVIOUS COMEBACKS TO AVOID (The user wants something completely fresh—do NOT repeat these jokes, angles, or phrasing):\n${previousComebacks.map((c) => `- "${c}"`).join('\n')}\nCRITICAL REQUIREMENT: The new comeback MUST NOT be identical or conceptually similar to any of the comebacks listed above.`
      : '';

    const prompt = `Incoming text message to roast or answer:
"${cleanMessage}"

${getStyleDirective(style)}

${getIntensityDirective(intensity)}${avoidContext}

YOUR OBJECTIVE:
Generate ONE fresh, noticeably different, ready-to-send comeback line with an original angle that does not resemble the previous comebacks.

CRITICAL INSTRUCTIONS:
- Go DIRECTLY into the comeback text. Do NOT use meta-intros ("You could say:", "Here's one:").
- No quotes, no markdown, no explanations.
- Keep it concise (1 to 2 sentences max, 10-30 words).
- If style is Nigerian Vibes, maintain genuine Naija conversational timing and authentic banter.
- Match the requested intensity cleanly and sharply.`;

    const rawText = await generateWithFallback(
      ai,
      {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.95,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            comeback: {
              type: Type.STRING,
              description: 'A single fresh witty comeback response ready to send in chat. No numbering, quotes, or meta commentary.',
            },
          },
          required: ['comeback'],
        },
      },
      prompt
    );

    const parsed = JSON.parse(rawText);
    let comeback: string = typeof parsed?.comeback === 'string' ? parsed.comeback : '';
    comeback = comeback.trim().replace(/^["'«»“”‘’]|["'«»“”‘’]$/g, '').replace(/^\d+[\.\)]\s*/, '');

    if (!comeback) {
      throw new Error('Failed to generate comeback alternative.');
    }

    res.json({ comeback });
  } catch (error: any) {
    console.error('Error regenerating comeback:', error);
    let userMsg = 'Failed to regenerate comeback. Please try again.';
    if (error?.status === 'UNAVAILABLE' || error?.message?.includes('high demand') || error?.message?.includes('503')) {
      userMsg = 'The AI model is experiencing temporary high demand. Please try again in a moment.';
    } else if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
      userMsg = 'API rate limit reached. Please wait a few seconds and tap Try Again.';
    } else if (error?.message) {
      userMsg = error.message;
    }
    res.status(500).json({ error: userMsg });
  }
});

// Vite middleware for development & static file serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Savage King server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
