import api from "@/Services";
import {PostBoostDTO} from "@/Models/PostDTOS/post.interface";

export default async (body: PostBoostDTO) => {
    return await api.post(`/v2/post-boost/charge`, body)
}
