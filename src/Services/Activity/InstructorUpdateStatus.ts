import api from "@/Services";

interface UpdateActivityStatus {
  activityId: number;
  instructorEmail: string;
  status: string;
}

export default async (data: UpdateActivityStatus) => {
  console.log("90009099009", data);
  const response = await api.post(
    `/activity/instructor-update-activity-status`,
    data
  );
  return response.data;
};
