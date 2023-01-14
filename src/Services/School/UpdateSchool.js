import api from '@/Services'

export default async (data) => {
    const response = await api.put(`/user/school/update`, JSON.stringify(data))
    return response.data
}
