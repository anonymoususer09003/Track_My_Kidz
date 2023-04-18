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
  initialState: {},
  action: createAction<Partial<any>>("chat/setParams"),
  reducers(state: any, { payload }: any) {
    state.item = payload;
  },
};
