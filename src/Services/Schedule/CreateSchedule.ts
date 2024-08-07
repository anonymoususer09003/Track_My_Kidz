import api from '@/Services';

export default async (isPractice: Boolean, body: any) => {
  const response = await api.post(`/schedule?isPractice=${isPractice}`, body);
  return response.data;
};
