import { Calendar, LinearGradientButton } from '@/Components';
import BackgroundLayout from '@/Components/BackgroundLayout';
import { actions } from '@/Context/state/Reducer';
import { useStateValue } from '@/Context/state/State';
// import { InstructorActivityScreen, InstructorGroupScreen } from "@/Screens";
import {
  FindInstructorBySchoolOrg,
  GetInstructor,
} from '@/Services/Instructor';
import ChangeInstructorActivityState from '@/Store/InstructorsActivity/ChangeInstructorActivityState';
import { ModalState } from '@/Store/Modal';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import Colors from '@/Theme/Colors';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { TabBar } from '@ui-kitten/components';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loadUserId } from '@/Storage/MainAppStorage';
// @refresh reset
const InstructorActivityNavigator = () => {
  const dispatch = useDispatch();
  const cancelToken = axios.CancelToken;
  const source = cancelToken.source();
  // const {state, dispatch} = useStateValue();
  const activeNav = useSelector(
    (state: { navigation: any }) => state.navigation.activeNav,
  );
  const currentUser = useSelector(
    (state: { user: any }) => state.user.item,
  );
  const TabNavigator = createMaterialTopTabNavigator();
  const tabNames = ['Activity', 'Group'];
  const [selectedMonth, setSelectedMonth] = useState(
    moment(new Date()).month(),
  );
  const [instructors, setInstructors] = useState([]);
  const [activeTab, setActiveTab] = useState<number>(1);
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
                  navigation.navigate(state.routeNames[index], { instructors });
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
  const findInstructorBySchoolId = async (res: any) => {
    try {
      let instructorsList = await FindInstructorBySchoolOrg(
        {
          schoolId: res?.schoolId,
          // 2198,
          // res?.schoolId,
          orgId: res?.orgId || null,
        },
        {
          cancelToken: source.token,
        },
      );

      if (instructorsList) {
        dispatch({
          type: actions.ORG_INSTRUCTORS,
          payload: instructorsList,
        });
        setInstructors(instructorsList);
        // setOrgInfo(org);
        //   })
      }
    } catch (err) {
      console.log('err', err);
    }
  };

  const getInstructors = async () => {
    try {
      console.log('logs00000', Object.keys(currentUser).length == 0);
      if (Object.keys(currentUser).length == 0) {
        const userId = await loadUserId();
        if (userId) {

          let res = await GetInstructor(userId);
          await findInstructorBySchoolId(res);
        }
      } else {
        await findInstructorBySchoolId(currentUser);
      }
    } catch (err) {
    }
  };

  useEffect(() => {
    if (!isCalendarVisible) {
      setSelectedDay(moment().format('D'));
      dispatch(
        ChangeInstructorActivityState.action({
          selectedMonthForFilter: moment().subtract(1, 'M').format('M'),
          selectedDayForFilter: moment().format('DD'),
        }),
      );
    }
  }, [isCalendarVisible]);
  useEffect(() => {
    getInstructors();
    if (activeNav) {
      setActiveTab(1);
    }
  }, [activeNav]);

  return (
    <>
      {/* <AppHeader
        hideCalendar={activeTab != 1 ? true : false}
        title={`Activity & Groups`}
      /> */}
      <BackgroundLayout
        hideLeftIcon={true}
        dropDownList={instructors}
        showDropDown={!!currentUser?.isAdmin}
        title={`Activity & Groups`}
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
            name="InstructorActivity"
            options={{ title: 'Activity' }}
            component={View}
          />
          <TabNavigator.Screen
            name="InstructorGroup"
            options={{ title: 'Groups' }}
            component={View}
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
