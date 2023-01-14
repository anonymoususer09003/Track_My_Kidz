import api from "@/Services";

export default async (contributorIds: any) => {
    return await api.post(`/contributors/addContributor`, {
        contributorIds: [
            contributorIds
          ]
    });
}
