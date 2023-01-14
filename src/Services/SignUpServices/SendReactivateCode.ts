import {EmailDTO} from "@/Models/UserDTOs";
import api from "@/Services";

export default async (emailDTO: EmailDTO) => {
    return await api.post(
        '/public/v2/mobile-user/registration/send-reactivate-code',
        emailDTO,
    )
}
