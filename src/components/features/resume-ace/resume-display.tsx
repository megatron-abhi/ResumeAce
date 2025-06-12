
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ResumeDisplayProps {
  dataUri: string;
  type: 'pdf' | 'txt';
  textContent?: string; // Only for TXT type for now
}

export function ResumeDisplay({ dataUri, type, textContent }: ResumeDisplayProps) {
  return (
    <Card className="h-full shadow-lg rounded-lg overflow-hidden flex flex-col">
      <CardHeader className="bg-muted/50">
        <CardTitle className="text-xl font-headline">Your Resume</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow">
        {type === 'pdf' && (
          <iframe
            src={dataUri}
            className="w-full h-full min-h-[70vh]"
            title="Resume Preview"
            aria-label="Resume Preview"
          />
        )}
        {type === 'txt' && textContent && (
          <div className="w-full h-full min-h-[70vh] p-4 overflow-auto bg-white">
            <pre className="text-sm whitespace-pre-wrap break-all font-code">{textContent}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
