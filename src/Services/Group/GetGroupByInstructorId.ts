import api from "@/Services";

export default async (
  id: number,
  status: any,
  page_number: any,
  page_size: any
) => {
  const response = await api.get(
    `/group/getGroupsByInstructorId?page_number=${page_number}&page_size=${page_size}&instructorId=${id}&status=${status}`
  );
  return response.data;
};
