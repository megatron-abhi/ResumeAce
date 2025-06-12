'use server';

/**
 * @fileOverview An AI agent that provides suggestions for improving a resume.
 *
 * - getResumeImprovementSuggestions - A function that handles the resume improvement process.
 * - ResumeImprovementSuggestionsInput - The input type for the getResumeImprovementSuggestions function.
 * - ResumeImprovementSuggestionsOutput - The return type for the getResumeImprovementSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResumeImprovementSuggestionsInputSchema = z.object({
  resumeText: z
    .string()
    .describe('The text content of the resume to be reviewed.'),
  jobDescription: z
    .string()
    .describe('The job description for the role the resume is targeting.'),
});
export type ResumeImprovementSuggestionsInput = z.infer<
  typeof ResumeImprovementSuggestionsInputSchema
>;

const ResumeImprovementSuggestionsOutputSchema = z.object({
  phrasingSuggestions: z
    .string()
    .describe('Suggestions for improving the phrasing of the resume.'),
  keywordSuggestions: z
    .string()
    .describe(
      'Suggestions for keywords to add to the resume based on the job description.'
    ),
  formattingSuggestions: z
    .string()
    .describe('Suggestions for improving the formatting of the resume.'),
  overallScore: z
    .number()
    .describe(
      'A score indicating the overall quality of the resume and areas for improvement.'
    ),
});
export type ResumeImprovementSuggestionsOutput = z.infer<
  typeof ResumeImprovementSuggestionsOutputSchema
>;

export async function getResumeImprovementSuggestions(
  input: ResumeImprovementSuggestionsInput
): Promise<ResumeImprovementSuggestionsOutput> {
  return resumeImprovementSuggestionsFlow(input);
}

const resumeImprovementSuggestionsPrompt = ai.definePrompt({
  name: 'resumeImprovementSuggestionsPrompt',
  input: {schema: ResumeImprovementSuggestionsInputSchema},
  output: {schema: ResumeImprovementSuggestionsOutputSchema},
  prompt: `You are a resume expert providing feedback on a resume based on industry best practices.

  Provide specific, actionable suggestions for improving the phrasing, keywords, and formatting of the resume so the user can present themself more effectively to potential employers.

  Based on your analysis, provide a score indicating overall resume quality and areas for improvement.

  Resume Text: {{{resumeText}}}
  Job Description: {{{jobDescription}}}
  `,
});

const resumeImprovementSuggestionsFlow = ai.defineFlow(
  {
    name: 'resumeImprovementSuggestionsFlow',
    inputSchema: ResumeImprovementSuggestionsInputSchema,
    outputSchema: ResumeImprovementSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await resumeImprovementSuggestionsPrompt(input);
    return output!;
  }
);
