import { createAction } from "@reduxjs/toolkit";
import { StudentState } from "@/Store/StudentActivity";

interface PayloadInterface {
  payload: Partial<StudentState>;
}

export default {
  initialState: {},
  action: createAction<Partial<StudentState>>("modal/changeModalState"),
  reducers(state: StudentState, { payload }: PayloadInterface) {
    if (typeof payload.showFamilyMap !== "undefined") {
      state.showFamilyMap = payload.showFamilyMap;
    }
    if (typeof payload.hideCalendar !== "undefined") {
      state.hideCalendar = payload.hideCalendar;
    }
    if (typeof payload.showParticipantMap !== "undefined") {
      state.showParticipantMap = payload.showParticipantMap;
    }
  },
};
