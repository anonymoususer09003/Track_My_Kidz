import api from "@/Services";

export default async (commentId: any) => {     
    const res= await api.delete(`/comment/${commentId}`);
    return res
}
