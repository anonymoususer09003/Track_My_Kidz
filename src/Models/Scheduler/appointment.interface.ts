export interface User {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    country: string;
    language: number;
    role: string;
    createdOn: Date;
    state: string;
    city: string;
    pictureUrl: string;
    zoomUserId: string;
    latestNotificationChecked: number;
}

export interface SpecificService {
    menuId: number;
    name: string;
    serviceTime: number;
}

export interface OpenDay {
    day: string;
    startHour: string;
    endHour: string;
}

export interface Menu {
    id: number;
    name: string;
    title: string;
    showingOrder: number;
    imageUrl: string;
}


export interface ServiceProvider {
    id: string;
    openDays: OpenDay[];
    bufferMinutes: number;
    closedDates: string[];
    user:  User;
}

export interface Appointment {
    id: string;
    user: User;
    note: string;
    specificServices: SpecificService[];
    appointmentTime: Date;
    serviceProvider: ServiceProvider;
}
