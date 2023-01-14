import api from "@/Services";

export default async (searchString: any, pageNumber: number, pageSize: number) => {
    const res = await api.get(`/products/self?pageNumber=${pageNumber}&pageSize=${pageSize}&searchString=${searchString}`);
    const { data } = res?.data
    
    if (!Array.isArray(data)) {
        return [];
    }

    return data
}


