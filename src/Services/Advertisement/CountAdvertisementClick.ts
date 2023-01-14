import api from "@/Services";

export default async (advertisement: any) => {
    return await api.post(`/advertisement/click`, advertisement);
}
