'use server';

/**
 * @fileOverview An AI agent that provides feedback on a resume.
 *
 * - getResumeFeedback - A function that handles the resume feedback process.
 * - ResumeFeedbackInput - The input type for the getResumeFeedback function.
 * - ResumeFeedbackOutput - The return type for the getResumeFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResumeFeedbackInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "The resume document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  jobDescription: z.string().describe('The job description for the target job.'),
});
export type ResumeFeedbackInput = z.infer<typeof ResumeFeedbackInputSchema>;

const ResumeFeedbackOutputSchema = z.object({
  overallScore: z.number().describe('A score indicating the overall resume quality (0-100).'),
  strengths: z.array(z.string()).describe('List of strengths of the resume.'),
  weaknesses: z.array(z.string()).describe('List of weaknesses of the resume.'),
  suggestions: z.array(z.string()).describe('Suggestions for improving the resume.'),
  visualHighlights: z
    .array(z.string())
    .describe('Areas of concern within the resume document that needs attention.'),
});
export type ResumeFeedbackOutput = z.infer<typeof ResumeFeedbackOutputSchema>;

export async function getResumeFeedback(input: ResumeFeedbackInput): Promise<ResumeFeedbackOutput> {
  return resumeFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'resumeFeedbackPrompt',
  input: {schema: ResumeFeedbackInputSchema},
  output: {schema: ResumeFeedbackOutputSchema},
  prompt: `You are a resume expert and will provide feedback on a resume based on industry best practices.

You will provide a score (0-100) indicating the overall resume quality. You will also identify strengths and weaknesses, suggest improvements to phrasing, keywords, and formatting, and highlight specific areas of concern within the resume document.

Target Job Description: {{{jobDescription}}}
Resume Content: {{media url=resumeDataUri}}

Here is the resume feedback in JSON format:
{{json output}}`,
});

const resumeFeedbackFlow = ai.defineFlow(
  {
    name: 'resumeFeedbackFlow',
    inputSchema: ResumeFeedbackInputSchema,
    outputSchema: ResumeFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
