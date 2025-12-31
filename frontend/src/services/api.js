import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Matches
export const matchesAPI = {
  getAll: (limit, offset) => api.get('/matches', { params: { limit, offset } }),
  getById: (id) => api.get(`/matches/${id}`),
  create: (matchData) => api.post('/matches', matchData),
  update: (id, matchData) => api.put(`/matches/${id}`, matchData),
  delete: (id) => api.delete(`/matches/${id}`),
  getStats: () => api.get('/matches/stats'),
};

// Goals
export const goalsAPI = {
  getAll: (status) => api.get('/goals', { params: { status } }),
  getById: (id) => api.get(`/goals/${id}`),
  create: (goalData) => api.post('/goals', goalData),
  update: (id, goalData) => api.put(`/goals/${id}`, goalData),
  delete: (id) => api.delete(`/goals/${id}`),
};

// Mistakes
export const mistakesAPI = {
  getAll: () => api.get('/mistakes'),
  getStats: () => api.get('/mistakes/stats'),
};

export default api;

