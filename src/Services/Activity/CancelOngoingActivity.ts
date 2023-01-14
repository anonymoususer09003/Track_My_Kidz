import api from "@/Services";

export default async (data: any) => {
  const response = await api.post(`/activity/cancel-ongoing-activity`, data);
  return response;
};
