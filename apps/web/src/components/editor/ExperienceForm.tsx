import { Button, Input, Textarea, Label } from '@ai-resume/ui';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useResumeStore } from '../../stores/resume-store';
import { useAiGenerate } from '../../hooks/use-resume';
import { toast } from 'sonner';
import { useState } from 'react';

export function ExperienceForm() {
  const { resume, addExperience, updateExperience, removeExperience } = useResumeStore();
  const aiGenerate = useAiGenerate();
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);

  if (!resume) return null;

  const experiences = resume.experience || [];

  const handleAiOptimize = async (index: number) => {
    const exp = experiences[index];
    if (!exp?.title) {
      toast.error('Enter a job title first');
      return;
    }
    setGeneratingIndex(index);
    aiGenerate.mutate(
      {
        resumeId: resume.id,
        action: 'optimize_experience',
        experienceIndex: index,
      },
      {
        onSettled: () => setGeneratingIndex(null),
      },
    );
  };

  return (
    <div className="space-y-6">
      {experiences.map((exp, index) => (
        <div key={index} className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Experience {index + 1}</h3>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAiOptimize(index)}
                disabled={generatingIndex === index}
                className="text-primary hover:bg-primary/10"
              >
                {generatingIndex === index ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'AI'
                )}
              </Button>
              {experiences.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExperience(index)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Job Title</Label>
              <Input
                value={exp.title || ''}
                onChange={(e) => updateExperience(index, { title: e.target.value })}
                placeholder="Senior Software Engineer"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Company</Label>
              <Input
                value={exp.companyName || ''}
                onChange={(e) => updateExperience(index, { companyName: e.target.value })}
                placeholder="Acme Inc."
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">City</Label>
              <Input
                value={exp.city || ''}
                onChange={(e) => updateExperience(index, { city: e.target.value })}
                placeholder="San Francisco"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">State</Label>
              <Input
                value={exp.state || ''}
                onChange={(e) => updateExperience(index, { state: e.target.value })}
                placeholder="CA"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Start Date</Label>
              <Input
                type="date"
                value={exp.startDate || ''}
                onChange={(e) => updateExperience(index, { startDate: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">End Date</Label>
              <Input
                type="date"
                value={exp.endDate || ''}
                onChange={(e) => updateExperience(index, { endDate: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground mb-1.5 block">Work Summary</Label>
              <Textarea
                value={exp.workSummary || ''}
                onChange={(e) => updateExperience(index, { workSummary: e.target.value })}
                placeholder="Describe your responsibilities and achievements..."
                className="min-h-[120px]"
              />
            </div>
          </div>
        </div>
      ))}

      <Button
        variant="outline"
        onClick={addExperience}
        className="w-full gap-2 border-dashed"
      >
        <Plus className="h-4 w-4" /> Add Experience
      </Button>
    </div>
  );
}
