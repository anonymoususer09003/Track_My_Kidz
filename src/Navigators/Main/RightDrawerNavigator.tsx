import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { UserTypeState } from '@/Store/UserType';
import { PermissionsAndroid, Platform } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import {
  ActivationCodeScreen,
  ActivityDetailsScreen,
  AppListScreen,
  ChangePasswordScreen,
  ContactUsScreen,
  CreateActivityScreen,
  CreateGroupScreen,
  CreateParentActivityScreen,
  DependentInfoScreen,
  DragDropStudentScreen,
  ImportDependentScreen,
  InstructorActivityDetailScreen,
  InstructorHome,
  InstructorPersonalProfileScreen,
  InstructorSettingsScreen,
  InstructorsListScreen,
  NotificationsScreen,
  OrganizationBusinformation,
  OrganizationInfoScreen,
  ParentDeletePermission,
  PersonalProfileScreen,
  ReportProblemScreen,
  SettingsScreen,
  StudentActivityDetailsScreen,
  StudentLocationScreen,
  StudentPersonalProfileScreen,
  StudentSettingsScreen,
  GroupScheduleNavigator,
  PracticesScreen,
  CompetitionScreen,
} from '@/Screens';

import { Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { createStackNavigator } from '@react-navigation/stack';
import { ParamListBase } from '@react-navigation/native';
import InstructorApprovalNavigator from '@/Navigators/Main/InstructorApprovalNavigator';
import AddMembersNavigator from '@/Navigators/Main/AddMembersNavigator';
import InstructorGroupApprovalNavigator from '@/Navigators/Main/InstructorGroupApprovalNavigator';
import InstructorActivityNavigator from '@/Navigators/Main/InstructorActivityNavigator';
import StudentActivityNavigator from '@/Navigators/Main/StudentActivityNavigator';
import HomeNavigator from '@/Navigators/Main/HomeNavigator';
import ActivityNavigator from '@/Navigators/Main/ActivityNavigator';
import ApprovalNavigator from '@/Navigators/Main/ApprovalNavigator';
import InstructorChatNavigator from '@/Navigators/Main/InstructorChatNavigator';
import { SingleChatScreen } from '@/Screens/Chats';
import { SingleChatScreenRouteParams } from '@/Screens/Chats/SingleChatScreen';
// @ts-ignore
import PaymentInformationScreen from '@/Screens/PaymentInfo/PaymentInfoScreen';
import * as Stomp from 'react-native-stompjs';
import { loadToken } from '@/Storage/MainAppStorage';
import SockJS from 'sockjs-client';
import { Config } from '@/Config';
import { getUniqueId } from 'react-native-device-info';

import { MessageBody, useTracker } from '@/Providers/TrackerProvider';
import BackgroundTimer from 'react-native-background-timer';
import BackgroundGeolocation from 'react-native-background-geolocation';
import { LogBox } from 'react-native';

type InstructorStack = {
  InstructorPersonalProfileScreen: undefined;
  InstructorActivity?: undefined;
  OrganizationInfo: undefined;
  InstructorSettings: undefined;
  InstructorActivityNavigator: undefined;
  ActivityDetails: { activity?: any };
  CreateActivity: { isEdit?: boolean; groupId?: string } | undefined;
  CreateGroup: { data: { groupId: number; groupName: string } } | undefined;
  InstructorApproval: { screen: string } | undefined;
  AddMembers: {
    screen?: string;
    isEdit: boolean;
    data: boolean;
  };
  InstructorGroupApprovalNavigator: undefined;
  InstructorList: { data: any };
  BusInfo: { data: { buses: any; schoolId: number } };
  InstructorHome: undefined;
  DragDropStudent: {
    students?: any[];
    attendanceMark?: any;
    activity: { activityId: any };
    bus: { busId: any };
  };
  InstructorActivityDetail: { data?: any; activitiesCount?: any } | undefined;
  InstructorChatNavigator: { title: string };
};

type SettingsStack = {
  Notifications: undefined;
  AppList: undefined;
  ChangePassword: undefined;
  ReportProblem: undefined;
  ContactUs: undefined;
};

type StudentStack = {
  StudentActivity: undefined;
  StudentActivityDetails: undefined;
  StudentSettings: undefined;
  StudentPersonalProfile: undefined;
};

type ParentStack = {
  Home: undefined;
  Activity: undefined;
  ChatScreen: SingleChatScreenRouteParams;
  CreateParentActivity: undefined;
  Approval:
    | {
        screen: string;
      }
    | undefined;
  ActivationCode: undefined;
  DependentInfo: undefined;
  ParentDeletePermission: {
    dependentId?: any;
    parentId?: any;
  };
  Settings: undefined;
  ImportParentDependentScreen: undefined;
  PersonalProfile: undefined;
  StudentLocation: { student: any; parent: any };
};

export type MainStackNavigatorParamsList = InstructorStack &
  SettingsStack &
  StudentStack &
  ParentStack &
  ParamListBase;

LogBox.ignoreLogs(['WARN Sending `location` with no listeners registered.']);

const RightDrawerNavigator = () => {
  const intervalIdRef = useRef(null);
  const isFocused = useIsFocused();
  const user_type = useSelector((state: { userType: UserTypeState }) => state.userType.userType);

  const { updateCoordinates } = useTracker();

  const stompClient = useRef<Stomp.Client | null>(null);

  useEffect(() => {
    const connectToSocket = async () => {
      const token = await loadToken();

      const socket = new SockJS(Config.WS_URL);
      stompClient.current = Stomp.over(socket);
      stompClient.current.connect({ token }, () => {
        trackDevicesById(stompClient.current, ['']);

        locationPermission();
      });
    };
    setTimeout(connectToSocket, 1000);
  }, []);
  const disconnectStompClient = () => {
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.disconnect(() => {});
    }
  };

  const locationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);

      if (
        granted['android.permission.ACCESS_BACKGROUND_LOCATION'] ===
        PermissionsAndroid.RESULTS.GRANTED
      ) {
        backgroundCall();
      }
    } else {
      Geolocation.requestAuthorization();
      backgroundCall();
      // todo: add logic for ios
      // backgroundCall();
    }
  };
  let intervalId: number | null = null;
  const backgroundCall = async () => {
    let times = 1;

    intervalId = BackgroundTimer.setInterval(async () => {
      try {
        times = times + 1;

        trackAndroidAnIos();
      } catch (error) {
        console.log(error);
      }
    }, 15000);

    if (times > 4) {
      disconnectStompClient();
      BackgroundTimer.clearInterval(intervalId);
    }
  };

  const trackAndroidAnIos = async () => {
    try {
      // Geolocation.setRNConfiguration({ enableBackgroundLocationUpdates: true, skipPermissionRequests: true });
      if (user_type != 'parent') {
        // Geolocation.getCurrentPosition(({ coords }) => {
        //   console.log('------s--s-s--s-s-scoords', coords);
        //   sendCoordinates(coords.latitude, coords.longitude);
        // }, console.log);

        Geolocation.getCurrentPosition(
          (position) => {
            // Alert.alert(JSON.stringify(position));

            const { latitude, longitude } = position.coords;
            // console.log('coords', coords);
            sendCoordinates(latitude, longitude);
          },
          (error) => {
            console.log(error);
            // setError(error.message);
          },
          { enableHighAccuracy: true, maximumAge: 9000 }
        );
      }
      // BackgroundTimer.clearInterval(intervalId);

      BackgroundGeolocation.ready({}).then((state: any) => {
        // YES -- .ready() has now resolved.
        intervalIdRef.current = setInterval(() => {
          BackgroundGeolocation.getCurrentPosition({
            desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
          })
            .then((res) => {
              if (user_type) sendCoordinates(res.coords.latitude, res.coords.longitude);
            })
            .catch(console.log);
        }, 15000);
        BackgroundGeolocation.start();
      });
    } catch (err) {
      console.log('trackAndroidAnIos error TrackerProvider.tsx line 139', err);
    }
  };
  const sendCoordinates = async (latitude: number, longitude: number) => {
    const token = await loadToken();
    const deviceId = await getUniqueId();

    stompClient.current.send(
      '/socket/ws-location',
      { token },
      JSON.stringify({
        latitude,
        longitude,
        deviceId,
      })
    );
  };
  const subscriptions: any[] = [];
  const trackDevicesById = async (stompClient: any, deviceIds: string[]) => {
    try {
      deviceIds.map((item) => {
        const subscribe = stompClient.subscribe(`/device/${item}`, subscriptionCallback);
        subscriptions.push(subscribe);
      });
    } catch (err) {
      console.log('Error:', err);
    }
  };
  const unsubscribeAll = () => {
    subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    // Optionally, clear the subscriptions array if you're not going to reuse it
    subscriptions.length = 0;
  };
  const subscriptionCallback = (subscriptionMessage: { body: string }) => {
    const messageBody: MessageBody = JSON.parse(subscriptionMessage.body);
    // console.log('Update Received', messageBody);

    updateCoordinates(messageBody);
  };

  const Stack = createStackNavigator<MainStackNavigatorParamsList>();

  const initialRoute = {
    instructor: 'InstructorActivity',
    student: 'StudentActivity',
    parent: 'Home',
  };
  useEffect(() => {
    // if (!user_type) {
    //   if (intervalIdRef.current !== null) {
    //     clearInterval(intervalIdRef.current);
    //     intervalIdRef.current = null;
    //   }
    //   disconnectStompClient();
    //   unsubscribeAll();
    //   BackgroundTimer.clearInterval(intervalId);
    // }
  }, [user_type, isFocused]);

  if (!user_type) return <></>;
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRoute[user_type]}
      // drawerContent={(props) => {
      //   rightNavigation = props.navigation;
      //   return <RightDrawerContent {...props} />;
      // }}
      // screenOptions={({ navigation }) => {
      //   rightNavigation = navigation;
      //   return {
      //     drawerPosition: "right",
      //     drawerStyle: {
      //       marginLeft:
      //         RNDeviceInfo.getDeviceType() === "Tablet" ? "70%" : "35%",
      //     },
      //     headerShown: false,
      //   };
      // }}
    >
      <>
        {/*Instructor screens*/}
        {/* {user_type === 'instructor' && ( */}
        <>
          <Stack.Screen name="InstructorActivity" component={InstructorActivityNavigator} />

          <Stack.Screen name="InstructorSettings" component={InstructorSettingsScreen} />
          <Stack.Screen
            name="InstructorPersonalProfileScreen"
            component={InstructorPersonalProfileScreen}
          />
          <Stack.Screen name="InstructorChatNavigator" component={InstructorChatNavigator} />
          <Stack.Screen name="OrganizationInfo" component={OrganizationInfoScreen} />

          <Stack.Screen name="ActivityDetails" component={ActivityDetailsScreen} />
          <Stack.Screen name="CreateActivity" component={CreateActivityScreen} />
          <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
          <Stack.Screen name="InstructorApproval" component={InstructorApprovalNavigator} />
          <Stack.Screen name="AddMembers" component={AddMembersNavigator} />
          <Stack.Screen
            name="InstructorGroupApproval"
            component={InstructorGroupApprovalNavigator}
          />
          <Stack.Screen name="InstructorList" component={InstructorsListScreen} />
          <Stack.Screen name="BusInfo" component={OrganizationBusinformation} />
          <Stack.Screen name="InstructorHome" component={InstructorHome} />
          <Stack.Screen name="DragDropStudent" component={DragDropStudentScreen} />
          <Stack.Screen
            name="InstructorActivityDetail"
            component={InstructorActivityDetailScreen}
          />

          {/* <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="ReportProblem" component={ReportProblemScreen} />
            <Stack.Screen name="ContactUs" component={ContactUsScreen} />
            <Stack.Screen name="AppList" component={AppListScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} /> */}
        </>
        {/* )} */}
        {/*////////////////////////////////////////////*/}

        {/*Settings*/}

        {/*////////////////////////////////////////////*/}

        {/*student*/}
        {/* {user_type === 'student' && ( */}
        <>
          <Stack.Screen name="StudentActivity" component={StudentActivityNavigator} />

          <Stack.Screen name="StudentActivityDetails" component={StudentActivityDetailsScreen} />
          <Stack.Screen name="StudentSettings" component={StudentSettingsScreen} />
          <Stack.Screen name="StudentPersonalProfile" component={StudentPersonalProfileScreen} />
          <Stack.Screen name="StudentLocation" component={StudentLocationScreen} />

          {/* <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="ReportProblem" component={ReportProblemScreen} />
          <Stack.Screen name="ContactUs" component={ContactUsScreen} />
          <Stack.Screen name="AppList" component={AppListScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} /> */}
        </>
        {/* )} */}
        {/*parent*/}
        {/* {user_type === 'parent' && ( */}
        <>
          <Stack.Screen name="Home" component={HomeNavigator} />
          <Stack.Screen name="Activity" component={ActivityNavigator} />
          <Stack.Screen name="CreateParentActivity" component={CreateParentActivityScreen} />
          <Stack.Screen name="Approval" component={ApprovalNavigator} />
          <Stack.Screen name="ActivationCode" component={ActivationCodeScreen} />

          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="PaymentInfo" component={PaymentInformationScreen} />
          <Stack.Screen name="DependentInfo" component={DependentInfoScreen} />
          <Stack.Screen name="ParentDeletePermission" component={ParentDeletePermission} />
          <Stack.Screen name="PersonalProfile" component={PersonalProfileScreen} />
          <Stack.Screen name="ImportParentDependentScreen" component={ImportDependentScreen} />
          <Stack.Screen name="ChatScreen" component={SingleChatScreen} />

          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="ReportProblem" component={ReportProblemScreen} />
          <Stack.Screen name="ContactUs" component={ContactUsScreen} />
          <Stack.Screen name="AppList" component={AppListScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />

          <Stack.Screen name="GroupScehdule" component={GroupScheduleNavigator} />
          <Stack.Screen name="PracticesScreen" component={PracticesScreen} />
          <Stack.Screen name="CompetitionScreen" component={CompetitionScreen} />
        </>
        {/* )} */}
        {/* <Stack.Screen name="Loading" component={}/> */}
      </>
    </Stack.Navigator>
  );
};

export default RightDrawerNavigator;
