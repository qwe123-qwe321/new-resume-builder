import { useState } from 'react';
import { Button, Textarea, Label, cn } from '@ai-resume/ui';
import {
  X,
  FileSearch,
  MessageSquare,
  Globe,
  TrendingUp,
  Loader2,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Target,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAiGenerate, useAiFeedback } from '../../hooks/use-resume';

interface AiPanelProps {
  resumeId: string;
  onClose: () => void;
}

type AiAction = 'analyze_ats' | 'generate_interview_questions' | 'suggest_improvements' | 'translate';

const ACTIONS: { id: AiAction; label: string; description: string; icon: typeof FileSearch }[] = [
  { 
    id: 'analyze_ats', 
    label: 'ATS Analysis', 
    description: 'Check compatibility with applicant tracking systems',
    icon: FileSearch 
  },
  { 
    id: 'generate_interview_questions', 
    label: 'Interview Prep', 
    description: 'Generate personalized interview questions',
    icon: MessageSquare 
  },
  { 
    id: 'suggest_improvements', 
    label: 'Smart Suggestions', 
    description: 'Get AI-powered improvement recommendations',
    icon: TrendingUp 
  },
  { 
    id: 'translate', 
    label: 'Translate Resume', 
    description: 'Translate your resume to other languages',
    icon: Globe 
  },
];

function scoreColor(score: number) {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-destructive';
}

function scoreBgColor(score: number) {
  if (score >= 80) return 'bg-success';
  if (score >= 60) return 'bg-warning';
  return 'bg-destructive';
}

function scoreGradient(score: number) {
  if (score >= 80) return 'from-success/20 to-success/5';
  if (score >= 60) return 'from-warning/20 to-warning/5';
  return 'from-destructive/20 to-destructive/5';
}

const LANGUAGES = [
  { code: 'zh', label: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', label: 'Korean', flag: '🇰🇷' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
  { code: 'de', label: 'German', flag: '🇩🇪' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
];

export function AiPanel({ resumeId, onClose }: AiPanelProps) {
  const aiGenerate = useAiGenerate();
  const aiFeedback = useAiFeedback();

  const [activeAction, setActiveAction] = useState<AiAction | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('zh');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    if (!activeAction) return;
    setLoading(true);
    setResult(null);

    aiGenerate.mutate(
      {
        resumeId,
        action: activeAction,
        targetJobDescription: jobDescription || undefined,
        targetLanguage: activeAction === 'translate' ? targetLanguage : undefined,
      },
      {
        onSuccess: (data) => {
          setResult((data as { data: { result: Record<string, unknown> } }).data.result);
          setLoading(false);
        },
        onError: () => setLoading(false),
      },
    );
  };

  const handleFeedback = (liked: boolean) => {
    aiFeedback.mutate({
      resumeId,
      action: activeAction || '',
      liked,
      originalOutput: JSON.stringify(result),
    });
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Powered by GPT-4</p>
          </div>
        </div>
        <button 
          type="button" 
          onClick={onClose} 
          className="p-2 rounded-lg hover:bg-accent transition-colors" 
          aria-label="Close"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Action Selector */}
      <div className="p-4 space-y-2">
        {ACTIONS.map((action) => (
          <button
            type="button"
            key={action.id}
            onClick={() => {
              setActiveAction(action.id);
              setResult(null);
            }}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200',
              activeAction === action.id
                ? 'bg-primary/10 border-2 border-primary/30 shadow-lg shadow-primary/5'
                : 'bg-accent/30 border-2 border-transparent hover:bg-accent hover:border-border',
            )}
          >
            <div className={cn(
              'h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors',
              activeAction === action.id ? 'bg-primary/20' : 'bg-accent'
            )}>
              <action.icon className={cn(
                'h-5 w-5',
                activeAction === action.id ? 'text-primary' : 'text-muted-foreground',
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm font-medium',
                activeAction === action.id ? 'text-primary' : 'text-foreground'
              )}>
                {action.label}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {action.description}
              </p>
            </div>
            <ChevronRight className={cn(
              'h-4 w-4 transition-transform',
              activeAction === action.id ? 'text-primary rotate-90' : 'text-muted-foreground'
            )} />
          </button>
        ))}
      </div>

      {/* Action Input */}
      <AnimatePresence>
        {activeAction && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4 border-t border-border overflow-hidden"
          >
            <div className="pt-4">
              {activeAction === 'analyze_ats' && (
                <div>
                  <Label className="text-xs font-medium text-foreground mb-2 block">
                    Paste Job Description
                  </Label>
                  <Textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here to analyze how well your resume matches..."
                    className="min-h-[120px] bg-accent/50 resize-none text-sm"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    We will analyze your resume against this job posting
                  </p>
                </div>
              )}
              
              {activeAction === 'translate' && (
                <div>
                  <Label className="text-xs font-medium text-foreground mb-2 block">
                    Target Language
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setTargetLanguage(lang.code)}
                        className={cn(
                          'p-2.5 rounded-lg text-center transition-all',
                          targetLanguage === lang.code
                            ? 'bg-primary/10 border-2 border-primary/30'
                            : 'bg-accent border-2 border-transparent hover:border-border'
                        )}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <p className="text-[10px] mt-1 text-muted-foreground">{lang.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleRun}
                disabled={loading || (activeAction === 'analyze_ats' && !jobDescription.trim())}
                className="w-full mt-4 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Run Analysis
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <div className="h-4 w-3/4 rounded bg-accent animate-pulse" />
              <div className="h-4 w-full rounded bg-accent animate-pulse" />
              <div className="h-4 w-2/3 rounded bg-accent animate-pulse" />
              <div className="h-20 w-full rounded-xl bg-accent animate-pulse mt-4" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* ATS Analysis Result */}
              {activeAction === 'analyze_ats' && result && (
                <div className="space-y-4">
                  {/* Score Card */}
                  <div className={cn(
                    'p-5 rounded-2xl bg-gradient-to-br text-center',
                    scoreGradient((result as Record<string, unknown>).score as number)
                  )}>
                    <div className={cn(
                      'text-5xl font-bold mb-1',
                      scoreColor((result as Record<string, unknown>).score as number)
                    )}>
                      {(result as Record<string, unknown>).score as number}
                    </div>
                    <p className="text-sm text-muted-foreground">ATS Compatibility Score</p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      {(result as Record<string, unknown>).score as number >= 80 ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-warning" />
                      )}
                      <span className="text-xs">
                        {(result as Record<string, unknown>).score as number >= 80 
                          ? 'Excellent match!' 
                          : 'Room for improvement'}
                      </span>
                    </div>
                  </div>

                  {/* Feedback */}
                  <p className="text-sm text-muted-foreground">
                    {(result as Record<string, unknown>).overallFeedback as string}
                  </p>

                  {/* Section Scores */}
                  {((result as Record<string, unknown>).sections as Record<string, { score: number; feedback: string }>) && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Section Breakdown
                      </h4>
                      {Object.entries((result as Record<string, unknown>).sections as Record<string, { score: number; feedback: string }>).map(([key, val]) => (
                        <div key={key} className="glass rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium capitalize">{key}</span>
                            <span className={cn('text-sm font-bold', scoreColor(val.score))}>
                              {val.score}%
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-accent overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${val.score}%` }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                              className={cn('h-full rounded-full', scoreBgColor(val.score))}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Missing Keywords */}
                  {Array.isArray((result as Record<string, unknown>).missingKeywords) && 
                   ((result as Record<string, unknown>).missingKeywords as unknown[]).length > 0 && (
                    <div className="glass rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="h-4 w-4 text-destructive" />
                        <h4 className="text-sm font-medium">Missing Keywords</h4>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {((result as Record<string, unknown>).missingKeywords as string[]).map((kw: string) => (
                          <span 
                            key={kw} 
                            className="px-2.5 py-1 rounded-md text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Interview Questions Result */}
              {activeAction === 'generate_interview_questions' && result && (
                <div className="space-y-4">
                  {Object.entries(result as Record<string, unknown>).map(([category, questions]) => {
                    if (category === 'selfIntroduction') {
                      return (
                        <div key={category} className="glass rounded-xl p-4">
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-primary" />
                            Self Introduction
                          </h4>
                          <p className="text-sm text-muted-foreground">{questions as string}</p>
                        </div>
                      );
                    }
                    if (Array.isArray(questions)) {
                      return (
                        <div key={category}>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            {category.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <div className="space-y-2">
                            {questions.map((q: { question: string; context?: string; suggested_answer_framework?: string }, i: number) => (
                              <div key={i} className="glass rounded-lg p-3">
                                <p className="text-sm font-medium text-foreground">{q.question}</p>
                                {q.suggested_answer_framework && (
                                  <p className="text-xs text-muted-foreground mt-2 pl-3 border-l-2 border-primary/30">
                                    {q.suggested_answer_framework}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}

              {/* Suggestions Result */}
              {activeAction === 'suggest_improvements' && result && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {((result as Record<string, unknown>).overallAssessment as string)}
                  </p>
                  {Array.isArray((result as Record<string, unknown>).improvements) && 
                   ((result as Record<string, unknown>).improvements as Array<{
                     section: string; issue: string; suggestion: string; example: string;
                   }>).map((imp, i) => (
                    <div key={i} className="glass rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                          {imp.section}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">{imp.issue}</p>
                      <p className="text-xs text-muted-foreground">{imp.suggestion}</p>
                      {imp.example && (
                        <p className="text-xs text-success mt-2 pl-3 border-l-2 border-success/30 italic">
                          {imp.example}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Translation Result */}
              {activeAction === 'translate' && result && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      Translated to {LANGUAGES.find(l => l.code === targetLanguage)?.label}
                    </span>
                  </div>
                  {((result as Record<string, unknown>).translatedFields as Record<string, string>) && 
                   Object.entries((result as Record<string, unknown>).translatedFields as Record<string, string>).map(([key, val]) => (
                    <div key={key} className="glass rounded-lg p-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                        {key}
                      </p>
                      <p className="text-sm text-foreground">{val}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Feedback */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <span className="text-xs text-muted-foreground">Was this helpful?</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback(true)}
                    className="h-8 w-8 p-0 hover:bg-success/10 hover:text-success"
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback(false)}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!activeAction && !loading && !result && (
          <div className="text-center py-8">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h4 className="text-sm font-medium text-foreground mb-1">
              Select an AI Tool
            </h4>
            <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
              Choose from the options above to get AI-powered insights for your resume
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
