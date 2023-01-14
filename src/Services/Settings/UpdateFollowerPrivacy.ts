import api from "@/Services";

export default async(id: string) =>{
    return await api.post(`/user/${id}/private`, {id})
}
