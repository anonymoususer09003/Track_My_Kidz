import api from "@/Services";

export default async (blogId: any, followers:any) => {
    return await api.post(`/post/${blogId}/share`, followers);
}
