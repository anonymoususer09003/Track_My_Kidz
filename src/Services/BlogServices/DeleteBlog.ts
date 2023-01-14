import api from "@/Services";

export default async (blogId: any) => {
     
    const res= await api.delete(`/blogs/${blogId}`);
    
    return res
}
