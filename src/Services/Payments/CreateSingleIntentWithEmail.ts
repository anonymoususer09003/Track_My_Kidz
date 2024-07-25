import api from "@/Services";

export default async (body:any) => {
  const resp = await api.post(`/payment-intent/single-intent-email`, body);
  return resp.data;
};
