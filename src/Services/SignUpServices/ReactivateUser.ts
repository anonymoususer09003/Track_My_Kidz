import {EmailDTO} from "@/Models/UserDTOs";
import api from "@/Services";

export default async (objectDto: any) => {
    return await api.post(
        '/public/v2/mobile-user/registration/reactivate',
        objectDto,
    )
}
