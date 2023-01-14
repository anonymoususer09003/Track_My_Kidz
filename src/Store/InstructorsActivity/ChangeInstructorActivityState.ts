import { createAction } from "@reduxjs/toolkit";
import { InstructorState } from "@/Store/InstructorsActivity";

interface PayloadInterface {
  payload: Partial<InstructorState>;
}

export default {
  initialState: {},
  action: createAction<Partial<InstructorState>>("modal/changeModalState"),
  reducers(state: InstructorState, { payload }: PayloadInterface) {
    if (typeof payload.selectedMonthForFilter !== "undefined") {
      state.selectedMonthForFilter = payload.selectedMonthForFilter;
    }
    if (typeof payload.selectedDayForFilter !== "undefined") {
      state.selectedDayForFilter = payload.selectedDayForFilter;
    }
  },
};
