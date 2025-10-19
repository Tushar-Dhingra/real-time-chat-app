import { auth } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = auth.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return res.json();
};

export const api = {
  sendFriendRequest: (username: string) =>
    apiCall('/friends/request', {
      method: 'POST',
      body: JSON.stringify({ receiverUsername: username }),
    }),

  respondToFriendRequest: (requestId: string, action: 'ACCEPTED' | 'REJECTED') =>
    apiCall('/friends/respond', {
      method: 'POST',
      body: JSON.stringify({ requestId, action }),
    }),

  getFriends: () => apiCall('/friends'),

  getFriendRequests: () => apiCall('/friends/requests'),

  getMessages: (friendId: string) => apiCall(`/messages/${friendId}`),

  sendMessage: (receiverId: string, content: string, type = 'TEXT') =>
    apiCall('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content, type }),
    }),

  reactToMessage: (messageId: string, emoji: string) =>
    apiCall(`/messages/${messageId}/react`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    }),
};