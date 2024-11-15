import api from "@/Services";

export default async (body: any, config: any) => {
  const response = await api.post(
    `/activity/count-pending-students-instructors`,
    body
  );
  return response.data;
};
