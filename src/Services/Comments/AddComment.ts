import api from "@/Services";

export default async (comment: any) => {
    return await api.post('/comment', comment);
}
