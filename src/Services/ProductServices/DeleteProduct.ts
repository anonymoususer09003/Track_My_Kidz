import api from "@/Services";

export default async (productId: any) => {
    return await api.delete(`/products/${productId}`);
}
