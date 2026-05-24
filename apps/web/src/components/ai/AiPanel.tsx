import { useState } from 'react';
import { Button, Textarea, Label, cn } from '@ai-resume/ui';
import {
  X,
  FileSearch,
  MessageSquare,
  Globe,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAiGenerate, useAiFeedback } from '../../hooks/use-resume';

interface AiPanelProps {
  resumeId: string;
  onClose: () => void;
}

type AiAction = 'analyze_ats' | 'generate_interview_questions' | 'suggest_improvements' | 'translate';

const ACTIONS: { id: AiAction; label: string; icon: typeof FileSearch }[] = [
  { id: 'analyze_ats', label: 'ATS Analysis', icon: FileSearch },
  { id: 'generate_interview_questions', label: 'Interview Questions', icon: MessageSquare },
  { id: 'suggest_improvements', label: 'Suggestions', icon: TrendingUp },
  { id: 'translate', label: 'Translate', icon: Globe },
];

function scoreColor(score: number) {
  if (score > 70) return 'text-green-500';
  if (score > 40) return 'text-yellow-500';
  return 'text-red-500';
}

function scoreBgColor(score: number) {
  if (score > 70) return 'bg-green-500';
  if (score > 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

const LANGUAGES = [
  { code: 'zh', label: 'Chinese' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'es', label: 'Spanish' },
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
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-sm">Tools</h3>
        <button type="button" onClick={onClose} className="p-1 rounded hover:bg-accent transition-colors" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4 space-y-1.5">
        {ACTIONS.map((action) => (
          <button
            type="button"
            key={action.id}
            onClick={() => {
              setActiveAction(action.id);
              setResult(null);
            }}
            className={cn(
              'w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors',
              activeAction === action.id
                ? 'bg-primary/10 border border-primary/30'
                : 'hover:bg-accent border border-transparent',
            )}
          >
            <action.icon className={cn(
              'h-4 w-4',
              activeAction === action.id ? 'text-primary' : 'text-muted-foreground',
            )} />
            <span className="text-sm font-medium">{action.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {activeAction && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4 border-b border-border overflow-hidden"
          >
            {activeAction === 'analyze_ats' && (
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Job Description</Label>
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description..."
                  className="min-h-30 text-sm"
                />
              </div>
            )}
            {activeAction === 'translate' && (
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Target Language</Label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full rounded-lg bg-accent border border-border px-3 py-2 text-sm text-foreground"
                  aria-label="Target language"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
              </div>
            )}

            <Button
              onClick={handleRun}
              disabled={loading || (activeAction === 'analyze_ats' && !jobDescription)}
              className="w-full mt-3 bg-primary hover:bg-primary/90"
              size="sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Run'
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto p-4">
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
              <div className="h-4 w-5/6 rounded bg-accent animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {activeAction === 'analyze_ats' && result && (
                <div className="space-y-4">
                  <div className="text-center p-4 rounded-xl bg-accent/50">
                    <div
                      className={cn('text-3xl font-bold', scoreColor((result as Record<string, unknown>).score as number))}
                    >
                      {(result as Record<string, unknown>).score as number}/100
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">ATS Score</p>
                  </div>

                  <p className="text-sm">{(result as Record<string, unknown>).overallFeedback as string}</p>

                  {((result as Record<string, unknown>).sections as Record<string, { score: number; feedback: string }>) && (
                    <div className="space-y-2">
                      {Object.entries((result as Record<string, unknown>).sections as Record<string, { score: number; feedback: string }>).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-3 text-sm">
                          <div className="w-16 text-xs text-muted-foreground capitalize">{key}</div>
                          <div className="flex-1 h-2 rounded-full bg-accent overflow-hidden">
                            <div
                              className={cn('h-full rounded-full transition-all', scoreBgColor(val.score))}
                              style={{ width: `${val.score}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono w-8">{val.score}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {Array.isArray((result as Record<string, unknown>).missingKeywords) && ((result as Record<string, unknown>).missingKeywords as unknown[]).length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Missing Keywords</p>
                      <div className="flex flex-wrap gap-1.5">
                        {((result as Record<string, unknown>).missingKeywords as string[]).map((kw: string) => (
                          <span key={kw} className="px-2 py-0.5 rounded-md text-xs bg-red-500/10 text-red-400">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeAction === 'generate_interview_questions' && result && (
                <div className="space-y-4">
                  {Object.entries(result as Record<string, unknown>).map(([category, questions]) => {
                    if (category === 'selfIntroduction') {
                      return (
                        <div key={category}>
                          <h4 className="text-sm font-semibold mb-2 capitalize">Self Introduction</h4>
                          <p className="text-sm text-muted-foreground">{questions as string}</p>
                        </div>
                      );
                    }
                    if (Array.isArray(questions)) {
                      return (
                        <div key={category}>
                          <h4 className="text-sm font-semibold mb-2 capitalize">
                            {category.replace(/([A-Z])/g, ' $1').trim()} Questions
                          </h4>
                          <div className="space-y-3">
                            {questions.map((q: { question: string; context?: string; suggested_answer_framework?: string }, i: number) => (
                              <div key={i} className="p-3 rounded-lg bg-accent/50">
                                <p className="text-sm font-medium">{q.question}</p>
                                {q.suggested_answer_framework && (
                                  <p className="text-xs text-muted-foreground mt-1.5">{q.suggested_answer_framework}</p>
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

              {activeAction === 'suggest_improvements' && result && (
                <div className="space-y-4">
                  <p className="text-sm">{((result as Record<string, unknown>).overallAssessment as string)}</p>
                  {Array.isArray((result as Record<string, unknown>).improvements) && ((result as Record<string, unknown>).improvements as Array<{
                    section: string; issue: string; suggestion: string; example: string;
                  }>).map((imp, i) => (
                    <div key={i} className="p-3 rounded-lg bg-accent/50">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary/20 text-primary">
                          {imp.section}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{imp.issue}</p>
                      <p className="text-xs text-muted-foreground mt-1">{imp.suggestion}</p>
                      {imp.example && (
                        <p className="text-xs text-green-400 mt-1 italic">{imp.example}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeAction === 'translate' && result && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">Translated to {targetLanguage.toUpperCase()}</p>
                  {((result as Record<string, unknown>).translatedFields as Record<string, string>) && Object.entries((result as Record<string, unknown>).translatedFields as Record<string, string>).map(([key, val]) => (
                    <div key={key} className="p-3 rounded-lg bg-accent/50">
                      <p className="text-xs text-muted-foreground capitalize mb-1">{key}</p>
                      <p className="text-sm">{val}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">Was this helpful?</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback(true)}
                  className="h-8 w-8 p-0"
                  aria-label="Thumbs up"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback(false)}
                  className="h-8 w-8 p-0"
                  aria-label="Thumbs down"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"/></svg>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
