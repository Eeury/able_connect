// API utility functions for Able Connect
// Automatically detects if running on same server or separate
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '8000'
  ? 'http://localhost:8000/api'  // Separate frontend/backend
  : '/api';  // Same server (integrated)

const CSRF_SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS', 'TRACE'];

function getCSRFToken() {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie ? document.cookie.split(';') : [];
  for (let i = 0; i < cookies.length; i += 1) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith('csrftoken=')) {
      return decodeURIComponent(cookie.substring('csrftoken='.length));
    }
  }
  return null;
}

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const config = { ...defaultOptions, ...options };
  const method = (config.method || 'GET').toUpperCase();
  
  // Handle FormData (for file uploads)
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  if (!CSRF_SAFE_METHODS.includes(method)) {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
  }
  
  try {
    const response = await fetch(url, config);
    
    // Handle non-JSON responses (like connection errors)
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      // If response is not JSON, it's likely a connection error
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      throw new Error('Invalid response from server');
    }
    
    if (!response.ok) {
      throw new Error(data.error || data.detail || `Request failed: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    // Check if it's a connection error
    if (error.message.includes('Failed to fetch') || 
        error.message.includes('ERR_CONNECTION_REFUSED') ||
        error.message.includes('NetworkError') ||
        error.name === 'TypeError') {
      console.warn('API server not available, will use localStorage fallback');
      throw new Error('API_UNAVAILABLE');
    }
    console.error('API Error:', error);
    throw error;
  }
}

// Authentication API
const authAPI = {
  register: async (userData) => {
    return apiCall('/users/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  login: async (email, password, userType) => {
    return apiCall('/users/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password, user_type: userType }),
    });
  },
  
  getCurrentUser: async () => {
    return apiCall('/users/me/');
  },

  updateProfile: async (userId, profileData) => {
    if (!userId) throw new Error('User ID is required to update the profile.');
    return apiCall(`/users/${userId}/`, {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  },
};

// Tubonge Posts API
const tubongeAPI = {
  getPosts: async () => {
    const data = await apiCall('/tubonge-posts/');
    return data.results || data;
  },
  
  createPost: async (postData) => {
    const formData = new FormData();
    formData.append('text', postData.text || '');
    
    if (postData.mediaFile) {
      formData.append('media_file', postData.mediaFile);
      formData.append('media_type', postData.mediaType || 'image');
    }
    
    if (postData.link) {
      formData.append('link', postData.link);
    }
    
    return apiCall('/tubonge-posts/', {
      method: 'POST',
      body: formData,
    });
  },
  
  likePost: async (postId) => {
    return apiCall(`/tubonge-posts/${postId}/like/`, {
      method: 'POST',
    });
  },
  
  addComment: async (postId, text) => {
    return apiCall(`/tubonge-posts/${postId}/comment/`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },
  
  getComments: async (postId) => {
    const data = await apiCall(`/tubonge-posts/${postId}/comments/`);
    return data;
  },
};

// Messages API
const messageAPI = {
  sendMessage: async (recipientId, text) => {
    return apiCall('/messages/', {
      method: 'POST',
      body: JSON.stringify({ recipient: recipientId, text }),
    });
  },
  
  getConversations: async () => {
    return apiCall('/messages/conversations/');
  },
  
  getMessagesWithUser: async (userId) => {
    return apiCall(`/messages/with_user/?user_id=${userId}`);
  },
};

// Gigs API
const gigAPI = {
  getGigs: async (status = null) => {
    const endpoint = status ? `/gigs/?status=${status}` : '/gigs/';
    const data = await apiCall(endpoint);
    return data.results || data;
  },
  
  createGig: async (gigData) => {
    const formData = new FormData();
    formData.append('title', gigData.title);
    formData.append('description', gigData.description);
    formData.append('price', gigData.price);
    formData.append('timeframe', gigData.timeframe);
    formData.append('requirements', gigData.requirements);
    
    if (gigData.document) {
      formData.append('document', gigData.document);
    }
    
    return apiCall('/gigs/', {
      method: 'POST',
      body: formData,
    });
  },
  
  placeBid: async (gigId, bidData) => {
    const formData = new FormData();
    formData.append('amount', bidData.amount);
    formData.append('proposal', bidData.proposal);
    
    if (bidData.document) {
      formData.append('document', bidData.document);
    }
    
    return apiCall(`/gigs/${gigId}/bid/`, {
      method: 'POST',
      body: formData,
    });
  },

  updateGig: async (gigId, gigData) => {
    return apiCall(`/gigs/${gigId}/`, {
      method: 'PATCH',
      body: JSON.stringify(gigData),
    });
  },
};

// Services API
const serviceAPI = {
  getServices: async (status = null) => {
    const endpoint = status ? `/services/?status=${status}` : '/services/';
    const data = await apiCall(endpoint);
    return data.results || data;
  },
  
  createService: async (serviceData) => {
    const formData = new FormData();
    formData.append('title', serviceData.title);
    formData.append('description', serviceData.description);
    formData.append('price', serviceData.price);
    formData.append('duration', serviceData.duration);
    formData.append('requirements', serviceData.requirements);
    
    if (serviceData.document) {
      formData.append('document', serviceData.document);
    }
    
    return apiCall('/services/', {
      method: 'POST',
      body: formData,
    });
  },
  
  bookService: async (serviceId, bookingData) => {
    const formData = new FormData();
    formData.append('proposal', bookingData.proposal);
    
    if (bookingData.document) {
      formData.append('document', bookingData.document);
    }
    
    return apiCall(`/services/${serviceId}/book/`, {
      method: 'POST',
      body: formData,
    });
  },

  updateService: async (serviceId, serviceData) => {
    return apiCall(`/services/${serviceId}/`, {
      method: 'PATCH',
      body: JSON.stringify(serviceData),
    });
  },
};

// Export for use in other files
window.ableConnectAPI = {
  auth: authAPI,
  tubonge: tubongeAPI,
  messages: messageAPI,
  gigs: gigAPI,
  services: serviceAPI,
};

