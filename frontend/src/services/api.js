import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const uploadPolicyDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(`${API_BASE_URL}/ocr/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const savePolicy = async (policyData) => {
  const response = await axios.post(`${API_BASE_URL}/policies`, policyData);
  return response.data;
};

export const fetchPolicies = async () => {
  const response = await axios.get(`${API_BASE_URL}/policies`);
  return response.data;
};

export const exportPoliciesCsvUrl = () => {
  return `${API_BASE_URL}/policies/export`;
};
