import api from '@/Services'

export default async () => {
    const response = await api.put(`/user/instructor/update`)
    return response.data
}
