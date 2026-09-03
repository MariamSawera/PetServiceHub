import api from './axios';

export const uploadImage = (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('image', file);

  return api.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
};
