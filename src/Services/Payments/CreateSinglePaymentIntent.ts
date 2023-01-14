import api from "@/Services";

export default async (amount: number) => {
  const resp = await api.post(`/payment-intent/single-intent`, {
    amountToPay: amount,
  });
  return resp.data;
};
