'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting optimal stock levels based on historical data.
 *
 * The flow takes historical stock data and uses it to predict optimal reorder points, minimum stock levels, and reorder quantities.
 *
 * @exports {
 *   suggestOptimalStockLevels,
 *   SuggestOptimalStockLevelsInput,
 *   SuggestOptimalStockLevelsOutput,
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalStockLevelsInputSchema = z.object({
  materialId: z.string().describe('The ID of the material to suggest stock levels for.'),
  historicalData: z.string().describe('Historical stock data in JSON format, including stock moves OUT and seasonality by period.'),
  leadTimeDays: z.number().describe('The lead time in days for the material.'),
  openOrdersQuantity: z.number().describe('The total quantity of the material in open orders.'),
});
export type SuggestOptimalStockLevelsInput = z.infer<
  typeof SuggestOptimalStockLevelsInputSchema
>;

const SuggestOptimalStockLevelsOutputSchema = z.object({
  suggestedReorderPoint: z.number().describe('The suggested reorder point for the material.'),
  suggestedMinStock: z.number().describe('The suggested minimum stock level for the material.'),
  suggestedQuantity: z
    .number()
    .describe('The suggested reorder quantity considering lead time and open orders.'),
});
export type SuggestOptimalStockLevelsOutput = z.infer<
  typeof SuggestOptimalStockLevelsOutputSchema
>;

export async function suggestOptimalStockLevels(
  input: SuggestOptimalStockLevelsInput
): Promise<SuggestOptimalStockLevelsOutput> {
  return suggestOptimalStockLevelsFlow(input);
}

const suggestOptimalStockLevelsPrompt = ai.definePrompt({
  name: 'suggestOptimalStockLevelsPrompt',
  input: {schema: SuggestOptimalStockLevelsInputSchema},
  output: {schema: SuggestOptimalStockLevelsOutputSchema},
  prompt: `You are an expert inventory management consultant.

  Based on the historical stock data, lead time, and open orders, suggest optimal stock levels to minimize shortages and overstocking.

  Historical Data: {{{historicalData}}}
  Lead Time (days): {{{leadTimeDays}}}
  Open Orders Quantity: {{{openOrdersQuantity}}}

  Consider the following factors:
  - Demand forecasting based on historical data.
  - Lead time variability.
  - Open orders and their impact on available stock.

  Provide your suggestions for the following:
  - Suggested Reorder Point: The stock level at which a new order should be placed.
  - Suggested Minimum Stock: The minimum stock level to avoid stockouts.
  - Suggested Reorder Quantity: The quantity to reorder to meet demand during the lead time.

  Format your response as a JSON object:
  {{json suggestedReorderPoint=number, suggestedMinStock=number, suggestedQuantity=number}}
  `,
});

const suggestOptimalStockLevelsFlow = ai.defineFlow(
  {
    name: 'suggestOptimalStockLevelsFlow',
    inputSchema: SuggestOptimalStockLevelsInputSchema,
    outputSchema: SuggestOptimalStockLevelsOutputSchema,
  },
  async input => {
    const {output} = await suggestOptimalStockLevelsPrompt(input);
    return output!;
  }
);
