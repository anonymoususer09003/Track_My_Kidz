import api from "@/Services";

export default async (commentId: any) => {
    
    const res = await api.get(`/comment/${commentId}/replies`);
    return res?.data
}


