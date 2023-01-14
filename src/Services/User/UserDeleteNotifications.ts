import api from "@/Services";

export default async (id: any) => {
  const response = await api.delete(`/user/delete/${id}`);
  return response.data;
};
