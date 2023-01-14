import api from '@/Services'

export default async (data) => {
    const response = await api.post(`/user/school/create`, data)
    return response.data
}
