import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, cn } from '@ai-resume/ui';
import {
  ArrowLeft,
  ArrowRight,
  Home,
  Save,
  Eye,
  Download,
  Loader2,
  PanelRightOpen,
  ZoomIn,
  ZoomOut,
  Monitor,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResume } from '@/hooks/use-resume';
import { useResumeStore } from '@/stores/resume-store';
import { PersonalDetailForm } from '@/components/editor/PersonalDetailForm';
import { SummaryForm } from '@/components/editor/SummaryForm';
import { ExperienceForm } from '@/components/editor/ExperienceForm';
import { EducationForm } from '@/components/editor/EducationForm';
import { ProfessionalSkillsForm } from '@/components/editor/ProfessionalSkillsForm';
import { SkillsForm } from '@/components/editor/SkillsForm';
import { ResumePreview } from '@/components/preview/ResumePreview';
import { ThemePicker } from '@/components/editor/ThemePicker';
import { toast } from 'sonner';
import { sanitizeRichTextHtml } from '@/lib/richtext-sanitize';

const SECTIONS = [
  { index: 0, label: '基本信息', component: PersonalDetailForm, icon: '01' },
  { index: 1, label: '教育背景', component: EducationForm, icon: '02' },
  { index: 2, label: '专业技能', component: ProfessionalSkillsForm, icon: '03' },
  { index: 3, label: '经历模块', component: ExperienceForm, icon: '04' },
  { index: 4, label: '校园经历', component: SkillsForm, icon: '05' },
  { index: 5, label: '自我评价', component: SummaryForm, icon: '06' },
];

function normalizeResumePayload(raw: any) {
  if (!raw || typeof raw !== 'object') return raw;
  return {
    ...raw,
    firstName: typeof raw.firstName === 'string' ? raw.firstName : '',
    lastName: typeof raw.lastName === 'string' ? raw.lastName : '',
    phone: typeof raw.phone === 'string' ? raw.phone : '',
    email: typeof raw.email === 'string' ? raw.email : '',
    address: typeof raw.address === 'string' ? raw.address : '',
    photoUrl: typeof raw.photoUrl === 'string' ? raw.photoUrl : '',
    targetJobTitle: typeof raw.targetJobTitle === 'string' ? raw.targetJobTitle : '',
    experience: Array.isArray(raw.experience) ? raw.experience : [],
    education: Array.isArray(raw.education) ? raw.education : [],
    skills: Array.isArray(raw.skills) ? raw.skills : [],
    certifications: Array.isArray(raw.certifications) ? raw.certifications : [],
    languages: Array.isArray(raw.languages) ? raw.languages : [],
  };
}

function sanitizeResumeRichText(resume: any) {
  if (!resume || typeof resume !== 'object') return resume;

  const next = { ...resume };
  if (typeof next.summary === 'string') next.summary = sanitizeRichTextHtml(next.summary);
  if (typeof next.targetIndustry === 'string') next.targetIndustry = sanitizeRichTextHtml(next.targetIndustry);
  if (typeof next.atsFeedback === 'string') next.atsFeedback = sanitizeRichTextHtml(next.atsFeedback);
  if (typeof next.targetCompany === 'string') next.targetCompany = sanitizeRichTextHtml(next.targetCompany);

  if (Array.isArray(next.education)) {
    next.education = next.education.map((edu: any) => ({
      ...edu,
      description: typeof edu.description === 'string' ? sanitizeRichTextHtml(edu.description) : edu.description,
    }));
  }

  if (Array.isArray(next.experience)) {
    next.experience = next.experience.map((exp: any) => ({
      ...exp,
      workSummary: typeof exp.workSummary === 'string' ? sanitizeRichTextHtml(exp.workSummary) : exp.workSummary,
    }));
  }

  if (Array.isArray(next.languages)) {
    next.languages = next.languages.map((item: any) =>
      typeof item === 'string' ? sanitizeRichTextHtml(item) : item,
    );
  }

  return next;
}

export function EditResumePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { data: resumeData, isLoading } = useResume(id);

  const { resume, setResume, activeSection, setActiveSection, isDirty, setIsDirty } = useResumeStore();

  const [saving, setSaving] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (resumeData) {
      const normalizedResume =
        (resumeData as { data?: Parameters<typeof setResume>[0] }).data ??
        (resumeData as Parameters<typeof setResume>[0]);
      setResume(normalizeResumePayload(normalizedResume));
    }
  }, [resumeData, setResume]);

  const handleSave = useCallback(
    async (silent = false): Promise<boolean> => {
      if (!id || !resume) return false;
      setSaving(true);
      try {
        const token = await getToken();
        const { api } = await import('@/lib/api');
        await api.resumes.update(id, resume, token);
        setIsDirty(false);
        if (!silent) toast.success('已保存更改');
        return true;
      } catch {
        if (!silent) toast.error('保存失败');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [id, resume, getToken, setIsDirty],
  );

  const goToSection = useCallback(
    async (nextSection: number) => {
      if (saving) return;
      if (isDirty) {
        const ok = await handleSave(true);
        if (!ok) return;
      }
      setActiveSection(nextSection);
    },
    [saving, isDirty, handleSave, setActiveSection],
  );

  const handleZoom = (direction: 'in' | 'out') => {
    setPreviewScale((prev) => {
      if (direction === 'in') return Math.min(prev + 0.1, 1);
      return Math.max(prev - 0.1, 0.3);
    });
  };

  const handleExport = async (normalizeBeforeExport: boolean) => {
    if (!id || !resume) return;
    setExporting(true);
    try {
      const token = await getToken();
      const { api } = await import('@/lib/api');
      const payload = normalizeBeforeExport ? sanitizeResumeRichText(resume) : resume;
      await api.resumes.update(id, payload, token);
      setResume(payload);
      setIsDirty(false);
      setExportDialogOpen(false);
      navigate(`/resume/${id}/view`);
    } catch {
      toast.error('导出前保存失败，请稍后重试');
    } finally {
      setExporting(false);
    }
  };

  const SectionComponent = SECTIONS[activeSection]?.component || PersonalDetailForm;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">正在加载简历...</p>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="text-center px-6">
          <p className="text-sm text-muted-foreground mb-4">简历数据加载失败或为空，暂时无法显示编辑区。</p>
          <Button size="sm" onClick={() => window.location.reload()} className="bg-primary hover:bg-primary/90">
            重新加载
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="glass-strong border-b border-border px-4 py-2 flex items-center justify-between shrink-0 z-40">
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">控制台</span>
            </Button>
          </Link>
          <div className="hidden sm:block h-5 w-px bg-border" />
          <div className="hidden md:flex items-center">
            {SECTIONS.map((s) => (
              <button
                key={s.index}
                onClick={() => {
                  void goToSection(s.index);
                }}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                  activeSection === s.index
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                )}
              >
                <span
                  className={cn(
                    'h-5 w-5 rounded text-[10px] font-bold flex items-center justify-center',
                    activeSection === s.index ? 'bg-white/20' : 'bg-accent',
                  )}
                >
                  {s.icon}
                </span>
                <span className="hidden lg:inline">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={cn(
              'hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300',
              isDirty ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success',
            )}
          >
            <div className={cn('h-2 w-2 rounded-full', isDirty ? 'bg-warning animate-pulse' : 'bg-success')} />
            {isDirty ? '有未保存改动' : '已全部保存'}
          </div>

          <div className="hidden lg:block h-5 w-px bg-border" />

          <div className="hidden lg:flex items-center gap-1 bg-accent rounded-lg p-1">
            <button
              onClick={() => setViewMode('editor')}
              className={cn('p-1.5 rounded-md transition-colors', viewMode === 'editor' ? 'bg-background shadow-sm' : 'hover:bg-background/50')}
              title="仅编辑"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={cn('p-1.5 rounded-md transition-colors', viewMode === 'split' ? 'bg-background shadow-sm' : 'hover:bg-background/50')}
              title="分屏模式"
            >
              <PanelRightOpen className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={cn('p-1.5 rounded-md transition-colors', viewMode === 'preview' ? 'bg-background shadow-sm' : 'hover:bg-background/50')}
              title="仅预览"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>

          <ThemePicker />

          <Link to={`/resume/${id}/view`}>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">预览</span>
            </Button>
          </Link>

          <Button size="sm" onClick={() => void handleSave()} disabled={saving || !isDirty} className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span className="hidden sm:inline">保存</span>
          </Button>
        </div>
      </div>

      <div className="lg:hidden flex border-b border-border">
        <button
          onClick={() => setMobileTab('editor')}
          className={cn('flex-1 py-3 text-sm font-medium text-center transition-colors', mobileTab === 'editor' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground')}
        >
          编辑
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={cn('flex-1 py-3 text-sm font-medium text-center transition-colors', mobileTab === 'preview' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground')}
        >
          预览
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <motion.div
          className={cn('overflow-y-auto', 'hidden lg:block', viewMode === 'editor' && 'lg:flex-1', viewMode === 'split' && 'lg:w-[45%]', viewMode === 'preview' && 'lg:hidden')}
          initial={false}
          animate={{ opacity: viewMode === 'preview' ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-6 lg:p-8 max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <SectionComponent />
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => void goToSection(Math.max(0, activeSection - 1))} disabled={activeSection === 0} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> 上一步
              </Button>

              {activeSection < SECTIONS.length - 1 ? (
                <Button size="sm" onClick={() => void goToSection(Math.min(SECTIONS.length - 1, activeSection + 1))} className="gap-2 bg-primary hover:bg-primary/90">
                  下一步 <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button size="sm" onClick={() => setExportDialogOpen(true)} className="gap-2 bg-primary hover:bg-primary/90">
                  <Download className="h-4 w-4" /> 完成并导出
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        <div className={cn('hidden lg:flex flex-col border-l border-border bg-card/30 overflow-hidden', viewMode === 'editor' && 'lg:hidden', viewMode === 'split' && 'lg:flex-1', viewMode === 'preview' && 'lg:flex-1')}>
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground">实时预览</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleZoom('out')} className="p-1.5 rounded-md hover:bg-accent transition-colors" title="缩小">
                <ZoomOut className="h-4 w-4 text-muted-foreground" />
              </button>
              <span className="text-xs text-muted-foreground w-12 text-center">{Math.round(previewScale * 100)}%</span>
              <button onClick={() => handleZoom('in')} className="p-1.5 rounded-md hover:bg-accent transition-colors" title="放大">
                <ZoomIn className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-6 a4-container">
            <div className="flex justify-center" style={{ transform: `scale(${previewScale})`, transformOrigin: 'top center', minHeight: `${297 * previewScale}mm` }}>
              <ResumePreview />
            </div>
          </div>
        </div>

        <div className={cn('lg:hidden flex-1 overflow-auto p-4 a4-container', mobileTab !== 'preview' && 'hidden')}>
          <div className="flex justify-center">
            <div className="w-full max-w-[400px]">
              <ResumePreview />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>导出前样式处理</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>是否在导出前统一字体、字号和颜色样式？</p>
            <p>选择“统一后导出”会仅在导出前对当前简历富文本做一次标准化，并保存后跳转预览页。</p>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setExportDialogOpen(false)} disabled={exporting}>
              取消
            </Button>
            <Button variant="outline" onClick={() => void handleExport(false)} disabled={exporting}>
              保持原样导出
            </Button>
            <Button onClick={() => void handleExport(true)} disabled={exporting} className="bg-primary hover:bg-primary/90">
              {exporting ? '处理中...' : '统一后导出'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
