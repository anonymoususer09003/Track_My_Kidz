import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FC } from 'react';
import { Text, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import Feather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from 'react-redux';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import ChangeModalState from '@/Store/Modal/ChangeModalState';
import ChangeStudentActivityState from '@/Store/StudentActivity/ChangeStudentActivityState';
import Colors from '@/Theme/Colors';
import { Normalize } from '@/Utils/Shared/NormalizeDisplay';
import { ModalState } from '@/Store/Modal';
import { UserTypeState } from '@/Store/UserType';
import { StudentState } from '@/Store/StudentActivity';
import { MainStackNavigatorParamsList } from '@/Navigators/Main/RightDrawerNavigator';

const homeIcon = require('@/Assets/Images/navigation_icon1.png');
const calendarIcon = require('@/Assets/Images/navigation_icon2.png');
const activitiesIcon = require('@/Assets/Images/navigation_icon3.png');
const settings = require('@/Assets/Images/navigation_icon4.png');
const addIcon = require('@/Assets/Images/add.png');
const listIcon = require('@/Assets/Images/list.png');
const arrowLeftIcon = require('@/Assets/Images/arrow-left.png');

type AppHeaderProps = {
  showGlobe?: boolean;
  hideCalendar?: boolean;
  hideApproval?: boolean
  goBack?: () => void
  onAddPress?: () => void
  hideCenterIcon?: boolean
  setThumbnail?: (thumbnail: (boolean | undefined)) => void
  thumbnail?: any
  isStack?: boolean
  isBack?: boolean
  isCalendar?: boolean
  simple?: boolean
  title?: string
};

const AppHeader: FC<AppHeaderProps> = ({ showGlobe, ...props }) => {
  const user_type = useSelector(
    (state: { userType: UserTypeState }) => state.userType.userType,
  );
  const isCalendarVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.showCalendar,
  );
  // const hideCalendar = props?.hideCalendar || false;
  const hideApproval = props?.hideApproval || false;
  const goBack = props.goBack;
  const { showFamilyMap } = useSelector(
    (state: { studentActivity: StudentState }) => state.studentActivity,
  );

  const route = useRoute();

  const renderSettingIcon = (props: { showGlobe?: boolean, } | any) => {
    return (
      <>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: props.showGlobe ? 'space-between' : 'flex-end',
            width: props.showGlobe || user_type != 'student' ? '85%' : '100%',
          }}
        >
          {props.showGlobe && user_type == 'student' && (
            <TouchableOpacity
              onPress={() => {
                dispatch(
                  ChangeStudentActivityState.action({
                    showFamilyMap: !showFamilyMap,
                    hideCalendar: !showFamilyMap,
                    showParticipantMap: false,
                  }),
                );
                dispatch(
                  ChangeModalState.action({
                    showCalendar: false,
                  }),
                );
              }}
              style={{ marginRight: 10 }}
            >
              <Image
                style={{ height: 25, width: 25, tintColor: Colors.white }}
                source={require('../../Assets/Images/earth.png')}
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

  const renderHomeIcon = () => (
    <Image style={{ height: 27, width: 27 }} source={homeIcon} />
  );


  const renderListItem = () => {
    if (user_type === 'instructor') {
      if (route.name === 'InstructorActivity') {
        return <Image style={{ height: 27, width: 27 }} source={calendarIcon} />;
      }
    } else if (user_type === 'parent') {
      if (props?.thumbnail) {
        return <></>;
      }
      switch (route.name) {
        case 'Activity':
          return <Image style={{ height: 27, width: 27 }} source={calendarIcon} />;
        case 'HomeScreen':
          return <Image style={{ height: 27, width: 27 }} source={listIcon} />;
      }
    } else if (user_type === 'student') {
      if (route.name !== 'StudentSettings')
        return <Image style={{ height: 27, width: 27 }} source={calendarIcon} />;
    }
    return <></>;
  };

  const isStack = props && props.isStack;
  const isBack = props && props.isBack;

  // const navigationLeftDrawer = useSelector(
  //   (state: { navigation: NavigationCustomState }) =>
  //     state.navigation.navigationLeftDrawer
  // );
  const dispatch = useDispatch();
  const navigation = useNavigation<StackNavigationProp<MainStackNavigatorParamsList>>();

  // const navigationRightDrawer = useSelector(
  //   (state: { navigation: NavigationCustomState }) =>
  //     state.navigation.navigationRightDrawer
  // );

  // const LeftDrawerMenu = () => {
  //   navigationRightDrawer.closeDrawer();
  //   navigationLeftDrawer.toggleDrawer();
  // };


  // const LeftGoBack = () => {
  //   navigationRightDrawer.closeDrawer();
  //   navigateAndSimpleReset("Home");
  // };


  // const GoBackToChats = () => {
  //   navigateAndSimpleReset('Chats');
  // };

  const LeftDrawerAction = () => (
    <View
      style={{
        width: '62%',

        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
    >
      {isStack ? (
        <TouchableOpacity onPress={() => navigation.goBack()}>
           <Image style={{ height: 25, width: 25 }} source={arrowLeftIcon} />
        </TouchableOpacity>
      ) : (
        <TopNavigationAction
          icon={renderHomeIcon}
          onPress={() => {
            if (user_type === 'instructor') {
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'InstructorActivity',
                  },
                ],
              });
            } else if (user_type === 'student') {
              navigation.navigate('StudentActivity');
              dispatch(
                ChangeStudentActivityState.action({
                  showFamilyMap: false,
                  hideCalendar: false,
                  showParticipantMap: false,
                }),
              );
              dispatch(
                ChangeModalState.action({
                  showCalendar: false,
                }),
              );
            } else {
              // if(user_type === "parent"){
              navigation.navigate('Home');
              // }
              if (props?.thumbnail) {
                dispatch(
                  ChangeModalState.action({
                    showCalendar: false,
                  }),
                );
              }
              props?.setThumbnail && props?.setThumbnail(false);
            }
          }}
        />
      )}
      {/*{!hideCalendar && (*/}
      <TopNavigationAction
        icon={renderListItem}
        style={{ marginLeft: 10 }}
        onPress={() => {
          console.log('props?.isCalendar', props?.isCalendar, props?.thumbnail);
          if (route.name === 'HomeScreen') {
            dispatch(
              ChangeModalState.action({
                showCalendar: false,
              }),
            );
          } else {
            dispatch(
              ChangeModalState.action({
                showCalendar: !isCalendarVisible,
              }),
            );
          }
          props?.setThumbnail && props?.setThumbnail(true);
        }}
      />
      {/*)}*/}
    </View>
  );
  const RightDrawerMenu = () => {
    if (user_type === 'instructor') {
      navigation.navigate('InstructorSettings');
    } else if (user_type === 'student') {
      navigation.navigate('StudentSettings');
    } else {
      navigation.navigate('Settings');
    }
  };
  const onApprovalPress = () => {
    navigation.navigate('Approval', {
      screen: 'ParentPendingScreen',
    });
  };
  const onInstructorApprovalPress = () => {
    navigation.navigate('InstructorApproval', {
      screen: 'InstructorPending',
    });
  };
  // const CalendarModalTrigger = () => {
  //   dispatch(
  //     ChangeModalState.action({
  //       showCalendar: !isCalendarVisible,
  //     }),
  //   );
  // };
  const AccessoryLeft = () =>
    isBack ? (
      <TouchableOpacity
        onPress={() => {
          if (goBack) {
            navigation.goBack();
          } else if (user_type === 'instructor') {
            navigation.navigate('InstructorSettings');
          } else if (user_type === 'student') {
            navigation.navigate('StudentSettings');
          } else {
            navigation.goBack();
            // navigation.navigate("Settings");
          }
        }}
      >
        <Image style={{ height: 25, width: 25 }} source={arrowLeftIcon} />
      </TouchableOpacity>
    ) : (
      <LeftDrawerAction />
    );

  const AccessoryRight = () => {
    console.log('AppHeader.tsx line 306 isBack', isBack);
    console.log('AppHeader.tsx line 306 user_type', user_type);
    console.log('AppHeader.tsx line 306 hideApproval', hideApproval);
    return isBack ?
      <></>
      : (
        <View
          style={{
            width: '60%',

            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          {(user_type === 'parent' || user_type === 'instructor') &&

          !hideApproval ? (
            <TouchableOpacity
              onPress={
                user_type === 'parent'
                  ? onApprovalPress
                  : onInstructorApprovalPress
              }
            >
              <Image
                source={activitiesIcon}
                style={{ width: 25, height: 25, marginRight: 10 }}
              />
            </TouchableOpacity>
          ) : <></>}
          <TopNavigationAction
            // showGlobe={props.showGlobe}
            icon={(props) => renderSettingIcon({ ...props, showGlobe })}
            onPress={RightDrawerMenu}
          />
        </View>
      );
  };

  return (
    <>
      <View style={styles.background}>
        {!props.hideCenterIcon && (
          <TouchableOpacity
            style={{ zIndex: 5 }}
            onPress={() => props?.onAddPress && props.onAddPress()}
          >
            <Image
              style={{
                height: 50,
                width: 50,
                position: 'absolute',
                alignSelf: 'center',
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
            accessoryLeft={AccessoryLeft}
            accessoryRight={AccessoryRight}
            title={() => (
              <Text
                style={{
                  color: Colors.white,
                  fontSize: 18,
                  width: '60%',
                  alignSelf: 'center',
                  textAlign: 'center',
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
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  topNav: {
  },
  icon: {
    width: 32,
    height: 32,
  },
  profileImage: {
    width: Normalize(35),
    height: Normalize(35),
    borderRadius: Normalize(20),
    alignSelf: 'center',
  },
});
