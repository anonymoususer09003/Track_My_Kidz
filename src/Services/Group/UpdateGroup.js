import api from "@/Services";

export default async (data: any) => {
  const response = await api.put(`/group/update`, data);
  return response.data;
};
