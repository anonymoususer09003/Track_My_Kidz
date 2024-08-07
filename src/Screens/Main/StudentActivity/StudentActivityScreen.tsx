import { InstructionsModal } from '@/Modals';
import { Activity, Optin } from '@/Models/DTOs';
import {
  GetActivitesCount,
  GetActivityByStudentId,
  ParticipantLocation,
} from '@/Services/Activity';
import GetParentChildrens from '@/Services/Parent/GetParentChildrens';
import TrackHistory from '@/Services/Parent/TrackHistory';
import {
  getHomeScreenCacheInfo,
  loadToken,
  storeHomeScreenCacheInfo,
} from '@/Storage/MainAppStorage';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import ChangeStudentActivityState from '@/Store/StudentActivity/ChangeStudentActivityState';
import { UserState } from '@/Store/User';
import Colors from '@/Theme/Colors';
import Geolocation from '@react-native-community/geolocation';
import { RouteProp, useIsFocused, useNavigation } from '@react-navigation/native';
import { Icon, IconRegistry, Text } from '@ui-kitten/components';
import axios from 'axios';
import moment from 'moment';
import React, { FC, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import GeolocationAndroid from 'react-native-geolocation-service';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import MapView, { LatLng, Marker } from 'react-native-maps';
import Entypo from 'react-native-vector-icons/Entypo';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import SockJS from 'sockjs-client';
// @ts-ignore
import * as Stomp from 'react-native-stompjs';

import BackgroundFetching from '@/Components/BackgroundFetching';
import { actions } from '@/Context/state/Reducer';
import { useStateValue } from '@/Context/state/State';
import { GroupParticipantsModal, ShowInstructorsStudentsModal } from '@/Modals';
import { InstructorState } from '@/Store/InstructorsActivity';
import { ModalState } from '@/Store/Modal';
import { StudentState } from '@/Store/StudentActivity';
import SetChatParam from '@/Store/chat/SetChatParams';
import BackgroundService from 'react-native-background-actions';
import { MainStackNavigatorParamsList } from '@/Navigators/Main/RightDrawerNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import { calculateDistance } from '@/Utils/DistanceCalculator';
import { AppHeader } from '@/Components';

const StudentActivityScreen: FC = () => {
  const navigation = useNavigation<StackNavigationProp<MainStackNavigatorParamsList>>();

  const isFocused = useIsFocused();
  const searchBarValue = useSelector((state: any) => state.header.searchBarValue);
  const cancelToken = axios.CancelToken;
  const source = cancelToken.source();
  const [selectionData, setSelectionData] = useState({
    type: 'student',
    status: 'pending',
  });
  const [showStudentsInstructorsModal, setShowStudentsInstructorsModal] = useState(false);
  const [{ selectedActivity: activity }, _dispatch]: any = useStateValue();
  const [originalActivities, setOriginalActivities] = useState<Activity[]>([]);
  const [activitiesCount, setActivitiesCount] = useState<any>({});
  const [children, setChildren] = useState<any[]>([]);
  const [originalChildren, setOriginalChildren] = useState<any[]>([]);
  const [studentsEmails, setStudentsEmail] = useState<any[]>([]);
  const [originalStudentsEmails, setOriginalStudentsEmail] = useState<any[]>([]);
  // const swipeableRef = useRef(null);
  const [userLocation, setUserLocation] = useState<LatLng>({ longitude: 0, latitude: 0 });
  const dispatch = useDispatch();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedInstructions, setSelectedInstructions] = useState<Optin>();
  // const [showActivityParticipant, setShowActivityParticipant] = useState<boolean>(false);
  // const [participantsEmail, setParticipantsEmail] = useState<any[]>([]);
  const [partcipants, setParticipants] = useState<any[]>([]);
  const [getChildrendeviceIds, setChildrensDeviceIds] = useState<any[]>([]);
  const [getParticipantsIds, setParticipantsIds] = useState<any[]>([]);
  // const [selectedActivity, setSelectedActivity] = useState();
  // const [trackerName, setTrackerName] = useState();
  const [trackingList, setTrackingList] = useState<any>({});
  const [newParticipnatsArr, setnewParticipnatsArr] = useState<any[]>([]);
  const [showModal, setModal] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [groups, setGroups] = useState<any>({});
  const currentUser: any = useSelector((state: { user: UserState }) => state.user.item);
  const isCalendarVisible = useSelector((state: { modal: ModalState }) => state.modal.showCalendar);

  const instructorImage = require('@/Assets/Images/approval_icon2.png');
  const { showFamilyMap, showParticipantMap } = useSelector(
    (state: { studentActivity: StudentState }) => state.studentActivity
  );
  const { selectedDayForFilter, selectedMonthForFilter } = useSelector(
    (state: { instructorsActivity: InstructorState }) => state.instructorsActivity
  );

  const ref = useRef<MapView>();
  let prevOpenedRow: any;
  let row: Array<any> = [];
  const getActivities = async () => {
    GetActivityByStudentId(currentUser?.studentId)
      .then((res) => {
        setActivities(res);
        setOriginalActivities(res);
        storeHomeScreenCacheInfo('student_activites', JSON.stringify(res));
      })
      .catch((err) => {
        console.log('Error:', err);
      });
  };

  const handleTrackHistory = async (status: boolean, id: any, latitude: any, longitude: any) => {
    const _date = moment(new Date()).format();

    const res = await TrackHistory(status, id, _date, latitude, longitude);
    // sendCoordinates(latitude, longitude);
  };

  const handleTrackHistorySchedule = async (tracking?: any) => {
    try {
      if (Platform.OS == 'android') {
        GeolocationAndroid.getCurrentPosition(async (pos) => {
          const crd = pos.coords;

          if (tracking) {
            sendCoordinates(crd.latitude, crd.longitude);
          } else {
            await handleTrackHistory(true, currentUser?.studentId, crd.latitude, crd.longitude);
          }
        });
      } else {
        Geolocation.getCurrentPosition(
          async (pos: any) => {
            const crd = pos.coords;

            if (tracking) {
              sendCoordinates(crd.latitude, crd.longitude);
            } else {
              await handleTrackHistory(true, currentUser?.studentId, crd.latitude, crd.longitude);
            }
          },
          () => {},
          {}
        );
      }
    } catch (err) {
      console.log('er99999999999999', err);
    }
  };
  const getCacheActivites = async () => {
    let activites = await getHomeScreenCacheInfo('student_activites');
    if (activites) {
      setActivities(JSON.parse(activites));
      setOriginalActivities(JSON.parse(activites));
    }
  };

  const fetchParent = async () => {
    try {
      getChildrens(currentUser?.parentReferenceCode1);
    } catch (err) {
      console.log('err', err);
    }
  };

  useEffect(() => {
    if (!isCalendarVisible) {
      setActivities(originalActivities);
    }
  }, [isCalendarVisible]);

  useEffect(() => {
    if (isFocused) {
      getCacheActivites();
      fetchParent();
    } else {
      dispatch(
        ChangeStudentActivityState.action({
          showFamilyMap: false,
        })
      );
    }
  }, [isFocused]);
  useEffect(() => {
    if (isFocused) {
      getActivities();
    }
  }, [isFocused]);

  const locationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        {
          title: 'Background Location Permission',
          message: 'TrackMyKidz App needs access to your location',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        backgroundCall();
      } else {
        backgroundCall();
      }
    } else {
      backgroundCall();
    }
  };
  const locationPermissionForTracking = async (tracking: any) => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        {
          title: 'Background Location Permission',
          message: 'TrackMyKidz App needs access to your location',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      // const granted = await PermissionsAndroid.request(
      //   PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      // );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        backgroundCall(tracking);
      } else {
        backgroundCall(tracking);
      }
    } else {
      backgroundCall(tracking);
      // backgroundCall();
    }
    // handleTrackHistorySchedule();
  };

  const backgroundCall = async (tracking?: any) => {
    const sleep = (time: any) => new Promise<void>((resolve) => setTimeout(() => resolve(), time));

    // You can do anything in your task such as network requests, timers and so on,
    // as long as it doesn't touch UI. Once your task completes (i.e. the promise is resolved),
    // React Native will go into "paused" mode (unless there are other tasks running,
    // or there is a foreground app).
    const veryIntensiveTask = async (taskDataArguments: any) => {
      // Example of an infinite loop task
      const { delay } = taskDataArguments;

      await new Promise(async () => {
        for (let i = 1; BackgroundService.isRunning(); i++) {
          try {
            // depends on which lib you are using
            await handleTrackHistorySchedule(tracking);
          } catch (error) {
            // console.log(error);
          }
          await sleep(tracking ? 12000 : Platform.OS == 'ios' ? 900000 : 300000);
        }
      });

      // await sleep(delay);
    };

    const options = {
      taskName: 'Example',
      taskTitle: 'TrackMyKidz',
      taskDesc: 'Tracking your Location',
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
      },
      color: '#ff00ff',
      linkingURI: 'yourSchemeHere://chat/jane', // See Deep Lking for more info
      parameters: {
        delay: tracking ? 2000 : Platform.OS == 'ios' ? 900000 : 300000,
      },
    };
    BackgroundService.on('expiration', () => {
      console.log('I am being closed :(');
    });

    // await BackgroundService.start(veryIntensiveTask, options);
    await BackgroundService.start(veryIntensiveTask, options);
    await BackgroundService.updateNotification({
      taskDesc: 'Tracking Location',
    }); // Only Android, iOS will ignore this call
    // iOS will also run everything here in the background until .stop() is called
    // await BackgroundService.stop();
  };

  const getParticipantLocation = async (activityId: string) => {
    try {
      let res = await ParticipantLocation(activityId);
      let deviceIds: any[] = [];
      res.map((item: any) => {
        item?.childDeviceId && deviceIds.push(item?.childDeviceId);
      });

      setParticipantsIds(deviceIds);
      deviceIds.length > 0 && turnOnParticipantsTracker(deviceIds);

      setParticipants(res);
    } catch (err) {
      console.log('err', err);
    }
  };

  const turnOnParticipantsTracker = async (deviceIds: any[]) => {
    try {
      const token = await loadToken();

      const socket = new SockJS('https://live-api.trackmykidz.com/ws-location');
      stompClient = Stomp.over(socket);
      stompClient.connect({ token }, () => {
        console.log('Connected');
        deviceIds.map((item) => {
          stompClient.subscribe(`/device/${item}`, participantSubscriptionCallback);
        });
      });
    } catch (err) {
      console.log('Error:', err);
    }
  };
  const participantSubscriptionCallback = (subscriptionMessage: any) => {
    const messageBody = JSON.parse(subscriptionMessage.body);

    setTrackingList({
      ...trackingList,
      [messageBody.deviceId]: {
        lat: messageBody?.latitude,
        lang: messageBody?.longitude,
      },
    });
    console.log('Update Received', messageBody);
  };

  // useEffect(() => {
  //   if (currentUser?.childTrackHistory) {
  //     locationPermission();
  //   }
  //   // return () => backgroundCall();
  // }, [currentUser]);

  // backgroundCall();
  function navigateToMyLocation() {
    ref.current?.animateToRegion({
      ...userLocation,
      latitudeDelta: 0.896,
      longitudeDelta: 0.896,
    });
  }

  useEffect(() => {
    if (userLocation.longitude !== 0 || userLocation.latitude !== 0) {
      navigateToMyLocation();
    }
  }, [userLocation]);

  const RightActions = (dragX: any, item: any) => (
    <View
      style={{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <TouchableOpacity
        // style={styles.buttonStyle}
        onPress={() => {
          if (prevOpenedRow) {
            prevOpenedRow?.close();
          }
          // setShowActivityParticipant(true);
          dispatch(
            ChangeStudentActivityState.action({
              showFamilyMap: false,
              hideCalendar: true,
              showParticipantMap: true,
            })
          );
          getParticipantLocation(item?.activityId);
        }}
      >
        <Entypo size={45} color={Colors.primary} name="location-pin" />
        {/* <Text style={styles.textStyle}>View Attendees</Text> */}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          prevOpenedRow?.close();

          dispatch(
            SetChatParam.action({
              title: item?.activityName,
              chatId: `activity_${item?.activityId}`,
              subcollection: 'student',
              user: {
                _id: currentUser?.studentId,
                avatar: currentUser?.studentPhoto,
                name: currentUser?.firstname
                  ? currentUser?.firstname[0].toUpperCase() +
                    currentUser?.firstname.slice(1) +
                    '' +
                    currentUser?.lastname[0]?.toUpperCase()
                  : currentUser?.firstname + '' + currentUser?.lastname,
              },
            })
          );
          navigation.navigate('ChatScreen', {
            title: item?.activityName,
            showHeader: true,
            fromChat: true,
            receiverUser: {},
            chatId: 1,
          });
        }}
        style={{
          padding: 5,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons size={35} color={Colors.primary} name="chatbox-ellipses" />
      </TouchableOpacity>
      {!item.status && (
        <TouchableOpacity
          style={{
            padding: 10,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon style={{ width: 30, height: 30 }} fill={Colors.primary} name="trash" />
        </TouchableOpacity>
      )}
    </View>
  );

  const getChildrens = async (referenceCode: any) => {
    try {
      let res = await GetParentChildrens(referenceCode);
      let temp: any[] = [];
      let deviceIds: any[] = [];
      res.map((item: any, index: number) => {
        temp.push({
          latitude: item?.latitude ? parseFloat(item?.latitude) : null,

          longitude: item?.longititude ? parseFloat(item?.longititude) : null,
        });

        if (item?.childDevice) {
          deviceIds.push(item?.childDevice);
        }
      });
      connectSockets(deviceIds);
      setOriginalChildren(res);
      setChildrensDeviceIds(deviceIds);
      setOriginalStudentsEmail(temp);
      setStudentsEmail(temp);
      setChildren(res);
    } catch (err) {
      console.log('err in children', err);
    }
  };
  const connectSockets = async (deviceIds: any[]) => {
    const token = await loadToken();
    const socket = new SockJS('https://live-api.trackmykidz.com/ws-location');
    stompClient = Stomp.over(socket);
    stompClient.connect({ token }, () => {
      console.log('Connected');
      // locationPermissionForTracking(true);
      deviceIds.map((item) => {
        stompClient.subscribe(`/device/${item}`, subscriptionCallback);
      });
    });
  };
  const subscriptionCallback = (subscriptionMessage: any) => {
    const messageBody = JSON.parse(subscriptionMessage.body);
    console.log('Update Received', messageBody);

    setTrackingList({
      ...trackingList,
      [messageBody.deviceId]: {
        lat: messageBody.latitude,
        lang: messageBody.longitude,
      },
    });
  };
  let stompClient: any = React.createRef<Stomp.Client>();
  const sendCoordinates = async (lat: any, lang: any) => {
    const token = await loadToken();
    stompClient.send(
      '/socket/ws-location',
      { token },
      JSON.stringify({
        latitude: lat,
        longitude: lang,
        deviceId: currentUser?.childDevice,
      })
    );
  };

  useEffect(() => {
    if (selectedInstructions) {
      dispatch(ChangeModalState.action({ instructionsModalVisibility: true }));
    }
  }, [selectedInstructions]);
  const closeRow = (index: any) => {
    if (prevOpenedRow && prevOpenedRow !== row[index]) {
      prevOpenedRow.close();
    }
    prevOpenedRow = row[index];
  };

  const getActivityesCountApi = async (body: any) => {
    try {
      let res = await GetActivitesCount(body, {
        cancelToken: source.token,
      });
      let temp: any = {};
      res.map((item: any) => {
        temp[item.activityId] = item;
      });

      setActivitiesCount({ ...activitiesCount, ...temp });
    } catch (err) {
      console.log('err', err);
    }
  };
  const search = (text: String) => {
    let allActivities = { ...activities };

    let temp = originalActivities?.filter((item, index) =>
      item.activityName.toLowerCase().includes(text.toLowerCase())
    );
    allActivities = temp;
    setActivities(allActivities);
  };
  const filterActivities = (month: any, day: any) => {
    let date = new Date().getFullYear() + '-' + month + '-' + day;
    let temp: any = [];
    console.log('originalActivities', originalActivities?.length);
    if (originalActivities?.length) {
      originalActivities.map((item: any) => {
        console.log('item', item?.fromDate);
        const date1 = moment(
          item?.fromDate,
          ['YYYY-MM-DDTHH:mm:ss.SSSZ', 'MMM DD, YYYYTHH:mm:ss.SSSZ'],
          true
        );
        const date2 = moment(date, ['YYYY-M-D'], true).add(1, 'month').add(1, 'day');
        console.log('date1', date1);
        console.log('date2', date2);
        if (moment(date1).isSame(date2, 'day') && moment(date1).isSame(date2, 'month')) {
          temp.push(item);
        }
      });
      setActivities(temp);
    }
  };
  useEffect(() => {
    console.log('isCalendarVisible', isCalendarVisible);
    if (isCalendarVisible) {
      filterActivities(selectedMonthForFilter, selectedDayForFilter);
    }
  }, [selectedDayForFilter, selectedMonthForFilter, isCalendarVisible]);

  useEffect(() => {
    if (isFocused) {
      let temp: any = [];
      if (activities?.length > 0) {
        activities?.forEach(async (element: any) => {
          temp.push(element.activityId);
          // await getActivityesCountApi(element?.activityId);
        });

        getActivityesCountApi(temp);
      }
    }
  }, [activities?.length, isFocused]);

  useEffect(() => {
    if (searchBarValue) {
      search(searchBarValue);
    } else {
      setActivities(originalActivities);
    }
  }, [searchBarValue]);

  useEffect(() => {
    let temp: any = [];
    let groups: any = {};
    let trackingListKeys = Object.keys(trackingList);
    trackingListKeys.map((item, index) => {
      let latitude1 = trackingList[item]?.lat;
      let longititude1 = trackingList[item]?.lang;
      for (let j = index + 1; j < trackingListKeys.length - 1; j++) {
        let nextParticipant = trackingList[trackingListKeys[j]];
        let latitude2 = nextParticipant?.lat;
        let longititude2 = nextParticipant?.lang;
        let distance = calculateDistance(latitude1, longititude1, latitude2, longititude2);
        const isUnderEqual100Meters = distance <= 100;
        let participant = partcipants.find(
          (pers) => pers.childDeviceId == nextParticipant.childDeviceId
        );
        if (isUnderEqual100Meters) {
          participant['group'] = true;
          participant['groupName'] = index + 1;
          temp.push(participant);
          if (groups[index + 1]) {
            let tempValue = { ...groups[index + 1] };

            tempValue.participants = [...tempValue.participants, participant];
            groups[index + 1] = tempValue;
          } else {
            groups[index + 1] = {
              id: index + 1,
              participants: [participant],
            };
          }
        } else {
          temp.push(participant);
        }
      }

      let firstPers = partcipants.find((firPer) => firPer?.childDeviceId == item);

      let isAnyParticipantExist = temp.find((temMember: any) => temMember?.groupName == index + 1);
      if (isAnyParticipantExist) {
        firstPers['group'] = true;
        firstPers['groupName'] = index + 1;
        temp.push(firstPers);

        if (groups[index + 1]) {
          let tempValue = { ...groups[index + 1] };
          tempValue.participants = [...tempValue.participants, firstPers];
          groups[index + 1] = tempValue;
        }

        // }
        else {
          groups[index + 1] = {
            id: index + 1,
            participants: [firstPers],
          };
        }
      } else {
        temp.push(firstPers);
      }
    });

    setGroups(groups);
    let groupedArray: any[] = [];
    let groupNames: any[] = [];

    temp.forEach((item: any) => {
      if (!item?.groupName || !groupNames.includes(item?.groupName)) {
        groupedArray.push(item);
        if (item?.groupName) {
          groupNames.push(item?.groupName);
        }
      }
    });

    setnewParticipnatsArr(groupedArray);
    setParticipants(temp);
  }, [trackingList]);

  return (
    <>
      {selectedInstructions && (
        <InstructionsModal
          selectedInstructions={selectedInstructions}
          setSelectedInstructions={setSelectedInstructions}
        />
      )}
      {currentUser?.childTrackHistory && <BackgroundFetching />}
      {selectedGroup && showModal && (
        <GroupParticipantsModal
          isVisible={showModal}
          setIsVisible={() => setModal(false)}
          participants={groups[selectedGroup]?.participants}
        />
      )}
      {showStudentsInstructorsModal && (
        <ShowInstructorsStudentsModal
          isVisible={showStudentsInstructorsModal}
          setIsVisible={() => {
            setShowStudentsInstructorsModal(false);
          }}
          status={selectionData.status}
          type={selectionData.type}
        />
      )}
      {!showFamilyMap && !showParticipantMap ? (
        <View style={styles.layout}>
          {activities.length > 0 && (
            <FlatList
              data={activities}
              style={{
                padding: 10,
                width: '100%',
                marginTop: 10,
              }}
              renderItem={({ item, index }: { item: any; index: number }) => (
                <Swipeable
                  ref={(ref) => (row[index] = ref)}
                  // ref={swipeableRef}

                  onSwipeableOpen={() => closeRow(index)}
                  renderRightActions={(e) => RightActions(e, item)}
                >
                  <View
                    style={[
                      styles.item,
                      {
                        backgroundColor: '#fff',
                      },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate('InstructorActivityDetail', {
                          data: item,
                          activitiesCount: activitiesCount,
                        });
                      }}
                    >
                      <Text
                        style={[
                          styles.text,
                          {
                            fontSize: 20,
                            fontWeight: '800',
                            paddingLeft: 25,
                          },
                        ]}
                      >
                        {item?.activityName}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingBottom: 20,
                          borderBottomWidth: 0.5,
                          paddingHorizontal: 10,
                          borderColor: Colors.borderGrey,
                        }}
                      >
                        <Image
                          source={require('@/Assets/Images/circle-dashed.png')}
                          style={{
                            height: 40,
                            width: 40,
                            resizeMode: 'contain',
                            // marginRight: 10,
                          }}
                        />
                        <View>
                          <Text style={styles.text}>{`${moment(
                            item?.fromDate == 'string' ? new Date() : item?.fromDate
                          ).format('YYYY-MM-DD')} at ${moment
                            .utc(item?.fromDate == 'string' ? new Date() : item?.fromDate)
                            .format('hh:mm a')} `}</Text>
                          <Text style={styles.text}>{`${moment(
                            item?.toDate == 'string' ? new Date() : item?.toDate
                          ).format('YYYY-MM-DD')} at ${moment
                            .utc(item?.toDate == 'string' ? new Date() : item?.toDate)
                            .format('hh:mm a')} `}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                      }}
                    >
                      <View style={{ alignItems: 'center' }}>
                        <Text style={styles.footerText}>{`Approved`}</Text>
                        <View style={{ flexDirection: 'row' }}>
                          <TouchableOpacity
                            style={styles.horizontal}
                            onPress={() => {
                              _dispatch({
                                type: actions.SET_SELECTED_ACTIVITY,
                                payload: item,
                              });
                              setSelectionData({
                                status: 'approved',
                                type: 'student',
                              });
                              setShowStudentsInstructorsModal(true);
                            }}
                          >
                            <Text style={styles.footerText}>{`${
                              activitiesCount[item.activityId]?.countApprovedStudents || '0'
                            }`}</Text>
                            <Entypo
                              name="book"
                              color={Colors.primary}
                              size={20}
                              style={{ marginHorizontal: 5 }}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.horizontal}
                            onPress={() => {
                              _dispatch({
                                type: actions.SET_SELECTED_ACTIVITY,
                                payload: item,
                              });
                              setSelectionData({
                                status: 'approved',
                                type: 'instructor',
                              });
                              setShowStudentsInstructorsModal(true);
                            }}
                          >
                            <Text style={styles.text}>
                              {activitiesCount[item.activityId]?.countApprovedInstructors || '0'}
                            </Text>
                            <Image source={instructorImage} style={styles.iconImages} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={{ alignItems: 'center' }}>
                        <Text style={styles.footerText}>{`Declined`}</Text>
                        <View style={{ flexDirection: 'row' }}>
                          <TouchableOpacity
                            style={styles.horizontal}
                            onPress={() => {
                              _dispatch({
                                type: actions.SET_SELECTED_ACTIVITY,
                                payload: item,
                              });
                              setSelectionData({
                                status: 'declined',
                                type: 'student',
                              });
                              setShowStudentsInstructorsModal(true);
                            }}
                          >
                            <Text style={styles.text}>{`${
                              activitiesCount[item.activityId]?.countDeclinedStudents || '0'
                            }`}</Text>
                            <Entypo
                              name="book"
                              color={Colors.primary}
                              size={20}
                              style={{ marginHorizontal: 5 }}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.horizontal}
                            onPress={() => {
                              _dispatch({
                                type: actions.SET_SELECTED_ACTIVITY,
                                payload: item,
                              });
                              setSelectionData({
                                status: 'declined',
                                type: 'instructor',
                              });
                              setShowStudentsInstructorsModal(true);
                            }}
                          >
                            <Text style={styles.text}>
                              {activitiesCount[item.activityId]?.countDeclinedInstructors || '0'}
                            </Text>
                            <Image source={instructorImage} style={styles.iconImages} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={{ alignItems: 'center' }}>
                        <Text style={styles.footerText}>{`Pending`}</Text>
                        <View style={{ flexDirection: 'row' }}>
                          <TouchableOpacity
                            onPress={() => {
                              _dispatch({
                                type: actions.SET_SELECTED_ACTIVITY,
                                payload: item,
                              });
                              setSelectionData({
                                status: 'pending',
                                type: 'student',
                              });
                              setShowStudentsInstructorsModal(true);
                            }}
                            style={styles.horizontal}
                          >
                            <Text style={styles.text}>
                              {`${activitiesCount[item.activityId]?.countPendingStudents || '0'}`}
                            </Text>
                            <Entypo
                              name="book"
                              color={Colors.primary}
                              size={20}
                              style={{ marginHorizontal: 5 }}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.horizontal}
                            onPress={() => {
                              _dispatch({
                                type: actions.SET_SELECTED_ACTIVITY,
                                payload: item,
                              });
                              setSelectionData({
                                status: 'pending',
                                type: 'instructor',
                              });
                              setShowStudentsInstructorsModal(true);
                            }}
                          >
                            <Text style={styles.text}>
                              {activitiesCount[item.activityId]?.countPendingInstructors || '0'}
                              {/* {item.countPendingInstructors || `0`} */}
                            </Text>
                            <Image source={instructorImage} style={styles.iconImages} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                </Swipeable>
              )}
            />
          )}
          {activities.length == 0 && (
            <Text style={{ textAlign: 'center', marginTop: 5 }}>
              You currently do not have any activities
            </Text>
          )}
          <View style={{ marginBottom: 50 }} />
        </View>
      ) : showParticipantMap ? (
        <View>
          <TouchableOpacity
            onPress={navigateToMyLocation}
            style={{
              position: 'absolute',
              bottom: 60,
              right: 10,
              zIndex: 222,
              paddingHorizontal: 10,
              paddingVertical: 9,
              borderRadius: 20,
              backgroundColor: '#fff8ff',
            }}
          >
            <Ionicons name="accessibility" style={{ fontSize: 28 }} />
          </TouchableOpacity>
          <MapView
            style={{ flex: 1 }}
            showsUserLocation
            showsMyLocationButton
            initialRegion={{ ...userLocation, latitudeDelta: 0.896, longitudeDelta: 0.896 }}
            onUserLocationChange={(e) => {
              setUserLocation({
                latitude: e.nativeEvent.coordinate?.latitude || 0,
                longitude: e.nativeEvent.coordinate?.longitude || 0,
              });
            }}
            ref={ref}
          >
            {partcipants.map((item, index) => {
              // console.log("item", item);
              let latitude = trackingList[item?.childDeviceId]?.lat;
              let longititude = trackingList[item?.childDeviceId]?.lang;

              return (
                <View style={{ flex: 1 }}>
                  {latitude && longititude && (
                    <Marker
                      onSelect={() => console.log('pressed')}
                      onPress={() => {
                        if (item?.group) {
                          setModal(true);
                          setSelectedGroup(item?.groupName);
                        }
                      }}
                      identifier={item?.email}
                      title={item.name}
                      description={item.description}
                      key={index}
                      coordinate={{
                        latitude,
                        longitude: longititude,
                      }}
                    >
                      {!item?.group && (
                        <View style={{}}>
                          <View
                            style={{
                              height: 30,
                              width: 30,
                              borderRadius: 80,
                              overflow: 'hidden',
                              // top: 33,
                              // zIndex: 10,
                            }}
                          >
                            {item?.image == '' && (
                              <View
                                style={{
                                  // height: "100%",
                                  // width: "100%",
                                  borderRadius: 20,
                                  backgroundColor: Colors.primary,
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}
                              >
                                <Text style={{ color: Colors.white }}>
                                  {item?.firstName?.substring(0, 1)?.toUpperCase() || ''}
                                  {item?.lastName?.substring(0, 1)?.toUpperCase() || ''}
                                </Text>
                              </View>
                            )}
                            {item?.image != '' && (
                              <Image
                                source={{
                                  uri: item?.image,
                                }}
                                style={{
                                  height: 40,
                                  width: 40,
                                  borderRadius: 30,
                                  aspectRatio: 1.5,
                                }}
                                resizeMode="contain"
                              />
                            )}
                          </View>
                          {/* <FA5 name="map-marker" size={40} color={"red"} /> */}
                        </View>
                      )}

                      {item?.group && (
                        <TouchableOpacity
                          style={{
                            alignItems: 'center',
                          }}
                        >
                          <View
                            style={{
                              // position: "absolute",
                              zIndex: 10,
                              bottom: 2,
                              // height: 80,
                              // width: 80,
                              // backgroundColor: Colors.primary,
                              // opacity: 0.7,
                            }}
                          >
                            <Text style={{ fontWeight: 'bold' }}>
                              {groups[item?.groupName]?.participants?.length}
                            </Text>
                          </View>

                          <Fontisto name="map-marker-alt" size={25} color="red" />
                        </TouchableOpacity>
                      )}
                    </Marker>
                  )}
                </View>
                // </>
                // </Circle>
              );
            })}
          </MapView>

          <MapView
            style={{ flex: 1 }}
            showsUserLocation
            showsMyLocationButton
            initialRegion={{ ...userLocation, latitudeDelta: 0.896, longitudeDelta: 0.896 }}
            onUserLocationChange={(e) => {
              setUserLocation({
                latitude: e.nativeEvent.coordinate?.latitude || 0,
                longitude: e.nativeEvent.coordinate?.longitude || 0,
              });
            }}
            ref={ref}
          >
            {partcipants.map((item, index) => {
              // console.log("item", item);
              let latitude = trackingList[item?.childDeviceId]?.lat;
              let longititude = trackingList[item?.childDeviceId]?.lang;

              return (
                <View style={{ flex: 1 }}>
                  {latitude && longititude && (
                    <Marker
                      onSelect={() => console.log('pressed')}
                      onPress={() => {
                        if (item?.group) {
                          setModal(true);
                          setSelectedGroup(item?.groupName);
                        }
                      }}
                      identifier={item?.email}
                      title={item.name}
                      description={item.description}
                      key={index}
                      coordinate={{
                        latitude,
                        longitude: longititude,
                      }}
                    >
                      {!item?.group && (
                        <View style={{}}>
                          <View
                            style={{
                              height: 30,
                              width: 30,
                              borderRadius: 80,
                              overflow: 'hidden',
                              // top: 33,
                              // zIndex: 10,
                            }}
                          >
                            {item?.image == '' && (
                              <View
                                style={{
                                  // height: "100%",
                                  // width: "100%",
                                  borderRadius: 20,
                                  backgroundColor: Colors.primary,
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}
                              >
                                <Text style={{ color: Colors.white }}>
                                  {item?.firstName?.substring(0, 1)?.toUpperCase() || ''}
                                  {item?.lastName?.substring(0, 1)?.toUpperCase() || ''}
                                </Text>
                              </View>
                            )}
                            {item?.image != '' && (
                              <Image
                                source={{
                                  uri: item?.image,
                                }}
                                style={{
                                  height: 40,
                                  width: 40,
                                  borderRadius: 30,
                                  aspectRatio: 1.5,
                                }}
                                resizeMode="contain"
                              />
                            )}
                          </View>
                          {/* <FA5 name="map-marker" size={40} color={"red"} /> */}
                        </View>
                      )}

                      {item?.group && (
                        <TouchableOpacity
                          style={{
                            alignItems: 'center',
                          }}
                        >
                          <View
                            style={{
                              // position: "absolute",
                              zIndex: 10,
                              bottom: 2,
                              // height: 80,
                              // width: 80,
                              // backgroundColor: Colors.primary,
                              // opacity: 0.7,
                            }}
                          >
                            <Text style={{ fontWeight: 'bold' }}>
                              {groups[item?.groupName]?.participants?.length}
                            </Text>
                          </View>

                          <Fontisto name="map-marker-alt" size={25} color="red" />
                        </TouchableOpacity>
                      )}
                    </Marker>
                  )}
                </View>
                // </>
                // </Circle>
              );
            })}
          </MapView>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={navigateToMyLocation}
            style={{
              position: 'absolute',
              bottom: 60,
              right: 10,
              zIndex: 222,
              paddingHorizontal: 10,
              paddingVertical: 9,
              borderRadius: 20,
              backgroundColor: '#fff8ff',
            }}
          >
            <Ionicons name="accessibility" style={{ fontSize: 28 }} />
          </TouchableOpacity>
          <MapView
            initialRegion={{ ...userLocation, latitudeDelta: 0.896, longitudeDelta: 0.896 }}
            showsUserLocation
            followsUserLocation
            //METHOD TO FETCH USER LOCATION , USE ON YOUR OWN
            onUserLocationChange={(e) => {
              setUserLocation({
                latitude: e.nativeEvent.coordinate?.latitude || 0,
                longitude: e.nativeEvent.coordinate?.longitude || 0,
              });
            }}
            ref={ref}
            style={{ flex: 1 }}
            // initialRegion={position} // Set initial region to current position
            onLayout={() => {
              let temp = studentsEmails.filter(
                (item) => item.latitude != null && item.longitude != null
              );
              ref.current.fitToCoordinates(temp, {
                edgePadding: {
                  top: 10,
                  right: 10,
                  bottom: 10,
                  left: 10,
                },
                animated: true,
              });
            }}
          >
            <Marker
              coordinate={{ ...userLocation }}
              title="Your Location"
              description="This is where you are"
            />
            {children.map((child, index) => {
              const latitude = parseFloat(child.latitude);
              const longitude = parseFloat(child.longititude);

              // Check if latitude and longitude are valid numbers
              if (isNaN(latitude) || isNaN(longitude)) {
                console.log(
                  `Invalid coordinates for child ${child.firstname}:`,
                  child.latitude,
                  child.longititude
                );
                return null; // Skip rendering this marker
              }

              return (
                <Marker
                  key={index}
                  coordinate={{
                    latitude: latitude,
                    longitude: longitude,
                  }}
                  title={child.firstname}
                  description={child.lastname}
                />
              );
            })}
          </MapView>
        </View>
      )}
      <AppHeader
        hideCenterIcon={true}
        hideCalendar={showFamilyMap ? true : false}
        showGlobe={true}
      />
    </>
  );
};

export default StudentActivityScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.newBackgroundColor,
  },
  item: {
    borderRadius: 15,
    width: '96%',
    backgroundColor: '#fff',
    marginHorizontal: '2%',
    // paddingHorizontal: 10,
    paddingTop: 10,
    // height: 185,
    marginBottom: 20,
    paddingBottom: 10,
  },
  footer: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    width: '96%',
    backgroundColor: '#fff',
    marginHorizontal: '2%',
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    marginVertical: 4,
  },

  iconImages: {
    height: 18,
    width: 18,
    resizeMode: 'contain',
    marginLeft: 5,
    marginRight: 5,
  },
  footerText: {
    fontSize: 16,
    marginVertical: 2,
  },
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
