import api from "@/Services";

export default async () => {
  const resp = await api.get("/payment-intent/get-card-detail");
  return resp.data;
};
