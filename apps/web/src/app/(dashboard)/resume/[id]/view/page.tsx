import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@ai-resume/ui';
import { Download, Share2, Copy, Check, Edit3, ArrowLeft, Sparkles } from 'lucide-react';
import { useResume } from '@/hooks/use-resume';
import { ResumePreview } from '@/components/preview/ResumePreview';
import { useResumeStore } from '@/stores/resume-store';
import { toast } from 'sonner';

export function ViewResumePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
      toast.success('链接已复制');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('复制失败');
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/resume/${id}/view`;
    if (navigator.share) {
      try {
        await navigator.share({ title: '我的简历', url });
        toast.success('分享成功');
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
    <div className="relative">
      <div className="no-print glass sticky top-0 z-40 border-b border-border px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          返回控制台
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate(`/resume/${id}/ai`)}
            className="gap-2 shadow-md transition-all bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">AI 工作台</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Link to={`/dashboard/resume/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit3 className="h-4 w-4 mr-2" /> 编辑
            </Button>
          </Link>
          <Button size="sm" onClick={handleDownload} className="bg-primary hover:bg-primary/90">
            <Download className="h-4 w-4 mr-2" /> 下载 PDF
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto my-10 p-4 print-content">
        <div className="bg-white text-black shadow-2xl rounded-sm print-area-wrapper" id="print-area">
          <ResumePreview />
        </div>
      </div>
    </div>
  );
}
