import api from '@/Services';

export default async (body: any, referenceCode: any) => {
  const response = await api.post(`/user/student/importChild/${referenceCode}`, body);

  return response.data;
};
