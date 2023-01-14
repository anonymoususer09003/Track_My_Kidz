import api from "@/Services";
import {AppointmentPostDto} from "@/Models/UserDTOs";

export default async(serviceProviderId:string, appointmentPostDTO:AppointmentPostDto) =>{
    const res= await api.post(`/service-provider/${serviceProviderId}/appointment`,appointmentPostDTO);
    return res?.data
}

