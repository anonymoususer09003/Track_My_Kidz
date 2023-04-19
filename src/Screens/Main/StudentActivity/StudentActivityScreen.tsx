import React, { useEffect, useState, useRef } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Text, Icon } from "@ui-kitten/components";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
  AppState,
  Image,
} from "react-native";
import * as Stomp from "stompjs";
import SockJS from "sockjs-client";
import MapView, { Marker, Circle } from "react-native-maps";
import GeolocationAndroid from "react-native-geolocation-service";
import { useDispatch, useSelector } from "react-redux";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Colors from "@/Theme/Colors";
import { InstructionsModal } from "@/Modals";
import { GetActivityByStudentId, GetAllActivity } from "@/Services/Activity";
import { AwsLocationTracker } from "@/Services/TrackController";
import Geolocation from "@react-native-community/geolocation";
import { UserState } from "@/Store/User";
import moment from "moment";
import ChangeStudentActivityState from "@/Store/StudentActivity/ChangeStudentActivityState";
import TrackHistory from "@/Services/Parent/TrackHistory";
import GetParentChildrens from "@/Services/Parent/GetParentChildrens";
import { Activity, Optin } from "@/Models/DTOs";
import { loadToken } from "@/Storage/MainAppStorage";

import {
  storeHomeScreenCacheInfo,
  getHomeScreenCacheInfo,
} from "@/Storage/MainAppStorage";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ParticipantLocation } from "@/Services/Activity";
import { GetUserById } from "@/Services/User";
import { StudentState } from "@/Store/StudentActivity";
import firestore from "@react-native-firebase/firestore";
import BackgroundService from "react-native-background-actions";
import SetChatParam from "@/Store/chat/SetChatParams";
const StudentActivityScreen = ({ route }) => {
  const navigation = useNavigation();

  const isFocused = useIsFocused();
  const [children, setChildren] = useState([]);
  const [originalChildren, setOriginalChildren] = useState([]);
  const [studentsEmails, setStudentsEmail] = useState([]);
  const [originalStudentsEmails, setOriginalStudentsEmail] = useState([]);
  const dependent = route && route.params && route.params.dependent;
  const swipeableRef = useRef(null);
  const dispatch = useDispatch();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedInstructions, setSelectedInstructions] = useState<Optin>();
  const [showActivityParticipant, setShowActivityParticipant] = useState(false);
  const [participantsEmail, setParticipantsEmail] = useState([]);
  const [partcipants, setParticipants] = useState([]);
  const [getChildrendeviceIds, setChildrensDeviceIds] = useState([]);
  const [getParticipantsIds, setParticipantsIds] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState();
  const [trackerName, setTrackerName] = useState();
  const [trackingList, setTrackingList] = useState({});
  const currentUser = useSelector(
    (state: { user: UserState }) => state.user.item
  );
  const { showFamilyMap, showParticipantMap } = useSelector(
    (state: { studentActivity: StudentState }) => state.studentActivity
  );

  const ref = useRef();
  let prevOpenedRow: any;
  let row: Array<any> = [];
  const getActivities = async () => {
    GetActivityByStudentId(currentUser?.studentId)
      .then((res) => {
        setActivities(res);
        storeHomeScreenCacheInfo("student_activites", JSON.stringify(res));
      })
      .catch((err) => {
        console.log("Error:", err);
      });
  };

  // useEffect(() => {
  //   try {
  //     firestore()
  //       .collection("Users")
  //       .add({
  //         name: "Ada Lovelace",
  //         age: 30,
  //       })
  //       .then(() => {
  //         console.log("User added!");
  //       })
  //       .catch((err) => {
  //         console.log("err", err);
  //       });
  //   } catch (err) {
  //     console.log("errr------", err);
  //   }
  // }, []);

  const handleTrackHistory = async (
    status: boolean,
    id: any,
    latitude: any,
    longitude: any
  ) => {
    const _date = moment(new Date()).format();

    const res = await TrackHistory(status, id, _date, latitude, longitude);
    sendCoordinates(latitude, longitude);
  };

  const handleTrackHistorySchedule = async (tracking) => {
    // if (currentUser?.childTrackHistory) {
    try {
      if (Platform.OS == "android") {
        GeolocationAndroid.getCurrentPosition(async (pos) => {
          const crd = pos.coords;
          console.log("crd", crd);

          if (tracking) {
            sendCoordinates(crd.latitude, crd.longitude);
          } else {
            await handleTrackHistory(
              true,
              currentUser?.studentId,
              crd.latitude,
              crd.longitude
            );
          }
        });
      } else {
        Geolocation.getCurrentPosition(async (pos) => {
          const crd = pos.coords;
          console.log("crd", crd);
          if (tracking) {
            sendCoordinates(crd.latitude, crd.longitude);
          } else {
            await handleTrackHistory(
              true,
              currentUser?.studentId,
              crd.latitude,
              crd.longitude
            );
          }
        });
      }
    } catch (err) {
      console.log("er99999999999999", err);
    }

    // }
  };
  const getCacheActivites = async () => {
    let activites = await getHomeScreenCacheInfo("student_activites");
    if (activites) {
      setActivities(JSON.parse(activites));
    }
  };

  const fetchParent = async () => {
    try {
      getChildrens(currentUser?.parentReferenceCode1);
    } catch (err) {
      console.log("err", err);
    }
  };

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
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        {
          title: "Background Location Permission",
          message: "TrackMyKidz App needs access to your location",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      // const granted = await PermissionsAndroid.request(
      //   PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      // );

      console.log("logs----", granted === PermissionsAndroid.RESULTS.GRANTED);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        backgroundCall();
      } else {
        backgroundCall();
      }
    } else {
      backgroundCall();
      // backgroundCall();
    }
    // handleTrackHistorySchedule();
  };
  const locationPermissionForTracking = async (tracking: any) => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        {
          title: "Background Location Permission",
          message: "TrackMyKidz App needs access to your location",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      // const granted = await PermissionsAndroid.request(
      //   PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      // );

      console.log("logs----", granted === PermissionsAndroid.RESULTS.GRANTED);
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

  const backgroundCall = async (tracking) => {
    const sleep = (time) =>
      new Promise((resolve) => setTimeout(() => resolve(), time));

    // You can do anything in your task such as network requests, timers and so on,
    // as long as it doesn't touch UI. Once your task completes (i.e. the promise is resolved),
    // React Native will go into "paused" mode (unless there are other tasks running,
    // or there is a foreground app).
    const veryIntensiveTask = async (taskDataArguments) => {
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
          await sleep(tracking ? 2000 : 900000);
        }
      });

      // await sleep(delay);
    };

    const options = {
      taskName: "Example",
      taskTitle: "TrackMyKidz",
      taskDesc: "Tracking your Location",
      taskIcon: {
        name: "ic_launcher",
        type: "mipmap",
      },
      color: "#ff00ff",
      linkingURI: "yourSchemeHere://chat/jane", // See Deep Lking for more info
      parameters: {
        delay: tracking ? 2000 : 900000,
      },
    };
    BackgroundService.on("expiration", () => {
      console.log("I am being closed :(");
    });

    // await BackgroundService.start(veryIntensiveTask, options);
    await BackgroundService.start(veryIntensiveTask, options);
    await BackgroundService.updateNotification({
      taskDesc: "Tracking Location",
    }); // Only Android, iOS will ignore this call
    // iOS will also run everything here in the background until .stop() is called
    // await BackgroundService.stop();
  };

  useEffect(() => {
    locationPermission();
    // return () => backgroundCall();
  }, []);

  // backgroundCall();
  console.log("trackingList", trackingList);
  const RightActions = (dragX: any, item: Activity) => (
    <View
      style={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <TouchableOpacity
        style={styles.buttonStyle}
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
          // getParticipantLocation(item?.activityId);
        }}
      >
        <Entypo size={25} color={Colors.primary} name="location-pin" />
        <Text style={styles.textStyle}>View Attendees</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          prevOpenedRow?.close();

          dispatch(
            SetChatParam.action({
              title: item?.activityName,
              chatId: `activity_${item?.activityId}`,
              subcollection: "student",
              user: {
                _id: currentUser?.studentId,
                avatar: currentUser?.imageurl,
                name: currentUser?.firstname
                  ? currentUser?.firstname[0].toUpperCase() +
                    currentUser?.firstname.slice(1) +
                    "" +
                    currentUser?.lastname[0]?.toUpperCase()
                  : currentUser?.firstname + "" + currentUser?.lastname,
              },
            })
          );
          navigation.navigate("ChatScreen", {
            title: item?.activityName,
            showHeader: true,
          });
        }}
        style={{
          padding: 5,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons size={25} color={Colors.primary} name="chatbox-ellipses" />
      </TouchableOpacity>
      {!item.status && (
        <TouchableOpacity
          style={{
            padding: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            style={{ width: 30, height: 30 }}
            fill={Colors.primary}
            name="trash"
          />
        </TouchableOpacity>
      )}
    </View>
  );

  const getChildrens = async (referenceCode: any) => {
    try {
      let res = await GetParentChildrens(referenceCode);
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
      connectSockets(deviceIds);
      setOriginalChildren(res);
      setChildrensDeviceIds(deviceIds);
      setOriginalStudentsEmail(temp);
      setStudentsEmail(temp);
      setChildren(res);
    } catch (err) {
      console.log("err in children", err);
    }
  };
  const connectSockets = async (deviceIds: any) => {
    const token = await loadToken();
    const socket = new SockJS("https://live-api.trackmykidz.com/ws-location");
    stompClient = Stomp.over(socket);
    stompClient.connect({ token }, () => {
      console.log("Connected");
      locationPermissionForTracking(true);
      deviceIds.map((item) => {
        stompClient.subscribe(`/device/${item}`, subscriptionCallback);
      });
    });
  };
  const subscriptionCallback = (subscriptionMessage: any) => {
    const messageBody = JSON.parse(subscriptionMessage.body);
    console.log("Update Received", messageBody);

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
      "/socket/ws-location",
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

  return (
    <>
      {selectedInstructions && (
        <InstructionsModal
          selectedInstructions={selectedInstructions}
          setSelectedInstructions={setSelectedInstructions}
        />
      )}
      {!showFamilyMap ? (
        <View style={styles.layout}>
          {activities.length > 0 && (
            <FlatList
              data={activities}
              style={{ padding: 10, width: "100%", marginTop: 10 }}
              renderItem={({ item, index }) => (
                <Swipeable
                  ref={(ref) => (row[index] = ref)}
                  onSwipeableOpen={() => closeRow(index)}
                  renderRightActions={(e) => RightActions(e, item)}
                >
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("InstructorGroupApproval")
                    }
                    style={[
                      styles.item,
                      {
                        backgroundColor: !item?.status
                          ? "#fff"
                          : index % 3 === 0
                          ? "lightgreen"
                          : index % 2 === 0
                          ? "#F6DDCC"
                          : "#fff",
                      },
                    ]}
                  >
                    <Text
                      style={styles.text}
                    >{`Date: ${item?.scheduler?.fromDate}`}</Text>
                    <Text
                      style={styles.text}
                    >{`Activity: ${item?.activityName}`}</Text>
                    <Text
                      style={styles.text}
                    >{`Where: ${item?.venueToName}`}</Text>
                    <Text
                      style={styles.text}
                    >{`Address: ${item?.venueToAddress}`}</Text>
                    <Text style={styles.text}>{`Status: ${
                      item?.status ? "Active" : "Inactive"
                    }`}</Text>
                    <Text style={styles.text}>{`Students: ${
                      (item?.students && item?.students?.length) || 0
                    }`}</Text>
                    <Text style={styles.text}>{`Instructors: ${
                      (item?.instructors && item?.instructors?.length) || 0
                    }`}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedInstructions(item.optin);
                    }}
                    style={[
                      styles.footer,
                      {
                        backgroundColor: !item?.status
                          ? "#fff"
                          : index % 3 === 0
                          ? "lightgreen"
                          : index % 2 === 0
                          ? "#F6DDCC"
                          : "#fff",
                      },
                    ]}
                  >
                    <Text
                      style={styles.text}
                    >{`Instructions / Disclaimer / Agreement`}</Text>
                  </TouchableOpacity>
                </Swipeable>
              )}
            />
          )}
          {activities.length == 0 && (
            <Text style={{ textAlign: "center", marginTop: 5 }}>
              You currently do not have any activities
            </Text>
          )}
        </View>
      ) : showParticipantMap ? (
        <>
          {partcipants.map((item, index) => {
            // console.log("item", item);
            return (
              <View style={{ flex: 1 }}>
                <Marker
                  onSelect={() => console.log("pressed")}
                  onPress={() => {
                    let latitude = trackingList[item.childDevice]?.lat;
                    let longititude = trackingList[item.childDevice]?.lang;
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
                    latitude: latitude ? parseFloat(latitude) : parseFloat(10),
                    longitude: longititude
                      ? parseFloat(longititude)
                      : parseFloat(10),
                  }}
                >
                  <TouchableOpacity
                    onPress={() => console.log("pressed")}
                    style={{ alignItems: "center" }}
                  >
                    <Text>{item?.firstName}</Text>
                    <Text style={{ marginBottom: 2 }}>{item?.lastName}</Text>
                    <Fontisto name="map-marker-alt" size={25} color="red" />
                  </TouchableOpacity>
                </Marker>
              </View>
              // </>
              // </Circle>
            );
          })}
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
              (item) => trackingList[item.childDevice]?.lat != null
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
          {children.map((item, index) => {
            let latitude = trackingList[item.childDevice]?.lat;
            let longititude = trackingList[item.childDevice]?.lang;
            // console.log("item", item);
            return (
              <>
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
                    latitude: latitude ? parseFloat(latitude) : parseFloat(10),
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
                            {item?.firstname?.substring(0, 1)?.toUpperCase() ||
                              ""}
                            {item?.lastname?.substring(0, 1)?.toUpperCase() ||
                              ""}
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
      )}
    </>
  );
};

export default StudentActivityScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: "column",
  },
  item: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: "96%",
    backgroundColor: "#fff",
    marginTop: 10,
    marginHorizontal: "2%",
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  footer: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    width: "96%",
    backgroundColor: "#fff",
    marginHorizontal: "2%",
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    marginVertical: 4,
  },
  buttonStyle: {
    padding: 5,
    alignItems: "center",
    //   justifyContent: "center",
    //   padding: 5,
    width: "100%",
    height: 50,
    backgroundColor: Colors.tintgray,
    borderRadius: 4,
    flexDirection: "row",
    paddingLeft: 20,
    marginBottom: 10,
  },
});
