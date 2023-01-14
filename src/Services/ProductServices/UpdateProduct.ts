import api from "@/Services";

export default async (product: any, productId:any) => {
    return await api.patch(`/products/${productId}`, product);
}
