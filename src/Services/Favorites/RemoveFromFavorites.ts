import api from "@/Services";

export default async (postId: any) => {
    const res = await api.post(`post/${postId}/favourite`);
    return res
}
