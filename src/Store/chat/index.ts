import { buildSlice } from "@thecodingmachine/redux-toolkit-wrapper";
import FetchOne from "./SetChatParams";
import { CurrentUserDTO, GetUserDTO } from "@/Models/UserDTOs";

// This state is common to all the "user" module, and can be modified by any "user" reducers
const sliceInitialState = {
  item: {},
  fetchOne: {},
};

export default buildSlice("chat", [FetchOne], sliceInitialState).reducer;

export interface ChatState {
  item: any;
  fetchOne: {
    loading: boolean;
    error: any;
  };
}
