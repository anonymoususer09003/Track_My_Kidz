import api from "@/Services";

export default async (id: string) => {
    return await api.get(`/user/${id}/free-boost/offer`)
}
