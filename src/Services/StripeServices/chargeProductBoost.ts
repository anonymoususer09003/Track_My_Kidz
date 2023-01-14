import api from "@/Services";
import {ProductBoostDTO} from "@/Models/PostDTOS/post.interface";

export default async (body: ProductBoostDTO) => {
    return await api.post(`/v2/product-boost/charge`, body)
}
