import { apiRequest } from './client.js';

// כל נקודות הקצה של השרת במקום אחד — המסכים לא כותבים כתובות בעצמם.

export const authApi = {
  login: (credentials) => apiRequest('/api/auth/login', { method: 'POST', body: credentials }),
  register: (details) => apiRequest('/api/auth/register', { method: 'POST', body: details })
};

export const categoriesApi = {
  list: () => apiRequest('/api/categories'),
  create: (category) => apiRequest('/api/categories', { method: 'POST', body: category })
};

export const coursesApi = {
  list: (query, signal) => apiRequest('/api/courses', { query, signal }),
  get: (id) => apiRequest(`/api/courses/${id}`),
  create: (course) => apiRequest('/api/courses', { method: 'POST', body: course }),
  update: (id, course) => apiRequest(`/api/courses/${id}`, { method: 'PUT', body: course }),
  remove: (id) => apiRequest(`/api/courses/${id}`, { method: 'DELETE' }),
  enrollments: (id, query, signal) => apiRequest(`/api/courses/${id}/enrollments`, { query, signal })
};

export const enrollmentsApi = {
  enroll: (courseId) => apiRequest('/api/enrollments', { method: 'POST', body: { courseId } }),
  list: (query, signal) => apiRequest('/api/enrollments', { query, signal }),
  cancel: (id) => apiRequest(`/api/enrollments/${id}`, { method: 'DELETE' })
};
