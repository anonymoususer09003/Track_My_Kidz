import api from "@/Services";

export default async (blog: any) => {
    
    return await api.post('/post/flag', blog);
}
