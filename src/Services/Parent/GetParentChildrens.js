import api from '@/Services';
import { Alert } from 'react-native';

export default async (data) => {
  console.log(`/user/parent/v2/getChildren?referenceCode=${data}`);
  const response = await api.get(`/user/parent/v2/getChildren?referenceCode=${data}`);
  console.log('response', response);
  return response?.data;
};
