import api from "@/Services";
import handleError from "@/Services/utils/handleError";
import { loadUserId, loadUserType } from "@/Storage/MainAppStorage";

export default async () => {
  const userId = await loadUserId();
  const userType = await loadUserType();
  console.log("userId", userId);
  console.log("userType", userType);
  if (!userId) {
    return handleError({ message: "User ID is required" });
  }
  if (userType?.toLowerCase() === "parent") {
    const response = await api.get(`/user/parent/${userId}`);
    return response.data;
  } else if (false && userType?.toLowerCase() === "instructor") {
    // console.log("log0-0-0--00-");
    // const response = await api.get(`/user/instructor/${userId}`);
    // return response.data;
    // return {};
  } else if (userType?.toLowerCase() === "student") {
    const response = await api.get(`/user/student/${userId}`);
    console.log("RESPONSE", response);
    return response.data;
  }
};
