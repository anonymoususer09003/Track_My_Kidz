import api from '@/Services';

export default async (id: number | string, parentId: number | string) => {
  console.log('id', id);
  console.log('parentid', parentId);
  const response = await api.delete(
    `/user/student/delete/${id}/${parentId}?approve=true`,
  );
  console.log('logs', response);
  return response.data;
};
