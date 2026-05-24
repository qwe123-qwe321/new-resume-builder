import { Textarea, Label } from '@ai-resume/ui';
import { useResumeStore } from '../../stores/resume-store';
import { FileText, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@ai-resume/ui';
import { useAiGenerate } from '../../hooks/use-resume';
import { useState } from 'react';
import { toast } from 'sonner';

const SUMMARY_TIPS = [
  'Start with your years of experience and key expertise',
  'Highlight 2-3 major achievements or skills',
  'Keep it concise - aim for 3-4 sentences',
  'Tailor it to your target role',
];

export function SummaryForm() {
  const { resume, updateField } = useResumeStore();
  const aiGenerate = useAiGenerate();
  const [generating, setGenerating] = useState(false);

  if (!resume) return null;

  const handleAiGenerate = async () => {
    if (!resume.jobTitle && !resume.targetJobTitle) {
      toast.error('Add a job title first to generate a summary');
      return;
    }
    setGenerating(true);
    aiGenerate.mutate(
      {
        resumeId: resume.id,
        action: 'generate_summary',
      },
      {
        onSuccess: (data) => {
          const result = (data as { data: { result: { summary: string } } }).data.result;
          if (result?.summary) {
            updateField('summary', result.summary);
            toast.success('Summary generated!');
          }
        },
        onError: () => {
          toast.error('Failed to generate summary');
        },
        onSettled: () => setGenerating(false),
      },
    );
  };

  const characterCount = resume.summary?.length || 0;
  const isOptimalLength = characterCount >= 150 && characterCount <= 500;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          Professional Summary
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Write a compelling summary that highlights your experience and career goals.
        </p>
      </div>

      {/* Tips Card */}
      <div className="glass rounded-xl p-4 border-l-4 border-primary">
        <h4 className="text-sm font-medium text-foreground mb-2">Writing Tips</h4>
        <ul className="space-y-1.5">
          {SUMMARY_TIPS.map((tip, i) => (
            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Summary Editor */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <Label className="text-sm font-medium text-foreground">Your Summary</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAiGenerate}
            disabled={generating}
            className="gap-2 text-primary border-primary/30 hover:bg-primary/10 ai-glow"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {generating ? 'Generating...' : 'AI Generate'}
          </Button>
        </div>

        <Textarea
          value={resume.summary || ''}
          onChange={(e) => updateField('summary', e.target.value)}
          placeholder="Dynamic and results-oriented professional with 5+ years of experience in software development. Proven track record in building scalable applications and leading cross-functional teams. Passionate about clean code and user-centric design..."
          className="min-h-[200px] bg-accent/50 border-border focus:border-primary resize-none"
        />

        {/* Character Counter */}
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-muted-foreground">
            {isOptimalLength ? (
              <span className="text-success">Optimal length for ATS</span>
            ) : characterCount < 150 ? (
              <span className="text-warning">Consider adding more detail</span>
            ) : (
              <span className="text-warning">Consider being more concise</span>
            )}
          </p>
          <span className={`text-xs font-mono ${isOptimalLength ? 'text-success' : 'text-muted-foreground'}`}>
            {characterCount} / 500
          </span>
        </div>
      </div>
    </div>
  );
}
