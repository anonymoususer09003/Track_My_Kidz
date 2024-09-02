import api from '@/Services';

export default async (data: any) => {
  console.log('data', data);

  const response = await api.post(`/activity/cancel-ongoing-activity`, data);
  return response;
};
