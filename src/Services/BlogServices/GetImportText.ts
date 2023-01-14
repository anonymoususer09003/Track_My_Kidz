import api from "@/Services";

export default async (blog: any) => {
    return await api.post('/blogs/v2/get-text', blog);
}
