import { ComebackStyle, ComebackIntensity, ComebackResponse } from '../types';

export interface GenerateComebackParams {
  message: string;
  style: ComebackStyle;
  intensity: ComebackIntensity;
}

export interface RegenerateSingleParams {
  responseId: string;
  message: string;
  style: ComebackStyle;
  intensity: ComebackIntensity;
  number: number;
  previousComebacks?: string[];
}

/**
 * Resilient helper to fetch JSON with automatic retry on transient network drops
 */
async function postJsonWithRetry(url: string, payload: unknown, retries = 1): Promise<any> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorDetail = 'Request failed. Please try again.';
      try {
        const errorData = await response.json();
        if (errorData?.error) {
          errorDetail = errorData.error;
        }
      } catch {
        // Response wasn't JSON
      }
      throw new Error(errorDetail);
    }

    return await response.json();
  } catch (err: any) {
    // If it is a transient network error (e.g. Failed to fetch while server awakens), retry once
    const isNetworkError =
      err?.name === 'TypeError' ||
      err?.message?.includes('Failed to fetch') ||
      err?.message?.includes('NetworkError') ||
      err?.message?.includes('Load failed');

    if (isNetworkError && retries > 0) {
      console.warn(`Transient fetch error for ${url}, retrying in 800ms...`);
      await new Promise((r) => setTimeout(r, 800));
      return postJsonWithRetry(url, payload, retries - 1);
    }

    if (isNetworkError) {
      throw new Error('Connection to the server was interrupted. Please tap Try Again.');
    }

    throw err;
  }
}

/**
 * Calls the backend Gemini API to generate 3 distinct witty comeback responses.
 */
export async function generateComebackSuggestions(
  params: GenerateComebackParams
): Promise<ComebackResponse[]> {
  const data = await postJsonWithRetry('/api/comebacks/generate', {
    message: params.message,
    style: params.style,
    intensity: params.intensity,
  });

  const comebacks: string[] = data?.comebacks || [];

  if (!Array.isArray(comebacks) || comebacks.length === 0) {
    throw new Error('No comeback responses were received. Please try again.');
  }

  return comebacks.slice(0, 3).map((text, idx) => ({
    id: `resp-${idx + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    number: idx + 1,
    text: text.trim(),
    isPlaceholder: false,
    style: params.style,
    intensity: params.intensity,
  }));
}

/**
 * Calls the backend Gemini API to regenerate a single comeback alternative.
 */
export async function regenerateSingleComeback(
  params: RegenerateSingleParams
): Promise<ComebackResponse> {
  const data = await postJsonWithRetry('/api/comebacks/regenerate-single', {
    message: params.message,
    style: params.style,
    intensity: params.intensity,
    previousComebacks: params.previousComebacks,
  });

  const comebackText = data?.comeback;

  if (!comebackText || typeof comebackText !== 'string') {
    throw new Error('Invalid comeback response received. Please try again.');
  }

  return {
    id: `resp-${params.number}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    number: params.number,
    text: comebackText.trim(),
    isPlaceholder: false,
    style: params.style,
    intensity: params.intensity,
  };
}
