import api from '@/Services';

export default async (data, user_id) => {
  const response = await api.post(
    `/user/instructor/create-multiple-instructors?user_id=${user_id}`,
    data
  );
  return response.data;
};
