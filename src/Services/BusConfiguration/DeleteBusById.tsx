import api from "@/Services";

export default async (id: any) => {
  return await api.delete(`/user/bus/delete/${id}`);
};
