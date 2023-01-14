import api from '@/Services'

interface UpdateGroupStatus {
    groupId: number;
    studentId: string;
    status: string;
}

export default async (data: UpdateGroupStatus) => {
    const response = await api.post(`/group/parent-update-group-status`, data);
    return response.data
}
