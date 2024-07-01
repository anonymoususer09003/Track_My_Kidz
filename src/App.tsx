import React, {useEffect} from 'react';
import {StripeProvider, initStripe} from '@stripe/stripe-react-native';
import {IconRegistry} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import {LogBox} from 'react-native';
import 'react-native-gesture-handler';
import {MenuProvider} from 'react-native-popup-menu';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/lib/integration/react';

import {ApplicationNavigator} from './Navigators/index';
import {Config} from '@/Config';
import {persistor, store} from '@/Store';
import {initialState} from './Context/state/InitialState';
import {reducer} from './Context/state/Reducer';
import {StateProvider} from './Context/state/State';
// import './Translations';

LogBox.ignoreLogs(['Reanimated 2']);
export default function App() {
  useEffect(() => {
    initStripe({
      publishableKey: Config.STRIPE_PK,
    }).catch(console.error);
  }, []);
  // XMLHttpRequest = GLOBAL.originalXMLHttpRequest
  //   ? GLOBAL.originalXMLHttpRequest
  //   : GLOBAL.XMLHttpRequest;

  // // fetch logger
  // global._fetch = fetch;
  // global.fetch = function (uri, options, ...args) {
  //   return global._fetch(uri, options, ...args).then(response => {
  //     // console.log("Fetch", { request: { uri, options, ...args }, response });
  //     return response;
  //   });
  // };

  return (
    <StripeProvider publishableKey={Config.STRIPE_PK}>
      <Provider store={store}>
        <StateProvider initialState={initialState} reducer={reducer}>
          <MenuProvider>
            <PersistGate loading={null} persistor={persistor}>
              <IconRegistry icons={EvaIconsPack} />
              <ApplicationNavigator />
            </PersistGate>
          </MenuProvider>
        </StateProvider>
      </Provider>
    </StripeProvider>
  );
}
