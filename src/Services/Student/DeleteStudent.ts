import api from '@/Services';

export default async (id: number | string, parentId: number | string) => {
  const response = await api.delete(`/user/student/delete/${id}/${parentId}?approve=true`);

  return response.data;
};
