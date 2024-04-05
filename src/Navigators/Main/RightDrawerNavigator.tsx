import ChangeNavigationCustomState from '@/Store/Navigation/ChangeNavigationCustomState';
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UserTypeState } from '@/Store/UserType';
import { PermissionsAndroid, Platform, Text, View } from 'react-native';
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
} from '@/Screens';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { ParamListBase, useNavigation } from '@react-navigation/native';
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
import * as Stomp from 'react-native-stompjs';
import { loadToken } from '@/Storage/MainAppStorage';
import SockJS from 'sockjs-client';
import { Config } from '@/Config';
import BackgroundService from 'react-native-background-actions';
import { BACKGROUND_TASK_START_OPTIONS } from '@/Constants';
import { getUniqueId } from 'react-native-device-info';
import GeolocationAndroid from 'react-native-geolocation-service';
import Geolocation from '@react-native-community/geolocation';
import { MessageBody, useTracker } from '@/Providers/TrackerProvider';


type InstructorStack = {
  InstructorPersonalProfileScreen: undefined
  InstructorActivity?: undefined
  OrganizationInfo: undefined
  InstructorSettings: undefined
  InstructorActivityNavigator: undefined
  ActivityDetails: { activity?: any }
  CreateActivity: { isEdit?: boolean, groupId?: string } | undefined
  CreateGroup: { data: { groupId: number, groupName: string } } | undefined
  InstructorApproval: { screen: string } | undefined
  AddMembers: {
    screen?: string,
    isEdit: boolean
    data: boolean,
  }
  InstructorGroupApprovalNavigator: undefined
  InstructorList: { data: any }
  BusInfo: { data: { buses: any, schoolId: number } }
  InstructorHome: undefined
  DragDropStudent: { students?: any[], attendanceMark?: any, activity: { activityId: any }, bus: { busId: any } }
  InstructorActivityDetail: { data?: any, activitiesCount?: any } | undefined
  InstructorChatNavigator: { title: string }
}

type SettingsStack = {
  Notifications: undefined
  AppList: undefined
  ChangePassword: undefined
  ReportProblem: undefined
  ContactUs: undefined
}

type StudentStack = {
  StudentActivity: undefined
  StudentActivityDetails: undefined
  StudentSettings: undefined
  StudentPersonalProfile: undefined
}

type ParentStack = {
  Home: undefined
  Activity: undefined
  ChatScreen: SingleChatScreenRouteParams
  CreateParentActivity: undefined
  Approval: {
    screen: string,
  } | undefined
  ActivationCode: undefined
  DependentInfo: undefined
  ParentDeletePermission: {
    dependentId?: any,
    parentId?: any,
  }
  Settings: undefined
  ImportParentDependentScreen: undefined
  PersonalProfile: undefined
  StudentLocation: { student: any, parent: any }
}

export type MainStackNavigatorParamsList = InstructorStack & SettingsStack & StudentStack & ParentStack & ParamListBase;

const RightDrawerNavigator = () => {
  const user_type = useSelector(
    (state: { userType: UserTypeState }) => state.userType.userType,
  );

  const { updateCoordinates } = useTracker();

  const stompClient = useRef<Stomp.Client | null>(null);

  useEffect(() => {
    const connectToSocket = async () => {
      const token = await loadToken();
      console.log('-------------------------------------------------------------------');
      console.log(token);
      const socket = new SockJS(Config.WS_URL);
      stompClient.current = Stomp.over(socket);
      stompClient.current.connect({ token }, () => {
        trackDevicesById(stompClient.current, ['']);

        if (user_type !== 'parent')
          locationPermission();
      });
    };
    setTimeout(connectToSocket, 3000);


  }, []);


  const locationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        {
          title: 'Background Location Permission',
          message: 'TrackMyKidz App needs access to your location',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      console.log(granted);

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        backgroundCall();
      }
    } else {
      backgroundCall();
    }
  };

  const backgroundCall = async () => {
    const sleep = (time: number) =>
      new Promise((resolve: any) => setTimeout(() => resolve(), time));

    // comments from Nouman
    // You can do anything in your task such as network requests, timers and so on,
    // as long as it doesn't touch UI. Once your task completes (i.e. the promise is resolved),
    // React Native will go into "paused" mode (unless there are other tasks running,
    // or there is a foreground app).
    const infiniteTrackingEvery2Seconds = async () => {

      await new Promise(async () => {
        for (let i = 1; BackgroundService.isRunning(); i++) {
          try {
            await trackAndroidAnIos();
          } catch (error) {
            console.log(error);
          }
          // sending location every 2 seconds
          await sleep(2000);
        }
      });
    };

    BackgroundService.on('expiration', () => {
      console.log('I am being closed :(');
    });

    await BackgroundService.start(infiniteTrackingEvery2Seconds, BACKGROUND_TASK_START_OPTIONS);
    await BackgroundService.updateNotification({ taskDesc: 'Tracking Location' });
    // comments from Nouman
    // Only Android, iOS will ignore this call
    // iOS will also run everything here in the background until .stop() is called
  };

  const trackDevicesById = async (stompClient: any, deviceIds: string[]) => {
    try {

      deviceIds.map((item) => {
        stompClient.subscribe(`/device/${item}`, subscriptionCallback);
      });
    } catch (err) {
      console.log('Error:', err);
    }
  };
  const subscriptionCallback = (subscriptionMessage: { body: string }) => {
    const messageBody: MessageBody = JSON.parse(subscriptionMessage.body);
    console.log('Update Received', messageBody);

    updateCoordinates(messageBody);
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
      }),
    );
  };


  const trackAndroidAnIos = async () => {
    try {
      if (Platform.OS === 'android') {
        GeolocationAndroid.getCurrentPosition(async ({ coords }) => {
          console.log('coords', coords);
          sendCoordinates(coords.latitude, coords.longitude);
        });
      } else {
        Geolocation.getCurrentPosition(async ({ coords }) => {
          console.log('coords', coords);
          sendCoordinates(coords.latitude, coords.longitude);
        });
      }
    } catch (err) {
      console.log('trackAndroidAnIos error TrackerProvider.tsx line 139', err);
    }
  };


  const Stack = createStackNavigator<MainStackNavigatorParamsList>();

  const initialRoute = {
    instructor: 'InstructorActivity',
    student: 'StudentActivity',
    parent: 'Home',
  };

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
        {user_type === 'instructor' && (
          <Stack.Screen
            name="InstructorActivity"
            component={InstructorActivityNavigator}
          />
        )}
        <Stack.Screen
          name="InstructorSettings"
          component={InstructorSettingsScreen}
        />
        <Stack.Screen
          name="InstructorPersonalProfileScreen"
          component={InstructorPersonalProfileScreen}
        />
        <Stack.Screen
          name="OrganizationInfo"
          component={OrganizationInfoScreen}
        />

        <Stack.Screen
          name="ActivityDetails"
          component={ActivityDetailsScreen}
        />
        <Stack.Screen name="CreateActivity" component={CreateActivityScreen} />
        <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
        <Stack.Screen
          name="InstructorApproval"
          component={InstructorApprovalNavigator}
        />
        <Stack.Screen name="AddMembers" component={AddMembersNavigator} />
        <Stack.Screen
          name="InstructorGroupApproval"
          component={InstructorGroupApprovalNavigator}
        />
        <Stack.Screen
          name="InstructorList"
          component={InstructorsListScreen}
        />
        <Stack.Screen name="BusInfo" component={OrganizationBusinformation} />
        <Stack.Screen name="InstructorHome" component={InstructorHome} />
        <Stack.Screen
          name="DragDropStudent"
          component={DragDropStudentScreen}
        />
        <Stack.Screen
          name="InstructorActivityDetail"
          component={InstructorActivityDetailScreen}
        />
        {/*////////////////////////////////////////////*/}

        {/*Settings*/}
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="ReportProblem" component={ReportProblemScreen} />
        <Stack.Screen name="ContactUs" component={ContactUsScreen} />
        <Stack.Screen name="AppList" component={AppListScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        {/*////////////////////////////////////////////*/}

        {/*student*/}
        {user_type === 'student' && (
          <Stack.Screen
            name="StudentActivity"
            component={StudentActivityNavigator}
          />
        )}
        <Stack.Screen
          name="StudentActivityDetails"
          component={StudentActivityDetailsScreen}
        />
        <Stack.Screen
          name="StudentSettings"
          component={StudentSettingsScreen}
        />
        <Stack.Screen
          name="StudentPersonalProfile"
          component={StudentPersonalProfileScreen}
        />


        {/*parent*/}
        {user_type === 'parent' && (
          <Stack.Screen name="Home" component={HomeNavigator} />
        )}
        <Stack.Screen name="Activity" component={ActivityNavigator} />
        <Stack.Screen
          name="CreateParentActivity"
          component={CreateParentActivityScreen}
        />
        <Stack.Screen name="Approval" component={ApprovalNavigator} />
        <Stack.Screen name="ActivationCode" component={ActivationCodeScreen} />
        <Stack.Screen name="DependentInfo" component={DependentInfoScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen
          name="ParentDeletePermission"
          component={ParentDeletePermission}
        />
        <Stack.Screen
          name="PersonalProfile"
          component={PersonalProfileScreen}
        />
        <Stack.Screen
          name="ImportParentDependentScreen"
          component={ImportDependentScreen}
        />
        <Stack.Screen
          name="StudentLocation"
          component={StudentLocationScreen}
        />

        <Stack.Screen name="ChatScreen" component={SingleChatScreen} />
        <Stack.Screen
          name="InstructorChatNavigator"
          component={InstructorChatNavigator}
        />
      </>
    </Stack.Navigator>
  );
};

export default RightDrawerNavigator;
