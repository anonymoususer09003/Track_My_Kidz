import api from "@/Services";

export default async(productId:any) =>{
    const res= await api.get(`/products/${productId}`);
    return res?.data
}


