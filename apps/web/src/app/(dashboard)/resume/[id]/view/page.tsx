import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@ai-resume/ui';
import { Download, Share2, Copy, Check, Edit3, ArrowLeft } from 'lucide-react';
import { useResume } from '@/hooks/use-resume';
import { ResumePreview } from '@/components/preview/ResumePreview';
import { useResumeStore } from '@/stores/resume-store';
import { toast } from 'sonner';

export function ViewResumePage() {
  const { id } = useParams<{ id: string }>();
  const { data: resumeData, isLoading } = useResume(id);
  const { setResume } = useResumeStore();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (resumeData) {
      setResume(resumeData as Parameters<typeof setResume>[0]);
    }
  }, [resumeData, setResume]);

  const handleDownload = () => {
    window.print();
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/resume/${id}/view`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/resume/${id}/view`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Resume', url });
        toast.success('Shared!');
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      {/* Top bar */}
      <div className="no-print glass sticky top-0 z-40 border-b border-border px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Link to={`/dashboard/resume/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit3 className="h-4 w-4 mr-2" /> Edit
            </Button>
          </Link>
          <Button size="sm" onClick={handleDownload} className="bg-primary hover:bg-primary/90">
            <Download className="h-4 w-4 mr-2" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Resume Preview */}
      <div className="max-w-4xl mx-auto my-10 p-4">
        <div className="bg-white text-black shadow-2xl rounded-sm" id="print-area">
          <ResumePreview />
        </div>
      </div>
    </div>
  );
}
