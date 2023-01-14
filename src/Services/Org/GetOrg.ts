import api from '@/Services'

export default async (id: number) => {
    const response = await api.get(`/user/org/${id}`)
    return response.data
}
