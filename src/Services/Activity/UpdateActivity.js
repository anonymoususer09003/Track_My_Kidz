import api from "@/Services";

export default async (body) => {
  const response = await api.put(`/activity/update`, body);
  return response.data;
};
