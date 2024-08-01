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
import MapView, { Circle, LatLng, Marker } from 'react-native-maps';
import MaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
const window = Dimensions.get('window');
const { width, height } = window;
const HomeScreen = () => {
  const navigation = useNavigation();
  const focused = useIsFocused();
  const swipeableRef = useRef(null);
  const ref = useRef<MapView>();
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
    _dispatch({
      type: actions.SET_THUMBNAIL,
      payload: false,
    });
  }, []);

  const [{ thumbnail, any }]: any = useStateValue();
  const [children, setChildren] = useState([]);
  const [trackingList, setTrackingList] = useState({});
  const [getChildrendeviceIds, setChildrensDeviceIds] = useState([]);
  const [originalChildren, setOriginalChildren] = useState([]);

  // const [thumbnail, setThumbnail] = useState(false);
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
  const [userLocation, setUserLocation] = useState<LatLng>({ longitude: 0, latitude: 0 });

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
        setThumbnail={(value) => {
          _dispatch({
            type: actions.SET_THUMBNAIL,
            payload: value,
          });
        }}
        hideCalendar={false}
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
        thumbnailView={false}
        onToggleChange={() => {
          _dispatch({
            type: actions.SET_THUMBNAIL,
            payload: !thumbnail,
          });

          dispatch(
            ChangeModalState.action({
              showCalendar: false,
            })
          );
        }}
        thumbnail={false}
        isThumbnail={false}
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
            // label={(evaProps: any) => <Text {...evaProps}></Text>}
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
          <View style={styles.container}>
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
              initialRegion={position} // Set initial region to current position
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
                coordinate={position}
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
      </View>
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
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
