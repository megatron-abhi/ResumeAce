
"use client";

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UploadCloud } from 'lucide-react';
import { LoadingSpinner } from './loading-spinner';

const ACCEPTED_FILE_TYPES = ["application/pdf", "text/plain"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const formSchema = z.object({
  resumeFile: z
    .custom<FileList>()
    .refine((files) => files && files.length > 0, "Resume file is required.")
    .refine((files) => files && files[0] && files[0].size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => files && files[0] && ACCEPTED_FILE_TYPES.includes(files[0].type),
      "Only .pdf and .txt files are accepted."
    ),
  jobDescription: z.string().min(50, "Job description must be at least 50 characters long."),
});

type FormValues = z.infer<typeof formSchema>;

interface ResumeUploadFormProps {
  onSubmit: (file: File, jobDescription: string) => Promise<void>;
  isLoading: boolean;
}

export function ResumeUploadForm({ onSubmit, isLoading }: ResumeUploadFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobDescription: "",
    },
  });

  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFileName(files[0].name);
      form.setValue("resumeFile", files);
      form.trigger("resumeFile"); // Trigger validation for file input
    } else {
      setFileName(null);
      form.setValue("resumeFile", new DataTransfer().files); // Set empty FileList
    }
  };
  
  const onFormSubmit: SubmitHandler<FormValues> = async (data) => {
    if (data.resumeFile && data.resumeFile.length > 0) {
      await onSubmit(data.resumeFile[0], data.jobDescription);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-center">Get Your Resume Audited</CardTitle>
        <CardDescription className="text-center">
          Upload your resume (PDF or TXT) and paste the job description to get AI-powered feedback.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="resumeFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="resumeFile" className="text-base">Upload Resume</FormLabel>
                  <FormControl>
                    <div className="relative flex items-center justify-center w-full">
                       <Label
                        htmlFor="resumeFile"
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">PDF or TXT (MAX. 5MB)</p>
                          {fileName && <p className="text-xs text-primary mt-2">{fileName}</p>}
                        </div>
                        <Input 
                          id="resumeFile" 
                          type="file" 
                          className="hidden" 
                          accept=".pdf,.txt"
                          onChange={handleFileChange}
                          onBlur={field.onBlur}
                          ref={field.ref}
                          name={field.name}
                        />
                      </Label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="jobDescription" className="text-base">Job Description</FormLabel>
                  <FormControl>
                    <Textarea
                      id="jobDescription"
                      placeholder="Paste the job description here..."
                      className="min-h-[150px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
              {isLoading ? <LoadingSpinner size={24} /> : 'Analyze My Resume'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
