const API_BASE_URL = 'http://localhost:5000/api';

const getHeaders = (token) => {
  const headers = { 'Content-Type': 'application/json' };
  const storedToken = token || localStorage.getItem('zerowaste_token');
  if (storedToken) {
    headers['Authorization'] = `Bearer ${storedToken}`;
  }
  return headers;
};

export const api = {
  // Auth
  register: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  login: async (credentials) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  getMe: async (token) => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(token),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Auth check failed');
    return data;
  },

  // Posts
  createPost: async (postData) => {
    const res = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(postData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error creating food post');
    return data;
  },

  getAvailablePosts: async () => {
    const res = await fetch(`${API_BASE_URL}/posts/available`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error fetching available food posts');
    return await res.json();
  },

  getMyPosts: async () => {
    const res = await fetch(`${API_BASE_URL}/posts/my-posts`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error fetching my posts');
    return await res.json();
  },

  getMyClaims: async () => {
    const res = await fetch(`${API_BASE_URL}/posts/my-claims`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error fetching my claims');
    return await res.json();
  },

  claimPost: async (postId) => {
    const res = await fetch(`${API_BASE_URL}/posts/${postId}/claim`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error claiming post');
    return data;
  },

  collectPost: async (postId, ratingData = {}) => {
    const res = await fetch(`${API_BASE_URL}/posts/${postId}/collect`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(ratingData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error marking collected');
    return data;
  },

  cancelPost: async (postId) => {
    const res = await fetch(`${API_BASE_URL}/posts/${postId}/cancel`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error cancelling post');
    return data;
  },

  // NGOs & Anti-Fraud
  getNgos: async () => {
    const res = await fetch(`${API_BASE_URL}/posts/ngos`, {
      headers: getHeaders(),
    });
    if (!res.ok) return [];
    return await res.json();
  },

  donorRateNgo: async (postId, ratingData) => {
    const res = await fetch(`${API_BASE_URL}/posts/${postId}/donor-rate-ngo`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(ratingData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error saving donor feedback on NGO');
    return data;
  },

  recipientRateNgo: async (postId, ratingData) => {
    const res = await fetch(`${API_BASE_URL}/posts/${postId}/recipient-rate-ngo`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(ratingData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error saving recipient feedback on NGO');
    return data;
  },

  // Notifications
  getNotifications: async () => {
    const res = await fetch(`${API_BASE_URL}/notifications`, {
      headers: getHeaders(),
    });
    if (!res.ok) return { notifications: [], unreadCount: 0 };
    return await res.json();
  },

  markNotificationsRead: async (notificationId = null) => {
    const res = await fetch(`${API_BASE_URL}/notifications/mark-read`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ notificationId }),
    });
    return await res.json();
  },

  // Stats
  getStats: async () => {
    const res = await fetch(`${API_BASE_URL}/stats`);
    if (!res.ok) throw new Error('Error loading stats');
    return await res.json();
  },

  // Monitoring (NGO Only)
  getMonitoring: async () => {
    const res = await fetch(`${API_BASE_URL}/monitoring`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error loading monitoring data');
    return await res.json();
  },

  seedDatabase: async () => {
    const res = await fetch(`${API_BASE_URL}/monitoring/seed`, { method: 'POST' });
    return await res.json();
  },
};
