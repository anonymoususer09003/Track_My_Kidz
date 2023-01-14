import api from "@/Services";

export default async (id: number, status: any) => {
  const response = await api.get(
    `/group/getGroupsByInstructorId?instructorId=${id}&status=${status}`
  );
  return response.data;
};
