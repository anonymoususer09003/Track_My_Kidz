import api from "@/Services";

export default async (id: number) => {
  const response = await api.get(`/user/instructor/${id}`);
  return response.data;
};
