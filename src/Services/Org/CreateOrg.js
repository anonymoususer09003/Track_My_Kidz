import api from '@/Services'

export default async (data) => {
    const response = await api.post(`/user/org/create`, data)
    return response.data
}
