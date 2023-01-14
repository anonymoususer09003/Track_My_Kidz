import api from "@/Services";

export default async (id: any) => {
    return await api.get(`/user/bus/${id}`);
}
