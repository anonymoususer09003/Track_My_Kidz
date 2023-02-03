import api from "@/Services";
import handleError from "@/Services/utils/handleError";
import {
  loadUserId,
  loadUserType,
  getStudentParentDetail,
  storeStudentParentDetail,
} from "@/Storage/MainAppStorage";
import {
  GetAllInstructors,
  GetInstructor,
  FindInstructorBySchoolOrg,
} from "@/Services/Instructor";
export default async () => {
  const userId = await loadUserId();
  const userType = await loadUserType();
  console.log("userId", userId);
  console.log("userType", userType);
  if (!userId) {
    return handleError({ message: "User ID is required" });
  }
  if (userType?.toLowerCase() === "parent") {
    const getInfo = await getStudentParentDetail();

    if (getInfo) {
      return JSON.parse(getInfo);
    } else {
      const response = await api.get(`/user/parent/${userId}`);
      await storeStudentParentDetail(JSON.stringify(response.data));
      return response.data;
    }
  } else if (userType?.toLowerCase() === "instructor") {
    // return {};
    // console.log("log0-0-0--00-");
    const response = await GetInstructor(userId);
    return response;
    // return {};
    return {};
  } else if (userType?.toLowerCase() === "student") {
    const getInfo = await getStudentParentDetail();

    if (getInfo) {
      return JSON.parse(getInfo);
    } else {
      const response = await api.get(`/user/student/${userId}`);
      await storeStudentParentDetail(JSON.stringify(response.data));
      return response.data;
    }
    // const response = await api.get(`/user/student/${userId}`);
    // console.log("RESPONSE", response);
    // return response.data;
  }
};
