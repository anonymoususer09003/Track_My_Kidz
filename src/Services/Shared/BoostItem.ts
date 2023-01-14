import api from "@/Services";

export default async (data: any) => {
    return await api.post(`/product-boost`, data);
}
