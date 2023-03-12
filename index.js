/**
 * @format
 */

import { AppRegistry, Platform } from "react-native";
import App from "./src/App";
import { name as appName, iosName } from "./app.json";
import "react-native-gesture-handler";

AppRegistry.registerComponent(
  Platform.OS === "ios" ? iosName : appName,
  () => App
);
