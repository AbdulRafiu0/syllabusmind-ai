import { NextResponse } from 'next/server';
import { buildUserPrompt, SYSTEM_PROMPT } from '@/lib/prompt';
import { buildMockRoadmap, sanitizeRoadmap } from '@/lib/roadmap';
import type {
  APIErrorPayload,
  APIRequestPayload,
  APIResponsePayload,
  RoadmapEdge,
  RoadmapNode,
} from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GEMINI_TIMEOUT_MS = 25_000;

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
  error?: { message?: string };
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function stripCodeFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\$/, '')
    .trim();
}

async function generateWithGemini(
  apiKey: string,
  strengths: string[],
  weaknesses: string[],
): Promise<{ nodes: RoadmapNode[]; edges: RoadmapEdge[] }> {
  
  const model = (process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite').trim();
  
  // FOOLPROOF URL CONSTRUCTION: This guarantees a valid URL even if your .env file has weird invisible characters.
  const endpoint = new URL(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`);
  endpoint.searchParams.append('key', apiKey.trim());

  const response = await fetch(endpoint.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
    cache: 'no-store',
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: buildUserPrompt(strengths, weaknesses) }] }],
      generationConfig: {
        response_mime_type: 'application/json',
        temperature: 0.4,
      },
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as GeminiResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? `Gemini request failed with status ${response.status}`);
  }

  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('');
  if (!text) throw new Error('Gemini returned an empty response');

  const parsed: unknown = JSON.parse(stripCodeFences(text));
  const roadmap = sanitizeRoadmap(parsed);
  if (!roadmap) throw new Error('Gemini returned a roadmap that failed validation');

  return roadmap;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<APIErrorPayload>({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const { strengths, weaknesses } = (body ?? {}) as Partial<APIRequestPayload>;
  if (!isStringArray(strengths) || !isStringArray(weaknesses)) {
    return NextResponse.json<APIErrorPayload>(
      { error: 'Both "strengths" and "weaknesses" must be arrays of strings.' },
      { status: 400 },
    );
  }

  const fallback = (warning: string) =>
    NextResponse.json<APIResponsePayload>({
      ...buildMockRoadmap(strengths, weaknesses),
      source: 'mock',
      warning,
    });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return fallback('GEMINI_API_KEY is not set, so a demo roadmap is shown. Add the key to .env.local for AI-generated paths.');
  }

  try {
    const roadmap = await generateWithGemini(apiKey, strengths, weaknesses);
    return NextResponse.json<APIResponsePayload>({ ...roadmap, source: 'gemini' });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[generate-path] Gemini generation failed:', errorMsg);
    return fallback(`API FAILED: ${errorMsg}`);
  }
}