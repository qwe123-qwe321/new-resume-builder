const API_BASE = '/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// Typed API methods
export const api = {
  // Resumes
  resumes: {
    list: (token: string) =>
      apiClient<{ data: unknown[] }>('/resumes', { token }),
    get: (id: string, token: string) =>
      apiClient<{ data: unknown }>(`/resumes/${id}`, { token }),
    create: (data: unknown, token: string) =>
      apiClient<{ data: unknown }>('/resumes', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      }),
    update: (id: string, data: unknown, token: string) =>
      apiClient<{ data: unknown }>(`/resumes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        token,
      }),
    archive: (id: string, token: string) =>
      apiClient<{ data: unknown }>(`/resumes/${id}`, {
        method: 'DELETE',
        token,
      }),
    versions: (id: string, token: string) =>
      apiClient<{ data: unknown[] }>(`/resumes/${id}/versions`, { token }),
    restore: (id: string, version: number, token: string) =>
      apiClient<{ data: unknown }>(`/resumes/${id}/versions/${version}/restore`, {
        method: 'POST',
        token,
      }),
  },

  // AI
  ai: {
    generate: (data: unknown, token: string) =>
      apiClient<{ data: unknown }>('/ai/generate', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      }),
    generateAsync: (data: unknown, token: string) =>
      apiClient<{ data: { jobId: string } }>('/ai/generate/async', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      }),
    job: (jobId: string, token: string) =>
      apiClient<{ data: unknown }>(`/ai/jobs/${jobId}`, { token }),
    opsStats: (token: string) =>
      apiClient<{ data: unknown }>('/ai/ops/stats', { token }),
    sessions: (resumeId: string, token: string) =>
      apiClient<{ data: unknown[] }>(`/ai/sessions/${resumeId}`, { token }),
    feedback: (data: unknown, token: string) =>
      apiClient<{ data: unknown }>('/ai/feedback', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      }),
  },

  // Templates
  templates: {
    list: () => apiClient<{ data: unknown[] }>('/templates'),
    get: (id: string) => apiClient<{ data: unknown }>(`/templates/${id}`),
  },

  // Users
  users: {
    me: (token: string) =>
      apiClient<{ data: unknown }>('/users/me', { token }),
    delete: (token: string) =>
      apiClient<{ data: unknown }>('/users/me', { method: 'DELETE', token }),
  },
};
