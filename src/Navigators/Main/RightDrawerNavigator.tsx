// import {
//   ActivationCodeScreen,
//   ActivityDetailsScreen,
//   AppListScreen,
//   ChangePasswordScreen,
//   ContactUsScreen,
//   CreateActivityScreen,
//   CreateGroupScreen,
//   CreateParentActivityScreen,
//   DependentInfoScreen,
//   DragDropStudentScreen,
//   ImportDependentScreen,
//   InstructorActivityDetailScreen,
//   InstructorHome,
//   InstructorPersonalProfileScreen,
//   InstructorSettingsScreen,
//   InstructorsListScreen,
//   NotificationsScreen,
//   OrganizationBusinformation,
//   OrganizationInfoScreen,
//   PaymentInfoScreen,
//   PersonalProfileScreen,
//   ReportProblemScreen,
//   SettingsScreen,
//   StudentActivityDetailsScreen,
//   StudentLocationScreen,
//   StudentPersonalProfileScreen,
//   StudentSettingsScreen,
// } from "@/Screens";
import ChangeNavigationCustomState from "@/Store/Navigation/ChangeNavigationCustomState";
import { createDrawerNavigator } from "@react-navigation/drawer";
import React, { useEffect } from "react";
import RNDeviceInfo from "react-native-device-info";
import { useDispatch, useSelector } from "react-redux";

import ActivityNavigator from "@/Navigators/Main/ActivityNavigator";
import ApprovalNavigator from "@/Navigators/Main/ApprovalNavigator";
import RightDrawerContent from "@/Navigators/Main/DrawerContents/RightDrawerContent/RightDrawerContent";
import HomeNavigator from "@/Navigators/Main/HomeNavigator";
import InstructorActivityNavigator from "@/Navigators/Main/InstructorActivityNavigator";
import InstructorApprovalNavigator from "@/Navigators/Main/InstructorApprovalNavigator";
import InstructorChatNavigator from "@/Navigators/Main/InstructorChatNavigator";
import StudentActivityNavigator from "@/Navigators/Main/StudentActivityNavigator";
import { ParentChatScreen } from "@/Screens/Chats";

import AddMembersNavigator from "@/Navigators/Main/AddMembersNavigator";
import InstructorGroupApprovalNavigator from "@/Navigators/Main/InstructorGroupApprovalNavigator";
import ParentDeletePermissionScreen from "@/Screens/Main/ParentDeletePermission/ParentDeletePermissionScreen";
import { UserTypeState } from "@/Store/UserType";

const RightDrawerNavigator = () => {
  const Drawer = createDrawerNavigator();
  const dispatch = useDispatch();
  const user_type = useSelector(
    (state: { userType: UserTypeState }) => state.userType.userType
  );
  let rightNavigation: any;
  useEffect(() => {
    if (rightNavigation) {
      dispatch(
        ChangeNavigationCustomState.action({
          navigationRightDrawer: rightNavigation,
        })
      );
    }
  }, [dispatch, rightNavigation]);

  if (!user_type) {
    return <></>;
  }

  return (
    <Drawer.Navigator
      backBehavior={"history"}
      drawerContent={(props) => {
        rightNavigation = props.navigation;
        return <RightDrawerContent {...props} />;
      }}
      screenOptions={({ navigation }) => {
        rightNavigation = navigation;
        return {
          drawerPosition: "right",
          drawerStyle: {
            marginLeft:
              RNDeviceInfo.getDeviceType() === "Tablet" ? "70%" : "35%",
          },
          headerShown: false,
        };
      }}
    >
      <>
        {user_type === "parent" && (
          <Drawer.Screen name="Home" component={HomeNavigator} />
        )}
        {user_type === "instructor" && (
          <Drawer.Screen
            name="InstructorActivity"
            component={InstructorActivityNavigator}
          />
        )}
        {user_type === "student" && (
          <Drawer.Screen
            name="StudentActivity"
            component={StudentActivityNavigator}
          />
        )}

        {/*<Drawer.Screen*/}
        {/*  name="InstructorActivityDetail"*/}
        {/*  component={InstructorActivityDetailScreen}*/}
        {/*/>*/}

        {/*<Drawer.Screen*/}
        {/*  name="StudentActivityDetails"*/}
        {/*  component={StudentActivityDetailsScreen}*/}
        {/*/>*/}
        {/*<Drawer.Screen name="InstructorHome" component={InstructorHome} />*/}
        {/*<Drawer.Screen*/}
        {/*  name="InstructorChatNavigator"*/}
        {/*  component={InstructorChatNavigator}*/}
        {/*/>*/}
        {/*<Drawer.Screen*/}
        {/*  name="CreateParentActivity"*/}
        {/*  component={CreateParentActivityScreen}*/}
        {/*/>*/}
        <Drawer.Screen name="ChatScreen" component={ParentChatScreen} />
        <Drawer.Screen name="Activity" component={ActivityNavigator} />
        <Drawer.Screen name="Approval" component={ApprovalNavigator} />
        <Drawer.Screen
          name="InstructorApproval"
          component={InstructorApprovalNavigator}
        />
        {/*<Drawer.Screen name="Settings" component={SettingsScreen} />*/}
        {/*<Drawer.Screen*/}
        {/*  name="StudentSettings"*/}
        {/*  component={StudentSettingsScreen}*/}
        {/*/>*/}
        {/*<Drawer.Screen*/}
        {/*  name="PersonalProfile"*/}
        {/*  component={PersonalProfileScreen}*/}
        {/*/>*/}
        {/*<Drawer.Screen*/}
        {/*  name="InstructorPersonalProfileScreen"*/}
        {/*  component={InstructorPersonalProfileScreen}*/}
        {/*/>*/}
        {/*<Drawer.Screen*/}
        {/*  name="StudentPersonalProfile"*/}
        {/*  component={StudentPersonalProfileScreen}*/}
        {/*/>*/}
        {/*<Drawer.Screen name="ChangePassword" component={ChangePasswordScreen} />*/}
        {/*<Drawer.Screen name="Notifications" component={NotificationsScreen} />*/}
        {/*<Drawer.Screen name="PaymentInfo" component={PaymentInfoScreen} />*/}

        {/*<Drawer.Screen name="ReportProblem" component={ReportProblemScreen} />*/}
        {/*<Drawer.Screen name="ContactUs" component={ContactUsScreen} />*/}
        {/*<Drawer.Screen name="AppList" component={AppListScreen} />*/}
        {/*<Drawer.Screen name="ActivationCode" component={ActivationCodeScreen} />*/}
        {/*<Drawer.Screen name="DependentInfo" component={DependentInfoScreen} />*/}
        {/*<Drawer.Screen*/}
        {/*  name="ImportParentDependentScreen"*/}
        {/*  component={ImportDependentScreen}*/}
        {/*/>*/}
        {/*<Drawer.Screen*/}
        {/*  name="StudentLocation"*/}
        {/*  component={StudentLocationScreen}*/}
        {/*/>*/}
        {/*<Drawer.Screen name="CreateActivity" component={CreateActivityScreen} />*/}
        {/*<Drawer.Screen name="CreateGroup" component={CreateGroupScreen} />*/}
        {/*<Drawer.Screen*/}
        {/*  name="ActivityDetails"*/}
        {/*  component={ActivityDetailsScreen}*/}
        {/*/>*/}
        <Drawer.Screen name="AddMembers" component={AddMembersNavigator} />
        <Drawer.Screen
          name="InstructorGroupApproval"
          component={InstructorGroupApprovalNavigator}
        />
        {/*<Drawer.Screen*/}
        {/*  name="InstructorSettings"*/}
        {/*  component={InstructorSettingsScreen}*/}
        {/*/>*/}
        {/*<Drawer.Screen*/}
        {/*  name="OrganizationInfo"*/}
        {/*  component={OrganizationInfoScreen}*/}
        {/*/>*/}
        {/*<Drawer.Screen*/}
        {/*  name="InstructorList"*/}
        {/*  component={InstructorsListScreen}*/}
        {/*/>*/}
        {/*<Drawer.Screen name="BusInfo" component={OrganizationBusinformation} />*/}
        <Drawer.Screen
          name="ParentDeletePermission"
          component={ParentDeletePermissionScreen}
        />
        {/*<Drawer.Screen*/}
        {/*  name="DragDropStudent"*/}
        {/*  component={DragDropStudentScreen}*/}
        {/*/>*/}
      </>
    </Drawer.Navigator>
  );
};

export default RightDrawerNavigator;
