import api from "@/Services";

export default async(userId:string, day:Date) =>{
    const res= await api.get(`/service-provider/user/${userId}/appointment?day=`+day.toISOString().substr(0,10));
    return res?.data
}

