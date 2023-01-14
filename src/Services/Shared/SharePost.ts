import api from "@/Services";

export default async (id:string,shareTo:string[]) => {
    return await api.post(`/post/${id}/share`, shareTo);
}
