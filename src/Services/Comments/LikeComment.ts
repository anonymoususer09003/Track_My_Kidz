import api from "@/Services";

export default async (commentId: any) => {     
    const res= await api.put(`/comment/${commentId}/like`);
    return res
}
