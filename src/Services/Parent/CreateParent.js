import api from '@/Services'

export default async () => {
    const response = await api.post(`/user/parent/create`)
    return response.data
}
