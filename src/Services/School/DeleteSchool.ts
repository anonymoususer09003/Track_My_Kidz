import api from '@/Services'

export default async (id: number) => {
    const response = await api.delete(`/user/school/delete/${id}`)
    return response.data
}
