import api from "@/Services";

export default async (instructor_id: number, page_number: number, page_size: number) => {
    return await api.get(`/user/bus/findall?instructor_id=${instructor_id}&page_number=${page_number}&page_size=${page_size}`);
}
