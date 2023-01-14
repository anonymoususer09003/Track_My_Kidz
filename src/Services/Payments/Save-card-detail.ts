import api from "@/Services";

export default async (body: any) => {
  const resp = await api.post(`/payment-intent/save-card-details`, body);
  return resp.data;
};
