import api from "@/Services";

export default async (body: any) => {
  const response = await api.post(
    `/group/count-pending-students-instructors`,
    body
  );
  return response.data;
};
