import api from "@/Services";

interface FindActivityByInstructorStatus {
  activityId: number;
  status: string;
  page: number;
  page_size: number;
}

export default async (data: FindActivityByInstructorStatus) => {
  const response = await api.post(
    `/activity/instructors-which-activity-status-pending/approved/decline?page_number=${data.page}&page_size=${data.page_size}`,
    data
  );
  return response.data;
};
