import handleError from "@/Services/utils/handleError";
import api from "@/Services";

export default async  (userId: string) => {
    if (!userId) {
        return handleError({ message: 'User ID is required' })
    }
    const response = await api.get(`user/${userId}`)
    return response.data
}
