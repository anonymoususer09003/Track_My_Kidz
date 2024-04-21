import { AppHeader, Calendar, LinearGradientButton } from '@/Components';
import BackgroundLayout from '@/Components/BackgroundLayout';
import { StudentActivityScreen, StudentGroupScreen } from '@/Screens';
import ChangeInstructorActivityState from '@/Store/InstructorsActivity/ChangeInstructorActivityState';
import { ModalState } from '@/Store/Modal';
import { StudentState } from '@/Store/StudentActivity';
import Colors from '@/Theme/Colors';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { TabBar } from '@ui-kitten/components';
import moment from 'moment';
import React, { FC, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

type StudentActivityNavigatorProp = {
  StudentActivityInner: undefined;
  StudentGroup: undefined;
};

// @refresh reset
const StudentActivityNavigator: FC = () => {
  const TabNavigator = createMaterialTopTabNavigator<StudentActivityNavigatorProp>();
  const tabNames = ['Activity', 'Group'];
  const [selectedMonth, setSelectedMonth] = useState(moment(new Date()).month());
  console.log('selectedMonth', selectedMonth);
  const dispatch = useDispatch();
  const { hideCalendar, showFamilyMap, showParticipantMap } = useSelector(
    (state: { studentActivity: StudentState }) => state.studentActivity
  );

  const [selectedDay, setSelectedDay] = useState(moment(new Date()).date());

  const isCalendarVisible = useSelector((state: { modal: ModalState }) => state.modal.showCalendar);

  //@ts-ignore
  const TopTabBar = ({ navigation, state }) => (
    <TabBar
      style={styles.toolBar}
      selectedIndex={state.index}
      indicatorStyle={{ display: 'none' }}
      onSelect={(index) => navigation.navigate(state.routeNames[index])}
    >
      {tabNames.map((tabName, index) => {
        if (state.index == index) {
          return (
            <View key={index} style={styles.background}>
              <LinearGradientButton onPress={() => null} textStyle={{ fontSize: 14 }}>
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

  return (
    <BackgroundLayout hideLeftIcon={true} title="Event Information" rightIcon={true}>
      {isCalendarVisible && (
        <Calendar
          selectedMonth={selectedMonth}
          setSelectedMonth={(m) => {
            setSelectedMonth(m);
            dispatch(
              ChangeInstructorActivityState.action({
                // @ts-ignore
                selectedMonthForFilter: m,
              })
            );
          }}
          selectedDay={selectedDay}
          setSelectedDay={(d) => {
            setSelectedDay(d);
            dispatch(
              ChangeInstructorActivityState.action({
                // @ts-ignore
                selectedDayForFilter: d,
              })
            );
          }}
        />
      )}
      <TabNavigator.Navigator
        screenOptions={{ lazy: true, swipeEnabled: false }}
        tabBar={(props) => (showFamilyMap || showParticipantMap ? null : <TopTabBar {...props} />)}
      >
        <TabNavigator.Screen
          name="StudentActivityInner"
          options={{ title: 'Activity' }}
          component={StudentActivityScreen}
        />
        <TabNavigator.Screen
          name="StudentGroup"
          options={{ title: 'Groups' }}
          component={StudentGroupScreen}
        />
      </TabNavigator.Navigator>
      <AppHeader hideCenterIcon={true} hideCalendar={!!showFamilyMap} showGlobe={true} />
    </BackgroundLayout>
  );
};

export default StudentActivityNavigator;
const styles = StyleSheet.create({
  background: {
    color: Colors.white,
    zIndex: -1,

    borderRadius: 10,
    backgroundColor: Colors.newBackgroundColor,
    marginTop: 20,
    paddingHorizontal: 20,
    width: '100%',
    borderColor: 'white',
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
    fontFamily: 'Gill Sans',
    textAlign: 'center',
    color: Colors.white,
    shadowColor: 'rgba(0,0,0, .4)', // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolBar: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,

    backgroundColor: Colors.newBackgroundColor,
    width: '100%',
  },
});
