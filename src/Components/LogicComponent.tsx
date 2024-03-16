import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {NotificationsState} from '@/Store/Notifications';
import FetchUnreadCount from '@/Store/Notifications/FetchUnreadCount';
import FetchNotifications from '@/Store/Notifications/FetchNotifications';
// import messaging from "@react-native-firebase/messaging";

const LogicComponent = () => {
  const dispatch = useDispatch();
  const unReadCount = useSelector(
    (state: {notifications: NotificationsState}) =>
      state.notifications.unreadCount,
  );

  // useEffect(() => {
  //     const unsubscribe = messaging().onMessage(async remoteMessage => {
  //         dispatch(FetchUnreadCount.action())
  //     });
  //     if (unReadCount.latest != 0) {
  //         dispatch(FetchNotifications.action())
  //     }
  //     return unsubscribe;
  // }, []);
  return <></>;
};

export default LogicComponent;
