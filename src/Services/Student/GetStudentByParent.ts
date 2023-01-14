import api from "@/Services";

export default async (param: any) => {
  const response = await api.post(
    `/user/student/referenceCode/${param.code}/${param.parentId}`
  );
  return response.data;
};
