import api from "@/Services";

export default async (contributorId: any) => {
    return await api.delete(`/user/${contributorId}/follow`);
}
