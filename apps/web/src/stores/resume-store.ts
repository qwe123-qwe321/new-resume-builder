import { create } from 'zustand';
import type { Resume, Experience, Education, Skill } from '@ai-resume/shared';

interface ResumeState {
  // Current resume being edited
  resume: Resume | null;
  setResume: (resume: Resume | null) => void;
  updateField: <K extends keyof Resume>(key: K, value: Resume[K]) => void;

  // Experiences
  addExperience: () => void;
  updateExperience: (index: number, data: Partial<Experience>) => void;
  removeExperience: (index: number) => void;

  // Education
  addEducation: () => void;
  updateEducation: (index: number, data: Partial<Education>) => void;
  removeEducation: (index: number) => void;

  // Skills
  addSkill: () => void;
  updateSkill: (index: number, data: Partial<Skill>) => void;
  removeSkill: (index: number) => void;

  // UI State
  activeSection: number;
  setActiveSection: (index: number) => void;
  isAiPanelOpen: boolean;
  toggleAiPanel: () => void;

  // Dirty tracking
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
}

export const useResumeStore = create<ResumeState>((set) => ({
  resume: null,
  setResume: (resume) => set({ resume, isDirty: false }),
  updateField: (key, value) =>
    set((state) => ({
      resume: state.resume ? { ...state.resume, [key]: value } : null,
      isDirty: true,
    })),

  // Experiences
  addExperience: () =>
    set((state) => ({
      resume: state.resume
        ? {
            ...state.resume,
            experience: [
              ...(state.resume.experience || []),
              { title: '', companyName: '', city: '', state: '', startDate: '', endDate: '', workSummary: '', currentlyWorking: false, aiGenerated: false },
            ],
          }
        : null,
      isDirty: true,
    })),
  updateExperience: (index, data) =>
    set((state) => {
      if (!state.resume) return state;
      const exp = [...(state.resume.experience || [])];
      exp[index] = { ...exp[index], ...data };
      return { resume: { ...state.resume, experience: exp }, isDirty: true };
    }),
  removeExperience: (index) =>
    set((state) => {
      if (!state.resume) return state;
      return {
        resume: {
          ...state.resume,
          experience: (state.resume.experience || []).filter((_, i) => i !== index),
        },
        isDirty: true,
      };
    }),

  // Education
  addEducation: () =>
    set((state) => ({
      resume: state.resume
        ? {
            ...state.resume,
            education: [
              ...(state.resume.education || []),
              { universityName: '', degree: '', major: '', startDate: '', endDate: '', description: '' },
            ],
          }
        : null,
      isDirty: true,
    })),
  updateEducation: (index, data) =>
    set((state) => {
      if (!state.resume) return state;
      const edu = [...(state.resume.education || [])];
      edu[index] = { ...edu[index], ...data };
      return { resume: { ...state.resume, education: edu }, isDirty: true };
    }),
  removeEducation: (index) =>
    set((state) => {
      if (!state.resume) return state;
      return {
        resume: {
          ...state.resume,
          education: (state.resume.education || []).filter((_, i) => i !== index),
        },
        isDirty: true,
      };
    }),

  // Skills
  addSkill: () =>
    set((state) => ({
      resume: state.resume
        ? { ...state.resume, skills: [...(state.resume.skills || []), { name: '', rating: 3 }] }
        : null,
      isDirty: true,
    })),
  updateSkill: (index, data) =>
    set((state) => {
      if (!state.resume) return state;
      const skills = [...(state.resume.skills || [])];
      skills[index] = { ...skills[index], ...data };
      return { resume: { ...state.resume, skills }, isDirty: true };
    }),
  removeSkill: (index) =>
    set((state) => {
      if (!state.resume) return state;
      return {
        resume: {
          ...state.resume,
          skills: (state.resume.skills || []).filter((_, i) => i !== index),
        },
        isDirty: true,
      };
    }),

  // UI
  activeSection: 0,
  setActiveSection: (index) => set({ activeSection: index }),
  isAiPanelOpen: false,
  toggleAiPanel: () => set((s) => ({ isAiPanelOpen: !s.isAiPanelOpen })),

  isDirty: false,
  setIsDirty: (dirty) => set({ isDirty: dirty }),
}));
