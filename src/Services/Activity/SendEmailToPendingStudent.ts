import api from "@/Services";

export default async (data: any) => {
  const response = await api.post(
    `/activity/sendEmailToPendingStudentParents`,
    data
  );
  return response;
};
