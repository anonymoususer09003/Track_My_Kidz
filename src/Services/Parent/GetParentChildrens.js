import api from '@/Services';
import { Alert } from 'react-native';

export default async (data) => {
  const response = await api.get(`/user/parent/v2/getChildren?referenceCode=${data}`);

  return response?.data;
};
