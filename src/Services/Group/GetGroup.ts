import api from '@/Services'

export default async (id: number) => {
    const response = await api.get(`/group/${id}`)
    return response.data
}
