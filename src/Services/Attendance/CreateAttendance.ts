import api from "@/Services";

export default async (body: any) => {
  return await api.post(`/attendance/create`, body);
};
