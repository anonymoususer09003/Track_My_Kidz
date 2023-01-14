import api from "@/Services";

export default async () => {
  const response = await api.get("/user/getNotifications");
  return response.data;
};
