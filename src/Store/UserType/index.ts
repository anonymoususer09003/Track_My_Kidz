import {buildSlice} from '@thecodingmachine/redux-toolkit-wrapper'
import ChangeUserTypeState from '@/Store/UserType/ChangeUserTypeState'

export default buildSlice('userType', [ChangeUserTypeState], {
    userType: ''
}).reducer

export type UserType = 'instructor' | 'student' | 'parent'

export interface UserTypeState {
    userType: UserType
}
