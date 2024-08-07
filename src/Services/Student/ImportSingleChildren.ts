import api from '@/Services';

export default async (body: any, referenceCode: any) => {
  console.log('body', body);
  const response = await api.post(`/user/student/importChild/${referenceCode}`, body);
  console.log('resposne', response);
  return response.data;
};
