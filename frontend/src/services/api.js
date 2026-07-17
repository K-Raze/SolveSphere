import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('solvesphere_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/user/login')) {
      localStorage.removeItem('solvesphere_token');
      localStorage.removeItem('solvesphere_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== AUTH =====
export const authAPI = {
  register: (data) => api.post('/user/register', data),
  login: (data) => api.post('/user/login', data),
  getProfile: () => api.get('/user/profile'),
  logout: () => api.post('/user/logout'),
};

// ===== EXPERIENCES =====
export const experienceAPI = {
  getAll: () => api.get('/experience'),
  getById: (id) => api.get(`/experience/${id}`),
  submit: (data) => api.post('/experience/submit', data),
  analyze: (data) => api.post('/experience/analyze', data),
  solve: (id) => api.post(`/experience/${id}/solve`),
};

// ===== PROBLEMS =====
export const problemAPI = {
  getById: (id) => api.get(`/problem/${id}`),
  getHint: (id, userCode) => api.post(`/problem/${id}/hint`, { userCode }),
};

// ===== SUBMISSIONS =====
export const submissionAPI = {
  run: (problemId, data) => api.post(`/submission/run/${problemId}`, data),
  submit: (problemId, data) => api.post(`/submission/submit/${problemId}`, data),
};

// ===== DISCUSSIONS =====
export const discussionAPI = {
  getByProblem: (problemId) => api.get(`/discussion/${problemId}`),
  create: (problemId, data) => api.post(`/discussion/${problemId}`, data),
};

// ===== AI =====
export const aiAPI = {
  getHint: (problemId, code, language) => api.post('/ai/hint', { problemId, code, language }),
};

// ===== DRAFTS =====
export const draftAPI = {
  get: (problemId) => api.get(`/submission/draft/${problemId}`),
  save: (problemId, data) => api.post(`/submission/draft/${problemId}`, data),
};

export default api;
