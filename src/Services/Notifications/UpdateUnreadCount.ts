import api from "@/Services";

export default async (latest:number) => {
    const response = await api.post('/notifications/latest?latest='+latest)
    return response.data;
}
