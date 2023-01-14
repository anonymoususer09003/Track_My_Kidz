import api from "@/Services";

export default async  (id: any) => {
    return await api.post(`/user/${id}/block`);
}
