import api from '@/Services';

export default async (data) => {
  const response = await api.get(`/user/parent/v2/getChildren?referenceCode=${data}`);
  console.log('response', response);
  return response?.data;
};
