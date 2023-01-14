import api from "@/Services";

export default async (data: any) => {
  console.log("data", data);
  return await api.post("/report/create", data);
};
