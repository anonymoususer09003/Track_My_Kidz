import api from "@/Services";

export default async( searchString:any,pageNumber:number, pageSize:number,adsPageSize:number) =>{
    const res= await api.get(`/products?pageNumber=${pageNumber}&pageSize=${pageSize}&searchString=${searchString}&adsPageSize=${adsPageSize}`);
    const data = res?.data

    return data
}


