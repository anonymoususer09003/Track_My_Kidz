import api from "@/Services";

export default async (data: any) => {
    return await api.post(`/report-problem/create`, data);
}
