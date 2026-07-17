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
    if (error.response?.status === 401) {
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
  run: (data) => api.post('/submit/run', data),
  submit: (data) => api.post('/submit/submit', data),
};

// ===== DISCUSSIONS =====
export const discussionAPI = {
  getByProblem: (problemId) => api.get(`/discussion/${problemId}`),
  create: (problemId, data) => api.post(`/discussion/${problemId}`, data),
};

// ===== AI =====
export const aiAPI = {
  getHint: (problemId, userCode) => api.post('/ai/hint', { problemId, userCode }),
};

// ===== DRAFTS =====
export const draftAPI = {
  get: (problemId) => api.get(`/submit/draft/${problemId}`),
  save: (problemId, data) => api.put(`/submit/draft/${problemId}`, data),
};

export default api;
