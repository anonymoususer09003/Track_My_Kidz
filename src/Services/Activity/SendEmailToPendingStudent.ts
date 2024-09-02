import api from '@/Services';

export default async (data: any) => {
  console.log('data', data);
  const response = await api.post(`/activity/sendEmailToPendingStudentParents`, data);
  return response;
};
