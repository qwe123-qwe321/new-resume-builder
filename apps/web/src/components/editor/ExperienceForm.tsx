import { Button, Input, Textarea, Label, cn } from '@ai-resume/ui';
import { Plus, Trash2, Loader2, Sparkles, Briefcase, Building2, MapPin, Calendar, GripVertical } from 'lucide-react';
import { useResumeStore } from '../../stores/resume-store';
import { useAiGenerate } from '../../hooks/use-resume';
import { toast } from 'sonner';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ExperienceForm() {
  const { resume, addExperience, updateExperience, removeExperience } = useResumeStore();
  const aiGenerate = useAiGenerate();
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

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
        onSuccess: () => {
          toast.success('Experience optimized!');
        },
        onError: () => {
          toast.error('Failed to optimize');
        },
        onSettled: () => setGeneratingIndex(null),
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          Work Experience
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          List your work history, starting with your most recent position.
        </p>
      </div>

      <AnimatePresence mode="popLayout">
        {experiences.map((exp, index) => (
          <motion.div
            key={index}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="glass rounded-xl overflow-hidden"
          >
            {/* Collapsed Header */}
            <button
              type="button"
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full flex items-center gap-3 p-4 hover:bg-accent/30 transition-colors text-left"
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-accent text-muted-foreground">
                <GripVertical className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">
                  {exp.title || 'New Position'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {exp.companyName || 'Company Name'} {exp.startDate && `· ${exp.startDate}`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {exp.aiGenerated && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                    <Sparkles className="h-3 w-3" /> AI Enhanced
                  </span>
                )}
                <svg
                  className={cn(
                    'h-5 w-5 text-muted-foreground transition-transform duration-200',
                    expandedIndex === index && 'rotate-180'
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Expanded Content */}
            <AnimatePresence>
              {expandedIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-2 border-t border-border space-y-4">
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAiOptimize(index)}
                        disabled={generatingIndex === index}
                        className="gap-2 text-primary border-primary/30 hover:bg-primary/10 ai-glow flex-1"
                      >
                        {generatingIndex === index ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        {generatingIndex === index ? 'Optimizing...' : 'AI Optimize'}
                      </Button>
                      {experiences.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeExperience(index)}
                          className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">Job Title</Label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            value={exp.title || ''}
                            onChange={(e) => updateExperience(index, { title: e.target.value })}
                            placeholder="Senior Software Engineer"
                            className="pl-10 bg-accent/50"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">Company</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            value={exp.companyName || ''}
                            onChange={(e) => updateExperience(index, { companyName: e.target.value })}
                            placeholder="Google Inc."
                            className="pl-10 bg-accent/50"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">City</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            value={exp.city || ''}
                            onChange={(e) => updateExperience(index, { city: e.target.value })}
                            placeholder="San Francisco"
                            className="pl-10 bg-accent/50"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">State / Country</Label>
                        <Input
                          value={exp.state || ''}
                          onChange={(e) => updateExperience(index, { state: e.target.value })}
                          placeholder="CA, USA"
                          className="bg-accent/50"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">Start Date</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="month"
                            value={exp.startDate || ''}
                            onChange={(e) => updateExperience(index, { startDate: e.target.value })}
                            className="pl-10 bg-accent/50"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1.5 block">End Date</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="month"
                            value={exp.endDate || ''}
                            onChange={(e) => updateExperience(index, { endDate: e.target.value })}
                            placeholder="Present"
                            disabled={exp.currentlyWorking}
                            className="pl-10 bg-accent/50 disabled:opacity-50"
                          />
                        </div>
                        <label className="flex items-center gap-2 mt-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={exp.currentlyWorking || false}
                            onChange={(e) => updateExperience(index, { 
                              currentlyWorking: e.target.checked,
                              endDate: e.target.checked ? '' : exp.endDate
                            })}
                            className="rounded border-border bg-accent text-primary focus:ring-primary"
                          />
                          <span className="text-xs text-muted-foreground">Currently working here</span>
                        </label>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs text-muted-foreground mb-1.5 block">
                          Work Summary & Achievements
                        </Label>
                        <Textarea
                          value={exp.workSummary || ''}
                          onChange={(e) => updateExperience(index, { workSummary: e.target.value })}
                          placeholder="• Led development of key features that increased user engagement by 40%&#10;• Managed a team of 5 engineers and mentored 3 junior developers&#10;• Implemented CI/CD pipeline that reduced deployment time by 60%"
                          className="min-h-[150px] bg-accent/50 resize-none"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1.5">
                          Use bullet points starting with action verbs. Include metrics where possible.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add Button */}
      <Button
        variant="outline"
        onClick={() => {
          addExperience();
          setExpandedIndex(experiences.length);
        }}
        className="w-full gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5 h-12"
      >
        <Plus className="h-4 w-4" /> Add Work Experience
      </Button>
    </div>
  );
}
