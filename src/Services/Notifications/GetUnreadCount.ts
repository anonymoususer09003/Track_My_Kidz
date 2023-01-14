import api from "@/Services";

export default async () => {
    const response = await api.get('/notifications/latest')
    return response.data;
}
