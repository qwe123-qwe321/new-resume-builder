import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Button } from '@ai-resume/ui';
import {
  ArrowLeft,
  ArrowRight,
  Home,
  Save,
  Sparkles,
  Eye,
  Download,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResume } from '@/hooks/use-resume';
import { useResumeStore } from '@/stores/resume-store';
import { PersonalDetailForm } from '@/components/editor/PersonalDetailForm';
import { SummaryForm } from '@/components/editor/SummaryForm';
import { ExperienceForm } from '@/components/editor/ExperienceForm';
import { EducationForm } from '@/components/editor/EducationForm';
import { SkillsForm } from '@/components/editor/SkillsForm';
import { ResumePreview } from '@/components/preview/ResumePreview';
import { AiPanel } from '@/components/ai/AiPanel';
import { ThemePicker } from '@/components/editor/ThemePicker';
import { cn } from '@ai-resume/ui';
import { toast } from 'sonner';

const SECTIONS = [
  { index: 0, label: 'Personal', component: PersonalDetailForm },
  { index: 1, label: 'Summary', component: SummaryForm },
  { index: 2, label: 'Experience', component: ExperienceForm },
  { index: 3, label: 'Education', component: EducationForm },
  { index: 4, label: 'Skills', component: SkillsForm },
];

export function EditResumePage() {
  const { id } = useParams<{ id: string }>();
  const { getToken } = useAuth();
  const { data: resumeData, isLoading } = useResume(id);

  const {
    resume,
    setResume,
    activeSection,
    setActiveSection,
    isAiPanelOpen,
    toggleAiPanel,
    isDirty,
    setIsDirty,
  } = useResumeStore();

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (resumeData) {
      setResume(resumeData as Parameters<typeof setResume>[0]);
    }
  }, [resumeData, setResume]);

  // Auto-save
  useEffect(() => {
    if (!isDirty || !id) return;
    const timer = setTimeout(() => {
      handleSave();
    }, 5000);
    return () => clearTimeout(timer);
  }, [resume, isDirty, id]);

  const handleSave = useCallback(async () => {
    if (!id || !resume) return;
    setSaving(true);
    try {
      const token = await getToken();
      const { api } = await import('@/lib/api');
      await api.resumes.update(id, { data: resume }, token);
      setIsDirty(false);
    } catch (err) {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  }, [id, resume, getToken, setIsDirty]);

  const SectionComponent = SECTIONS[activeSection]?.component || PersonalDetailForm;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="glass sticky top-0 z-40 border-b border-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <Home className="h-4 w-4" />
            </Button>
          </Link>

          {/* Section Tabs */}
          <div className="flex items-center gap-0.5 bg-accent/50 rounded-lg p-0.5 ml-4">
            {SECTIONS.map((s) => (
              <button
                key={s.index}
                onClick={() => setActiveSection(s.index)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  activeSection === s.index
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Save indicator */}
          <span className={cn(
            'text-xs flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors',
            isDirty ? 'text-yellow-400 bg-yellow-400/10' : 'text-green-400 bg-green-400/10',
          )}>
            <div className={cn(
              'h-1.5 w-1.5 rounded-full',
              isDirty ? 'bg-yellow-400 animate-pulse' : 'bg-green-400',
            )} />
            {isDirty ? 'Unsaved' : 'Saved'}
          </span>

          <ThemePicker />

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAiPanel}
            className={cn(isAiPanelOpen && 'bg-primary/10 text-primary')}
          >
            <Sparkles className="h-4 w-4" />
          </Button>

          <Link to={`/resume/${id}/view`} target="_blank">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Main Content: Editor + Preview + AI Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panel */}
        <motion.div
          className="flex-1 overflow-y-auto p-6"
          animate={{ width: isAiPanelOpen ? '40%' : '50%' }}
          transition={{ duration: 0.2 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
            >
              <SectionComponent />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
              disabled={activeSection === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Previous
            </Button>

            {activeSection < SECTIONS.length - 1 ? (
              <Button
                size="sm"
                onClick={() => setActiveSection(Math.min(SECTIONS.length - 1, activeSection + 1))}
                className="gap-2"
              >
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Link to={`/resume/${id}/view`}>
                <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                  <Download className="h-4 w-4" /> Finish & Export
                </Button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Preview Panel */}
        <div className="w-[50%] border-l border-border bg-card/30 overflow-y-auto p-6">
          <ResumePreview />
        </div>

        {/* AI Panel — slide in from right */}
        <AnimatePresence>
          {isAiPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l border-border bg-card overflow-y-auto"
            >
              <AiPanel resumeId={id!} onClose={toggleAiPanel} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
