import api from '@/Services';

interface FindActivityByStudentStatus {
  activityId: number;
  status: string;
  page: number;
  page_size: number;
}

export default async (data: FindActivityByStudentStatus) => {
  const response = await api.post(
    `/activity/students-which-activity-status-pending/approved/decline?page_number=${data.page}&page_size=${data.page_size}`,
    data
  );

  return response.data;
};
