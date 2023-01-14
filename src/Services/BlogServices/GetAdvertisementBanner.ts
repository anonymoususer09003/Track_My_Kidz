import api from "@/Services";

export default async({pageSize}:{ pageSize:any}) =>{
    return await api.get(`/advertisement/summary?pageNumber=1&pageSize=${pageSize}`);
}
