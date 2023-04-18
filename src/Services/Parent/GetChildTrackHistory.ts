import api from "@/Services";

export default async (studentId) => {
  const response = await api.post(
    `/user/parent/childLocationHistory?studentId=${studentId}`
  );
  return response.data;
};
