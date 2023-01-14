import api from '@/Services'

export default async (page, pageSize) => {
    const response = await api.get(`/user/org/findallpage_number=${page}&page_size=${pageSize}`)
    return response.data
}
