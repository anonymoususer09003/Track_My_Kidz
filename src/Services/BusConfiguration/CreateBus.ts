import api from "@/Services";

export default async (bus: any) => {
    return await api.post(`/user/bus/create`, bus);
}
