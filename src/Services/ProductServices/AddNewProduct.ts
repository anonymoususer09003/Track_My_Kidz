import api from "@/Services";

export default async (product: any) => {
    return await api.post('/products', product);
}
