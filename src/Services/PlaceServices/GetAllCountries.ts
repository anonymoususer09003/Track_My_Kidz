import api from "@/Services";

export default async () => {
  const response = await api.get("/public/places/country");
  return response?.data;
};
