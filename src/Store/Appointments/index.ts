import {buildSlice} from '@thecodingmachine/redux-toolkit-wrapper'
import LoadAppointments from "@/Store/Appointments/LoadAppointments";
import {Appointment} from "@/Models/Scheduler/appointment.interface";

// This state is common to all the "user" module, and can be modified by any "user" reducers
const sliceInitialState = {
    item: [],
}

export default buildSlice('appointments', [LoadAppointments], sliceInitialState).reducer

export interface AppointmentsState {
    item: Appointment[]
    loadAppointments: {
        loading: boolean
        error: any
    }
}
