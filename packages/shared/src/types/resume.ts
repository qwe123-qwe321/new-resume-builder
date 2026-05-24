import { z } from 'zod';

// ============================================
// Resume Types
// ============================================

export const ExperienceSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Job title is required'),
  companyName: z.string().min(1, 'Company name is required'),
  city: z.string().optional(),
  state: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  currentlyWorking: z.boolean().default(false),
  workSummary: z.string().optional(),
  aiGenerated: z.boolean().default(false),
});

export const EducationSchema = z.object({
  id: z.string().optional(),
  universityName: z.string().min(1, 'University name is required'),
  degree: z.string().min(1, 'Degree is required'),
  major: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

export const SkillSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Skill name is required'),
  rating: z.number().min(1).max(5).default(3),
});

export const ResumeSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  targetJobTitle: z.string().optional(),
  targetIndustry: z.string().optional(),
  targetCompany: z.string().optional(),
  language: z.enum(['en', 'zh', 'ja', 'ko', 'fr', 'de', 'es']).default('en'),
  templateId: z.string().optional(),
  themeColor: z.string().default('#2563eb'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  jobTitle: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  linkedIn: z.string().optional(),
  github: z.string().optional(),
  portfolio: z.string().optional(),
  summary: z.string().optional(),
  experience: z.array(ExperienceSchema).default([]),
  education: z.array(EducationSchema).default([]),
  skills: z.array(SkillSchema).default([]),
  certifications: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  atsScore: z.number().min(0).max(100).optional(),
  atsFeedback: z.string().optional(),
});

export type Resume = z.infer<typeof ResumeSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Skill = z.infer<typeof SkillSchema>;

// ============================================
// AI Types
// ============================================

export const AIRequestSchema = z.object({
  resumeId: z.string(),
  action: z.enum([
    'generate_summary',
    'optimize_experience',
    'analyze_ats',
    'generate_interview_questions',
    'translate',
    'suggest_improvements',
  ]),
  targetJobDescription: z.string().optional(),
  targetLanguage: z.enum(['en', 'zh', 'ja', 'ko', 'fr', 'de', 'es']).optional(),
  experienceIndex: z.number().optional(),
});

export type AIRequest = z.infer<typeof AIRequestSchema>;

// ============================================
// Template Types
// ============================================

export const TemplateSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  category: z.enum(['professional', 'creative', 'modern', 'minimal', 'academic']),
  isPremium: z.boolean().default(false),
  layout: z.enum(['single', 'double', 'sidebar']).default('single'),
  colors: z.array(z.string()),
  fonts: z.array(z.string()),
  previewHtml: z.string().optional(),
});

export type Template = z.infer<typeof TemplateSchema>;
