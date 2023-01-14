import api from "@/Services";
import {PostBoostDTO, PostBoostFreeDTO} from "@/Models/PostDTOS/post.interface";


export default async (body: PostBoostFreeDTO) => {
    return await api.post(`/v2/post-boost/free`, body)
}
