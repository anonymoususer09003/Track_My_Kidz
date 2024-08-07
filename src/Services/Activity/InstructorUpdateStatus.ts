import api from '@/Services';

interface UpdateActivityStatus {
  activityId: number;
  instructorEmail: string;
  status: string;
}

export default async (data: UpdateActivityStatus) => {
  const response = await api.post(`/activity/instructor-update-activity-status`, data);
  return response.data;
};
