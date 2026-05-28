import { callLLM, parseJSON, getAIConfig } from './llm-client';

export interface ResumeData {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle?: string | null;
  targetJobTitle?: string | null;
  targetIndustry?: string | null;
  summary?: string | null;
  experience?: Array<{ title?: string; companyName?: string; workSummary?: string; [key: string]: unknown }>;
  education?: Array<Record<string, unknown>>;
  skills?: Array<{ name?: string; rating?: number; [key: string]: unknown }>;
  [key: string]: unknown;
}

export async function generateSummary(resume: ResumeData) {
  const config = getAIConfig();
  const prompt = `You are a professional resume writer and ATS optimization expert.

Given the following resume information, generate a powerful professional summary.

Resume Data:
- Name: ${resume.firstName} ${resume.lastName}
- Current/Desired Title: ${resume.jobTitle || resume.targetJobTitle || 'Professional'}
- Target Industry: ${resume.targetIndustry || 'Technology'}
- Target Job: ${resume.targetJobTitle || 'Not specified'}

Return ONLY a valid JSON object (no markdown, no extra text):
{
  "summary": "A 3-4 line professional summary using strong action verbs and measurable achievements",
  "experience_level": "Fresher | Mid Level | Senior Level",
  "keywords": ["keyword1", "keyword2", ...],
  "alternatives": [
    { "summary": "Alternative version 1", "experience_level": "Fresher" },
    { "summary": "Alternative version 2", "experience_level": "Mid Level" },
    { "summary": "Alternative version 3", "experience_level": "Senior Level" }
  ]
}`;

  const raw = await callLLM(config, prompt);
  const parsed = parseJSON(raw);

  return {
    summary: parsed.summary || raw,
    experienceLevel: parsed.experience_level || 'Mid Level',
    keywords: parsed.keywords || [],
    suggestions: Array.isArray(parsed.alternatives)
      ? parsed.alternatives.map((alt: { summary: string; experience_level: string }) => ({
          summary: alt.summary,
          experienceLevel: alt.experience_level,
        }))
      : [],
  };
}

export async function optimizeExperience(resume: ResumeData, experienceIndex: number) {
  const config = getAIConfig();
  const exp = resume.experience?.[experienceIndex];
  if (!exp) throw new Error(`Experience at index ${experienceIndex} not found`);

  const prompt = `You are a professional resume optimization expert. Transform the following work experience into STAR-format bullet points with quantified achievements.

Job Title: ${exp.title || 'Not specified'}
Company: ${exp.companyName || 'Not specified'}
Original Description: ${exp.workSummary || 'Not provided'}
Target Role: ${resume.targetJobTitle || 'Professional'}

Rules:
- Use STAR method (Situation, Task, Action, Result)
- Start each bullet with a strong action verb
- Include specific metrics and numbers where possible
- Focus on impact and results, not just responsibilities
- Generate 4-6 bullet points
- At least 70% should contain quantified achievements

Return ONLY a valid JSON object:
{
  "title": "Optimized job title",
  "bullets": ["bullet1", "bullet2", ...],
  "metrics": ["Achievement metric 1", ...],
  "star_analysis": {
    "situation": "...",
    "task": "...",
    "action": "...",
    "result": "..."
  }
}`;

  const raw = await callLLM(config, prompt);
  const parsed = parseJSON(raw);

  return {
    title: parsed.title || exp.title,
    companyName: exp.companyName,
    optimizedBullets: Array.isArray(parsed.bullets) ? parsed.bullets : [raw],
    quantifiedAchievements: Array.isArray(parsed.metrics) ? parsed.metrics : [],
    starAnalysis: parsed.star_analysis || null,
  };
}

export async function translateResume(resume: ResumeData, targetLanguage: string) {
  const config = getAIConfig();
  const langNames: Record<string, string> = {
    zh: 'Chinese (Simplified)', ja: 'Japanese', ko: 'Korean',
    fr: 'French', de: 'German', es: 'Spanish',
  };

  const prompt = `Translate the following resume content into ${langNames[targetLanguage] || targetLanguage}. Maintain professional tone and industry-standard terminology.

First Name: ${resume.firstName}
Last Name: ${resume.lastName}
Job Title: ${resume.jobTitle || ''}
Summary: ${resume.summary || ''}

Return ONLY a valid JSON object with translated fields:
{
  "firstName": "translated",
  "lastName": "translated",
  "jobTitle": "translated",
  "summary": "translated"
}`;

  const raw = await callLLM(config, prompt);
  const parsed = parseJSON(raw);

  return { targetLanguage, translatedFields: parsed };
}

export async function analyzeATS(resume: ResumeData, targetJobDescription: string) {
  const config = getAIConfig();
  const prompt = `你是一名中文简历 ATS 优化专家。请基于候选人简历与目标岗位描述，输出中文分析结论。

Resume Summary: ${resume.summary || 'Not provided'}
Job Title: ${resume.jobTitle || 'Not specified'}
Target Job Description: ${targetJobDescription || 'Not provided'}

Skills: ${(resume.skills || []).map((s) => s.name).join(', ')}

只返回合法 JSON（不要 markdown）:
{
  "atsScore": 85,
  "matchLevel": "Strong Match | Partial Match | Weak Match",
  "matchedKeywords": ["keyword1", ...],
  "missingKeywords": ["keyword1", ...],
  "recommendations": ["recommendation1", ...],
  "formatIssues": ["issue1", ...]
}`;

  const raw = await callLLM(config, prompt);
  const parsed = parseJSON(raw);

  return {
    atsScore: parsed.atsScore || parsed.ats_score || 0,
    matchLevel: parsed.matchLevel || parsed.match_level || 'Unknown',
    matchedKeywords: parsed.matchedKeywords || parsed.matched_keywords || [],
    missingKeywords: parsed.missingKeywords || parsed.missing_keywords || [],
    recommendations: parsed.recommendations || [],
    formatIssues: parsed.formatIssues || parsed.format_issues || [],
  };
}

export async function suggestImprovements(resume: ResumeData) {
  const config = getAIConfig();
  const prompt = `你是一名中文简历优化专家。请审阅这份简历并给出可执行建议，全部使用中文。

First Name: ${resume.firstName} ${resume.lastName}
Job Title: ${resume.jobTitle || 'Not specified'}
Summary: ${resume.summary || 'Not provided'}
Target Job: ${resume.targetJobTitle || 'Not specified'}
Target Industry: ${resume.targetIndustry || 'Technology'}

只返回合法 JSON（不要 markdown）:
{
  "overallScore": 75,
  "strengths": ["strength1", ...],
  "weaknesses": ["weakness1", ...],
  "quickWins": ["quick win 1", ...],
  "sectionScores": {
    "summary": 80,
    "experience": 70,
    "skills": 85,
    "education": 75
  }
}`;

  const raw = await callLLM(config, prompt);
  const parsed = parseJSON(raw);

  return {
    overallScore: parsed.overallScore || parsed.overall_score || 0,
    strengths: parsed.strengths || [],
    weaknesses: parsed.weaknesses || [],
    quickWins: parsed.quickWins || parsed.quick_wins || [],
    sectionScores: parsed.sectionScores || parsed.section_scores || {},
  };
}

export async function generateInterviewQuestions(resume: ResumeData) {
  const config = getAIConfig();
  const prompt = `你是一名中国互联网求职场景的资深面试官。请根据候选人简历内容和目标岗位，生成中文面试题。
要求：
1) HR面：覆盖动机、职业稳定性、协作冲突、抗压、沟通、项目 ownership、期望与风险点。
2) 技术面：深挖简历中每一项技术与项目，给出追问链路，按“30分钟高强度拷打”组织问题。
3) 问题要具体、可追问、可验证，不要泛泛而谈。

Candidate: ${resume.firstName} ${resume.lastName}
Job Title: ${resume.jobTitle || resume.targetJobTitle || 'Professional'}
Summary: ${resume.summary || 'Not provided'}
Skills: ${(resume.skills || []).map((s) => s.name).join(', ')}

只返回合法 JSON（不要 markdown）:
{
  "technicalQuestions": [
    { "question": "...", "context": "Why this is relevant", "difficulty": "easy|medium|hard" }
  ],
  "behavioralQuestions": [
    { "question": "...", "context": "What to look for", "category": "leadership|teamwork|conflict|achievement" }
  ],
  "roleSpecificQuestions": [
    { "question": "...", "context": "Why this matters for the role" }
  ],
  "questionsToAskThem": ["question1", ...]
}`;

  const raw = await callLLM(config, prompt);
  const parsed = parseJSON(raw);

  return {
    technicalQuestions: parsed.technicalQuestions || parsed.technical_questions || [],
    behavioralQuestions: parsed.behavioralQuestions || parsed.behavioral_questions || [],
    roleSpecificQuestions: parsed.roleSpecificQuestions || parsed.role_specific_questions || [],
    questionsToAskThem: parsed.questionsToAskThem || parsed.questions_to_ask_them || [],
  };
}
