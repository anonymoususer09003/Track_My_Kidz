import api from "@/Services";

export default async () => {
  const response = await api.get(`findall?page_number=0&page_size=30`);
  return response.data;
};
