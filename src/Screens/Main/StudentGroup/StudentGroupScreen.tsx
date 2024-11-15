import { InstructionsModal } from '@/Modals';
import {
  DeleteGroup,
  FindGroupsByName,
  GetGroupByStudentId,
  GetGroupCount,
} from '@/Services/Group';
import {
  getHomeScreenCacheInfo,
  loadToken,
  storeHomeScreenCacheInfo,
} from '@/Storage/MainAppStorage';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import { StudentState } from '@/Store/StudentActivity';
import { UserState } from '@/Store/User';
import SetChatParam from '@/Store/chat/SetChatParams';
import Colors from '@/Theme/Colors';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Icon, Text } from '@ui-kitten/components';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import MapView, { LatLng, Marker } from 'react-native-maps';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import SockJS from 'sockjs-client';
// @ts-ignore
import * as Stomp from 'react-native-stompjs';
import { actions } from '@/Context/state/Reducer';
import { useStateValue } from '@/Context/state/State';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackNavigatorParamsList } from '@/Navigators/Main/RightDrawerNavigator';
import GetParentChildrens from '@/Services/Parent/GetParentChildrens';
import { AppHeader } from '@/Components';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
const StudentGroupScreen = () => {
  const navigation = useNavigation<StackNavigationProp<MainStackNavigatorParamsList>>();
  const [children, setChildren] = useState<any[]>([]);
  const instructorImage = require('@/Assets/Images/approval_icon2.png');
  // const dependent = route && route.params && route.params.dependent;
  const isFocused = useIsFocused();
  const [trackingList, setTrackingList] = useState<any>({});
  // const swipeableRef = useRef<any>(null);
  const ref = useRef<MapView>();
  const [groupCount, setGroupCount] = useState<any>({});
  const dispatch = useDispatch();
  let prevOpenedRow: any;
  const [, _dispatch]: any = useStateValue();
  let row: any[] = [];
  const searchBarValue = useSelector((state: any) => state.header.searchBarValue);
  const { showFamilyMap } = useSelector(
    (state: { studentActivity: StudentState }) => state.studentActivity
  );
  const [studentsEmails, setStudentsEmail] = useState<any[]>([]);

  const [selectedDependent, setSelectedDependent] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedInstructions, setSelectedInstructions] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<LatLng>({ longitude: 0, latitude: 0 });
  const currentUser: any = useSelector((state: { user: UserState }) => state.user.item);

  const getGroups = async () => {
    GetGroupByStudentId(currentUser?.studentId)
      .then((res) => {
        setGroups(res);
        storeHomeScreenCacheInfo('student_groups', JSON.stringify(res));
      })
      .catch((err) => {
        console.log('Error:', err);
      });
  };
  const getCacheGroups = async () => {
    let group = await getHomeScreenCacheInfo('student_groups');
    if (group) {
      setGroups(JSON.parse(group));
    }
  };

  const getGroupCountApi = async (body: any) => {
    try {
      let temp: any = {};
      let res: any[] = await GetGroupCount(body);
      res.map((item) => {
        temp[item.groupId] = item;
      });
      setGroupCount({ ...groupCount, ...temp });
    } catch (err) {
      console.log('err', err);
    }
  };
  const search = (text: String) => {
    if (text == '') {
      getGroups();
    } else {
      FindGroupsByName({ groupName: text }, 0, 30)
        .then((res) => {
          setGroups(res?.result);
        })
        .catch((err) => {
          console.log('Error:', err);
        });
    }
  };
  const closeRow = (index: number) => {
    if (prevOpenedRow && prevOpenedRow !== row[index]) {
      prevOpenedRow?.close();
    }
    prevOpenedRow = row[index];
  };
  useEffect(() => {
    getCacheGroups();
  }, [isFocused]);
  useEffect(() => {
    if (isFocused) {
      let temp: any[] = [];
      if (groups?.length > 0) {
        groups?.forEach(async (element) => {
          temp.push(element.groupId);
        });
        getGroupCountApi(temp);
        // getGroupCountApi(temp);
      }
    }
  }, [groups?.length, isFocused]);
  useEffect(() => {
    if (selectedDependent) {
      dispatch(ChangeModalState.action({ editDependentModalVisibility: true }));
    }
  }, [selectedDependent]);

  useEffect(() => {
    if (selectedInstructions) {
      dispatch(ChangeModalState.action({ instructionsModalVisibility: true }));
    }
  }, [selectedInstructions]);

  const getChildrens = async (referenceCode: any) => {
    try {
      let res: any[] = await GetParentChildrens(referenceCode);
      let temp: any[] = [];
      let deviceIds: any[] = [];
      res.map((item, index) => {
        temp.push({
          latitude: item?.latitude ? parseFloat(item?.latitude) : null,

          longitude: item?.longititude ? parseFloat(item?.longititude) : null,
        });

        if (item?.childDevice) {
          deviceIds.push(item?.childDevice);
        }
      });
      connectSockets(deviceIds);
      setStudentsEmail(temp);
      setChildren(res);
    } catch (err) {
      console.log('err in children', err);
    }
  };
  let stompClient: any = React.createRef<Stomp.Client>();
  const connectSockets = async (deviceIds: any[]) => {
    const token = await loadToken();
    const socket = new SockJS('https://live-api.trackmykidz.com/ws-location');
    stompClient = Stomp.over(socket);
    stompClient.connect({ token }, () => {
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

  const fetchParent = async () => {
    try {
      getChildrens(currentUser?.parentReferenceCode1);
    } catch (err) {
      console.log('err', err);
    }
  };
  useEffect(() => {
    if (isFocused) {
      getGroups();
      fetchParent();
    }
  }, [isFocused]);
  useEffect(() => {
    if (searchBarValue) {
      search(searchBarValue);
    }
  }, [searchBarValue]);

  const RightActions = (dragX: any, item: any) => {
    return (
      <View
        style={{
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TouchableOpacity
          onPress={() => {
            dispatch(
              SetChatParam.action({
                title: item?.groupName,
                chatId: `activity_${item?.groupId}`,
                subcollection: 'student',
                user: {
                  _id: currentUser?.studentId,
                  avatar: currentUser?.imageurl,
                  name: currentUser?.firstname
                    ? currentUser?.firstname[0].toUpperCase() +
                      currentUser?.firstname.slice(1) +
                      '' +
                      currentUser?.lastname[0]
                    : currentUser?.firstname + '' + currentUser?.lastname,
                },
              })
            );
            navigation.navigate('ChatScreen', {
              title: item?.groupName,
              showHeader: true,
            });
          }}
          style={{
            padding: 5,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons size={25} color={Colors.primary} name="chatbox-ellipses" />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            padding: 5,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => {
            prevOpenedRow?.close();
            _dispatch({
              type: actions.SET_SELECTED_GROUP,
              payload: item?.groupId,
            });
            navigation.navigate('GroupScehdule');
          }}
        >
          <FontAwesome5 size={25} name="calendar" color={Colors.primary} />
        </TouchableOpacity>

        {!item.status && (
          <TouchableOpacity
            style={{
              padding: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() =>
              DeleteGroup(item.id)
                .then((res) => {
                  getGroups();
                })
                .catch((err) => {
                  console.log('Error:', err);
                })
            }
          >
            <Icon style={{ width: 30, height: 30 }} fill={Colors.primary} name="trash" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

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

  return (
    <>
      {selectedInstructions && (
        <InstructionsModal
          group={selectedInstructions}
          selectedInstructions={selectedInstructions}
          setSelectedInstructions={setSelectedInstructions}
        />
      )}
      <View style={styles.layout}>
        {groups.length > 0 && (
          <FlatList
            data={groups || []}
            style={{
              padding: 10,
              width: '100%',
              marginTop: 10,
              marginBottom: 20,
            }}
            renderItem={({ item, index }: { item: any; index: number }) => {
              let temp: any[] = [];
              let instructor = item?.instructors?.map((item: any) => temp.push(item?.firstName));
              return (
                <Swipeable
                  ref={(ref) => (row[index] = ref)}
                  onSwipeableOpen={() => closeRow(index)}
                  renderRightActions={(e) => RightActions(e, item)}
                >
                  <View style={[styles.item, { backgroundColor: '#fff' }]}>
                    <Text
                      style={[
                        styles.text,
                        {
                          fontSize: 20,
                          fontWeight: '800',
                          paddingLeft: 25,
                        },
                      ]}
                    >{`${item?.groupName}`}</Text>
                    {/* <Text style={styles.text}>{`Status: ${
  item?.status ? "Active" : "Inactive"
}`}</Text> */}

                    <Text
                      style={[
                        styles.text,
                        {
                          fontSize: 12,
                          fontWeight: '700',
                          paddingLeft: 25,
                        },
                      ]}
                    >{`Instructors: ${temp.toString()}`}</Text>
                    <View style={styles.divider}>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={styles.text}>{`Approval`}</Text>
                        <View style={{ flexDirection: 'row' }}>
                          <TouchableOpacity style={styles.horizontal}>
                            <Text style={styles.footerText}>{`${
                              groupCount[item.groupId]?.countApprovedStudents || '0'
                            }`}</Text>
                            <Entypo
                              name="book"
                              color={Colors.primary}
                              size={15}
                              style={{ marginHorizontal: 5 }}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.horizontal}>
                            <Text style={styles.text}>
                              {groupCount[item.groupId]?.countApprovedInstructors || '0'}
                            </Text>
                            <Image source={instructorImage} style={styles.iconImages} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={{ alignItems: 'center' }}>
                        <Text style={styles.footerText}>{`Declined`}</Text>
                        <View style={{ flexDirection: 'row' }}>
                          <TouchableOpacity style={styles.horizontal}>
                            <Text style={styles.text}>{`${
                              groupCount[item.groupId]?.countDeclinedStudents || '0'
                            }`}</Text>
                            <Entypo
                              name="book"
                              color={Colors.primary}
                              size={15}
                              style={{ marginHorizontal: 5 }}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.horizontal}>
                            <Text style={styles.text}>
                              {groupCount[item.groupId]?.countDeclinedInstructors || '0'}
                            </Text>
                            <Image source={instructorImage} style={styles.iconImages} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={{ alignItems: 'center' }}>
                        <Text style={styles.footerText}>{`Pending`}</Text>
                        <View style={{ flexDirection: 'row' }}>
                          <TouchableOpacity style={styles.horizontal}>
                            <Text style={styles.text}>
                              {`${groupCount[item.groupId]?.countPendingStudents || '0'}`}
                            </Text>
                            <Entypo
                              name="book"
                              color={Colors.primary}
                              size={15}
                              style={{ marginHorizontal: 5 }}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.horizontal}>
                            <Text style={styles.text}>
                              {groupCount[item.groupId]?.countPendingInstructors || '0'}
                              {/* {item.countPendingInstructors || `0`} */}
                            </Text>
                            <Image source={instructorImage} style={styles.iconImages} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        setSelectedInstructions(item);
                        dispatch(
                          ChangeModalState.action({
                            instructionsModalVisibility: true,
                          })
                        );
                      }}
                      style={{ width: '100%', alignItems: 'center' }}
                    >
                      <Text
                        style={[
                          styles.text,
                          {
                            fontSize: 16,
                            marginVertical: 15,
                            opacity: 0.6,
                          },
                        ]}
                      >{`Instructions     /    Disclaimer    /    Agreement`}</Text>
                    </TouchableOpacity>
                  </View>
                </Swipeable>
              );
            }}
          />
        )}
        {showFamilyMap && (
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
              showsUserLocation
              showsMyLocationButton
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

        {groups.length == 0 && (
          <Text style={{ textAlign: 'center', marginTop: 5 }}>
            You currently do not have any groups
          </Text>
        )}
      </View>
      <AppHeader
        hideCenterIcon={showFamilyMap ? false : true}
        hideCalendar={true}
        showGlobe={true}
      />
    </>
  );
};

export default StudentGroupScreen;

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
    minHeight: 205,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 13,
    marginVertical: 4,
  },

  iconImages: {
    height: 15,
    width: 15,
    resizeMode: 'contain',
    marginLeft: 5,
    marginRight: 5,
  },
  footerText: {
    fontSize: 13,
    marginVertical: 2,
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
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: Colors.lightgray,
    paddingVertical: 10,
    marginVertical: 10,
  },
});
