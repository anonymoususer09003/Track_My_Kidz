import LogoutStore from "@/Store/Authentication/LogoutStore";
import { store } from "@/Store";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { Alert } from "react-native";

export interface Error {
  message?: string;
  data?: any;
  status?: number;
}

export default function ({ message, data, status }: Error) {


  const { dispatch } = store;
  if (status == 401) {
    dispatch(LogoutStore.action());
  } else if (status == 403) {
    if (data.title == "TWO FA REQUIRED") {
      dispatch(ChangeModalState.action({ twoFactorAuthCodeModal: true }));
    }
  } else if (status == 502 || status == 504) {
    Alert.alert("something went wrong please later");
  }
  return Promise.reject({ message, data, status });
}
