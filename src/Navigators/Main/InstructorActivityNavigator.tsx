import React, { useState, useEffect } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Button, TabBar } from "@ui-kitten/components";
import { StyleSheet, View } from "react-native";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import ChangeInstructorState from "@/Store/InstructorsActivity/ChangeInstructorActivityState";
import { InstructorActivityScreen, InstructorGroupScreen } from "@/Screens";
import { AppHeader, Calendar } from "@/Components";
import Colors from "@/Theme/Colors";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { ModalState } from "@/Store/Modal";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import ChangeInstructorActivityState from "@/Store/InstructorsActivity/ChangeInstructorActivityState";
// @refresh reset
const InstructorActivityNavigator = () => {
  const dispatch = useDispatch();
  const activeNav = useSelector(
    (state: { navigation: any }) => state.navigation.activeNav
  );
  const TabNavigator = createMaterialTopTabNavigator();
  const tabNames = ["Activity", "Group"];
  const [selectedMonth, setSelectedMonth] = useState(
    moment(new Date()).month()
  );
  const [activeTab, setActiveTab] = useState(1);
  const [selectedDay, setSelectedDay] = useState(moment().format("D"));

  const isCalendarVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.showCalendar
  );

  //@ts-ignore
  const TopTabBar = ({ navigation, state, setActiveTab }) => (
    <TabBar
      selectedIndex={state.index}
      indicatorStyle={{ display: "none" }}
      onSelect={(index) => navigation.navigate(state.routeNames[index])}
    >
      {tabNames.map((tabName, index) => {
        if (state.index == index) {
          return (
            <Button
              key={index}
              style={[
                styles.buttonText,
                styles.background,
                { backgroundColor: Colors.lightgray },
              ]}
              appearance="ghost"
              size="medium"
              status="primary"
            >
              {tabName}
            </Button>
          );
        } else {
          return (
            <View key={index} style={styles.background}>
              <Button
                style={styles.buttonText}
                appearance="ghost"
                size="medium"
                status="control"
                onPress={() => {
                  setActiveTab(state.index);
                  if (state.index != 1) {
                    dispatch(
                      ChangeModalState.action({
                        showCalendar: false,
                      })
                    );
                  }
                  navigation.navigate(state.routeNames[index]);
                }}
              >
                {tabName}
              </Button>
            </View>
          );
        }
      })}
    </TabBar>
  );
  useEffect(() => {
    if (!isCalendarVisible) {
      setSelectedDay(moment().format("D"));
      dispatch(
        ChangeInstructorActivityState.action({
          selectedMonthForFilter: moment().format("M"),
          selectedDayForFilter: moment().format("DD"),
        })
      );
    }
  }, [isCalendarVisible]);
  useEffect(() => {
    if (activeNav) {
      setActiveTab(1);
    }
  }, [activeNav]);

  return (
    <>
      <AppHeader
        hideCalendar={activeTab != 1 ? true : false}
        title={`Activity & Groups`}
      />
      {isCalendarVisible && (
        <Calendar
          selectedMonth={selectedMonth}
          setSelectedMonth={(value) => {
            setSelectedMonth(value);
            dispatch(
              ChangeInstructorActivityState.action({
                selectedMonthForFilter: value,
              })
            );
          }}
          selectedDay={parseInt(selectedDay)}
          setSelectedDay={(value: any) => {
            setSelectedDay(value);
            dispatch(
              ChangeInstructorActivityState.action({
                selectedDayForFilter: value,
              })
            );
          }}
        />
      )}
      <TabNavigator.Navigator
        screenOptions={{ lazy: true, swipeEnabled: false }}
        tabBar={(props) => (
          <TopTabBar
            {...props}
            setIsCalendar={() => setIs}
            setActiveTab={(value) => setActiveTab(value)}
          />
        )}
      >
        <TabNavigator.Screen
          name="InstructorActivity"
          options={{ title: "Activity" }}
          component={InstructorActivityScreen}
        />
        <TabNavigator.Screen
          name="InstructorGroup"
          options={{ title: "Groups" }}
          component={InstructorGroupScreen}
        />
      </TabNavigator.Navigator>
    </>
  );
};

export default InstructorActivityNavigator;
const styles = StyleSheet.create({
  background: {
    color: Colors.white,
    zIndex: -1,
    marginLeft: 2,
    marginRight: 2,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  topNav: {
    color: Colors.white,
  },
  text: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 18,
  },
  buttonText: {
    borderRadius: 10,
    fontFamily: "Gill Sans",
    textAlign: "center",
    color: Colors.white,
    shadowColor: "rgba(0,0,0, .4)", // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    justifyContent: "center",
    alignItems: "center",
  },
});
