// import {
//   buildAsyncState,
//   buildAsyncReducers,
//   buildAsyncActions,
// } from "@thecodingmachine/redux-toolkit-wrapper";
// import fetchOneUserService from "@/Services/User/FetchOne";
// // fetchOneUserService();
// export default {
//   initialState: buildAsyncState("fetchOne"),
//   action: buildAsyncActions("user/fetchOne", fetchOneUserService),
//   reducers: buildAsyncReducers({
//     errorKey: "fetchOne.error", // Optionally, if you scoped variables, you can use a key with dot notation
//     loadingKey: "fetchOne.loading",
//   }),
// };

import { createAction } from "@reduxjs/toolkit";
import { ModalState } from "@/Store/Modal";

interface PayloadInterface {
  payload: Partial<ModalState>;
}

export default {
  initialState: {item:null},
  action: createAction<Partial<any>>("user/fetchOne"),
  reducers(state: any, { payload }: any) {
    console.log('0000000000payload',payload)
    state.item = payload?.item;
  },
};
