import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import jwt_decode from "jwt-decode";

interface JwtBaftrendsPayload {
  sub: string;
  jti: string;
  aud: string;
  exp: number;
}

export const storeToken = async (value: string) => {
  try {
    await AsyncStorage.setItem("login_token", value);
    const decoded = jwt_decode<JwtBaftrendsPayload>(value);
    await storeUserId(decoded.jti);
    return true;
  } catch (e) {
    return false;
  }
};
export const storeInstructors = async (instructors: any) => {
  try {
    await AsyncStorage.setItem("instructors", instructors);

    return true;
  } catch (e) {
    return false;
  }
};
export const getOrgInstructors = async (instructors: any) => {
  try {
  let res=  await AsyncStorage.getItem("instructors");

    return res;
  } catch (e) {
    return false;
  }
};
export const removeInstructors = async () => {
  try {
    await AsyncStorage.removeItem("instructors");
    return true;
  } catch (e) {
    return false;
  }
};
export const clearToken = async () => {
  await AsyncStorage.removeItem("login_token");
  await AsyncStorage.removeItem("instructor_groups");
  await AsyncStorage.removeItem("instructor_activites");
  await AsyncStorage.removeItem("student_activites");
  await AsyncStorage.removeItem("student_groups");
};

export const storeHomeScreenCacheInfo = async (type: string, data: any) => {
  await AsyncStorage.setItem(type, data);
};
export const getHomeScreenCacheInfo = async (type: any) => {
  try {
    const value = await AsyncStorage.getItem(type);
    if (value !== null) {
      return value;
    }
  } catch (e) {}
  return "";
};

export const storeBiometricToken = async () => {
  const existingToken = await loadToken();
  await AsyncStorage.setItem("biometric_token", existingToken);
};

export const loadBiometricToken = async () => {
  try {
    const value = await AsyncStorage.getItem("biometric_token");
    if (value !== null) {
      return value;
    }
  } catch (e) {}
  return "";
};

export const loadToken = async () => {
  try {
    const value = await AsyncStorage.getItem("login_token");
    if (value !== null) {
      return value;
    }
  } catch (e) {}
  return "";
};

export const clearUserId = async () => {
  await AsyncStorage.removeItem("user_id");
};

export const storeCountryDetail = async (data: any) => {
  await AsyncStorage.setItem("country_detail", data);
};
export const removeCountryDetail = async () => {
  await AsyncStorage.removeItem("country_detail");
};
export const getCountryDetail = async () => {
  return await AsyncStorage.getItem("country_detail");
};
export const storeInstructorDetail = async (data: any) => {
  await AsyncStorage.setItem("instructor_detail", data);
};
export const removeInstructorDetail = async () => {
  await AsyncStorage.removeItem("instructor_detail");
};
export const getInstructorDetail = async () => {
  return await AsyncStorage.getItem("instructor_detail");
};

export const storeStudentParentDetail = async (data: any) => {
  await AsyncStorage.setItem("studentParent_detail", data);
};
export const removeStudentParentDetail = async () => {
  await AsyncStorage.removeItem("studentParent_detail");
};
export const getStudentParentDetail = async () => {
  return await AsyncStorage.getItem("studentParent_detail");
};
export const storeUserId = async (userId: string) => {
  await AsyncStorage.setItem("user_id", userId);
};

export const storeId = async (userId: string) => {
  await AsyncStorage.setItem("id", userId);
};

export const storeIsSubscribed = async (isSubscribed: boolean) => {
  await AsyncStorage.setItem("isSubscribed", isSubscribed.toString());
};

export const clearUserType = async () => {
  await AsyncStorage.removeItem("user_id");
};

export const storeUserType = async (user_type: string) => {
  await AsyncStorage.setItem("user_type", user_type);
};
export const removeStoreUserType = async () => {
  await AsyncStorage.removeItem("user_type");
};

export const loadUserId = async () => {
  return await AsyncStorage.getItem("user_id");
};
export const removeUserId = async () => {
  return await AsyncStorage.removeItem("user_id");
};

export const loadId = async () => {
  return await AsyncStorage.getItem("id");
};

export const loadIsSubscribed = async () => {
  const isSubscribed = await AsyncStorage.getItem("isSubscribed");
  if (isSubscribed == "true") {
    return true;
  }
  return false;
};

export const loadUserType = async () => {
  return await AsyncStorage.getItem("user_type");
};
export const removeUserType = async () => {
  return await AsyncStorage.removeItem("user_type");
};

export const setDateTime = async (data: any) => {
  return await AsyncStorage.setItem("last_date_time", JSON.stringify(data));
};

export const loadDateTime = async () => {
  const data = await AsyncStorage.getItem("last_date_time");
  if (!data) {
    return null;
  }
  return JSON.parse(data);
};
