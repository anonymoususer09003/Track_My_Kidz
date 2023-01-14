import api from '@/Services'

export default async (id: number) => {
    const response = await api.delete(`/group/delete/${id}`)
    return response.data
}
