'use server';
import {
  suggestOptimalStockLevels,
  type SuggestOptimalStockLevelsInput,
  type SuggestOptimalStockLevelsOutput,
} from '@/ai/flows/suggest-optimal-stock-levels';

type FormState = {
  success: boolean;
  data: SuggestOptimalStockLevelsOutput | null;
  error: string | null;
};

export async function getStockSuggestion(
  prevState: FormState,
  data: SuggestOptimalStockLevelsInput
): Promise<FormState> {
  try {
    const result = await suggestOptimalStockLevels(data);
    return { success: true, data: result, error: null };
  } catch (error) {
    console.error('Error in getStockSuggestion action:', error);
    // In a real app, you might want to log this error more robustly
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      success: false,
      data: null,
      error: `Failed to get suggestion: ${errorMessage}`,
    };
  }
}
