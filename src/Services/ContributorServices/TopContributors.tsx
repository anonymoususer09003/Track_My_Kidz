import api from "@/Services";

export default async () => {
    return await api.get('/contributors/top');
}
