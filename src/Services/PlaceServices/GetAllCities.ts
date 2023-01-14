import api from "@/Services";

export default async(countryId: any, stateId: any) => {
    return await api.get(`/public/places/country/${countryId}/state/${stateId}/cities`);
}
