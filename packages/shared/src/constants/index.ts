export const APP_NAME = 'AI Resume Builder';
export const APP_DESCRIPTION = 'Professional AI-powered resume builder with ATS optimization';

export const RESUME_THEME_COLORS = [
  '#0f3460', '#1e40af', '#2563eb', '#2a2a2a',
  '#4a4a4a', '#6b7280', '#065f46', '#0d9488',
  '#059669', '#4f46e5', '#6d28d9', '#8b5cf6',
  '#92400e', '#d97706', '#b45309',
] as const;

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
] as const;

export const RATE_LIMITS = {
  AI_GENERATE: { ttl: 60, max: 10 },
  RESUME_CRUD: { ttl: 60, max: 30 },
  AUTH: { ttl: 60, max: 10 },
} as const;
