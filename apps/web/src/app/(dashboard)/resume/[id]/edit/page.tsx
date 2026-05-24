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
  PanelRightOpen,
  PanelRightClose,
  ZoomIn,
  ZoomOut,
  Monitor,
  Smartphone,
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
  { index: 0, label: 'Personal', component: PersonalDetailForm, icon: '01' },
  { index: 1, label: 'Summary', component: SummaryForm, icon: '02' },
  { index: 2, label: 'Experience', component: ExperienceForm, icon: '03' },
  { index: 3, label: 'Education', component: EducationForm, icon: '04' },
  { index: 4, label: 'Skills', component: SkillsForm, icon: '05' },
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
  const [previewScale, setPreviewScale] = useState(0.6);
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

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
      toast.success('Changes saved');
    } catch (err) {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  }, [id, resume, getToken, setIsDirty]);

  const handleZoom = (direction: 'in' | 'out') => {
    setPreviewScale(prev => {
      if (direction === 'in') return Math.min(prev + 0.1, 1);
      return Math.max(prev - 0.1, 0.3);
    });
  };

  const SectionComponent = SECTIONS[activeSection]?.component || PersonalDetailForm;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading resume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top Toolbar */}
      <div className="glass-strong border-b border-border px-4 py-2 flex items-center justify-between shrink-0 z-40">
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>

          <div className="hidden sm:block h-5 w-px bg-border" />

          {/* Section Steps - Desktop */}
          <div className="hidden md:flex items-center">
            {SECTIONS.map((s, i) => (
              <button
                key={s.index}
                onClick={() => setActiveSection(s.index)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                  activeSection === s.index
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                )}
              >
                <span className={cn(
                  'h-5 w-5 rounded text-[10px] font-bold flex items-center justify-center',
                  activeSection === s.index 
                    ? 'bg-white/20' 
                    : 'bg-accent'
                )}>
                  {s.icon}
                </span>
                <span className="hidden lg:inline">{s.label}</span>
              </button>
            ))}
          </div>

          {/* Section Dropdown - Mobile */}
          <div className="md:hidden">
            <select
              value={activeSection}
              onChange={(e) => setActiveSection(Number(e.target.value))}
              className="bg-accent border border-border rounded-lg px-3 py-1.5 text-sm text-foreground"
            >
              {SECTIONS.map((s) => (
                <option key={s.index} value={s.index}>
                  {s.icon} {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Save Status */}
          <div className={cn(
            'hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300',
            isDirty 
              ? 'bg-warning/10 text-warning' 
              : 'bg-success/10 text-success',
          )}>
            <div className={cn(
              'h-2 w-2 rounded-full',
              isDirty ? 'bg-warning animate-pulse' : 'bg-success',
            )} />
            {isDirty ? 'Unsaved changes' : 'All changes saved'}
          </div>

          <div className="hidden lg:block h-5 w-px bg-border" />

          {/* View Mode Toggle - Desktop */}
          <div className="hidden lg:flex items-center gap-1 bg-accent rounded-lg p-1">
            <button
              onClick={() => setViewMode('editor')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'editor' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              )}
              title="Editor only"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'split' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              )}
              title="Split view"
            >
              <PanelRightOpen className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'preview' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              )}
              title="Preview only"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>

          <ThemePicker />

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAiPanel}
            className={cn(
              'gap-2 transition-all duration-200',
              isAiPanelOpen 
                ? 'bg-primary/10 text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Sparkles className={cn('h-4 w-4', isAiPanelOpen && 'animate-pulse')} />
            <span className="hidden sm:inline">AI</span>
          </Button>

          <Link to={`/resume/${id}/view`} target="_blank">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Save</span>
          </Button>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex border-b border-border">
        <button
          onClick={() => setMobileTab('editor')}
          className={cn(
            'flex-1 py-3 text-sm font-medium text-center transition-colors',
            mobileTab === 'editor' 
              ? 'text-primary border-b-2 border-primary bg-primary/5' 
              : 'text-muted-foreground'
          )}
        >
          Editor
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={cn(
            'flex-1 py-3 text-sm font-medium text-center transition-colors',
            mobileTab === 'preview' 
              ? 'text-primary border-b-2 border-primary bg-primary/5' 
              : 'text-muted-foreground'
          )}
        >
          Preview
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panel */}
        <motion.div
          className={cn(
            'overflow-y-auto',
            // Desktop
            'hidden lg:block',
            viewMode === 'editor' && 'lg:flex-1',
            viewMode === 'split' && 'lg:w-[45%]',
            viewMode === 'preview' && 'lg:hidden',
          )}
          initial={false}
          animate={{ 
            opacity: viewMode === 'preview' ? 0 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-6 lg:p-8 max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <SectionComponent />
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
                disabled={activeSection === 0}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </Button>

              {activeSection < SECTIONS.length - 1 ? (
                <Button
                  size="sm"
                  onClick={() => setActiveSection(Math.min(SECTIONS.length - 1, activeSection + 1))}
                  className="gap-2 bg-primary hover:bg-primary/90"
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
          </div>
        </motion.div>

        {/* Mobile Editor */}
        <div className={cn(
          'lg:hidden flex-1 overflow-y-auto',
          mobileTab !== 'editor' && 'hidden'
        )}>
          <div className="p-4">
            <SectionComponent />
            
            <div className="flex justify-between mt-6 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
                disabled={activeSection === 0}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              {activeSection < SECTIONS.length - 1 ? (
                <Button
                  size="sm"
                  onClick={() => setActiveSection(Math.min(SECTIONS.length - 1, activeSection + 1))}
                  className="bg-primary hover:bg-primary/90"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setMobileTab('preview')}
                  className="bg-primary hover:bg-primary/90"
                >
                  View Preview
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Preview Panel - Desktop */}
        <div className={cn(
          'hidden lg:flex flex-col border-l border-border bg-card/30 overflow-hidden',
          viewMode === 'editor' && 'lg:hidden',
          viewMode === 'split' && 'lg:flex-1',
          viewMode === 'preview' && 'lg:flex-1',
        )}>
          {/* Preview Controls */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
            <span className="text-xs font-medium text-muted-foreground">Live Preview</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleZoom('out')}
                className="p-1.5 rounded-md hover:bg-accent transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="h-4 w-4 text-muted-foreground" />
              </button>
              <span className="text-xs text-muted-foreground w-12 text-center">
                {Math.round(previewScale * 100)}%
              </span>
              <button
                onClick={() => handleZoom('in')}
                className="p-1.5 rounded-md hover:bg-accent transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* A4 Preview Container */}
          <div className="flex-1 overflow-auto p-6 a4-container">
            <div 
              className="flex justify-center"
              style={{ 
                transform: `scale(${previewScale})`,
                transformOrigin: 'top center',
                minHeight: `${297 * previewScale}mm`,
              }}
            >
              <ResumePreview />
            </div>
          </div>
        </div>

        {/* Mobile Preview */}
        <div className={cn(
          'lg:hidden flex-1 overflow-auto p-4 a4-container',
          mobileTab !== 'preview' && 'hidden'
        )}>
          <div className="flex justify-center">
            <div className="w-full max-w-[400px]">
              <ResumePreview />
            </div>
          </div>
        </div>

        {/* AI Panel */}
        <AnimatePresence>
          {isAiPanelOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="hidden lg:block border-l border-border bg-card overflow-hidden shrink-0"
            >
              <AiPanel resumeId={id!} onClose={toggleAiPanel} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
