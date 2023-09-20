import { Calendar, LinearGradientButton } from "@/Components";
import BackgroundLayout from "@/Components/BackgroundLayout";
import { useStateValue } from "@/Context/state/State";
import { ActivityScreen, GroupScreen } from "@/Screens";
import ChangeInstructorActivityState from "@/Store/InstructorsActivity/ChangeInstructorActivityState";
import { ModalState } from "@/Store/Modal";
import Colors from "@/Theme/Colors";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { TabBar } from "@ui-kitten/components";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
// @refresh reset
const ActivityNavigator = ({ route }) => {
  const TabNavigator = createMaterialTopTabNavigator();
  const tabNames = ["Activity", "Group"];
  const dispatch = useDispatch();
  
  const [selectedMonth, setSelectedMonth] = useState(
    moment(new Date()).month()
  );
  const [selectedDay, setSelectedDay] = useState(moment().format("D"));

  const isCalendarVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.showCalendar
  );

  
  const [{ childName }] = useStateValue();
  //@ts-ignore
  const TopTabBar = ({ navigation, state }) => (
    <TabBar
      style={styles.toolBar}
      selectedIndex={state.index}
      indicatorStyle={{ display: "none" }}
      onSelect={(index) => navigation.navigate(state.routeNames[index])}
    >
      {tabNames.map((tabName, index) => {
        if (state.index == index) {
          return (
            <View key={index} style={styles.background}>
              <LinearGradientButton
                onPress={() => null}
                textStyle={{ fontSize: 14 }}
              >
                {tabName}
              </LinearGradientButton>
            </View>
          );
        } else {
          return (
            <View key={index} style={styles.background}>
              <LinearGradientButton
                textStyle={{ color: Colors.black, fontSize: 14 }}
                gradient={[Colors.white, Colors.white]}
                onPress={() => navigation.navigate(state.routeNames[index])}
              >
                {tabName}
              </LinearGradientButton>
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
          selectedMonthForFilter: moment().subtract(1,'M').format("M"),
          selectedDayForFilter: moment().format("DD"),
        })
      );
    }
  }, [isCalendarVisible]);


  
  console.log('isCalendarVisible',isCalendarVisible)
  return (
    <BackgroundLayout title="Event Information" rightIcon={true}>
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
              console.log('value',value)
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
        tabBar={(props) => <TopTabBar {...props} />}
      >
        <TabNavigator.Screen
          name="Activity"
          options={{ title: "Activity" }}
          component={ActivityScreen}
        />
        <TabNavigator.Screen
          name="Group"
          options={{ title: "Groups" }}
          component={GroupScreen}
        />
      </TabNavigator.Navigator>
    </BackgroundLayout>
  );
};

export default ActivityNavigator;
const styles = StyleSheet.create({
  background: {
    color: Colors.white,
    zIndex: -1,

    borderRadius: 10,
    backgroundColor: Colors.newBackgroundColor,
    marginTop: 20,
    paddingHorizontal: 20,
    width: "100%",
    borderColor: "white",
  },
  topNav: {
    color: Colors.white,
  },
  text: {
    color: Colors.black,
    // fontWeight: "bold",
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
  toolBar: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,

    backgroundColor: Colors.newBackgroundColor,
    width: "100%",
  },
});
