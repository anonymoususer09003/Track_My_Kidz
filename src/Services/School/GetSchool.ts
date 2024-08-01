import api from '@/Services';
import { Alert } from 'react-native';

export default async (id: number) => {
  const response = await api.get(`/user/school/v2/${id}`);
  return response.data;
};
