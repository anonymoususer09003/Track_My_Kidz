import api from '@/Services'

export default async (data) => {
    const response = await api.put(`/user/org/update`, JSON.stringify(data))
    return response.data
}
