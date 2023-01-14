import {UserRegistrationDTO} from "@/Models/UserDTOs";
import api from "@/Services";

export default async (userRegistration: UserRegistrationDTO, type: string) => {
    if (type === 'parent') {
        return await api.post(
            '/user/parent/create',
            userRegistration,
        )
    } else if (type === 'instructor') {
        return await api.post(
            '/user/instructor/create',
            userRegistration,
        )
    } else if (type === 'school') {
        return await api.post(
            '/user/school/create',
            userRegistration,
        )
    } else {
        return await api.post(
            '/user/student/create',
            userRegistration,
        )
    }
}
