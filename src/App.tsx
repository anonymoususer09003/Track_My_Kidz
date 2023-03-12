import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/lib/integration/react";
import { store, persistor } from "@/Store";
import { ApplicationNavigator } from "@/Navigators";
import "./Translations";
import { IconRegistry } from "@ui-kitten/components";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import { initStripe, StripeProvider } from "@stripe/stripe-react-native";
import { Config } from "@/Config";
import { StateProvider } from "./Context/state/State";
import { reducer } from "./Context/state/Reducer";
import { initialState } from "./Context/state/InitialState";
import { MenuProvider } from "react-native-popup-menu";
import { LogBox } from "react-native";

LogBox.ignoreLogs(["Reanimated 2"]);
export default function App() {
  useEffect(() => {
    initStripe({
      publishableKey: Config.STRIPE_PK,
    });
  });
  XMLHttpRequest = GLOBAL.originalXMLHttpRequest
    ? GLOBAL.originalXMLHttpRequest
    : GLOBAL.XMLHttpRequest;

  // fetch logger
  global._fetch = fetch;
  global.fetch = function (uri, options, ...args) {
    return global._fetch(uri, options, ...args).then((response) => {
      // console.log("Fetch", { request: { uri, options, ...args }, response });
      return response;
    });
  };

  return (
    <StripeProvider publishableKey={Config.STRIPE_PK}>
      <Provider store={store}>
        <StateProvider initialState={initialState} reducer={reducer}>
          <MenuProvider>
            <PersistGate loading={null} persistor={persistor}>
              <IconRegistry icons={[EvaIconsPack]} />
              <ApplicationNavigator />
            </PersistGate>
          </MenuProvider>
        </StateProvider>
      </Provider>
    </StripeProvider>
  );
}
