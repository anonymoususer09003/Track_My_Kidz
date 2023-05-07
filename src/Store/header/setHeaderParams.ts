import { createAction } from "@reduxjs/toolkit";
import { ModalState } from "@/Store/Modal";

interface PayloadInterface {
  payload: Partial<ModalState>;
}

export default {
  initialState: {},
  action: createAction<Partial<any>>("header/setHeaderParams"),
  reducers(state: any, { payload }: any) {
    if (typeof payload.selectedDropDownOption !== "undefined") {
      state.selectedDropDownOption = payload.selectedDropDownOption;
    }

    if (typeof payload.dropDownValue !== "undefined") {
      state.dropDownValue = payload.dropDownValue;
    }
    if (typeof payload.searchBarValue !== "undefined") {
      state.searchBarValue = payload.searchBarValue;
    }
  },
};
