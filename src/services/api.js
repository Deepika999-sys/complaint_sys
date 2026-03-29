import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login:    (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
};

export const complaintAPI = {
  submit:        (data)    => API.post('/complaints', data),
  getAll:        ()        => API.get('/complaints'),
  getMine:       ()        => API.get('/complaints/my'),
  getById:       (id)      => API.get(`/complaints/${id}`),
  getByStatus:   (s)       => API.get(`/complaints/status/${s}`),
  getByPriority: (p)       => API.get(`/complaints/priority/${p}`),
  getByCategory: (c)       => API.get(`/complaints/category/${c}`),
  getOverdue:    (h = 48)  => API.get(`/complaints/overdue?hours=${h}`),
  assign:        (id, d)   => API.put(`/complaints/${id}/assign`, d),
  updateStatus:  (id, d)   => API.put(`/complaints/${id}/status`, d),
  resolve:       (id, d)   => API.put(`/complaints/${id}/resolve`, d),
  feedback:      (id, d)   => API.post(`/complaints/${id}/feedback`, d),
};

export const analyticsAPI = {
  dashboard: () => API.get('/analytics/dashboard'),
};

export const departmentAPI = {
  getAll:     ()       => API.get('/departments'),
  create:     (d)      => API.post('/departments', d),
  update:     (id, d)  => API.put(`/departments/${id}`, d),
  deactivate: (id)     => API.delete(`/departments/${id}`),
};

export const ruleAPI = {
  getAll:  ()       => API.get('/priority-rules'),
  create:  (d)      => API.post('/priority-rules', d),
  update:  (id, d)  => API.put(`/priority-rules/${id}`, d),
  toggle:  (id)     => API.patch(`/priority-rules/${id}/toggle`),
  delete:  (id)     => API.delete(`/priority-rules/${id}`),
};

export const adminAPI = {
  getUsers:   ()             => API.get('/admin/users'),
  getStaff:   ()             => API.get('/admin/staff'),
  promote:    (id, dept)     => API.patch(`/admin/users/${id}/promote-staff?department=${encodeURIComponent(dept)}`),
  deactivate: (id)           => API.delete(`/admin/users/${id}`),
};

export default API;
