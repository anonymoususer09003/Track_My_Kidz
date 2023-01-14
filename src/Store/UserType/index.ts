import {buildSlice} from '@thecodingmachine/redux-toolkit-wrapper'
import ChangeUserTypeState from '@/Store/UserType/ChangeUserTypeState'

export default buildSlice('userType', [ChangeUserTypeState], {
    userType: ''
}).reducer

export interface UserTypeState {
    userType: string
}
