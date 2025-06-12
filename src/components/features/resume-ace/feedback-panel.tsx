
import type { ResumeFeedbackOutput } from '@/ai/flows/resume-feedback';
import type { ResumeImprovementSuggestionsOutput } from '@/ai/flows/resume-improvement-suggestions';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Eye, DraftingCompass, Gauge, KeyRound, Lightbulb, ListChecks, Palette, ThumbsDown, ThumbsUp, Type, XCircle, Sparkles } from 'lucide-react';
import { LoadingSpinner } from './loading-spinner';

interface FeedbackPanelProps {
  feedback?: ResumeFeedbackOutput;
  improvementSuggestions?: ResumeImprovementSuggestionsOutput;
  isLoading: boolean;
  resumeType: 'pdf' | 'txt' | null;
  onReset: () => void;
}

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, icon, children, defaultOpen = false }) => (
  <AccordionItem value={title} className="border-b-0">
    <AccordionTrigger className="text-lg font-semibold hover:no-underline py-3 px-4 rounded-md hover:bg-muted/50 transition-colors [&[data-state=open]]:bg-muted/60">
      <div className="flex items-center gap-3">
        {icon}
        {title}
      </div>
    </AccordionTrigger>
    <AccordionContent className="pt-2 pb-4 px-4 text-sm">
      {children}
    </AccordionContent>
  </AccordionItem>
);

const ListItem: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <li className={`flex items-start gap-2 py-1 ${className}`}>
    <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
    <span>{children}</span>
  </li>
);

const WeaknessItem: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <li className={`flex items-start gap-2 py-1 ${className}`}>
    <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
    <span>{children}</span>
  </li>
);


export function FeedbackPanel({ feedback, improvementSuggestions, isLoading, resumeType, onReset }: FeedbackPanelProps) {
  if (isLoading) {
    return (
      <Card className="h-full shadow-lg rounded-lg flex flex-col items-center justify-center min-h-[70vh]">
        <LoadingSpinner size={64} />
        <p className="mt-4 text-lg text-muted-foreground">Analyzing your resume...</p>
      </Card>
    );
  }

  if (!feedback) {
    return (
       <Card className="h-full shadow-lg rounded-lg flex flex-col items-center justify-center min-h-[70vh]">
        <Sparkles className="w-16 h-16 text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Upload your resume to get feedback.</p>
      </Card>
    );
  }

  const overallScore = feedback.overallScore;

  return (
    <Card className="h-full shadow-lg rounded-lg overflow-hidden flex flex-col">
      <CardHeader className="bg-muted/50">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-headline">AI Feedback</CardTitle>
           <button onClick={onReset} className="text-sm text-primary hover:underline">Analyze New Resume</button>
        </div>
        <CardDescription>Here's what our AI thinks about your resume.</CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-grow overflow-y-auto">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Gauge className="h-6 w-6 text-primary" />
            Overall Score: <Badge variant={overallScore > 75 ? "default" : overallScore > 50 ? "secondary" : "destructive"} className="text-lg ml-2 bg-primary text-primary-foreground">{overallScore}/100</Badge>
          </h3>
          <Progress value={overallScore} className="w-full h-3 mb-6 [&>div]:bg-primary" />
        </div>
        
        <Accordion type="multiple" defaultValue={["Strengths", "Weaknesses", "AI Suggestions"]} className="w-full">
          {feedback.strengths && feedback.strengths.length > 0 && (
            <Section title="Strengths" icon={<ThumbsUp className="h-5 w-5 text-green-500" />} defaultOpen>
              <ul className="space-y-1 list-none pl-0">
                {feedback.strengths.map((item, index) => (
                  <ListItem key={`strength-${index}`}>{item}</ListItem>
                ))}
              </ul>
            </Section>
          )}

          {feedback.weaknesses && feedback.weaknesses.length > 0 && (
            <Section title="Weaknesses" icon={<ThumbsDown className="h-5 w-5 text-red-500" />} defaultOpen>
              <ul className="space-y-1 list-none pl-0">
                {feedback.weaknesses.map((item, index) => (
                  <WeaknessItem key={`weakness-${index}`}>{item}</WeaknessItem>
                ))}
              </ul>
            </Section>
          )}
          
          {feedback.suggestions && feedback.suggestions.length > 0 && (
             <Section title="AI Suggestions" icon={<Lightbulb className="h-5 w-5 text-yellow-500" />} defaultOpen>
               <ul className="space-y-1 list-none pl-0">
                {feedback.suggestions.map((item, index) => (
                  <ListItem key={`suggestion-${index}`}>{item}</ListItem>
                ))}
              </ul>
            </Section>
          )}

          {feedback.visualHighlights && feedback.visualHighlights.length > 0 && (
            <Section title="Visual Areas of Concern" icon={<Eye className="h-5 w-5 text-blue-500" />}>
              <p className="text-xs text-muted-foreground mb-2">These are general areas the AI identified for review in your document.</p>
              <ul className="space-y-1 list-none pl-0">
                {feedback.visualHighlights.map((item, index) => (
                  <ListItem key={`visual-${index}`}>{item}</ListItem>
                ))}
              </ul>
            </Section>
          )}

          {improvementSuggestions && (
            <>
              <Separator className="my-4" />
              <div className="px-4 py-2">
                 <h4 className="text-md font-semibold text-primary">Detailed Improvement Suggestions</h4>
                 {resumeType === 'pdf' && <p className="text-xs text-muted-foreground mb-2">Note: Some detailed suggestions below are best applied to .txt resumes for precise keyword/phrasing analysis.</p>}
              </div>

              {improvementSuggestions.phrasingSuggestions && (
                <Section title="Phrasing Improvements" icon={<Type className="h-5 w-5 text-purple-500" />}>
                  <p className="whitespace-pre-wrap">{improvementSuggestions.phrasingSuggestions}</p>
                </Section>
              )}
              {improvementSuggestions.keywordSuggestions && (
                <Section title="Keyword Optimizations" icon={<KeyRound className="h-5 w-5 text-indigo-500" />}>
                  <p className="whitespace-pre-wrap">{improvementSuggestions.keywordSuggestions}</p>
                </Section>
              )}
              {improvementSuggestions.formattingSuggestions && (
                <Section title="Formatting Tips" icon={<DraftingCompass className="h-5 w-5 text-teal-500" />}>
                   <p className="whitespace-pre-wrap">{improvementSuggestions.formattingSuggestions}</p>
                </Section>
              )}
            </>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
}
