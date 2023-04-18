import api from "@/Services";

export default async (data: any) => {
  const response = await api.post(`/group/sendEmailToPendingInstructors`, data);
  return response;
};
