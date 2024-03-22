import AsyncStorage from '@react-native-async-storage/async-storage';
import {combineReducers} from 'redux';
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import {configureStore} from '@reduxjs/toolkit';

import startup from './Startup';
import user from './User';
import theme from './Theme';
import modal from './Modal';
import userType from './UserType';
import chat from './chat';
import header from './header';
import addMembersStudents from './AddMembersStudents';
import navigation from './Navigation';
import authentication from './Authentication';
import upload from './Upload';
// import blogs from "./Blogs";
import places from './Places';
import notifications from './Notifications';
import selected from './Selected';
// import appointments from "./Appointments";
import instructorsActivity from './InstructorsActivity';
import studentActivity from './StudentActivity';
import ads from './Ads';
const reducers = combineReducers({
  startup,
  user,
  theme,
  modal,
  userType,
  addMembersStudents,
  navigation,
  authentication,
  upload,
  // livestream,
  // blogs,
  places,
  notifications,
  selected,
  // appointments,
  // ads,
  instructorsActivity,
  studentActivity,
  chat,
  header,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['theme'],
};

const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware => {
    const middlewares = getDefaultMiddleware({
      serializableCheck: false,
    });

    if (__DEV__ && !process.env.JEST_WORKER_ID) {
      const createDebugger = require('redux-flipper').default;
      middlewares.push(createDebugger());
    }

    return middlewares;
  },
});

const persistor = persistStore(store);

export {store, persistor};
