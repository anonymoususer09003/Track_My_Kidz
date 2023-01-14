import api from "@/Services";

export  default async (userId: any) => {
    const res = await api.post(`/user/${userId}/block`)
    return res
}
