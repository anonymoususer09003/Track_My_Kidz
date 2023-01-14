import api from '@/Services'

export default async (id: number) => {
    const response = await api.get(`/activity/${id}`)
    return response.data
}
