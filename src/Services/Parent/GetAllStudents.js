import api from '@/Services'

export default async () => {
    const response = await api.get(`/user/student/findall`)
    return response.data
}
