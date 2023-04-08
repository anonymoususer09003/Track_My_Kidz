import api from "@/Services";

export default async (studentId: any, date: any) => {
  const response = await api.get(
    `/user/parent/download-csv?studentId=${studentId}&date=${date}`
  );
  return response.data;
};
