import api from '@/Services'

export default async (page_number, page_size) => {
    const response = await api.get(`/user/instructor/findall?page_number=${page_number}&page_size=${page_size}`)
    return response.data
}
