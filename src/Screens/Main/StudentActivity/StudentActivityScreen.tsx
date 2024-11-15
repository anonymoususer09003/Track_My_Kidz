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
  Alert,
  FlatList,
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import GroupMap from '../../../Components/groupMap/index';
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

// import BackgroundFetching from '@/Components/BackgroundFetching';
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
  const [newChildrenArr, setnewChildrenArr] = useState<any[]>([]);
  const [showModal, setModal] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [groups, setGroups] = useState<any>({});
  const currentUser: any = useSelector((state: { user: UserState }) => state.user.item);
  const isCalendarVisible = useSelector((state: { modal: ModalState }) => state.modal.showCalendar);

  const [activityMapReRender, setActivityMapRerender] = useState(0);

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

      setActivityMapRerender((state) => state + 1);
    } catch (err) {
      console.log('err', err);
    }
  };
  let stompClient: any = React.createRef<Stomp.Client>();
  let subscriptions: Stomp.Subscription[] = []; // Array to store subscriptions
  const turnOnParticipantsTracker = async (deviceIds: any[]) => {
    try {
      const token = await loadToken();

      const socket = new SockJS('https://live-api.trackmykidz.com/ws-location');
      stompClient = Stomp.over(socket);
      stompClient.connect({ token }, () => {
        deviceIds.forEach((item) => {
          // Subscribe and store the subscription object
          const subscription = stompClient.subscribe(
            `/device/${item}`,
            participantSubscriptionCallback
          );
          subscriptions.push(subscription);
        });
      });
    } catch (err) {
      console.log('Error:', err);
    }
  };

  const unsubscribeSockets = () => {
    // Unsubscribe from all subscriptions
    subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });

    // Clear the subscriptions array
    subscriptions = [];
  };
  useEffect(() => {
    if (!isFocused) {
      unsubscribeSockets();
    }
  }, [isFocused]);
  const participantSubscriptionCallback = (subscriptionMessage: any) => {
    const messageBody = JSON.parse(subscriptionMessage.body);

    // ref.current?.animateToRegion({
    //   longitude: messageBody?.longitude, latitude: messageBody?.latitude
    //   latitudeDelta: 0.896,
    //   longitudeDelta: 0.896,
    // });

    setTrackingList({
      ...trackingList,
      [messageBody.deviceId]: {
        lat: messageBody?.latitude,
        lang: messageBody?.longitude,
      },
    });
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
          // setTrackingList({});

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
      // console.log('childrens0300303030030303030030303030', children);

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
      // locationPermissionForTracking(true);
      deviceIds.map((item) => {
        stompClient.subscribe(`/device/${item}`, subscriptionCallback);
      });
    });
  };
  const subscriptionCallback = (subscriptionMessage: any) => {
    const messageBody = JSON.parse(subscriptionMessage.body);

    setTrackingList({
      ...trackingList,
      [messageBody.deviceId]: {
        lat: messageBody.latitude,
        lang: messageBody.longitude,
      },
    });
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

    if (originalActivities?.length) {
      originalActivities.map((item: any) => {
        const date1 = moment(
          item?.fromDate,
          ['YYYY-MM-DDTHH:mm:ss.SSSZ', 'MMM DD, YYYYTHH:mm:ss.SSSZ'],
          true
        );
        const date2 = moment(date, ['YYYY-M-D'], true).add(1, 'month').add(1, 'day');

        if (moment(date1).isSame(date2, 'day') && moment(date1).isSame(date2, 'month')) {
          temp.push(item);
        }
      });
      setActivities(temp);
    }
  };
  useEffect(() => {
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
  const makingGroups = () => {
    let temp: any[] = [];
    let groups: any = {};
    let trackingListKeys = Object.keys(trackingList);

    if (trackingListKeys.length > 1) {
      trackingListKeys.map((item, index) => {
        let latitude1 = trackingList[item]?.lat;
        let longititude1 = trackingList[item]?.lang;

        for (let j = index + 1; j <= trackingListKeys.length - 1; j++) {
          let nextParticipant = trackingList[trackingListKeys[j]];

          let latitude2 = nextParticipant?.lat;
          let longititude2 = nextParticipant?.lang;
          let distance = calculateDistance(latitude1, longititude1, latitude2, longititude2);
          const isUnderEqual100Meters = distance <= 100;
          let participant = partcipants.find(
            (pers) => pers?.childDeviceId == nextParticipant?.childDeviceId
          );
          // console.log('participants---------', partcipants);
          // Alert.alert(JSON.stringify(participant));
          if (participant && isUnderEqual100Meters) {
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

        let isAnyParticipantExist = temp.find((temMember) => temMember?.groupName == index + 1);
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

      temp.forEach((item) => {
        if (!item?.groupName || !groupNames.includes(item?.groupName)) {
          groupedArray.push(item);
          if (item?.groupName) {
            groupNames.push(item?.groupName);
          }
        }
      });

      setnewParticipnatsArr(groupedArray);

      setParticipants(temp);
    } else {
      let participant = [];
      trackingListKeys.map((item, index) => {
        participant = partcipants.filter((pers) => pers.childDeviceId == item);
      });
      setnewParticipnatsArr([...participant]);
    }
  };
  // console.log('children', children);
  const makingGroupsForChildren = () => {
    let temp: any[] = [];
    let groups: any = {};
    let trackingListKeys = Object.keys(trackingList);

    if (trackingListKeys.length > 1 && children.length > 0) {
      trackingListKeys.map((item, index) => {
        let latitude1 = trackingList[item]?.lat;
        let longititude1 = trackingList[item]?.lang;

        for (let j = index + 1; j <= trackingListKeys.length - 1; j++) {
          let nextParticipant = trackingList[trackingListKeys[j]];

          let latitude2 = nextParticipant?.lat;
          let longititude2 = nextParticipant?.lang;
          let distance = calculateDistance(latitude1, longititude1, latitude2, longititude2);
          const isUnderEqual100Meters = distance <= 100;
          let participant = children.find(
            (pers) => pers?.childDevice == nextParticipant?.childDevice
          );

          if (participant && isUnderEqual100Meters) {
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
          }

          // else {
          //   temp.push(participant);
          // }
        }
        // console.log('children', children);
        let firstPers = children.find((firPer) => firPer?.childDevice == item);

        let isAnyParticipantExist = temp.find((temMember) => temMember?.groupName == index + 1);

        if (firstPers && isAnyParticipantExist) {
          // console.log('first person90390903093090390930930990309390399039030930909309', firstPers);

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
              participants: [{ ...firstPers, group: true, groupName: index + 1 }],
            };
          }
        } else {
          temp.push(firstPers);
        }
      });

      setGroups(groups);
      let groupedArray: any[] = [];
      let groupNames: any[] = [];

      temp.forEach((item) => {
        if (!item?.groupName || !groupNames.includes(item?.groupName)) {
          groupedArray.push(item);
          if (item?.groupName) {
            groupNames.push(item?.groupName);
          }
        }
      });

      setnewChildrenArr(temp);

      // setChildren(temp);
    } else {
      let participant = [];
      trackingListKeys.map((item, index) => {
        participant = children.filter((pers) => pers.childDevice == item);
      });
      setnewChildrenArr([...participant]);
    }
  };

  useEffect(() => {
    if (showParticipantMap) {
      makingGroups();
    } else {
      makingGroupsForChildren();
    }
  }, [activityMapReRender, showParticipantMap, showFamilyMap]);

  return (
    <>
      {selectedInstructions && (
        <InstructionsModal
          selectedInstructions={selectedInstructions}
          setSelectedInstructions={setSelectedInstructions}
        />
      )}
      {/* {currentUser?.childTrackHistory && <BackgroundFetching />} */}
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
        <GroupMap
          newParticipnatsArr={newParticipnatsArr}
          trackingList={trackingList}
          groups={groups}
          onClick={(group: any) => {
            {
              setSelectedGroup(group);
              setModal(true);
            }
          }}
        />
      ) : (
        <GroupMap
          newParticipnatsArr={newChildrenArr}
          trackingList={trackingList}
          groups={groups}
          onClick={(group: any) => {
            {
              setSelectedGroup(group);
              setModal(true);
            }
          }}
        />
        // <MapView
        //   showsUserLocation
        //   ref={ref}
        //   // onRegionChange={(region) => setRegion(region)}
        //   // zoomEnabled
        //   // region={region}
        //   // initialRegion={{
        //   //   latitude: children[0]?.latitude
        //   //     ? parseFloat(children[0]?.latitude)
        //   //     : parseFloat(10),
        //   //   longitude: children[0]?.longititude
        //   //     ? parseFloat(children[0]?.longititude)
        //   //     : parseFloat(10),
        //   //   latitudeDelta: 0.0922 + width / height,
        //   //   longitudeDelta: 0.0421,
        //   // }}
        //   onLayout={() => {
        //     let temp = studentsEmails.filter((item) => trackingList[item.childDevice]?.lat != null);

        //     ref?.current?.fitToCoordinates(temp, {
        //       edgePadding: {
        //         top: 10,
        //         right: 10,
        //         bottom: 10,
        //         left: 10,
        //       },
        //       animated: true,
        //     });
        //   }}
        //   style={{ flex: 1 }}
        // >
        //   {children.map((item, index) => {
        //     let latitude = trackingList[item.childDevice]?.lat;
        //     let longititude = trackingList[item.childDevice]?.lang;

        //     if (trackingList[item.childDevice]?.lat) {
        //       return (
        //         <>
        //           <Marker
        //             onSelect={() => console.log('pressed')}
        //             onPress={() => {
        //               ref.current.fitToSuppliedMarkers(
        //                 [
        //                   {
        //                     latitude: latitude ? parseFloat(latitude) : 10,
        //                     longitude: longititude ? parseFloat(longititude) : 10,
        //                   },
        //                 ]
        //                 // false, // not animated
        //               );
        //             }}
        //             identifier={item?.email}
        //             key={index}
        //             coordinate={{
        //               latitude: latitude ? parseFloat(latitude) : 10,
        //               longitude: longititude ? parseFloat(longititude) : 10,
        //             }}
        //           >
        //             <View style={{}}>
        //               <View
        //                 style={{
        //                   // borderRadius: 30,
        //                   overflow: 'hidden',
        //                   // top: 33,
        //                   // zIndex: 10,
        //                 }}
        //               >
        //                 {item?.studentImage == '' && (
        //                   <View
        //                     style={{
        //                       // borderRadius: 20,
        //                       backgroundColor: Colors.primary,
        //                       justifyContent: 'center',
        //                       alignItems: 'center',
        //                     }}
        //                   >
        //                     <Text style={{ color: Colors.white }}>
        //                       {item?.firstname?.substring(0, 1)?.toUpperCase() || ''}
        //                       {item?.lastname?.substring(0, 1)?.toUpperCase() || ''}
        //                     </Text>
        //                   </View>
        //                 )}
        //                 {item?.studentImage != '' && (
        //                   <Image
        //                     source={{
        //                       uri: item?.studentImage,
        //                     }}
        //                     style={{
        //                       height: 40,
        //                       width: 40,
        //                       borderRadius: 20,
        //                       // aspectRatio: 2,
        //                     }}
        //                     resizeMode="contain"
        //                   />
        //                 )}
        //               </View>
        //               {/* <FA5 name="map-marker" size={40} color={"red"} /> */}
        //             </View>
        //             {/* <TouchableOpacity
        //             onPress={() => console.log("pressed")}
        //             style={{ alignItems: "center" }}
        //           >
        //             <Text>{item?.firstname}</Text>
        //             <Text style={{ marginBottom: 2 }}>
        //               {item?.lastname}
        //             </Text>
        //             <Fontisto
        //               name="map-marker-alt"
        //               size={25}
        //               color="red"
        //             />
        //           </TouchableOpacity> */}
        //           </Marker>
        //         </>
        //         // </>
        //         // </Circle>
        //       );
        //     }
        //   })}
        // </MapView>
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
