import { AppHeader } from '@/Components';
import { actions } from '@/Context/state/Reducer';
import { useStateValue } from '@/Context/state/State';
import { GroupParticipantsModal, InstructionsModal, ShowInstructorsStudentsModal } from '@/Modals';
import { Activity, Optin } from '@/Models/DTOs';
import {
  GetActivitesCount,
  GetActivityByStudentId,
  ParticipantLocation,
} from '@/Services/Activity';
import { InstructorState } from '@/Store/InstructorsActivity';
import { ModalState } from '@/Store/Modal';
import SetChatParam from '@/Store/chat/SetChatParams';
import Colors from '@/Theme/Colors';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Icon, Text } from '@ui-kitten/components';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import MapView, { Marker } from 'react-native-maps';
import Entypo from 'react-native-vector-icons/Entypo';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import SockJS from 'sockjs-client';
// @ts-ignore
import * as Stomp from 'react-native-stompjs';
import { UserState } from '@/Store/User';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackNavigatorParamsList } from '@/Navigators/Main/RightDrawerNavigator';
import { calculateDistance } from '@/Utils/DistanceCalculator';
import { loadToken } from '@/Storage/MainAppStorage';
import GroupMap from '../../../Components/groupMap/index';
const ActivityScreen = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation<StackNavigationProp<MainStackNavigatorParamsList>>();
  const ref = useRef<any>();

  // const swipeableRef = useRef(null);
  const [, _dispatch]: any = useStateValue();
  const searchBarValue = useSelector((state: any) => state.header.searchBarValue);
  const dispatch = useDispatch();
  let prevOpenedRow: any;
  let row: Array<any> = [];
  const [showStudentsInstructorsModal, setShowStudentsInstructorsModal] = useState<boolean>(false);
  const [selectionData, setSelectionData] = useState<any>({
    type: 'student',
    status: 'pending',
  });
  const instructorImage = require('@/Assets/Images/approval_icon2.png');
  // const dependent = route && route.params && route.params.dependent;
  // console.log('setThumbnail',route)
  const currentUser: any = useSelector((state: { user: UserState }) => state.user.item);
  const cancelToken = axios.CancelToken;
  const source = cancelToken.source();
  const [activitiesCount, setActivitiesCount] = useState<any>({});
  // const [getChildrendeviceIds, setChildrensDeviceIds] = useState([]);
  const [{ selectedDependentActivity, child }]: any = useStateValue();
  const [originalActivities, setOriginalActivities] = useState<Activity[]>([]);
  const [trackingList, setTrackingList] = useState<any>({});
  const [activities, setActivities] = useState<any[]>(selectedDependentActivity);
  const [selectedInstructions, setSelectedInstructions] = useState<Optin | null>(null);
  const [showParticipantMap, setParticipantMap] = useState<boolean>(false);
  const [getParticipantsIds, setParticipantsIds] = useState<any[]>([]);
  const [partcipants, setParticipants] = useState<any[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<any>();
  const [groups, setGroups] = useState<any>({});
  const [showModal, setModal] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [newParticipnatsArr, setnewParticipnatsArr] = useState<any[]>([]);

  const { selectedDayForFilter, selectedMonthForFilter } = useSelector(
    (state: { instructorsActivity: InstructorState }) => state.instructorsActivity
  );
  const isCalendarVisible = useSelector((state: { modal: ModalState }) => state.modal.showCalendar);

  const RightActions = (dragX: any, item: any) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <>
        <View
          style={{
            // flexDirection: "column",
            alignItems: 'center',
            justifyContent: 'space-evenly',
            height: 200,
            // backgroundColor:'red'
          }}
        >
          <TouchableOpacity
            onPress={() => {
              dispatch(
                SetChatParam.action({
                  title: item?.activityName,
                  chatId: `activity_${item?.activityId}`,
                  subcollection: 'parent',
                  user: {
                    _id: currentUser?.parentId,
                    avatar:
                      currentUser?.imageurl ||
                      'https://pictures-tmk.s3.amazonaws.com/images/image/man.png',
                    name: currentUser?.firstname
                      ? currentUser?.firstname[0].toUpperCase() +
                        currentUser?.firstname.slice(1) +
                        ' ' +
                        currentUser?.lastname[0].toUpperCase()
                      : currentUser?.firstname + '' + currentUser?.lastname,
                  },
                })
              );
              navigation.navigate('ChatScreen', {
                title: item?.activityName,
                receiverUser: {},
                chatId: 1,
                showHeader: true,
                fromChat: true,
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
              <Icon style={{ width: 40, height: 40 }} fill={Colors.primary} name="trash" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            // style={styles.buttonStyle}
            onPress={() => {
              setParticipantMap(true);
              setSelectedActivity(item);
              getParticipantLocation(item?.activityId);
            }}
          >
            <Entypo size={40} color={Colors.primary} name="location-pin" />
          </TouchableOpacity>
        </View>
      </>
    );
  };
  const getParticipantLocation = async (activityId: any) => {
    try {
      let res: any[] = await ParticipantLocation(activityId);
      let deviceIds: any[] = [];
      res.map((item) => {
        item?.childDeviceId && deviceIds.push(item?.childDeviceId);
      });

      setParticipantsIds(deviceIds);
      connectSockets(deviceIds);

      setParticipants(res);
    } catch (err) {
      console.log('err', err);
    }
  };

  const getActivities = async () => {
    GetActivityByStudentId(child?.studentId)
      .then((res) => {
        setActivities(res);
        setOriginalActivities(res);
      })
      .catch((err) => {
        console.log('Error:', err);
      });
  };

  const getActivityesCountApi = async (body: any) => {
    try {
      let res: any[] = await GetActivitesCount(body, {
        cancelToken: source.token,
      });
      let temp: any = {};
      res.map((item) => {
        temp[item.activityId] = item;
      });

      setActivitiesCount({ ...activitiesCount, ...temp });
    } catch (err) {
      console.log('err', err);
    }
  };
  const closeRow = (index: number) => {
    if (prevOpenedRow && prevOpenedRow !== row[index]) {
      prevOpenedRow.close();
    }
    prevOpenedRow = row[index];
  };

  let stompClient: any = React.createRef<Stomp.Client>();
  let subscriptions: Stomp.Subscription[] = []; // Array to store subscriptions
  const connectSockets = async (deviceIds: any[]) => {
    try {
      const token = await loadToken();

      const socket = new SockJS('https://live-api.trackmykidz.com/ws-location');
      stompClient = Stomp.over(socket);
      stompClient.connect({ token }, () => {
        deviceIds.forEach((item) => {
          // Subscribe and store the subscription object
          const subscription = stompClient.subscribe(`/device/${item}`, subscriptionCallback);
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

  const subscriptionCallback = (subscriptionMessage: any) => {
    const messageBody = JSON.parse(subscriptionMessage.body);

    setTrackingList({
      ...trackingList,
      [messageBody.deviceId]: {
        lat: messageBody.latitude,
        lang: messageBody.longitude,
      },
    });
    console.log('Update Received iin actiivty screen', messageBody);
  };
  useEffect(() => {
    if (!isFocused) {
      unsubscribeSockets();
    }
  }, [isFocused]);
  const search = (text: String) => {
    let allActivities = { ...activities };

    allActivities = originalActivities?.filter((item) =>
      item.activityName.toLowerCase().includes(text.toLowerCase())
    );
    setActivities(allActivities);
  };

  const filterActivities = (month: any, day: any) => {
    let date = new Date().getFullYear() + '-' + month + '-' + day;
    let temp: any[] = [];
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
    if (!isCalendarVisible) {
      setActivities(originalActivities);
    }
  }, [isCalendarVisible]);

  useEffect(() => {
    if (isCalendarVisible) {
      filterActivities(selectedMonthForFilter, selectedDayForFilter);
    }
  }, [selectedDayForFilter, selectedMonthForFilter, isCalendarVisible]);

  useEffect(() => {
    if (isFocused) {
      // if (selectedActivity) {
      getActivities();
      // }
    }
  }, [isFocused]);

  useEffect(() => {
    if (isFocused) {
      let temp: any[] = [];
      if (activities?.length > 0) {
        activities?.forEach(async (element) => {
          temp.push(element.activityId);
          // await getActivityesCountApi(element?.activityId);
        });

        getActivityesCountApi(temp);
      }
    } else {
      setParticipantMap(false);
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
    let temp: any[] = [];
    let groups: any = {};
    let trackingListKeys = Object.keys(trackingList);

    if (trackingListKeys.length > 1) {
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
  }, [trackingList]);

  // useEffect(() => {
  //   const temp = [];
  //   const groups = {};
  //   const trackingListKeys = Object.keys(trackingList);

  //   if (trackingListKeys.length > 1) {
  //     trackingListKeys.forEach((item, index) => {
  //       const latitude1 = trackingList[item]?.lat;
  //       const longitude1 = trackingList[item]?.lang;

  //       const currentGroup = [];
  //       for (let j = index + 1; j < trackingListKeys.length; j++) {
  //         const nextParticipant = trackingList[trackingListKeys[j]];
  //         const latitude2 = nextParticipant?.lat;
  //         const longitude2 = nextParticipant?.lang;
  //         const distance = calculateDistance(latitude1, longitude1, latitude2, longitude2);

  //         if (distance <= 100) {
  //           const participant = partcipants.find(
  //             (pers) => pers.childDeviceId === nextParticipant.childDeviceId
  //           );

  //           if (participant) {
  //             const updatedParticipant = {
  //               ...participant,
  //               group: true,
  //               groupName: index + 1,
  //             };
  //             currentGroup.push(updatedParticipant);
  //           }
  //         }
  //       }

  //       const firstPers = partcipants.find((firPer) => firPer?.childDeviceId === item);

  //       if (currentGroup.length > 0 && firstPers) {
  //         const updatedFirstPers = {
  //           ...firstPers,
  //           group: true,
  //           groupName: index + 1,
  //         };
  //         currentGroup.push(updatedFirstPers);

  //         groups[index + 1] = {
  //           id: index + 1,
  //           participants: [...currentGroup],
  //         };
  //         temp.push(...currentGroup);
  //       } else if (firstPers) {
  //         temp.push(firstPers);
  //       }
  //     });

  //     const groupedArray = temp.reduce((acc, item) => {
  //       if (!item.groupName || !acc.some((i) => i.groupName === item.groupName)) {
  //         acc.push(item);
  //       }
  //       return acc;
  //     }, []);

  //     setGroups(groups);
  //     setnewParticipnatsArr(groupedArray);
  //     setParticipants(temp);
  //   } else {
  //     const participant = partcipants.filter((pers) => pers.childDeviceId === trackingListKeys[0]);
  //     setnewParticipnatsArr(participant);
  //   }
  // }, [trackingList, partcipants]);

  return (
    <>
      <AppHeader isCalendar={true} hideCalendar={false} />
      {selectedGroup && showModal && (
        <GroupParticipantsModal
          isVisible={showModal}
          setIsVisible={() => setModal(false)}
          participants={groups[selectedGroup]?.participants}
        />
      )}
      {selectedInstructions && (
        <InstructionsModal
          selectedInstructions={selectedInstructions}
          activity={selectedActivity}
          setSelectedInstructions={setSelectedInstructions}
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

      <View style={styles.layout}>
        {console.log('new ', newParticipnatsArr)}
        {!showParticipantMap ? (
          <>
            <FlatList
              data={activities}
              style={{
                padding: 10,
                width: '100%',
                marginTop: 10,
              }}
              renderItem={({ item, index }) => (
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
                        marginBottom: index === activities.length - 1 ? 70 : 0,
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
          </>
        ) : (
          <GroupMap
            newParticipnatsArr={newParticipnatsArr}
            trackingList={trackingList}
            groups={groups}
          />
        )}
      </View>
    </>
  );
};

export default ActivityScreen;

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
    marginTop: 10,
    marginHorizontal: '2%',
    // paddingHorizontal: 10,
    paddingTop: 10,
    height: 185,
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
