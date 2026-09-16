export type ComebackStyle = 'sarcastic' | 'savage' | 'funny' | 'nigerian' | 'classy';

export type ComebackIntensity = 'light' | 'medium' | 'savage';

export interface StyleOption {
  id: ComebackStyle;
  emoji: string;
  label: string;
  description: string;
}

export interface IntensityOption {
  id: ComebackIntensity;
  label: string;
  description: string;
  color: string;
}

export interface ComebackResponse {
  id: string;
  number: number;
  text: string;
  isPlaceholder: boolean;
  style: ComebackStyle;
  intensity: ComebackIntensity;
  isFavorite?: boolean;
}

export type AppView = 'landing' | 'generator' | 'results';
