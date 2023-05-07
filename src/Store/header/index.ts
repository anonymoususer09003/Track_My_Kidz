import { buildSlice } from "@thecodingmachine/redux-toolkit-wrapper";
import FetchOne from "./setHeaderParams";

// This state is common to all the "user" module, and can be modified by any "user" reducers
const sliceInitialState = {
  selectedDropDownOption: "",
  dropDownValue: "",
  searchBarValue: "",
};

export default buildSlice("header", [FetchOne], sliceInitialState).reducer;

export interface HeaderState {
  selectedDropDownOption: any;
  dropDownValue: any;
  searchBarValue: any;
}
