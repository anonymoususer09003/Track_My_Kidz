import { buildSlice } from "@thecodingmachine/redux-toolkit-wrapper";
import ChangeStudentActivity from "@/Store/StudentActivity/ChangeStudentActivityState";

export default buildSlice("StudentActivity", [ChangeStudentActivity], {
  showFamilyMap: false,
  hideCalendar: false,
  showParticipantMap: false,
}).reducer;

export interface StudentState {
  showFamilyMap: Boolean;
  hideCalendar: Boolean;
  showParticipantMap: Boolean;
}
