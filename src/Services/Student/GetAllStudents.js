import api from "@/Services";

export default async () => {
  const response = await api.get(
    `/user/student/findall?page_number=0&page_size=20`
  );
  return response.data;
};
