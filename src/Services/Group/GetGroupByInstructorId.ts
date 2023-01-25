import api from "@/Services";

export default async (id: number, status: any) => {
  const response = await api.get(
    `/group/getGroupsByInstructorId?page_number=0&page_size=20&instructorId=${id}&status=${status}`
  );
  return response.data;
};
