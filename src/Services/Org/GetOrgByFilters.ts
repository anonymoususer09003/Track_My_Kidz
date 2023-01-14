import api from '@/Services'

export default async (data: any) => {
    const response = await api.post(`/user/org/org_list_filter`, data);
    return response.data
}
