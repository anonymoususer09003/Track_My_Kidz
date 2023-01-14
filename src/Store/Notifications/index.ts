import {buildSlice} from '@thecodingmachine/redux-toolkit-wrapper'
import {NotificationsDTO, UnreadCount} from "@/Models/NotificationsDTO/NotificationsDTO";
import FetchNotifications from "@/Store/Notifications/FetchNotifications";
import FetchUnreadCount from "@/Store/Notifications/FetchUnreadCount";

const sliceInitialState = {
    notifications: [],
    notificationsState:{
        loading:false,
        error:''
    },
    unreadCount: {latest:0},
    unreadCountState: {
        loading: false,
        error: ''
    }
}

export default buildSlice('notifications', [FetchNotifications,FetchUnreadCount], sliceInitialState).reducer

export interface NotificationsState {
    notifications: NotificationsDTO[]
    notificationsState: {
        loading: boolean
        error: any
    },
    unreadCount: UnreadCount,
    unreadCountState: {
        loading: boolean
        error: any
    },
}
