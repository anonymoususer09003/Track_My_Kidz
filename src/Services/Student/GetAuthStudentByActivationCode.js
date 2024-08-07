import api from '@/Services';

export default async (values) => {
  const response = await api.post(`/auth/student/${values.code}`, {
    studentEmail: values.studentEmail,
    parentEmail: values.parentEmail,
  });
  return response.data;
};
