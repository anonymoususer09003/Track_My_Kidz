import api from '@/Services'

export default async (data) => {
    const response = await api.post(`/user/student/create`, data)
    return response.data
}
