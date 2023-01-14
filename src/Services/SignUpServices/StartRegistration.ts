import api from "@/Services";

export default async (email: any, type?: string) => {
    return await api.post(`/auth/getactivationcode/${type?.toLowerCase()}`, JSON.stringify({
        email: email
    }))
}
