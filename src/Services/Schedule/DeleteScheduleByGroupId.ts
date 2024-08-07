import api from '@/Services';

export default async (id: number, isPractice: boolean) => {
  const response = await api.delete(`/schedule/group/${id}?isPractice=${isPractice}`);
  return response?.data;
};
