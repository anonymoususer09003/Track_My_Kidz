import LogoutStore from '@/Store/Authentication/LogoutStore'
import {store} from "@/Store";
import ChangeModalState from "@/Store/Modal/ChangeModalState";

export interface Error {
    message?: string
    data?: any
    status?: number
}

export default function ({message, data, status}: Error) {
    const {dispatch} = store
    if (status == 401) {
        dispatch(LogoutStore.action())
    } else if (status == 403) {
        if (data.title == "TWO FA REQUIRED") {
            dispatch(ChangeModalState.action({twoFactorAuthCodeModal: true}))
        }
    }
    return Promise.reject({message, data, status})
}
