import api from "@/Services";

export default async (id: string, date: string) => {
    return await api.get(`/user/${id}/free-boost/acceptedDate/${date}`)
}
