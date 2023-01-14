import api from "@/Services";

export default async (id: number) => {
  console.log("logss0s909s090s90");
  const response = await api.get(`/user/parent/${id}`);
  return response.data;
};
