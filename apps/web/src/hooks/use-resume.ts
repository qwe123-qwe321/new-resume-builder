import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/auth';
import { api } from '../lib/api';
import { toast } from 'sonner';

export function useResumes() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['resumes'],
    queryFn: async () => {
      const token = await getToken();
      const res = await api.resumes.list(token);
      return res.data;
    },
  });
}

export function useResume(id: string | undefined) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['resume', id],
    queryFn: async () => {
      if (!id) throw new Error('No resume ID');
      const token = await getToken();
      const res = await api.resumes.get(id, token);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateResume() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (data: unknown) => {
      const token = await getToken();
      return api.resumes.create(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      toast.success('Resume created');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateResume() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
      const token = await getToken();
      return api.resumes.update(id, data, token);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resume', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      toast.success('Saved');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useAiGenerate() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (data: unknown) => {
      const token = await getToken();
      return api.ai.generate(data, token);
    },
    onSuccess: (_data, variables) => {
      const { resumeId } = variables as { resumeId: string };
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
      queryClient.invalidateQueries({ queryKey: ['ai-sessions', resumeId] });
      toast.success('AI generation complete');
    },
    onError: (error: Error) => {
      toast.error(`AI failed: ${error.message}`);
    },
  });
}

export function useAiGenerateAsync() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (data: unknown) => {
      const token = await getToken();
      return api.ai.generateAsync(data, token);
    },
  });
}

export function useAiOpsStats() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['ai-ops-stats'],
    refetchInterval: 10000,
    queryFn: async () => {
      const token = await getToken();
      const res = await api.ai.opsStats(token);
      return res.data;
    },
  });
}

export function useAiJob(jobId: string | null) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['ai-job', jobId],
    enabled: !!jobId,
    refetchInterval: (query) => {
      const s = (query.state.data as { status?: string } | undefined)?.status;
      return s === 'done' || s === 'failed' ? false : 1500;
    },
    queryFn: async () => {
      if (!jobId) throw new Error('No jobId');
      const token = await getToken();
      const res = await api.ai.job(jobId, token);
      return res.data;
    },
  });
}

export function useAiFeedback() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (data: unknown) => {
      const token = await getToken();
      return api.ai.feedback(data, token);
    },
    onSuccess: () => toast.success('Feedback submitted'),
    onError: (error: Error) => toast.error(error.message),
  });
}
