import api from '@/Services'

export default async (data: any) => {
    const response = await api.post(`/user/school/name/school_list_filter`, data);
    return response.data
}
