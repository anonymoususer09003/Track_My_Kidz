import ChangeNavigationCustomState from '@/Store/Navigation/ChangeNavigationCustomState';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UserTypeState } from '@/Store/UserType';
import { Text, View } from 'react-native';
import {
  ActivityDetailsScreen,
  AppListScreen,
  ChangePasswordScreen,
  ContactUsScreen,
  CreateActivityScreen,
  CreateGroupScreen,
  DragDropStudentScreen,
  InstructorActivityDetailScreen,
  InstructorHome,
  InstructorPersonalProfileScreen,
  InstructorSettingsScreen,
  InstructorsListScreen,
  NotificationsScreen,
  OrganizationBusinformation,
  OrganizationInfoScreen,
  ReportProblemScreen,
} from '@/Screens';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import InstructorApprovalNavigator from '@/Navigators/Main/InstructorApprovalNavigator';
import AddMembersNavigator from '@/Navigators/Main/AddMembersNavigator';
import InstructorGroupApprovalNavigator from '@/Navigators/Main/InstructorGroupApprovalNavigator';
import InstructorActivityNavigator from '@/Navigators/Main/InstructorActivityNavigator';
import StudentActivityNavigator from '@/Navigators/Main/StudentActivityNavigator';

type InstructorStack = {
  InstructorPersonalProfileScreen: undefined
  InstructorActivity?: undefined
  OrganizationInfo: undefined
  InstructorSettings: undefined
  InstructorActivityNavigator: undefined
  ActivityDetails: { activity?: any }
  CreateActivity: { isEdit?: boolean, groupId?: string }
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
  DragDropStudent: { students: any[], attendanceMark: any, activity: { activityId: any }, bus: { busId: any } }
  InstructorActivityDetail: { data?: any, activitiesCount?: any } | undefined
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
}

export type MainStackNavigatorParamsList = InstructorStack & SettingsStack & StudentStack & ParamListBase;

const RightDrawerNavigator = () => {
  const dispatch = useDispatch();
  const user_type = useSelector(
    (state: { userType: UserTypeState }) => state.userType.userType,
  );
  let rightNavigation: any;
  useEffect(() => {
    if (rightNavigation) {
      dispatch(
        ChangeNavigationCustomState.action({
          navigationRightDrawer: rightNavigation,
        }),
      );
    }
  }, [dispatch, rightNavigation]);

  if (!user_type) {
    return <></>;
  }
  const Stack = createStackNavigator<MainStackNavigatorParamsList>();


  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
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

        {/*Settings*/}
        {user_type === "student" && (
          <Stack.Screen
            name="StudentActivity"
            component={StudentActivityNavigator}
          />
        )}


        {/*{user_type === "parent" && (*/}
        {/*  <Stack.Screen name="Home" component={HomeNavigator} />*/}
        {/*)}*/}



        {/*<Stack.Screen*/}
        {/*  name="StudentActivityDetails"*/}
        {/*  component={StudentActivityDetailsScreen}*/}
        {/*/>*/}
        {/*<Stack.Screen*/}
        {/*  name="InstructorChatNavigator"*/}
        {/*  component={InstructorChatNavigator}*/}
        {/*/>*/}
        {/*<Stack.Screen*/}
        {/*  name="CreateParentActivity"*/}
        {/*  component={CreateParentActivityScreen}*/}
        {/*/>*/}
        {/*<Stack.Screen name="ChatScreen" component={ParentChatScreen} />*/}
        {/*<Stack.Screen name="Activity" component={ActivityNavigator} />*/}
        {/*<Stack.Screen name="Approval" component={ApprovalNavigator} />*/}

        {/*<Stack.Screen name="Settings" component={SettingsScreen} />*/}
        {/*<Stack.Screen*/}
        {/*  name="StudentSettings"*/}
        {/*  component={StudentSettingsScreen}*/}
        {/*/>*/}
        {/*<Stack.Screen*/}
        {/*  name="PersonalProfile"*/}
        {/*  component={PersonalProfileScreen}*/}
        {/*/>*/}
        {/*<Stack.Screen*/}
        {/*  name="StudentPersonalProfile"*/}
        {/*  component={StudentPersonalProfileScreen}*/}
        {/*/>*/}

        {/*<Stack.Screen name="ActivationCode" component={ActivationCodeScreen} />*/}
        {/*<Stack.Screen name="DependentInfo" component={DependentInfoScreen} />*/}
        {/*<Stack.Screen*/}
        {/*  name="ImportParentDependentScreen"*/}
        {/*  component={ImportDependentScreen}*/}
        {/*/>*/}
        {/*<Stack.Screen*/}
        {/*  name="StudentLocation"*/}
        {/*  component={StudentLocationScreen}*/}
        {/*/>*/}


        {/*<Stack.Screen*/}
        {/*  name="ParentDeletePermission"*/}
        {/*  component={ParentDeletePermissionScreen}*/}
        {/*/>*/}

      </>
    </Stack.Navigator>
  );
};
const Placeholder = () => {
  const navigation = useNavigation<StackNavigationProp<MainStackNavigatorParamsList>>();

  return <View>
    <Text onPress={() => navigation.navigate('StudentActivity')}>
      Open test page
    </Text>
  </View>;
};
export default RightDrawerNavigator;
