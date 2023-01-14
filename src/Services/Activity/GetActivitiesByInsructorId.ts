import api from "@/Services";

export default async (id: string, status: string) => {
  const response = await api.get(
    `/activity/getActivitiesByInstructorId?instructorId=${id}&status=${status}`
  );
  return response;
};
