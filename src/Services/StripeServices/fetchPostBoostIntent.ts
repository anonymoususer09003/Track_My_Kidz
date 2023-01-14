import api from "@/Services";

export default async(amount:number) =>{
    const resp= await api.post(`/v2/post-boost/intent`,{amountToPay:amount})
    return resp.data
}
