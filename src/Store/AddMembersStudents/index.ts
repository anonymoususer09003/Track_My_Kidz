import {buildSlice} from '@thecodingmachine/redux-toolkit-wrapper'
import ChangeAddMembersStudentsState from '@/Store/AddMembersStudents/ChangeAddMembersStudentsState'

export default buildSlice('addMembersStudents', [ChangeAddMembersStudentsState], {
    students: []
}).reducer

export interface AddMembersStudentsState {
    students: any
}
