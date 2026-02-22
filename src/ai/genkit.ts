import { genkit } from 'genkit'
import { googleAI } from '@genkit-ai/google-genai'

let aiInstance: ReturnType<typeof genkit> | null = null

export function getAi(): ReturnType<typeof genkit> {
  if (aiInstance) {
    return aiInstance
  }

  aiInstance = genkit({
    plugins: [googleAI()],
    model: 'googleai/gemini-2.5-flash',
  })
  return aiInstance
}
