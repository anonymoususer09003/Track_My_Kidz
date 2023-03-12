import api from "@/Services";

export default async (data: { email: string }, type: string) => {
  const response = await api.post(`/auth/getactivationcode/${type}`, data);
  return response.data;
};
