import api from '@/Services';

export default async (id: number) => {
  console.log(`/activity/delete/${id}`);
  const response = await api.delete(`/activity/delete/${id}`);
  return response.data;
};
