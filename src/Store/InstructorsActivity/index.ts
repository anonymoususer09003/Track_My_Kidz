import ChangeInstructorActivity from "@/Store/InstructorsActivity/ChangeInstructorActivityState";
import { buildSlice } from "@thecodingmachine/redux-toolkit-wrapper";
import moment from "moment";

export default buildSlice("InstructorActivity", [ChangeInstructorActivity], {
  selectedMonthForFilter: moment().subtract(1, "M").format("M"),
  selectedDayForFilter: moment().format("DD"),
}).reducer;

export interface InstructorState {
  selectedMonthForFilter: number;
  selectedDayForFilter: number;
}
