import api from '../../../lib/axios';

export const getPosts = () => api.get('/api/community/posts');
export const getPostComments = (postId) => api.get(`/api/community/posts/${postId}/comments`);
export const createPost = (payload) => api.post('/api/community/posts', payload);
export const updatePost = (postId, payload) => api.patch(`/api/community/posts/${postId}`, payload);
export const deletePost = (postId) => api.delete(`/api/community/posts/${postId}`);
export const createComment = (postId, content) => api.post(`/api/community/posts/${postId}/comments`, { content });
export const deleteComment = (commentId) => api.delete(`/api/community/comments/${commentId}`);
