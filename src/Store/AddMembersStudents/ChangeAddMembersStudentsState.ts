import { createAction } from '@reduxjs/toolkit'
import { AddMembersStudentsState } from '@/Store/AddMembersStudents'

interface PayloadInterface {
  payload: Partial<AddMembersStudentsState>
}

export default {
  initialState: {},
  action: createAction<Partial<AddMembersStudentsState>>('addMembersStudents/changeAddMembersStudentsState'),
  reducers(state: AddMembersStudentsState, { payload }: PayloadInterface) {
    if (typeof payload.students !== 'undefined') {
      state.students = payload.students;
    }
  },
}
