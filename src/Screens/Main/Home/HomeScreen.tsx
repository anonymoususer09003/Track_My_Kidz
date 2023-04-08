import React, { useEffect, useState, useRef } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Text, Icon, Select, SelectItem } from "@ui-kitten/components";
import {
  StyleSheet,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import Fontisto from "react-native-vector-icons/Fontisto";
// import { LinearGradientButton } from "@/Components/LinearGradientButton/LinearGradientButton";
import { AppHeader } from "@/Components";
import TrackHistory from "@/Services/Parent/TrackHistory";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { AwsLocationTracker } from "@/Services/TrackController";
import messaging from "@react-native-firebase/messaging";
import { UpdateDeviceToken } from "@/Services/User";
import { useDispatch, useSelector } from "react-redux";
import ChangeSearchString from "@/Store/Blogs/ChangeSearchString";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { navigateAndSimpleReset } from "@/Navigators/Functions";
import {
  WelcomeMessageModal,
  EditDependentModal,
  AddStudentModal,
  ParentPaymentModal,
} from "@/Modals";
import FA5 from "react-native-vector-icons/FontAwesome5";
import SearchBar from "@/Components/SearchBar/SearchBar";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Colors from "@/Theme/Colors";
import MaterialCommunity from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Entypo from "react-native-vector-icons/Entypo";
import { LinearGradientButton } from "@/Components";
import MapView, { Marker, Circle } from "react-native-maps";
import { ModalState } from "@/Store/Modal";
import moment from "moment";
import { Calendar } from "@/Components";
import { UserState } from "@/Store/User";
import { GetAllStudents, GetParent } from "@/Services/Parent";
import { loadIsSubscribed, loadUserId, loadId } from "@/Storage/MainAppStorage";
import FetchOne from "@/Services/User/FetchOne";
import { GetAllActivity, GetChildrenAcitivities } from "@/Services/Activity";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useStateValue } from "@/Context/state/State";
import { actions } from "@/Context/state/Reducer";
import { color } from "react-native-reanimated";
import LogoutStore from "@/Store/Authentication/LogoutStore";
import Geolocation from "@react-native-community/geolocation";
import GetParentChildrens from "@/Services/Parent/GetParentChildrens";
import { iteratorSymbol } from "immer/dist/internal";
const window = Dimensions.get("window");
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
  const [initialRoute, setInitialRoute] = useState("FeaturedScreen");
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
  const [searchParam, setSearchParam] = useState("");
  const [selectedDependent, setSelectedDependent] = useState(null);
  const [parentLatLong, setparentLatLong] = useState();
  const [selectedMonth, setSelectedMonth] = useState(
    moment(new Date()).month()
  );
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 60,
    longitudeDelta: 0.0421,
  });
  const [studentsEmails, setStudentsEmail] = useState([]);
  const [originalStudentsEmails, setOriginalStudentsEmail] = useState([]);
  const [selectedDay, setSelectedDay] = useState(moment().format("D"));
  const [showChildFilter, setShowChildFilter] = useState(false);
  const [selectedChild, setSelectedChild] = useState("All");
  const [activities, setActivities] = useState([]);
  const currentUser = useSelector(
    (state: { user: UserState }) => state.user.item
  );
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
    console.log("respo9090090909", userId);
    GetParent(userId)
      .then((res) => {
        setparentLatLong(res.data);
        console.log("respo9090090909", res.data);
      })
      .catch((err) => console.log("error", err));
  };

  useEffect(() => {
    let loop = ["KXx7HLpckEuYMiIPmX0T", "54V52gB9Bft15OUQ3A5G", "2313"];

    let temp = [];
    let promise = [];
    loop.map(async (item) =>
      promise.push(
        await firestore()
          .collection("students")
          .doc(typeof item != "string" ? JSON.stringify(item) : item)
          .onSnapshot((documentSnapshot) => {
            temp.push(documentSnapshot.data());
            console.log("User data: ", documentSnapshot.data());
          })
      )
    );
    // Promise.all(promise).then((res) => {
    //   console.log("log100101011", res);
    // });
    // console.log("temp", temp);
    // Stop listening for updates when no longer required
    // return () => subscriber();

    // try {
    //   const colRef = firestore().collection("students");
    //   //real time update
    //   let temp = [];
    //   const unsubscribe = colRef
    //     .doc("54V52gB9Bft15OUQ3A5G")
    //     .where("parentemail1", "==", currentUser.email)
    //     .onSnapshot(async (snapshot) => {
    //       snapshot.docs.forEach((doc) => {
    //         temp.push(doc.data());
    //         // setTestData((prev) => [...prev, doc.data()])
    //         // console.log("onsnapshot", doc.data());
    //       });
    //     });
    //   console.log("temp firestore", temp);
    // } catch (err) {
    //   console.log("err", err);
    // }
    //remember to unsubscribe from your realtime listener on unmount or you will create a memory leak
    // return () => unsubscribe();
  }, []);

  useEffect(() => {
    getParentInfo();
    handleLoadSubscribed();
  }, []);

  const isCalendarVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.showCalendar
  );
  const closeRow = (index) => {
    console.log(index);
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
        if (item?.deviceId) {
          deviceIds.push(item.deviceId);
        }
      });
      setChildrensDeviceIds(deviceIds);
      turnOnTracker(currentUser?.id, deviceIds, "activity");
      setOriginalChildren(res);

      setOriginalStudentsEmail(temp);
      setStudentsEmail(temp);
      setChildren(res);
    } catch (err) {
      console.log("err in children", err);
    }
  };
  const loadUserDetails = async () => {
    FetchOne()
      .then((res) => {
        getChildrens(res?.referenceCode);
      })
      .catch((err) => console.log("loadUserDetails", err));
  };

  useEffect(() => {
    if (focused) {
      loadUserDetails();
    } else {
      setSelectedChild("All");
      setShowChildFilter(false);
      turnOffTracker(null);
    }
    return () => {
      setSelectedChild("All");
      setShowChildFilter(false);
    };
  }, [focused]);

  useEffect(() => {
    if (selectedDependent) {
      dispatch(ChangeModalState.action({ editDependentModalVisibility: true }));
    }
  }, [selectedDependent]);

  const turnOnTracker = async (id: any, deviceIds: any, from: any) => {
    try {
      let body = {
        deviceIds: deviceIds,
        trackerName: id,
        locationTrackerTrigger: true,
      };

      let res = await AwsLocationTracker(body);

      let temp = {};
      res.map((item) => {
        temp = {
          ...temp,
          [temp.deviceId]: {
            lat: item.position[0],
            lang: item.position[1],
          },
        };
      });
      setTrackingList(temp);
    } catch (err) {
      console.log("err", err);
    }
  };
  const turnOffTracker = async (from: any) => {
    try {
      let body = {
        deviceIds: getChildrendeviceIds,
        trackerName: currentUser.id,
        locationTrackerTrigger: false,
      };
      let res = await AwsLocationTracker(body);
    } catch (err) {
      console.log("err", err);
    }
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
          latitude: item?.latitude
            ? parseFloat(item?.latitude)
            : parseFloat(10),
          longitude: item?.longititude
            ? parseFloat(item?.longititude)
            : parseFloat(10),
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
      extrapolate: "clamp",
    });

    return (
      <View
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
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
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 15,
          }}
        >
          <Icon
            style={{ width: 23, height: 23 }}
            fill={Colors.primary}
            name="edit-2"
          />
        </TouchableOpacity>

        {item.childTrackHistory && (
          <TouchableOpacity
            style={{
              padding: 5,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => {
              navigation.navigate("StudentLocationScreen", {
                student: item,
                parent: parentLatLong,
              });
            }}
            // prevOpenedRow?.close();
          >
            <MaterialCommunity
              size={23}
              color={Colors.primary}
              name="restart"
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <>
      <WelcomeMessageModal />
      <AddStudentModal />
      {!!selectedDependent && (
        <EditDependentModal
          selectedDependent={selectedDependent}
          setSelectedDependent={(value: any) => setSelectedDependent(value)}
        />
      )}
      {!isSubscribed && (
        <ParentPaymentModal
          onPay={() => {}}
          onCancel={() => dispatch(LogoutStore.action())}
        />
      )}
      <AppHeader
        title="Home"
        thumbnail={thumbnail}
        setThumbnail={() => setThumbnail(!thumbnail)}
        hideCalendar={thumbnail ? false : true}
      />
      {isCalendarVisible && (
        <Calendar
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
            setSelectedChild("All");
          }
          setShowChildFilter(value);
        }}
      />

      <View style={[styles.layout]}>
        {showChildFilter && (
          <Select
            style={{ width: "90%", marginHorizontal: "5%" }}
            value={selectedChild}
            placeholder="Select Child"
            onSelect={(index: any) => {
              console.log("index", index.row);
              let children = [...originalChildren];

              const child =
                index.row === 0
                  ? "All"
                  : children[index.row - 1]?.firstname +
                    " " +
                    children[index.row - 1]?.lastname;
              console.log("children", originalStudentsEmails);
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
                setStudentsEmail(markers);
              }
              setSelectedChild(child);
            }}
            label={(evaProps: any) => <Text {...evaProps}></Text>}
          >
            <SelectItem title="All" />
            {originalChildren &&
              originalChildren.map((item) => (
                <SelectItem
                  key={item?.studentId}
                  title={item?.firstname + " " + item?.lastname}
                />
              ))}
          </Select>
        )}
        {
          thumbnail ? (
            <>
              {children.length == 0 && (
                <View
                  style={{
                    minHeight: 50,
                    width: "95%",
                    marginTop: 5,
                    alignSelf: "center",
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
                // <TouchableOpacity
                //   onPress={() => {
                //     dispatch(
                //       ChangeModalState.action({
                //         addStudentModal: true,
                //       })
                //     );
                //   }}
                // >
                //   <Text
                //     style={{
                //       fontSize: 16,
                //       textAlign: "center",
                //       marginTop: 20,
                //       color: Colors.primary,
                //     }}
                //   >
                //     Click here to add a child's profile
                //   </Text>
                // </TouchableOpacity>
              )}

              <FlatList
                data={children}
                style={{ padding: 10, width: "100%" }}
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
                            ? "#fff"
                            : index % 3 === 0
                            ? "lightgreen"
                            : index % 2 === 0
                            ? "#F6DDCC"
                            : "#fff",
                        },
                      ]}
                      onPress={() => {
                        _dispatch({
                          type: actions.SET_SELECTED_CHILD,
                          payload: item,
                        });
                        navigation.navigate("Activity", {
                          dependent: item,
                        });
                      }}
                    >
                      <View
                        style={[
                          styles.row,
                          { justifyContent: "space-between" },
                        ]}
                      >
                        <Text
                          style={[styles.text, { fontWeight: "600" }]}
                        >{`${item.firstname} ${item.lastname}`}</Text>
                      </View>
                      <Text style={styles.text}>{`${
                        (!!item.chidlSchool && item.childSchool) || ""
                      }`}</Text>

                      {item?.status ? (
                        <Text
                          style={styles.text}
                        >{`Status: ${item.status}`}</Text>
                      ) : (
                        <Text style={styles.text}>{`Status: No Activity`}</Text>
                      )}
                    </TouchableOpacity>
                  </Swipeable>
                )}
              />

              {false && children.length > 0 && activities.length == 0 && (
                <TouchableOpacity
                  onPress={() => {
                    dispatch(
                      ChangeModalState.action({
                        addStudentModal: true,
                      })
                    );
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      textAlign: "center",
                      marginTop: 20,
                      color: Colors.primary,
                    }}
                  >
                    You don't have any activities approved for any dependant
                  </Text>
                </TouchableOpacity>
              )}

              {/* {console.log(activities)} */}
            </>
          ) : (
            <MapView
              ref={ref}
              // onRegionChange={(region) => setRegion(region)}
              // zoomEnabled
              // region={region}
              // initialRegion={{
              //   latitude: children[0]?.latitude
              //     ? parseFloat(children[0]?.latitude)
              //     : parseFloat(10),
              //   longitude: children[0]?.longititude
              //     ? parseFloat(children[0]?.longititude)
              //     : parseFloat(10),
              //   latitudeDelta: 0.0922 + width / height,
              //   longitudeDelta: 0.0421,
              // }}
              onLayout={() => {
                let temp = studentsEmails.filter(
                  (item) => item.latitude != null
                );

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
                    trackingList[item.deviceId]?.lat != "undefined" &&
                    trackingList[item.deviceId]?.lat != null
                )
                .map((item, index) => {
                  console.log("item", item);
                  let latitude = trackingList[item.deviceId]?.lat;
                  let longititude = trackingList[item.deviceId]?.lang;
                  // console.log("item", item);
                  return (
                    <>
                      {item?.childTrackHistory && (
                        <Circle
                          key={index}
                          center={{
                            latitude: latitude
                              ? parseFloat(latitude)
                              : parseFloat(10),
                            longitude: longititude
                              ? parseFloat(longititude)
                              : parseFloat(10),
                            // latitude: parentLatLong?.location[0]?.parentLat
                            //   ? parseFloat(parentLatLong?.location[0]?.parentLat)
                            //   : parseFloat(10),
                            // longitude: parentLatLong?.location[0]?.parentLong
                            //   ? parseFloat(parentLatLong?.location[0]?.parentLong)
                            //   : parseFloat(10),
                          }}
                          radius={item?.allowedDistance || 50}
                          strokeWidth={10}
                          strokeColor={"red"}
                          fillColor={"rgba(230,238,255,0.5)"}
                        />
                      )}

                      <Marker
                        onSelect={() => console.log("pressed")}
                        onPress={() => {
                          console.log("ref", ref);
                          ref.current.fitToSuppliedMarkers(
                            [
                              {
                                latitude: latitude
                                  ? parseFloat(latitude)
                                  : parseFloat(10),
                                longitude: longititude
                                  ? parseFloat(longititude)
                                  : parseFloat(10),
                              },
                            ]
                            // false, // not animated
                          );
                        }}
                        identifier={item?.email}
                        key={index}
                        coordinate={{
                          latitude: latitude
                            ? parseFloat(latitude)
                            : parseFloat(10),
                          longitude: longititude
                            ? parseFloat(longititude)
                            : parseFloat(10),
                        }}
                      >
                        <View style={{}}>
                          <View
                            style={{
                              height: 30,
                              width: 30,
                              borderRadius: 80,
                              overflow: "hidden",
                              // top: 33,
                              // zIndex: 10,
                            }}
                          >
                            {item?.studentImage == "" && (
                              <View
                                style={{
                                  height: "100%",
                                  width: "100%",
                                  borderRadius: 80,
                                  backgroundColor: Colors.primary,
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <Text style={{ color: Colors.white }}>
                                  {item?.firstname
                                    ?.substring(0, 1)
                                    ?.toUpperCase() || ""}
                                  {item?.lastname
                                    ?.substring(0, 1)
                                    ?.toUpperCase() || ""}
                                </Text>
                              </View>
                            )}
                            {item?.studentImage != "" && (
                              <Image
                                source={{
                                  uri: item?.studentImage,
                                }}
                                style={{
                                  height: "100%",
                                  width: "100%",
                                  borderRadius: 80,
                                  aspectRatio: 2,
                                }}
                                resizeMode="contain"
                              />
                            )}
                          </View>
                          {/* <FA5 name="map-marker" size={40} color={"red"} /> */}
                        </View>
                        {/* <TouchableOpacity
                          onPress={() => console.log("pressed")}
                          style={{ alignItems: "center" }}
                        >
                          <Text>{item?.firstname}</Text>
                          <Text style={{ marginBottom: 2 }}>
                            {item?.lastname}
                          </Text>
                          <Fontisto
                            name="map-marker-alt"
                            size={25}
                            color="red"
                          />
                        </TouchableOpacity> */}
                      </Marker>
                    </>
                    // </>
                    // </Circle>
                  );
                })}
            </MapView>
          )
          // ) : (
          //   <MapView
          //     ref={ref}
          //     initialRegion={{
          //       latitude: 37.78825,
          //       longitude: -122.4324,
          //       latitudeDelta: 0.0922 + width / height,
          //       longitudeDelta: 0.0421,
          //     }}
          //     style={{ width: "100%", height: "100%" }}
          //   >
          //     {children.map((item, index) => {
          //       // console.log("item", item);
          //       return (
          //         <View style={{ flex: 1 }}>
          //           {true && (
          //             <Circle
          //               key={index}
          //               center={{
          //                 latitude: parentLatLong?.location[0]?.parentLat
          //                   ? parseFloat(parentLatLong?.location[0]?.parentLat)
          //                   : parseFloat(10),
          //                 longitude: parentLatLong?.location[0]?.parentLong
          //                   ? parseFloat(parentLatLong?.location[0]?.parentLong)
          //                   : parseFloat(10),
          //               }}
          //               radius={item?.allowedDistance || 100}
          //               strokeWidth={2}
          //               strokeColor={"#1a66ff"}
          //               fillColor={"rgba(230,238,255,0.5)"}
          //             />
          //           )}

          //           <Marker
          //             onSelect={() => console.log("pressed")}
          //             onPress={() => {
          //               console.log("ref", ref);
          //               ref.current.fitToSuppliedMarkers(
          //                 [
          //                   {
          //                     latitude: item?.latitude
          //                       ? parseFloat(item?.latitude)
          //                       : parseFloat(10),
          //                     longitude: item?.longititude
          //                       ? parseFloat(item?.longititude)
          //                       : parseFloat(10),
          //                   },
          //                 ]
          //                 // false, // not animated
          //               );
          //             }}
          //             key={index}
          //             coordinate={{
          //               latitude: item?.latitude
          //                 ? parseFloat(item?.latitude)
          //                 : parseFloat(10),
          //               longitude: item?.longititude
          //                 ? parseFloat(item?.longititude)
          //                 : parseFloat(10),
          //             }}
          //           >
          //             <TouchableOpacity
          //               onPress={() => console.log("pressed")}
          //               style={{ alignItems: "center" }}
          //             >
          //               <Text>{item?.firstname}</Text>
          //               <Text style={{ marginBottom: 2 }}>{item?.lastname}</Text>
          //               <Fontisto name="map-marker-alt" size={25} color="red" />
          //             </TouchableOpacity>
          //           </Marker>
          //         </View>
          //         // </>
          //         // </Circle>
          //       );
          //     })}
          //   </MapView>
          // )
        }
        <TouchableOpacity
          style={[
            styles.floatButton,
            { elevation: children.length == 0 ? 0 : 5 },
          ]}
          onPress={() => {
            children.length == 0
              ? Alert.alert(
                  "Add Activities",
                  "Please add a dependant to your profile before creating an activity",
                  [{ text: "OK" }]
                )
              : navigation.navigate("CreateParentActivity");
          }}
          disabled={false}
        >
          <AntDesign name="pluscircle" size={50} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: "column",
  },
  item: {
    borderRadius: 10,
    width: "96%",
    backgroundColor: "#fff",
    marginVertical: 10,
    marginHorizontal: "2%",
    padding: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
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
    width: "100%",
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
  },
  day: {
    width: 40,
    height: 40,
    backgroundColor: "#fff",
    borderWidth: 0.5,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  floatButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    shadowColor: Colors.primary,
    shadowOffset: {
      height: 10,
      width: 10,
    },
    shadowOpacity: 0.9,
    shadowRadius: 50,
    elevation: 5,
  },
  buttonText: {
    flex: 1,
    borderRadius: 8,
    fontFamily: "Gill Sans",
    textAlign: "center",
    margin: 2,
    shadowColor: "rgba(0,0,0, .4)", // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    shadowOpacity: 1, // IOS
    shadowRadius: 1, //IOS
    justifyContent: "center",
    backgroundColor: Colors.primary,
    alignItems: "center",
    flexDirection: "row",
  },
});
