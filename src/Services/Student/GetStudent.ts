import api from '@/Services'

export default async (id: number) => {
    const response = await api.get(`/user/student/${id}`)
    return response.data
}
