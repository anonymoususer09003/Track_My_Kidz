import { createAction } from "@reduxjs/toolkit";
import { ModalState } from "@/Store/Modal";

interface PayloadInterface {
  payload: Partial<ModalState>;
}

export default {
  initialState: {},
  action: createAction<Partial<any>>("places/fetchCountries"),
  reducers(state: any, { payload }: any) {
    state.countries = payload?.countries;
  },
};
