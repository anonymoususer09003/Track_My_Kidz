import api from '@/Services'

export default async () => {
    const response = await api.put(`/user/parent/update`)
    return response.data
}
