import { loadToken } from '@/Storage/MainAppStorage';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Icon, Select, SelectItem, Text } from '@ui-kitten/components';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import SockJS from 'sockjs-client';
import * as Stomp from 'react-native-stompjs';
// import { LinearGradientButton } from "@/Components/LinearGradientButton/LinearGradientButton";
import { AppHeader, Calendar, LinearGradientButton } from '@/Components';
import SearchBar from '@/Components/SearchBar/SearchBar';
import { actions } from '@/Context/state/Reducer';
import { useStateValue } from '@/Context/state/State';
import { AddStudentModal, EditDependentModal, ParentPaymentModal } from '@/Modals';
import { GetParent } from '@/Services/Parent';
import GetParentChildrens from '@/Services/Parent/GetParentChildrens';
import FetchOne from '@/Services/User/FetchOne';
import { loadIsSubscribed, loadUserId } from '@/Storage/MainAppStorage';
import LogoutStore from '@/Store/Authentication/LogoutStore';
import { ModalState } from '@/Store/Modal';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import { UserState } from '@/Store/User';
import Colors from '@/Theme/Colors';
import Geolocation from '@react-native-community/geolocation';
import moment from 'moment';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import MapView, { Circle, Marker } from 'react-native-maps';
import MaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
const window = Dimensions.get('window');
const { width, height } = window;
const HomeScreen = () => {
  const navigation = useNavigation();
  const focused = useIsFocused();
  const swipeableRef = useRef(null);
  const ref = useRef();
  const [, _dispatch] = useStateValue();
  let row: Array<any> = [];
  let prevOpenedRow: any;
  const dispatch = useDispatch();
  const [initialRoute, setInitialRoute] = useState('FeaturedScreen');
  const [position, setPosition] = useState({
    latitude: 10,
    longitude: 10,
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
  });
  useEffect(() => {
    Geolocation.getCurrentPosition((pos) => {
      const crd = pos.coords;
      setPosition({
        latitude: crd.latitude,
        longitude: crd.longitude,
        latitudeDelta: 0.0421,
        longitudeDelta: 0.0421,
      });
    });
  }, []);
  useEffect(() => {
    setThumbnail(false);
  }, [focused]);
  const [children, setChildren] = useState([]);
  const [trackingList, setTrackingList] = useState({});
  const [getChildrendeviceIds, setChildrensDeviceIds] = useState([]);
  const [originalChildren, setOriginalChildren] = useState([]);
  const [thumbnail, setThumbnail] = useState(false);
  const [searchParam, setSearchParam] = useState('');
  const [selectedDependent, setSelectedDependent] = useState(null);
  const [parentLatLong, setparentLatLong] = useState();
  const [selectedMonth, setSelectedMonth] = useState(moment(new Date()).month());
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 60,
    longitudeDelta: 0.0421,
  });
  const [studentsEmails, setStudentsEmail] = useState([]);
  const [originalStudentsEmails, setOriginalStudentsEmail] = useState([]);
  const [selectedDay, setSelectedDay] = useState(moment().format('D'));
  const [showChildFilter, setShowChildFilter] = useState(false);
  const [selectedChild, setSelectedChild] = useState('All');
  const [activities, setActivities] = useState([]);
  const currentUser = useSelector((state: { user: UserState }) => state.user.item);
  const socketRef = useRef();

  // console.log("currentUser", currentUser);
  const [isSubscribed, setIsSubscribed] = useState<boolean>();

  const handleLoadSubscribed = async () => {
    const _isSubscribed = await loadIsSubscribed();
    // console.log("_isSubscribed", _isSubscribed);
    setIsSubscribed(_isSubscribed);
    if (!_isSubscribed) {
      dispatch(
        ChangeModalState.action({
          parentPaymentModalVisibility: true,
        })
      );
    }
  };
  const getParentInfo = async () => {
    const userId = await loadUserId();

    GetParent(userId)
      .then((res) => {
        setparentLatLong(res.data);
      })
      .catch((err) => console.log('error', err));
  };

  useEffect(() => {
    getParentInfo();
    handleLoadSubscribed();
  }, []);

  const isCalendarVisible = useSelector((state: { modal: ModalState }) => state.modal.showCalendar);
  const closeRow = (index) => {
    if (prevOpenedRow && prevOpenedRow !== row[index]) {
      prevOpenedRow.close();
    }
    prevOpenedRow = row[index];
  };

  const getChildrens = async (referCode: string) => {
    try {
      let res = await GetParentChildrens(referCode);
      let temp = [];
      let deviceIds = [];
      res.map((item, index) => {
        temp.push({
          latitude: item?.latitude ? parseFloat(item?.latitude) : null,

          longitude: item?.longititude ? parseFloat(item?.longititude) : null,
        });
        if (item?.childDevice) {
          deviceIds.push(item.childDevice);
        }
      });
      setChildrensDeviceIds(deviceIds);

      // turnOnTracker(currentUser?.id, deviceIds, 'activity');

      setOriginalChildren(res);

      setOriginalStudentsEmail(temp);
      setStudentsEmail(temp);
      setChildren(res);
    } catch (err) {
      console.log('err in children', err);
    }
  };
  const loadUserDetails = async () => {
    FetchOne()
      .then((res) => {
        getChildrens(res?.referenceCode);
      })
      .catch((err) => console.log('loadUserDetails', err));
  };

  useEffect(() => {
    if (focused) {
      loadUserDetails();
    } else {
      setSelectedChild('All');
      setShowChildFilter(false);
    }
    return () => {
      setSelectedChild('All');
      setShowChildFilter(false);
    };
  }, [focused]);

  useEffect(() => {
    if (selectedDependent) {
      dispatch(ChangeModalState.action({ editDependentModalVisibility: true }));
    }
  }, [selectedDependent]);
  let stompClient: any = React.createRef<Stomp.Client | null>();
  const turnOnTracker = async (id: any, deviceIds: any, from: any) => {
    try {
      const token = await loadToken();

      const socket = new SockJS('https://live-api.trackmykidz.com/ws-location');
      stompClient = Stomp.over(socket);
      stompClient.connect({ token }, () => {
        deviceIds.map((item) => {
          stompClient.subscribe(`/device/${item}`, subscriptionCallback);
        });
      });
    } catch (err) {
      console.log('Error:', err);
    }
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
  // const RightActions = (dragX: any, item) => {
  //   const scale = dragX.interpolate({
  //     inputRange: [-100, 0],
  //     outputRange: [1, 0],
  //     extrapolate: "clamp",
  //   });
  //   return (
  //     <View
  //       style={{
  //         flexDirection: "column",
  //         alignItems: "center",
  //         justifyContent: "center",
  //       }}
  //     >
  //       <TouchableOpacity
  //         onPress={() => {
  //           const _activites = activities.filter(
  //             (a) =>
  //               a?.firstName === item?.firstName &&
  //               a?.lastName === item?.lastName
  //           );
  //           _dispatch({
  //             type: actions.SET_SELECTED_DEPENDENT_ACTIVITY,
  //             payload: _activites,
  //           });
  //           _dispatch({
  //             type: actions.SET_CHILD_NAME,
  //             payload: item?.firstName + " " + item?.lastName,
  //           });
  //           navigation.navigate("Activity", {
  //             dependent: item,
  //             dependentActivities: _activites,
  //           });
  //         }}
  //         style={{
  //           padding: 5,
  //           marginTop: 10,
  //           alignItems: "center",
  //           justifyContent: "center",
  //         }}
  //       >
  //         <Image
  //           source={require("@/Assets/Images/Approval_Decline_1.png")}
  //           style={{ width: 25, height: 25, marginRight: 10 }}
  //         />
  //       </TouchableOpacity>
  //       <TouchableOpacity
  //         onPress={() =>
  //           navigation.navigate("StudentLocationScreen", {
  //             student: item,
  //           })
  //         }
  //         style={{
  //           padding: 5,
  //           alignItems: "center",
  //           justifyContent: "center",
  //         }}
  //       >
  //         <Entypo size={30} color={Colors.primary} name="back-in-time" />
  //       </TouchableOpacity>
  //       <TouchableOpacity
  //         onPress={() => setSelectedDependent(item)}
  //         style={{
  //           padding: 5,
  //           alignItems: "center",
  //           justifyContent: "center",
  //         }}
  //       >
  //         <Icon
  //           style={{ width: 30, height: 30 }}
  //           fill={Colors.primary}
  //           name="edit-2"
  //         />
  //       </TouchableOpacity>
  //     </View>
  //   );
  // };
  useEffect(() => {
    if (selectedDependent) {
      dispatch(ChangeModalState.action({ editDependentModalVisibility: true }));
    }
  }, [selectedDependent]);
  const mapFitToCoordinates = () => {
    if (thumbnail && children.length > 0) {
      let temp = [];
      let arr = children.map((item, index) => {
        temp.push({
          latitude: item?.latitude ? parseFloat(item?.latitude) : parseFloat(10),
          longitude: item?.longititude ? parseFloat(item?.longititude) : parseFloat(10),
        });
      });
      // ref.current.fitToSuppliedMarkers(temp.map(({ studentId }) => studentId));
      ref.current.fitToCoordinates(temp, {
        edgePadding: {
          top: 2,
          right: 2,
          bottom: 2,
          left: 2,
        },
        animated: true,
      });
    }
  };
  // useEffect(() => {
  //   if (!thumbnail) {
  //     mapFitToCoordinates();
  //   }
  // }, [thumbnail, children]);
  const RightActions = (dragX: any, item: any, index: number) => {
    // console.log("child---", item.childTrackHistory);
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View
        style={{
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* <TouchableOpacity
          style={{
            padding: 5,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => {
            setSelectedStudentVisibility(item);
            prevOpenedRow?.close();
          }}
        >
          <Entypo size={23} color={Colors.primary} name="eye" />
        </TouchableOpacity> */}
        <TouchableOpacity
          onPress={() => {
            setSelectedDependent(item);
            prevOpenedRow?.close();
          }}
          style={{
            padding: 5,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 15,
          }}
        >
          <Icon style={{ width: 23, height: 23 }} fill={Colors.primary} name="edit-2" />
        </TouchableOpacity>

        {item.childTrackHistory && (
          <TouchableOpacity
            style={{
              padding: 5,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => {
              navigation.navigate('StudentLocationScreen', {
                student: item,
                parent: parentLatLong,
              });
            }}
            // prevOpenedRow?.close();
          >
            <MaterialCommunity size={23} color={Colors.primary} name="restart" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <>
      {/* <WelcomeMessageModal /> */}
      <AddStudentModal />
      {!!selectedDependent && (
        <EditDependentModal
          selectedDependent={selectedDependent}
          setSelectedDependent={(value: any) => setSelectedDependent(value)}
        />
      )}
      {!isSubscribed && (
        <ParentPaymentModal onPay={() => {}} onCancel={() => dispatch(LogoutStore.action())} />
      )}
      <AppHeader
        // title="Home"
        onAddPress={() => navigation.navigate('CreateParentActivity')}
        thumbnail={thumbnail}
        setThumbnail={(value) => setThumbnail(value)}
        hideCalendar={thumbnail ? false : true}
      />
      {isCalendarVisible && (
        <Calendar
          style={{ backgroundColor: Colors.primary }}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedDay={parseInt(selectedDay)}
          setSelectedDay={setSelectedDay}
        />
      )}

      <SearchBar
        searchText={searchParam}
        onChangeText={(value) => setSearchParam(value)}
        thumbnailView={thumbnail}
        onToggleChange={() => {
          setThumbnail(!thumbnail);
          dispatch(
            ChangeModalState.action({
              showCalendar: false,
            })
          );
        }}
        thumbnail={thumbnail}
        isThumbnail
        showFilter
        showDropdown={showChildFilter}
        setShowDropdown={(value) => {
          if (showChildFilter) {
            setSelectedChild('All');
          }
          setShowChildFilter(value);
        }}
      />

      <View style={[styles.layout]}>
        {showChildFilter && (
          <Select
            style={{ width: '90%', marginHorizontal: '5%' }}
            value={selectedChild}
            placeholder="Select Child"
            onSelect={(index: any) => {
              let children = [...originalChildren];

              const child =
                index.row === 0
                  ? 'All'
                  : children[index.row - 1]?.firstname + ' ' + children[index.row - 1]?.lastname;

              if (index.row == 0) {
                setChildren([...originalChildren]);
                setOriginalStudentsEmail([...originalStudentsEmails]);
              } else {
                let res = children.filter(
                  (item) => children[index.row - 1].studentId == item.studentId
                );
                setChildren(res);
                let studentsMarker = [...originalStudentsEmails];
                let markers = studentsMarker[index.row - 1];

         
                setStudentsEmail([markers]);
              }
              setSelectedChild(child);
            }}
            label={(evaProps: any) => <Text {...evaProps}></Text>}
          >
            <SelectItem title="All" />
            {originalChildren &&
              originalChildren.map((item) => (
                <SelectItem key={item?.studentId} title={item?.firstname + ' ' + item?.lastname} />
              ))}
          </Select>
        )}
        {thumbnail ? (
          <View style={{ flex: 1, backgroundColor: Colors.newBackgroundColor }}>
            {children.length == 0 && (
              <View
                style={{
                  minHeight: 50,
                  width: '95%',
                  marginTop: 5,
                  alignSelf: 'center',
                }}
              >
                <View style={styles.buttonText}>
                  <LinearGradientButton
                    style={{
                      borderRadius: 25,
                      flex: 1,
                    }}
                    appearance="ghost"
                    size="medium"
                    status="control"
                    onPress={() => {
                      dispatch(
                        ChangeModalState.action({
                          addStudentModal: true,
                        })
                      );
                    }}
                  >
                    Click here to add a child's profile
                  </LinearGradientButton>
                </View>
              </View>
            )}

            <FlatList
              data={children}
              style={{ padding: 10, width: '100%' }}
              renderItem={({ item, index }) => (
                <Swipeable
                  ref={(ref) => (row[index] = ref)}
                  onSwipeableOpen={() => closeRow(index)}
                  renderRightActions={(e) => RightActions(e, item, index)}
                >
                  {/* {console.log("chidldren0000000", item.studentId + item.email)} */}
                  <TouchableOpacity
                    style={[
                      styles.item,
                      {
                        backgroundColor: !item.approve
                          ? '#fff'
                          : index % 3 === 0
                          ? 'lightgreen'
                          : index % 2 === 0
                          ? '#F6DDCC'
                          : '#fff',
                      },
                    ]}
                    onPress={() => {
                      _dispatch({
                        type: actions.SET_SELECTED_CHILD,
                        payload: item,
                      });
                      navigation.navigate('Activity', {
                        dependent: item,
                      });
                    }}
                  >
                    <View style={[styles.row, { justifyContent: 'space-between' }]}>
                      <Text
                        style={[styles.text, { fontWeight: '600' }]}
                      >{`${item.firstname} ${item.lastname}`}</Text>
                    </View>
                    <Text style={styles.text}>{`${
                      (!!item.chidlSchool && item.childSchool) || ''
                    }`}</Text>

                    {item?.status ? (
                      <Text style={styles.text}>{`Status: ${item.status}`}</Text>
                    ) : (
                      <Text style={styles.text}>{`Status: No Activity`}</Text>
                    )}
                  </TouchableOpacity>
                </Swipeable>
              )}
            />
          </View>
        ) : (
          <MapView
            ref={ref}
            onLayout={() => {
              console.log('studnet emails',studentsEmails)
              let temp = studentsEmails?.filter((item) => item.latitude != null);

              ref?.current?.fitToCoordinates(temp, {
                edgePadding: {
                  top: 10,
                  right: 10,
                  bottom: 10,
                  left: 10,
                },
                animated: true,
              });
            }}
            style={{ flex: 1 }}
          >
            {children
              .filter(
                (item) =>
                  trackingList[item.childDevice]?.lat != 'undefined' &&
                  trackingList[item.childDevice]?.lat != null
              )
              .map((item, index) => {
                let latitude = trackingList[item.childDevice]?.lat;
                let longititude = trackingList[item.childDevice]?.lang;

                return (
                  <>
                    {item?.toggleAlert && (
                      <Circle
                        key={index}
                        center={{
                          latitude: latitude ? parseFloat(latitude) : parseFloat(10),
                          longitude: longititude ? parseFloat(longititude) : parseFloat(10),
                        }}
                        radius={item?.allowedDistance || 50}
                        strokeWidth={10}
                        strokeColor={'red'}
                        fillColor={'rgba(230,238,255,0.5)'}
                      />
                    )}

                    <Marker
                      onSelect={() => console.log('pressed')}
                      onPress={() => {
                        ref.current.fitToSuppliedMarkers(
                          [
                            {
                              latitude: latitude ? parseFloat(latitude) : parseFloat(10),
                              longitude: longititude ? parseFloat(longititude) : parseFloat(10),
                            },
                          ]
                          // false, // not animated
                        );
                      }}
                      identifier={item?.email}
                      key={index}
                      coordinate={{
                        latitude: latitude ? parseFloat(latitude) : parseFloat(10),
                        longitude: longititude ? parseFloat(longititude) : parseFloat(10),
                      }}
                    >
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
                          {item?.studentImage == '' && (
                            <View
                              style={{
                                height: '100%',
                                width: '100%',
                                borderRadius: 80,
                                backgroundColor: Colors.primary,
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <Text style={{ color: Colors.white }}>
                                {item?.firstname?.substring(0, 1)?.toUpperCase() || ''}
                                {item?.lastname?.substring(0, 1)?.toUpperCase() || ''}
                              </Text>
                            </View>
                          )}
                          {item?.studentImage != '' && (
                            <Image
                              source={{
                                uri: item?.studentImage,
                              }}
                              style={{
                                height: '100%',
                                width: '100%',
                                borderRadius: 80,
                                aspectRatio: 1.5,
                              }}
                              resizeMode="contain"
                            />
                          )}
                        </View>
                        {/* <FA5 name="map-marker" size={40} color={"red"} /> */}
                      </View>
                    </Marker>
                  </>
                  // </>
                  // </Circle>
                );
              })}
          </MapView>
        )}
      </View>
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.newBackgroundColor,
  },
  item: {
    borderRadius: 10,
    width: '96%',
    backgroundColor: '#fff',
    marginVertical: 10,
    marginHorizontal: '2%',
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    marginVertical: 4,
  },
  calendar: {
    flex: 0,
    color: Colors.white,
    zIndex: -1,
    padding: 20,
    width: '100%',
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  day: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    flex: 1,
    borderRadius: 8,
    fontFamily: 'Gill Sans',
    textAlign: 'center',
    margin: 2,
    shadowColor: 'rgba(0,0,0, .4)', // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    shadowOpacity: 1, // IOS
    shadowRadius: 1, //IOS
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    alignItems: 'center',
    flexDirection: 'row',
  },
});
