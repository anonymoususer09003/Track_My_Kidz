import api from '@/Services';
import { Alert } from 'react-native';
export default async (data) => {
  const response = await api.post(`/activity/create`, data);
  return response.data;
};
