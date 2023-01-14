import {
    buildAsyncState,
    buildAsyncReducers,
    buildAsyncActions,
} from '@thecodingmachine/redux-toolkit-wrapper'
import {FetchLoggedUserAppointments} from "@/Services/SchedulerService";

export default {
    initialState: buildAsyncState('loadAppointments'),
    action: buildAsyncActions('appointments/loadAppointments', FetchLoggedUserAppointments),
    reducers: buildAsyncReducers({
        errorKey: 'loadAppointments.error', // Optionally, if you scoped variables, you can use a key with dot notation
        loadingKey: 'loadAppointments.loading',
    }),
}
