import {RegisterDTO} from "@/Models/UserDTOs";
import api from "@/Services";

export default async (register: RegisterDTO, type: string) => {
    return await api.post(
        `/auth/register/${type}`,
        register,
    )
}
