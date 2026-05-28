import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Textarea } from '@ai-resume/ui';
import { ArrowLeft, Loader2, SearchCheck, MessageSquare, Languages, TrendingUp } from 'lucide-react';
import { useAiGenerateAsync, useAiJob } from '@/hooks/use-resume';

type TaskKey = 'analyze_ats' | 'generate_interview_questions' | 'suggest_improvements' | 'translate';
type JsonRecord = Record<string, unknown>;

const TASKS: { key: TaskKey; label: string; icon: typeof SearchCheck; description: string }[] = [
  { key: 'analyze_ats', label: 'ATS 匹配分析', icon: SearchCheck, description: '根据目标岗位描述进行匹配分析' },
  { key: 'generate_interview_questions', label: '面试题准备', icon: MessageSquare, description: '生成中国求职背景下的 HR 面 + 技术面深挖问题' },
  { key: 'suggest_improvements', label: '简历优化建议', icon: TrendingUp, description: '给出可执行的中文优化建议' },
  { key: 'translate', label: '简历翻译', icon: Languages, description: '中英文互切换' },
];

export function ResumeAiWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const aiGenerateAsync = useAiGenerateAsync();

  const [jobDescription, setJobDescription] = useState('');
  const [targetLanguage, setTargetLanguage] = useState<'zh' | 'en'>('en');
  const [results, setResults] = useState<Partial<Record<TaskKey, unknown>>>({});
  const [jobs, setJobs] = useState<Partial<Record<TaskKey, string>>>({});
  const [jobToTask, setJobToTask] = useState<Record<string, TaskKey>>({});
  const [taskMeta, setTaskMeta] = useState<Partial<Record<TaskKey, { submittedAt?: string; finishedAt?: string; error?: string }>>>({});
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [loadingKey, setLoadingKey] = useState<TaskKey | null>(null);
  const { data: activeJobData } = useAiJob(activeJobId);

  const loading = useMemo(() => loadingKey !== null, [loadingKey]);
  const jobStatusMap = useMemo(() => {
    const out: Partial<Record<TaskKey, { status?: string; error?: string }>> = {};
    if (activeJobId && activeJobData) {
      const task = jobToTask[activeJobId];
      if (task) {
        out[task] = {
          status: (activeJobData as { status?: string }).status,
          error: (activeJobData as { error?: string }).error,
        };
      }
    }
    return out;
  }, [activeJobId, activeJobData, jobToTask]);

  useEffect(() => {
    const status = (activeJobData as { status?: string; result?: unknown } | undefined)?.status;
    if (!activeJobId || !activeJobData || (status !== 'done' && status !== 'failed')) return;
    const task = jobToTask[activeJobId];
    if (!task) return;
    if (status === 'done') {
      const result = (activeJobData as { result?: unknown }).result;
      if (result) setResults((prev) => ({ ...prev, [task]: result }));
    }
    setTaskMeta((prev) => ({
      ...prev,
      [task]: {
        ...(prev[task] || {}),
        finishedAt: new Date().toISOString(),
        error: status === 'failed' ? String((activeJobData as { error?: unknown }).error || '任务失败') : undefined,
      },
    }));
    setLoadingKey((prev) => (prev === task ? null : prev));
    setActiveJobId(null);
  }, [activeJobId, activeJobData, jobToTask]);

  const runTask = (task: TaskKey) => {
    if (!id) return;
    setLoadingKey(task);
    aiGenerateAsync.mutate(
      {
        resumeId: id,
        action: task,
        targetJobDescription: jobDescription || undefined,
        targetLanguage: task === 'translate' ? targetLanguage : undefined,
      },
      {
        onSuccess: (data) => {
          const jobId = (data as { data?: { jobId?: string } }).data?.jobId;
          if (!jobId) return;
          setJobs((prev) => ({ ...prev, [task]: jobId }));
          setJobToTask((prev) => ({ ...prev, [jobId]: task }));
          setTaskMeta((prev) => ({
            ...prev,
            [task]: { submittedAt: new Date().toISOString(), finishedAt: undefined, error: undefined },
          }));
          setActiveJobId(jobId);
        },
        onError: () => setLoadingKey(null),
      },
    );
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate(`/resume/${id}/view`)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> 返回简历预览
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">AI 简历工作台</h1>
        <div />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        <aside className="glass rounded-xl p-5 h-fit space-y-4">
          <div>
            <p className="text-sm font-semibold mb-2">目标岗位描述（用于 ATS / 面试题）</p>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="请粘贴岗位 JD，越完整越好。"
              className="min-h-36 text-sm"
            />
          </div>
          <div>
            <p className="text-sm font-semibold mb-2">翻译方向</p>
            <div className="flex gap-2">
              <Button variant={targetLanguage === 'en' ? 'default' : 'outline'} size="sm" onClick={() => setTargetLanguage('en')}>中文 {'->'} 英文</Button>
              <Button variant={targetLanguage === 'zh' ? 'default' : 'outline'} size="sm" onClick={() => setTargetLanguage('zh')}>英文 {'->'} 中文</Button>
            </div>
          </div>
          <div className="space-y-2">
            {TASKS.map((task) => (
              <Button
                key={task.key}
                onClick={() => runTask(task.key)}
                disabled={loading}
                className="w-full justify-start gap-2 bg-primary hover:bg-primary/90"
              >
                {loadingKey === task.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <task.icon className="h-4 w-4" />}
                {task.label}
              </Button>
            ))}
          </div>
        </aside>

        <main className="space-y-4">
          {TASKS.map((task) => (
            <section key={task.key} className="glass rounded-xl p-5">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <task.icon className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold">{task.label}</h2>
                </div>
                <StatusBadge status={loadingKey === task.key ? 'running' : (jobStatusMap[task.key]?.status || (jobs[task.key] ? 'queued' : 'idle'))} />
              </div>
              <p className="text-xs text-muted-foreground mb-3">{task.description}</p>
              <div className="rounded-lg border border-border bg-background p-4 min-h-36 whitespace-pre-wrap text-sm leading-6">
                {results[task.key] ? <ResultRenderer task={task.key} data={results[task.key]} /> : '暂无内容，点击左侧按钮开始生成。'}
              </div>
              <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between gap-3">
                <div>
                  {taskMeta[task.key]?.submittedAt ? `提交：${formatTime(taskMeta[task.key]?.submittedAt)}` : '未提交'}
                  {taskMeta[task.key]?.finishedAt ? ` ｜ 完成：${formatTime(taskMeta[task.key]?.finishedAt)}` : ''}
                  {(taskMeta[task.key]?.error || jobStatusMap[task.key]?.error) ? ` ｜ 错误：${String(taskMeta[task.key]?.error || jobStatusMap[task.key]?.error)}` : ''}
                </div>
                {(taskMeta[task.key]?.error || jobStatusMap[task.key]?.error) && (
                  <Button size="sm" variant="outline" onClick={() => runTask(task.key)}>
                    重试
                  </Button>
                )}
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}

function ResultRenderer({ task, data }: { task: TaskKey; data: unknown }) {
  const d = (data || {}) as JsonRecord;

  if (task === 'analyze_ats') {
    const score = Number((d.atsScore ?? d.score ?? 0) as number);
    const missing = ((d.missingKeywords ?? []) as unknown[]).map(String);
    const rec = ((d.recommendations ?? []) as unknown[]).map(String);
    return (
      <div className="space-y-3">
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold">{score}</span>
          <span className="text-sm text-muted-foreground">/ 100</span>
        </div>
        <p className="text-sm text-muted-foreground">匹配等级：{String(d.matchLevel ?? '未知')}</p>
        {missing.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">缺失关键词</p>
            <div className="flex flex-wrap gap-1">
              {missing.map((item) => <span key={item} className="px-2 py-0.5 rounded bg-destructive/10 text-destructive text-xs">{item}</span>)}
            </div>
          </div>
        )}
        {rec.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">优化建议</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {rec.map((item, idx) => <li key={`${item}-${idx}`}>{item}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (task === 'generate_interview_questions') {
    const tech = ((d.technicalQuestions ?? d.technical_questions ?? []) as unknown[]);
    const beh = ((d.behavioralQuestions ?? d.behavioral_questions ?? []) as unknown[]);
    const role = ((d.roleSpecificQuestions ?? d.role_specific_questions ?? []) as unknown[]);
    return (
      <div className="space-y-4">
        <QuestionSection title="HR 面（中国求职场景）" items={beh} />
        <QuestionSection title="技术面（深挖简历与岗位）" items={tech} />
        <QuestionSection title="岗位专项追问" items={role} />
      </div>
    );
  }

  if (task === 'suggest_improvements') {
    const strengths = ((d.strengths ?? []) as unknown[]).map(String);
    const weaknesses = ((d.weaknesses ?? []) as unknown[]).map(String);
    const wins = ((d.quickWins ?? d.quick_wins ?? []) as unknown[]).map(String);
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">整体评分：{String(d.overallScore ?? d.overall_score ?? '-')}</p>
        <ListBlock title="优势亮点" items={strengths} />
        <ListBlock title="短板风险" items={weaknesses} />
        <ListBlock title="快速优化动作" items={wins} />
      </div>
    );
  }

  if (task === 'translate') {
    const fields = (d.translatedFields ?? d) as JsonRecord;
    return (
      <div className="space-y-2">
        {Object.entries(fields).map(([k, v]) => (
          <div key={k} className="border border-border rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">{k}</p>
            <p className="text-sm whitespace-pre-wrap">{String(v ?? '')}</p>
          </div>
        ))}
      </div>
    );
  }

  return <pre className="text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>;
}

function formatTime(iso?: string) {
  if (!iso) return '-';
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { text: string; cls: string }> = {
    idle: { text: '未开始', cls: 'bg-muted text-muted-foreground' },
    queued: { text: '排队中', cls: 'bg-amber-100 text-amber-700' },
    running: { text: '执行中', cls: 'bg-blue-100 text-blue-700' },
    done: { text: '已完成', cls: 'bg-emerald-100 text-emerald-700' },
    failed: { text: '失败', cls: 'bg-red-100 text-red-700' },
  };
  const hit = map[status] || map.idle;
  return <span className={`text-xs px-2 py-0.5 rounded ${hit.cls}`}>{hit.text}</span>;
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{title}</p>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        {items.map((item, idx) => <li key={`${item}-${idx}`}>{item}</li>)}
      </ul>
    </div>
  );
}

function QuestionSection({ title, items }: { title: string; items: unknown[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-sm font-semibold mb-2">{title}</p>
      <div className="space-y-2">
        {items.map((raw, idx) => {
          const q = raw as JsonRecord;
          const question = String(q.question ?? raw ?? '');
          const context = String(q.context ?? q.suggested_answer_framework ?? '');
          return (
            <div key={`${question}-${idx}`} className="rounded-lg border border-border p-3">
              <p className="text-sm font-medium">{idx + 1}. {question}</p>
              {context && <p className="text-xs text-muted-foreground mt-1">{context}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
