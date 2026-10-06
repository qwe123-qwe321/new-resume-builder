import { create } from 'zustand';
import type { Resume, Experience, Education, Skill } from '@ai-resume/shared';

interface ResumeState {
  resume: Resume | null;
  setResume: (resume: Resume | null) => void;
  updateField: <K extends keyof Resume>(key: K, value: Resume[K]) => void;

  addExperience: () => void;
  updateExperience: (index: number, data: Partial<Experience>) => void;
  removeExperience: (index: number) => void;

  addEducation: () => void;
  updateEducation: (index: number, data: Partial<Education>) => void;
  removeEducation: (index: number) => void;

  addSkill: () => void;
  updateSkill: (index: number, data: Partial<Skill>) => void;
  removeSkill: (index: number) => void;

  activeSection: number;
  setActiveSection: (index: number) => void;
  candidateType: 'student' | 'professional';
  setCandidateType: (type: 'student' | 'professional') => void;
  studentExperienceType: 'internship' | 'project';
  setStudentExperienceType: (type: 'internship' | 'project') => void;

  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
}

function cloneExperiences(list: Experience[] | undefined): Experience[] {
  return (list || []).map((item) => ({ ...item }));
}

function getExperienceTypeFromId(id: string | undefined): 'internship' | 'project' | 'professional' | undefined {
  if (!id) return undefined;
  if (id.startsWith('internship:')) return 'internship';
  if (id.startsWith('project:')) return 'project';
  if (id.startsWith('professional:')) return 'professional';
  return undefined;
}

function getCurrentExperienceType(
  candidateType: 'student' | 'professional',
  studentExperienceType: 'internship' | 'project',
): 'internship' | 'project' | 'professional' {
  if (candidateType === 'professional') return 'professional';
  return studentExperienceType;
}

function normalizeExperiences(
  list: Experience[] | undefined,
  candidateType: 'student' | 'professional',
  studentExperienceType: 'internship' | 'project',
): Experience[] {
  const fallbackType = getCurrentExperienceType(candidateType, studentExperienceType);
  return cloneExperiences(list).map((item) => ({
    ...item,
    experienceType: item.experienceType || getExperienceTypeFromId(item.id) || fallbackType,
  }));
}

export const useResumeStore = create<ResumeState>((set) => ({
  resume: null,
  setResume: (resume) =>
    set((state) => {
      const nextResume = resume
        ? {
            ...resume,
            experience: normalizeExperiences(
              resume.experience as Experience[],
              state.candidateType,
              state.studentExperienceType,
            ),
          }
        : null;
      return { resume: nextResume, isDirty: false };
    }),
  updateField: (key, value) =>
    set((state) => ({
      resume: state.resume ? { ...state.resume, [key]: value } : null,
      isDirty: true,
    })),

  addExperience: () =>
    set((state) => {
      if (!state.resume) return state;
      const nextExperience = [
        ...(state.resume.experience || []),
        {
          experienceType: getCurrentExperienceType(state.candidateType, state.studentExperienceType),
          title: '',
          companyName: '',
          city: '',
          state: '',
          startDate: '',
          endDate: '',
          workSummary: '',
          currentlyWorking: false,
          aiGenerated: false,
        },
      ];
      return {
        resume: { ...state.resume, experience: nextExperience },
        isDirty: true,
      };
    }),
  updateExperience: (index, data) =>
    set((state) => {
      if (!state.resume) return state;
      const exp = [...(state.resume.experience || [])];
      exp[index] = { ...exp[index], ...data };
      return {
        resume: { ...state.resume, experience: exp },
        isDirty: true,
      };
    }),
  removeExperience: (index) =>
    set((state) => {
      if (!state.resume) return state;
      const next = (state.resume.experience || []).filter((_, i) => i !== index);
      return {
        resume: {
          ...state.resume,
          experience: next,
        },
        isDirty: true,
      };
    }),

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

  activeSection: 0,
  setActiveSection: (index) => set({ activeSection: index }),
  candidateType: 'student',
  setCandidateType: (type) =>
    set(() => ({
      candidateType: type,
    })),
  studentExperienceType: 'project',
  setStudentExperienceType: (type) =>
    set(() => ({
      studentExperienceType: type,
    })),

  isDirty: false,
  setIsDirty: (dirty) => set({ isDirty: dirty }),
}));
