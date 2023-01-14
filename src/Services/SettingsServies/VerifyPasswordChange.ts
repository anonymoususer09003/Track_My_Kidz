import api from "@/Services";

export default async (changePasswordObject: { oldPassword: string, newPassword: string, token: string }) => {
    return await api.patch('/settings/change-password/verify', changePasswordObject);
}
