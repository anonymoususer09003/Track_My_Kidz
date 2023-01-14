import api from '@/Services'

interface UpdateActivityStatus {
    activityId: number;
    studentId: string;
    status: string;
}

export default async (data: UpdateActivityStatus) => {
    console.log(data);
    const response = await api.post(`/activity/update-activity-status`, data);
    return response.data
}
