import api from '@/Services';

export default async (id: any) => {
  const response = await api.get(`/activity/participantLocation?activity_id=${id}`);
  return response.data;
};
