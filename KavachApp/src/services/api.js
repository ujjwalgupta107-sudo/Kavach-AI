import axios from 'axios';

// Emulator backend se connect karne ke liye default 10.0.2.2 IP use hoti hai
const API_BASE_URL = 'http://10.0.2.2:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const kavachAPI = {
  // 1. Live Call Stream Verification
  analyzeCallStream: async (phone, transcriptChunk) => {
    const response = await api.post('/call/analyze', {
      phone: phone,
      audio_transcript_chunk: transcriptChunk,
    });
    return response.data;
  },

  // 2. Truecaller Registry Incident Check
  checkPhoneReputation: async (phoneNumber) => {
    const response = await api.get(`/phone/check/${phoneNumber}`);
    return response.data;
  },

  // 3. Central Database Fraud Incident Report Submit
  submitIncidentReport: async (reportData) => {
    const response = await api.post('/report', reportData);
    return response.data;
  },
};

export default api;