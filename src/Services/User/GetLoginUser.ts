import {loadUserId} from "@/Storage/MainAppStorage";
import handleError from "@/Services/utils/handleError";
import api from "@/Services";

export default async  () => {
    const userId = await loadUserId();
    if (!userId) {
        return handleError({ message: 'User ID is required' })
    }
    const response = await api.get(`user/${userId}`)
    return response.data
}
