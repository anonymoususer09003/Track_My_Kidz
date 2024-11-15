import { navigateAndSimpleReset } from "@/Navigators/Functions";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { NavigationCustomState } from "@/Store/Navigation";
import ChangeStudentActivityState from "@/Store/StudentActivity/ChangeStudentActivityState";
import Colors from "@/Theme/Colors";
import { Normalize } from "@/Utils/Shared/NormalizeDisplay";
import { useNavigation } from "@react-navigation/native";
import {
  Text, TopNavigation,
  TopNavigationAction
} from "@ui-kitten/components";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import Icon from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from "react-redux";

import { ModalState } from "@/Store/Modal";
import { UserTypeState } from "@/Store/UserType";

import { StudentState } from "@/Store/StudentActivity";
const homeIcon = require("@/Assets/Images/navigation_icon1.png");
const calendarIcon = require("@/Assets/Images/navigation_icon2.png");

const activitiesIcon = require("@/Assets/Images/navigation_icon3.png");
const settings = require("@/Assets/Images/navigation_icon4.png");
const addIcon = require("@/Assets/Images/add.png");
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
      <>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: props.showGlobe ? "space-between" : "flex-end",
            width: props.showGlobe || user_type != "student" ? "85%" : "100%",
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
                style={{ height: 25, width: 25, tintColor: Colors.white }}
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
          <Image
            style={{ height: 22, width: 22, tintColor: Colors.white }}
            source={settings}
          />
        </View>
      </>
    );
  };

  //@ts-ignore
  const renderHomeIcon = (props) => (
    <Image style={{ height: 27, width: 27 }} source={homeIcon} />
  );
  //@ts-ignore
  const renderListItem = (props) => (
    <Icon name="list" size={25} color="white" /> 
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
    <View
      style={{
        width: "62%",

        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
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
                  showParticipantMap: false,
                })
              );
              dispatch(
                ChangeModalState.action({
                  showCalendar: false,
                })
              );
            } else {
              // nav.navigate("Home");
              if (props?.thumbnail) {
                dispatch(
                  ChangeModalState.action({
                    showCalendar: false,
                  })
                );
              }
              props?.setThumbnail && props?.setThumbnail(false);
            }
          }}
        />
      )}
      {/* {!hideCalendar && ( */}
        <TopNavigationAction
          icon={user_type === "parent"?renderListItem:undefined}
          style={{ marginLeft: 10 }}
          onPress={()=> props?.setThumbnail && props?.setThumbnail(true)}
        />
      {/* )} */}
    </View>
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
      <View
        style={{
          width: "60%",

          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
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
                source={activitiesIcon}
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
        {!props.hideCenterIcon && (
          <TouchableOpacity
            style={{ zIndex: 5 }}
            onPress={() => props.onAddPress()}
          >
            <Image
              style={{
                height: 50,
                width: 50,
                position: "absolute",
                alignSelf: "center",
                top: -25,
              }}
              source={addIcon}
            />
          </TouchableOpacity>
        )}
        {props.simple ? (
          <TopNavigation
            style={styles.topNav}
            {...props}
            appearance="control"
            alignment="center"
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
    // flex: 0,
    color: Colors.white,
    zIndex: 2,
    backgroundColor: Colors.primary,
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
