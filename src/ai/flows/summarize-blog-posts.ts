'use server';

/**
 * @fileOverview A blog post summarization AI agent.
 *
 * - summarizeBlogPost - A function that summarizes a blog post.
 * - SummarizeBlogPostInput - The input type for the summarizeBlogPost function.
 * - SummarizeBlogPostOutput - The return type for the summarizeBlogPost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeBlogPostInputSchema = z.object({
  blogPostContent: z
    .string()
    .describe('The full content of the blog post to be summarized.'),
});
export type SummarizeBlogPostInput = z.infer<typeof SummarizeBlogPostInputSchema>;

const SummarizeBlogPostOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the blog post, suitable for display in search results.'),
});
export type SummarizeBlogPostOutput = z.infer<typeof SummarizeBlogPostOutputSchema>;

export async function summarizeBlogPost(
  input: SummarizeBlogPostInput
): Promise<SummarizeBlogPostOutput> {
  return summarizeBlogPostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeBlogPostPrompt',
  input: {schema: SummarizeBlogPostInputSchema},
  output: {schema: SummarizeBlogPostOutputSchema},
  prompt: `You are an expert blog post summarizer. Your goal is to create a concise and informative summary of a blog post that can be used in search results or as a preview.

Blog Post Content: {{{blogPostContent}}}

Summary:`,
});

const summarizeBlogPostFlow = ai.defineFlow(
  {
    name: 'summarizeBlogPostFlow',
    inputSchema: SummarizeBlogPostInputSchema,
    outputSchema: SummarizeBlogPostOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
