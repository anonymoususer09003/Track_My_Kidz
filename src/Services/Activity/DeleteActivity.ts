import api from '@/Services';

export default async (id: number) => {
  const response = await api.delete(`/activity/delete/${id}`);
  return response.data;
};
