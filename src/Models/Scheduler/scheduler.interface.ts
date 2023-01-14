export interface OpenDaysDTO {
    day: string;
    endHour: string;
    startHour: string;
}

export interface SpecificServicesDTO {
    menuId: number;
    name: string;
    serviceTime: string;
}

export interface SchedulerSetupDTO {
    bufferMinutes: number;
    closedDates: Date[];
    openDays: OpenDaysDTO[];
    specificServices: SpecificServicesDTO[];
}
