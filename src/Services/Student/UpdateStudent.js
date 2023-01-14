import api from "@/Services";

export default async (data) => {
  const response = await api.put(`/user/student/update`, data);
  return response.data;
};
