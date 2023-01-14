import api from "@/Services";

export default async(searchString: string, page: number, limit: number) =>{
    const res = await api.get(`/user/search?pageNumber=${page}&pageSize=${limit}&searchString=${searchString}`);

    const {data} = res?.data
    if (!Array.isArray(data)) {
        return [];
    }

    return data
}
