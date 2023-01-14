import { buildSlice } from "@thecodingmachine/redux-toolkit-wrapper";
import ChangeInstructorActivity from "@/Store/InstructorsActivity/ChangeInstructorActivityState";
import moment from "moment";

export default buildSlice("InstructorActivity", [ChangeInstructorActivity], {
  selectedMonthForFilter: moment().format("M"),
  selectedDayForFilter: moment().format("DD"),
}).reducer;

export interface InstructorState {
  selectedMonthForFilter: String;
  selectedDayForFilter: String;
}
