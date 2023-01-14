import api from "@/Services";

export default async (bus: any) => {
    return await api.put(`/user/bus/update`, bus);
}
