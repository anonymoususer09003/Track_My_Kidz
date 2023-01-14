import handleError from "@/Services/utils/handleError";
import api from "@/Services";

export default async (isTrue: boolean) => {
    if (!isTrue) {
        return handleError({message: 'Select is required'})
    }
    return await api.patch('/settings/other-setting', isTrue);
}
