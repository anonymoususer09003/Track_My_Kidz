import api from "@/Services";

export default async  (problem: any) => {
    return await api.post('/report-problem/create', problem);
}
