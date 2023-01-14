import api from '@/Services'

export default async (id: number) => {
    const response = await api.delete(`/user/instructor/delete/${id}`)
    return response.data
}
