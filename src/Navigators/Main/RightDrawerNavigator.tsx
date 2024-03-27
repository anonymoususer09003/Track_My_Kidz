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
  InstructorPersonalProfileScreen,
  InstructorSettingsScreen,
  OrganizationInfoScreen,
  ReportProblemScreen,
} from '@/Screens';
import { createStackNavigator } from '@react-navigation/stack';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import InstructorActivityNavigator from '@/Navigators/Main/InstructorActivityNavigator';

export type MainStackNavigatorParamsList = {
  InstructorPersonalProfileScreen: undefined
  InstructorActivity?: undefined
  ChangePassword: undefined
  OrganizationInfo: undefined
  InstructorSettings: undefined
  ReportProblemScreen: undefined
  InstructorActivityNavigator: undefined
  ActivityDetails: { activity?: any }
} & ParamListBase;

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
        {/*{user_type === "parent" && (*/}
        {/*  <Stack.Screen name="Home" component={HomeNavigator} />*/}
        {/*)}*/}

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
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen
          name="OrganizationInfo"
          component={OrganizationInfoScreen}
        />
        <Stack.Screen name="ReportProblem" component={ReportProblemScreen} />
        <Stack.Screen name="ContactUs" component={ContactUsScreen} />
        <Stack.Screen name="AppList" component={AppListScreen} />

        <Stack.Screen
          name="ActivityDetails"
          component={ActivityDetailsScreen}
        />

        {/*{user_type === "student" && (*/}
        {/*  <Stack.Screen*/}
        {/*    name="StudentActivity"*/}
        {/*    component={StudentActivityNavigator}*/}
        {/*  />*/}
        {/*)}*/}

        {/*<Stack.Screen*/}
        {/*  name="InstructorActivityDetail"*/}
        {/*  component={InstructorActivityDetailScreen}*/}
        {/*/>*/}

        {/*<Stack.Screen*/}
        {/*  name="StudentActivityDetails"*/}
        {/*  component={StudentActivityDetailsScreen}*/}
        {/*/>*/}
        {/*<Stack.Screen name="InstructorHome" component={InstructorHome} />*/}
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
        {/*<Stack.Screen*/}
        {/*  name="InstructorApproval"*/}
        {/*  component={InstructorApprovalNavigator}*/}
        {/*/>*/}
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
        {/*<Stack.Screen name="Notifications" component={NotificationsScreen} />*/}
        {/*<Stack.Screen name="PaymentInfo" component={PaymentInfoScreen} />*/}

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
        {/*<Stack.Screen name="CreateActivity" component={CreateActivityScreen} />*/}
        {/*<Stack.Screen name="CreateGroup" component={CreateGroupScreen} />*/}

        {/*<Stack.Screen name="AddMembers" component={AddMembersNavigator} />*/}

        {/*<Stack.Screen*/}
        {/*  name="InstructorGroupApproval"*/}
        {/*  component={InstructorGroupApprovalNavigator}*/}
        {/*/>*/}

        {/*<Stack.Screen*/}
        {/*  name="InstructorList"*/}
        {/*  component={InstructorsListScreen}*/}
        {/*/>*/}
        {/*<Stack.Screen name="BusInfo" component={OrganizationBusinformation} />*/}
        {/*<Stack.Screen*/}
        {/*  name="ParentDeletePermission"*/}
        {/*  component={ParentDeletePermissionScreen}*/}
        {/*/>*/}
        {/*<Stack.Screen*/}
        {/*  name="DragDropStudent"*/}
        {/*  component={DragDropStudentScreen}*/}
        {/*/>*/}
      </>
    </Stack.Navigator>
  );
};
const Placeholder = () => {
  let useNavigation1: any = useNavigation();
  return <View>
    <Text onPress={() => useNavigation1.navigate('ActivityDetails')}>
      settings
    </Text>
  </View>;
};
export default RightDrawerNavigator;
