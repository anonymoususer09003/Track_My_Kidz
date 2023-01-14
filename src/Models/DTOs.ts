export interface Activity {
    status?: string;
    scheduler?: {
        fromDate: string;
        toDate: string;
    };
    activityName: string;
    venueToName: string;
    venueToAddress: string;
    students: Student[];
    instructors: any[];
    optin: Optin;
}

export interface Optin {
    instructions: string;
    disclaimer: string;
    agreement: string;
}

export interface Student {
    studentId: number;
    firstname: string;
    lastname: string;
    phone: string;
    email: string;
    school: string;
    grade: string;
    status: string;
    approve: boolean;
    latitude: string;
    longititude: string;
    parentemail1: string;
    parentemail2: string;
    referenceCode: string;
    toggleAlert: boolean;
}