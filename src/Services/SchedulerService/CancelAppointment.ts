import api from "@/Services";
import {AppointmentPostDto} from "@/Models/UserDTOs";

export default async(serviceProviderId:string, appointmentId:string) =>{
    const res= await api.delete(`/service-provider/${serviceProviderId}/appointment/${appointmentId}`);
    return res?.data
}

