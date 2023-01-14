import api from "@/Services";

export default async (message: any) => {
    return await api.post('/contact-us/create', message);
}
