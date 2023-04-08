import axios from "axios";
import handleError from "@/Services/utils/handleError";
import { Config } from "@/Config";
import { loadToken } from "@/Storage/MainAppStorage";

const instance = axios.create({
  baseURL: Config.API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  // timeout: 60000,
});

instance.interceptors.request.use(async (request) => {
  const token = await loadToken();
  console.log("token", token);
  if (token) {
    switch (request.url) {
      case "/contact-us/create":
        request.headers = {
          ...request.headers,

          Authorization: "Bearer " + token,
        };

        break;

      case "/user/student/create":
      case "/user/student/update":
      case "/user/instructor/create":
      case "/user/instructor/update":
        request.headers = {
          ...request.headers,

          Authorization: "Bearer " + token,
          "Content-Type": "multipart/form-data",
        };

      default:
        request.headers.Authorization = "Bearer " + token;
    }
  }
  console.log("request----", request);
  // console.log("request", request);
  return request;
});

instance.interceptors.response.use(
  (response) => response,
  ({ message, response: { data, status } }) => {
    console.log("response", message, data);

    return handleError({ message, data, status });
  }
);

export default instance;
