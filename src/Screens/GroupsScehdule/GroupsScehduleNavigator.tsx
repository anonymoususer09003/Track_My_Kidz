import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { TabBar } from '@ui-kitten/components';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { Calendar, LinearGradientButton } from '@/Components';
import BackgroundLayout from '@/Components/BackgroundLayout';


import ChangeInstructorActivityState from '@/Store/InstructorsActivity/ChangeInstructorActivityState';
import { ModalState } from '@/Store/Modal';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import Colors from '@/Theme/Colors';

import { CompetitionScreen, InstructorActivityScreen, InstructorGroupScreen, PracticesScreen } from '@/Screens';

export type GroupScheduleNavigatorParamList = {
  InstructorActivity: { instructors?: any };
  InstructorGroup: { instructors?: any };
};

// @refresh reset
const InstructorActivityNavigator = () => {
  const dispatch = useDispatch();
  const cancelToken = axios.CancelToken;

  // const {state, dispatch} = useStateValue();
  const activeNav = useSelector(
    (state: { navigation: any }) => state.navigation.activeNav,
  );
  const currentUser = useSelector(
    (state: { user: any }) => state.user.item,
  );
  const TabNavigator = createMaterialTopTabNavigator<GroupScheduleNavigatorParamList>();
  const tabNames = [ 'Competition','Practices',];
  const [selectedMonth, setSelectedMonth] = useState(
    moment(new Date()).month(),
  );

  const [_, setActiveTab] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState(moment().format('D'));

  const isCalendarVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.showCalendar,
  );

  //@ts-ignore
  const TopTabBar = ({ navigation, state, setActiveTab }) => (
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
              <LinearGradientButton onPress={() => null}>
                {tabName}
              </LinearGradientButton>
            </View>
          );
        } else {
          return (
            <View key={index} style={styles.background}>
              <LinearGradientButton
                textStyle={{ color: Colors.black }}
                gradient={[Colors.white, Colors.white]}
                onPress={() => {
                  setActiveTab(state.index);
                  if (state.index != 1) {
                    dispatch(
                      ChangeModalState.action({
                        showCalendar: false,
                      }),
                    );
                  }
                  navigation.navigate(state.routeNames[index]);
                }}
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
      setSelectedDay(moment().format('D'));
      dispatch(
        ChangeInstructorActivityState.action({
          // todo solve this not a priority
          // @ts-ignore
          selectedMonthForFilter: moment().subtract(1, 'M').format('M'),
          // @ts-ignore
          selectedDayForFilter: moment().format('DD'),
        }),
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
      <BackgroundLayout
showSearchBar={!!currentUser?.isAdmin}
        // dropDownList={instructors}
        showDropDown={false}
        title={`Schedule`}
        rightIcon={true}
      >
        {isCalendarVisible && (
          <Calendar
            style={''}
            selectedMonth={selectedMonth}
            setSelectedMonth={(value) => {
              setSelectedMonth(value);
              dispatch(
                ChangeInstructorActivityState.action({
                  // todo solve this not a priority
                  // @ts-ignore
                  selectedMonthForFilter: String(value),
                }),
              );
            }}
            selectedDay={parseInt(selectedDay)}
            setSelectedDay={(value: any) => {
              setSelectedDay(value);
              dispatch(
                ChangeInstructorActivityState.action({
                  selectedDayForFilter: value,
                }),
              );
            }}
          />
        )}
        <TabNavigator.Navigator
          screenOptions={{ lazy: true, swipeEnabled: false }}
          tabBar={(props) => (
            <TopTabBar
              {...props}
              setActiveTab={(value: number) => setActiveTab(value)}
            />
          )}
        >
          <TabNavigator.Screen
            name="CompetitionScreen"
            options={{ title: 'Competition' }}
            component={CompetitionScreen}
          />
          <TabNavigator.Screen
            name="PracticesScreen"
            options={{ title: 'Practice' }}
            component={PracticesScreen}
          />
        </TabNavigator.Navigator>
      </BackgroundLayout>
    </>
  );
};

export default InstructorActivityNavigator;
const styles = StyleSheet.create({
  background: {
    color: Colors.white,
    zIndex: -1,

    borderRadius: 10,
    backgroundColor: Colors.newBackgroundColor,
    marginTop: 20,
    paddingHorizontal: 20,
    width: '100%',
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

    shadowColor: 'rgba(0,0,0, .4)', // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  toolBar: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,

    backgroundColor: Colors.newBackgroundColor,
    width: '100%',
  },
});
