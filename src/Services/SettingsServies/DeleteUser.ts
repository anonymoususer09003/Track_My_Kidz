import api from "@/Services";

export default async(id: number) => {
    return await api.delete(`/user/delete/${id}`);
}
