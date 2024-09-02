import api from '@/Services';

export default async (id: any) => {
  console.log(`/activity/participantLocation?activity_id=${id}`);
  const response = await api.get(`/activity/participantLocation?activity_id=${id}`);
  return response.data;
};
