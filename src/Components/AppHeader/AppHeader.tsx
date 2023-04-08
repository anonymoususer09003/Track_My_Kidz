import React, { useEffect, useCallback } from "react";
import {
  Icon,
  TopNavigation,
  TopNavigationAction,
  Text,
  Popover,
  Layout,
  Avatar,
} from "@ui-kitten/components";
import { StyleSheet, TouchableOpacity, View, Image } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { NavigationCustomState } from "@/Store/Navigation";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import ChangeStudentActivityState from "@/Store/StudentActivity/ChangeStudentActivityState";
import { Normalize } from "@/Utils/Shared/NormalizeDisplay";
import { useNavigation } from "@react-navigation/native";
import { navigateAndSimpleReset } from "@/Navigators/Functions";
import Feather from "react-native-vector-icons/Feather";
import Colors from "@/Theme/Colors";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { UserTypeState } from "@/Store/UserType";
import { ModalState } from "@/Store/Modal";
import EntypoIcon from "react-native-vector-icons/Entypo";
import { StudentState } from "@/Store/StudentActivity";
const AppHeader = ({ showGlobe, ...props }) => {
  const user_type = useSelector(
    (state: { userType: UserTypeState }) => state.userType.userType
  );
  const isCalendarVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.showCalendar
  );
  const hideCalendar = props?.hideCalendar || false;
  const hideApproval = props?.hideApproval || false;
  const goBack = props.goBack;
  const { showFamilyMap } = useSelector(
    (state: { studentActivity: StudentState }) => state.studentActivity
  );

  // const user_type = 'instructor';
  //@ts-ignore
  const renderSettingIcon = (props) => {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {props.showGlobe && user_type == "student" && (
          <TouchableOpacity
            onPress={() => {
              dispatch(
                ChangeStudentActivityState.action({
                  showFamilyMap: showFamilyMap ? false : true,
                  hideCalendar: !showFamilyMap ? true : false,
                  showParticipantMap: false,
                })
              );
              dispatch(
                ChangeModalState.action({
                  showCalendar: false,
                })
              );
            }}
            style={{ marginRight: 10 }}
          >
            <Image
              style={{ height: 22, width: 22, tintColor: Colors.white }}
              source={require("../../Assets/Images/earth.png")}
            />
          </TouchableOpacity>

          //  <EntypoIcon
          //     onPress={() =>
          //       dispatch(
          //         ChangeStudentActivityState.action({
          //           showFamilyMap: showFamilyMap ? false : true,
          //           hideCalendar: !showFamilyMap ? true : false,
          //         })
          //       )
          //     }
          //     size={22}
          //     style={{ marginRight: 10 }}
          //     name="globe"
          //     color={showFamilyMap ? Colors.green : Colors.white}
          //   />
        )}
        <Icon {...props} name="settings" fill={Colors.white} />
      </View>
    );
  };

  //@ts-ignore
  const renderHomeIcon = (props) => (
    <Icon {...props} name="home" fill={Colors.white} />
  );
  //@ts-ignore
  const renderCalendarIcon = (props) => (
    <Icon {...props} name="calendar" fill={Colors.white} />
  );

  const isStack = props && props.isStack;
  const isBack = props && props.isBack;

  const navigationLeftDrawer = useSelector(
    (state: { navigation: NavigationCustomState }) =>
      state.navigation.navigationLeftDrawer
  );
  const dispatch = useDispatch();
  const nav = useNavigation();

  const navigationRightDrawer = useSelector(
    (state: { navigation: NavigationCustomState }) =>
      state.navigation.navigationRightDrawer
  );
  // @ts-ignore
  const LeftDrawerMenu = () => {
    navigationRightDrawer.closeDrawer();
    navigationLeftDrawer.toggleDrawer();
  };

  // @ts-ignore
  const LeftGoBack = () => {
    navigationRightDrawer.closeDrawer();
    navigateAndSimpleReset("Home");
  };

  // @ts-ignore
  const GoBackToChats = () => {
    navigateAndSimpleReset("Chats");
  };

  const LeftDrawerAction = () => (
    <>
      {isStack ? (
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Feather name="arrow-left" color={Colors.white} size={25} />
        </TouchableOpacity>
      ) : (
        <TopNavigationAction
          icon={renderHomeIcon}
          onPress={() => {
            if (user_type === "instructor") {
              nav.reset({
                index: 0,
                routes: [
                  {
                    name: "InstructorActivity",
                  },
                ],
              });
            } else if (user_type === "student") {
              nav.navigate("StudentActivity");
              dispatch(
                ChangeStudentActivityState.action({
                  showFamilyMap: false,
                  hideCalendar: false,
                })
              );
              dispatch(
                ChangeModalState.action({
                  showCalendar: false,
                })
              );
            } else {
              nav.navigate("Home");
              if (props?.thumbnail) {
                dispatch(
                  ChangeModalState.action({
                    showCalendar: false,
                  })
                );
              }
              props?.setThumbnail && props?.setThumbnail();
            }
          }}
        />
      )}
      {!hideCalendar && (
        <TopNavigationAction
          icon={renderCalendarIcon}
          style={{ marginLeft: 10 }}
          onPress={CalendarModalTrigger}
        />
      )}
    </>
  );
  const RightDrawerMenu = () => {
    if (user_type === "instructor") {
      nav.navigate("InstructorSettings");
    } else if (user_type === "student") {
      nav.navigate("StudentSettings");
    } else {
      nav.navigate("Settings");
    }
  };
  const onApprovalPress = () => {
    nav.navigate("Approval", {
      screen: "ParentPendingScreen",
    });
  };
  const onInstructorApprovalPress = () => {
    nav.navigate("InstructorApproval", {
      screen: "InstructorPending",
    });
  };
  const CalendarModalTrigger = () => {
    dispatch(
      ChangeModalState.action({
        showCalendar: isCalendarVisible ? false : true,
      })
    );
  };

  const RightDrawerAction = () =>
    !isBack && (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {(user_type === "parent" || user_type === "instructor") &&
          !hideApproval && (
            <TouchableOpacity
              onPress={
                user_type === "parent"
                  ? onApprovalPress
                  : onInstructorApprovalPress
              }
            >
              <Image
                source={require("@/Assets/Images/Approval_Decline.png")}
                style={{ width: 25, height: 25, marginRight: 10 }}
              />
            </TouchableOpacity>
          )}
        <TopNavigationAction
          // showGlobe={props.showGlobe}
          icon={(props) => renderSettingIcon({ ...props, showGlobe })}
          onPress={RightDrawerMenu}
        />
      </View>
    );

  return (
    <>
      <View style={styles.background}>
        {props.simple ? (
          <TopNavigation
            style={styles.topNav}
            {...props}
            appearance="control"
            alignment="center"
            title={() => (
              <Text
                style={{
                  color: Colors.white,
                  fontSize: 18,
                }}
              >
                {props.title}
              </Text>
            )}
          />
        ) : (
          <TopNavigation
            style={styles.topNav}
            appearance="control"
            {...props}
            alignment="center"
            accessoryLeft={
              isBack ? (
                <TouchableOpacity
                  onPress={() => {
                    if (goBack) {
                      nav.goBack();
                    } else if (user_type === "instructor") {
                      nav.navigate("InstructorSettings");
                    } else if (user_type === "student") {
                      nav.navigate("StudentSettings");
                    } else {
                      nav.goBack();
                      // nav.navigate("Settings");
                    }
                  }}
                >
                  <Feather name="arrow-left" color={Colors.white} size={25} />
                </TouchableOpacity>
              ) : (
                LeftDrawerAction
              )
            }
            accessoryRight={RightDrawerAction}
            title={() => (
              <Text
                style={{
                  color: Colors.white,
                  fontSize: 18,
                  width: "60%",
                  alignSelf: "center",
                  textAlign: "center",
                }}
              >
                {props.title}
              </Text>
            )}
          />
        )}
      </View>
    </>
  );
};

export default AppHeader;
const styles = StyleSheet.create({
  background: {
    flex: 0,
    color: Colors.white,
    zIndex: -1,
    backgroundColor: Colors.primary,
  },
  topNav: {
    color: Colors.white,
  },
  icon: {
    width: 32,
    height: 32,
  },
  profileImage: {
    width: Normalize(35),
    height: Normalize(35),
    borderRadius: Normalize(20),
    alignSelf: "center",
  },
});
