import api from "@/Services";

export default async (id: number) => {
  const response = await api.get(`/user/school/v2/${id}`);
  return response.data;
};
