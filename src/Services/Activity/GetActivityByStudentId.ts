import api from "@/Services";

export default async (studentId: number) => {
  const response = await api.get(
    `/activity/getActivityByStudentId?studentId=${studentId}`
  );
  return response.data;
};
