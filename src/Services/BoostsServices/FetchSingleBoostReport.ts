import api from "@/Services";

export default async(postId: string, frequency: string) =>{
    const res = await api.get(`/post/${postId}/boost-report/?frequency=${frequency}`);
    if (!Array.isArray(res?.data)) {
        return [];
    }

    return res?.data
}
