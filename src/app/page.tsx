
"use client";

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { ResumeUploadForm } from '@/components/features/resume-ace/resume-upload-form';
import { ResumeDisplay } from '@/components/features/resume-ace/resume-display';
import { FeedbackPanel } from '@/components/features/resume-ace/feedback-panel';
import { getResumeFeedback, type ResumeFeedbackInput, type ResumeFeedbackOutput } from '@/ai/flows/resume-feedback';
import { getResumeImprovementSuggestions, type ResumeImprovementSuggestionsInput, type ResumeImprovementSuggestionsOutput } from '@/ai/flows/resume-improvement-suggestions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";


export default function ResumeAcePage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  
  const [resumeDataUri, setResumeDataUri] = useState<string | null>(null);
  const [resumeTextContent, setResumeTextContent] = useState<string | null>(null);
  const [resumeType, setResumeType] = useState<'pdf' | 'txt' | null>(null);

  const [feedbackResult, setFeedbackResult] = useState<ResumeFeedbackOutput | null>(null);
  const [improvementSuggestionsResult, setImprovementSuggestionsResult] = useState<ResumeImprovementSuggestionsOutput | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  // Effect to clear error after a delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000); // Clear error after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleFormSubmit = async (file: File, jd: string) => {
    setIsLoading(true);
    setError(null);
    setFeedbackResult(null);
    setImprovementSuggestionsResult(null);
    setResumeFile(file);
    setJobDescription(jd);

    const reader = new FileReader();

    reader.onloadend = async () => {
      const dataUri = reader.result as string;
      setResumeDataUri(dataUri);

      let textContent: string | null = null;
      const currentFileType = file.type === 'application/pdf' ? 'pdf' : 'txt';
      setResumeType(currentFileType);

      if (currentFileType === 'txt') {
        // For TXT files, read content as text
        const textReader = new FileReader();
        textReader.onloadend = async () => {
          textContent = textReader.result as string;
          setResumeTextContent(textContent);
          await fetchAiResults(dataUri, textContent, jd, currentFileType);
        };
        textReader.onerror = () => {
          setError("Failed to read text file content.");
          setIsLoading(false);
        };
        textReader.readAsText(file);
      } else {
        // For PDF files, textContent will be null initially
        setResumeTextContent(null);
        await fetchAiResults(dataUri, null, jd, currentFileType);
      }
    };
    
    reader.onerror = () => {
      setError("Failed to read file.");
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const fetchAiResults = async (dataUri: string, textContent: string | null, jd: string, fileType: 'pdf' | 'txt') => {
    try {
      // Call for getResumeFeedback (always)
      const feedbackInput: ResumeFeedbackInput = { resumeDataUri: dataUri, jobDescription: jd };
      const feedback = await getResumeFeedback(feedbackInput);
      setFeedbackResult(feedback);

      // Call for getResumeImprovementSuggestions (only if TXT file and textContent is available)
      if (fileType === 'txt' && textContent) {
        const suggestionsInput: ResumeImprovementSuggestionsInput = { resumeText: textContent, jobDescription: jd };
        const suggestions = await getResumeImprovementSuggestions(suggestionsInput);
        setImprovementSuggestionsResult(suggestions);
      }
      
      toast({
        title: "Analysis Complete!",
        description: "Your resume feedback is ready.",
      });

    } catch (e: any) {
      console.error("AI processing error:", e);
      setError(`An error occurred during AI analysis: ${e.message || 'Unknown error'}`);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: `Failed to analyze resume. ${e.message || 'Please try again.'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setResumeFile(null);
    setJobDescription('');
    setResumeDataUri(null);
    setResumeTextContent(null);
    setResumeType(null);
    setFeedbackResult(null);
    setImprovementSuggestionsResult(null);
    setError(null);
    setIsLoading(false);
  };


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6 shadow-md">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!resumeDataUri ? (
          <ResumeUploadForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            <div className="md:col-span-1 h-full">
              {resumeDataUri && resumeType && (
                <ResumeDisplay
                  dataUri={resumeDataUri}
                  type={resumeType}
                  textContent={resumeTextContent || undefined}
                />
              )}
            </div>
            <div className="md:col-span-1 h-full">
               <FeedbackPanel
                feedback={feedbackResult || undefined}
                improvementSuggestions={improvementSuggestionsResult || undefined}
                isLoading={isLoading && !feedbackResult} // Show loading in panel only if results not yet available
                resumeType={resumeType}
                onReset={handleReset}
              />
            </div>
          </div>
        )}
      </main>
      <footer className="text-center py-4 border-t text-sm text-muted-foreground">
        ResumeAce &copy; {new Date().getFullYear()} - AI-Powered Resume Auditor
      </footer>
    </div>
  );
}
