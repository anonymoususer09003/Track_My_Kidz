import api from "@/Services";

export default async (data: any) => {
  const response = await api.put(
    `/user/instructor/update-multiple-instructors`,
    data
  );
  return response.data;
};
