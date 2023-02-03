import api from "@/Services";

export default async (id: string, status: string, page: any, pageSize: any) => {
  const response = await api.get(
    `/activity/getActivitiesByInstructorId?page_number=${page}&page_size=${pageSize}&instructorId=${id}&status=${status}`
  );
  return response;
};
