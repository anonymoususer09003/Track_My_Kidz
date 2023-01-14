import api from "@/Services";

export default async (contributorId: any) => {
    return await api.post(`/user/${contributorId}/follow`);
}
