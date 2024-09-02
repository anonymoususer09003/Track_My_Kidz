import api from '@/Services';

export default async (body: any) => {
  return await api.put(`/attendance/update`, body);
};
