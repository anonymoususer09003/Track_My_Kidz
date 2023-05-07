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
