import api from "@/Services";

export default async  (user: any, type: string) => {
    if (type === 'parent') {
        return await api.put(
            '/user/parent/update',
            user,
        )
    } else if (type === 'instructor') {
        return await api.put(
            '/user/instructor/update',
            user,
        )
    } else if (type === 'school') {
        return await api.put(
            '/user/school/update',
            user,
        )
    } else {
        return await api.put(
            '/user/student/update',
            user,
        )
    }
}
