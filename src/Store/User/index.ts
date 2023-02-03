import { buildSlice } from "@thecodingmachine/redux-toolkit-wrapper";
import FetchOne from "./FetchOne";
import { CurrentUserDTO, GetUserDTO } from "@/Models/UserDTOs";

// This state is common to all the "user" module, and can be modified by any "user" reducers
const sliceInitialState = {
  item: {},
  fetchOne: {},
};

export default buildSlice("user", [FetchOne], sliceInitialState).reducer;

export interface UserState {
  item: CurrentUserDTO;
  fetchOne: {
    loading: boolean;
    error: any;
  };
}
