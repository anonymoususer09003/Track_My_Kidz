import handleError from "@/Services/utils/handleError";
import api from "@/Services";
import {SchedulerSetupDTO} from "@/Models/Scheduler/scheduler.interface";

export default async (schedulerSetup: SchedulerSetupDTO) => {
    return await api.post('/service-provider', schedulerSetup);
}
