import api from '@/Services'

export default async (data) => {
    const response = await api.post(`/group/create`, data)
    return response.data
}
