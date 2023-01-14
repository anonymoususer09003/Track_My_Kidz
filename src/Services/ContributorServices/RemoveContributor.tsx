import api from "@/Services";

export default async (userId: any) => {
    return await api.delete(`/contributors/contributors/delete/${userId}`);
}
