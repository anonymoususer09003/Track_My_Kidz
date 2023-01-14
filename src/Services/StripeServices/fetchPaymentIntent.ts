import api from "@/Services";

export default async (interval: string, type: string) => {
  const subscribtionType =
    type === "product-activation" ? "products" : "scheduler";
  return await api.post(
    `/service-activation/subscribe/products?interval=${interval}`
  );
};
