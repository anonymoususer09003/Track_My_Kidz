import api from '@/Services'

export default async () => {
    const response = await api.post(`/user/instructor/create`)
    return response.data
}
