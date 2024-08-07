import api from '@/Services';

export default async (data: any) => {
  return await api.post('/report/create', data);
};
