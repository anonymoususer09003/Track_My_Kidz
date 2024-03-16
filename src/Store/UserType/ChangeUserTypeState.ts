import {createAction} from '@reduxjs/toolkit';
import {UserTypeState} from '../../Store/UserType';

interface PayloadInterface {
  payload: Partial<UserTypeState>;
}

export default {
  initialState: {},
  action: createAction<Partial<UserTypeState>>('userType/changeUserTypeState'),
  reducers(state: UserTypeState, {payload}: PayloadInterface) {
    if (typeof payload.userType !== 'undefined') {
      state.userType = payload.userType;
    }
  },
};
