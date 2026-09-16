import { StyleOption, IntensityOption, ComebackStyle, ComebackIntensity, ComebackResponse } from './types';

export const MAX_MESSAGE_LENGTH = 500;

export const STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'sarcastic',
    emoji: '😏',
    label: 'Sarcastic',
    description: 'Dry, razor-sharp irony that cuts straight to the point'
  },
  {
    id: 'savage',
    emoji: '🔥',
    label: 'Savage',
    description: 'Unapologetic burns and merciless royal reality checks'
  },
  {
    id: 'funny',
    emoji: '😂',
    label: 'Funny',
    description: 'Playful wit, comedic twists, and lighthearted clapbacks'
  },
  {
    id: 'nigerian',
    emoji: '🇳🇬',
    label: 'Nigerian Vibes',
    description: 'Pure Naija cruise, proverbs, "shey you dey whine me", and dramatic flair'
  },
  {
    id: 'classy',
    emoji: '🎩',
    label: 'Classy but Petty',
    description: 'Polite vocabulary concealing exquisite, devastating shade'
  }
];

export const INTENSITY_OPTIONS: IntensityOption[] = [
  {
    id: 'light',
    label: 'Light',
    description: 'Playful jab with a friendly grin',
    color: 'emerald'
  },
  {
    id: 'medium',
    label: 'Medium',
    description: 'Sharp roast with undeniable sting',
    color: 'amber'
  },
  {
    id: 'savage',
    label: 'Savage',
    description: 'Maximum scorch — crown fully adjusted',
    color: 'rose'
  }
];

/**
 * Example prompts requested for inspiration:
 * "You talk too much."
 * "Nobody asked for your opinion."
 * "You're always online."
 * "You think you're better than everyone."
 */
export const INSPIRATION_PROMPTS = [
  "You talk too much.",
  "Nobody asked for your opinion.",
  "You're always online.",
  "You think you're better than everyone.",
  "Can you do this for free? It's great exposure!",
  "Why are you leaving me on read?",
  "You look totally different in real life."
];

export const QUICK_SAMPLE_PROMPTS = INSPIRATION_PROMPTS;

export function getPlaceholderResponses(
  message: string,
  style: ComebackStyle,
  intensity: ComebackIntensity
): ComebackResponse[] {
  return [
    {
      id: `resp-1-${Date.now()}`,
      number: 1,
      text: "I would agree with you, but then we would both be wrong.",
      isPlaceholder: false,
      style,
      intensity,
      isFavorite: false,
    },
    {
      id: `resp-2-${Date.now()}`,
      number: 2,
      text: "I am trying to see things from your perspective, but I can not get my head that low.",
      isPlaceholder: false,
      style,
      intensity,
      isFavorite: false,
    },
    {
      id: `resp-3-${Date.now()}`,
      number: 3,
      text: "I would give you a nasty look, but it seems you already have one.",
      isPlaceholder: false,
      style,
      intensity,
      isFavorite: false,
    }
  ];
}
