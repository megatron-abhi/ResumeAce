
import { FileText } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="py-4 px-6 border-b bg-card shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-headline font-semibold text-primary">
          <FileText className="h-8 w-8" />
          ResumeAce
        </Link>
      </div>
    </header>
  );
}
