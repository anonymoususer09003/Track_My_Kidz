import api from '@/Services'

export default async (id: number, page: number, pageSize: number) => {
    const response = await api
        .get(`/group/find-groups-by-instructorId?instructor_id=${id}&page_number=${page}&page_size=${pageSize}`)
    return response.data
}
