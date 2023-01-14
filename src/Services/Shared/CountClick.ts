import api from "@/Services";

export default async ( id:any) => {
    return await api.post(`/post/${id}/clicked`,id);
}
