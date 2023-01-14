import api from "@/Services";

export default async (data: any) => {
  const response = await api.post(
    `/group/instructor-update-group-status`,
    data
  );
  return response.data;
};
