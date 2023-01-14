import api from "@/Services";

export default async(pageNumber: number, pageSize: number) =>{
    return await api.get(`/user/blocked?pageNumber=${pageNumber}&pageSize=${pageSize}`);
}
