import api from "@/Services";

export default async (postId: any) => {
    const res = await api.post(`product/${postId}/share`);
    return res
}
