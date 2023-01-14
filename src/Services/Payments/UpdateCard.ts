import api from "@/Services";

export default async (body: any) => {
  const resp = await api.patch("/payment-intent/update-card-details", body);
  return resp.data;
};
