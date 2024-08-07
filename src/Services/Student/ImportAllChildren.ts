import api from '@/Services';

export default async (body: any, code: any) => {
  const response = await api.post(`/user/student/v2/importAllChildren/${code}`, body);
  return response.data;
};
