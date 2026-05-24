import { useState } from 'react';
import { Button, Textarea, Label } from '@ai-resume/ui';
import { Loader2 } from 'lucide-react';
import { useResumeStore } from '../../stores/resume-store';
import { useAiGenerate } from '../../hooks/use-resume';
import { toast } from 'sonner';

export function SummaryForm() {
  const { resume, updateField } = useResumeStore();
  const aiGenerate = useAiGenerate();
  const [loading, setLoading] = useState(false);

  if (!resume) return null;

  const handleAiGenerate = async () => {
    if (!resume.jobTitle && !resume.targetJobTitle) {
      toast.error('Set a job title first');
      return;
    }

    setLoading(true);
    aiGenerate.mutate(
      {
        resumeId: resume.id,
        action: 'generate_summary',
      },
      {
        onSettled: () => setLoading(false),
      },
    );
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Summary</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAiGenerate}
          disabled={loading}
          className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'AI'
          )}
          Generate
        </Button>
      </div>

      <Label className="text-xs text-muted-foreground mb-1.5 block">Professional summary</Label>
      <Textarea
        value={resume.summary || ''}
        onChange={(e) => updateField('summary', e.target.value)}
        placeholder="Write a professional summary..."
        className="min-h-[200px]"
      />
    </div>
  );
}
