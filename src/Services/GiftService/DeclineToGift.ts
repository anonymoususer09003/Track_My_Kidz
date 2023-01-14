import api from "@/Services";

export default async () => {
    const resp = await api.delete(`/baftrends-gift/decline`);
    return resp.data

}
