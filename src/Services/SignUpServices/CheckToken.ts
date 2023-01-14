import api from "@/Services";

export default async (activationToken: any) => {
    return await api.post(
        '/public/v2/mobile-user/registration/check-token',
        activationToken,
    )
}
