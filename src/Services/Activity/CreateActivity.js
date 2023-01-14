import api from '@/Services'

export default async (data) => {
    const response = await api.post(`/activity/create`, data)
    return response.data
}
