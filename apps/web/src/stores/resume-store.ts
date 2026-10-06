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

  experienceDrafts: {
    student_internship: Experience[];
    student_project: Experience[];
    professional: Experience[];
  };
}

function cloneExperiences(list: Experience[] | undefined): Experience[] {
  return (list || []).map((item) => ({ ...item }));
}

function getModeKey(
  candidateType: 'student' | 'professional',
  studentExperienceType: 'internship' | 'project',
): 'student_internship' | 'student_project' | 'professional' {
  if (candidateType === 'professional') return 'professional';
  return studentExperienceType === 'internship' ? 'student_internship' : 'student_project';
}

export const useResumeStore = create<ResumeState>((set) => ({
  resume: null,
  setResume: (resume) =>
    set((state) => {
      const modeKey = getModeKey(state.candidateType, state.studentExperienceType);
      const nextDrafts = {
        student_internship: [] as Experience[],
        student_project: [] as Experience[],
        professional: [] as Experience[],
      };
      nextDrafts[modeKey] = cloneExperiences((resume?.experience || []) as Experience[]);
      return { resume, isDirty: false, experienceDrafts: nextDrafts };
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
        { title: '', companyName: '', city: '', state: '', startDate: '', endDate: '', workSummary: '', currentlyWorking: false, aiGenerated: false },
      ];
      const modeKey = getModeKey(state.candidateType, state.studentExperienceType);
      return {
        resume: { ...state.resume, experience: nextExperience },
        experienceDrafts: { ...state.experienceDrafts, [modeKey]: cloneExperiences(nextExperience as Experience[]) },
        isDirty: true,
      };
    }),
  updateExperience: (index, data) =>
    set((state) => {
      if (!state.resume) return state;
      const exp = [...(state.resume.experience || [])];
      exp[index] = { ...exp[index], ...data };
      const modeKey = getModeKey(state.candidateType, state.studentExperienceType);
      return {
        resume: { ...state.resume, experience: exp },
        experienceDrafts: { ...state.experienceDrafts, [modeKey]: cloneExperiences(exp as Experience[]) },
        isDirty: true,
      };
    }),
  removeExperience: (index) =>
    set((state) => {
      if (!state.resume) return state;
      const next = (state.resume.experience || []).filter((_, i) => i !== index);
      const modeKey = getModeKey(state.candidateType, state.studentExperienceType);
      return {
        resume: {
          ...state.resume,
          experience: next,
        },
        experienceDrafts: { ...state.experienceDrafts, [modeKey]: cloneExperiences(next as Experience[]) },
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
    set((state) => ({
      candidateType: type,
      studentExperienceType: state.studentExperienceType,
      resume: state.resume
        ? {
            ...state.resume,
            experience: cloneExperiences(
              state.experienceDrafts[
                getModeKey(type, state.studentExperienceType)
              ],
            ),
          }
        : null,
      experienceDrafts: (() => {
        const currentKey = getModeKey(state.candidateType, state.studentExperienceType);
        return {
          ...state.experienceDrafts,
          [currentKey]: cloneExperiences((state.resume?.experience || []) as Experience[]),
        };
      })(),
      isDirty: true,
    })),
  studentExperienceType: 'project',
  setStudentExperienceType: (type) =>
    set((state) => ({
      studentExperienceType: type,
      resume: state.resume
        ? {
            ...state.resume,
            experience: cloneExperiences(
              state.experienceDrafts[getModeKey('student', type)],
            ),
          }
        : null,
      experienceDrafts: (() => {
        const currentKey = getModeKey(state.candidateType, state.studentExperienceType);
        return {
          ...state.experienceDrafts,
          [currentKey]: cloneExperiences((state.resume?.experience || []) as Experience[]),
        };
      })(),
      isDirty: true,
    })),

  isDirty: false,
  setIsDirty: (dirty) => set({ isDirty: dirty }),
  experienceDrafts: {
    student_internship: [],
    student_project: [],
    professional: [],
  },
}));
