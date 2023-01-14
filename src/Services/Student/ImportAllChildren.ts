import api from "@/Services";

export default async (param: any) => {
  const response = await api.post(
    `/user/student/importAllChildren/${param.referenceCode}`
  );
  return response.data;
};
