import api from "@/Services";

export default async (data: any) => {
    const resp = await api.post(`/baftrends-gift/charge`, data);
    return resp.data

}
