import api from "@/Services";

export default async (data: any) => {
  const response = await api.post(
    `/activity/sendEmailToPendingInstructors`,
    data
  );
  return response;
};
