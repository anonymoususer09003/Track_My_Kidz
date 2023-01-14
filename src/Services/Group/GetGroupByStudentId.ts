import api from '@/Services'

export default async (studentId: number) => {
    const response = await api.get(`/group/getGroupByStudentId?studentId=${studentId}`);
    return response.data
}
