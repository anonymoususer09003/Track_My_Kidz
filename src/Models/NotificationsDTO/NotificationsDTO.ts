import {GetUserDTO} from "@/Models/UserDTOs";

export interface NotificationsDTO {
    id: number;
    message: string;
    operation: string;
    operationDate: Date;
    reference: string;
    user: GetUserDTO;
}

export interface UnreadCount {
    latest: number;
}
