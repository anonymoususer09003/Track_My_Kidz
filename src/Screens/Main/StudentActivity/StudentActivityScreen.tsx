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
} from "react-native";

import GeolocationAndroid from "react-native-geolocation-service";
import { useDispatch, useSelector } from "react-redux";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Colors from "@/Theme/Colors";
import { InstructionsModal } from "@/Modals";
import { GetActivityByStudentId, GetAllActivity } from "@/Services/Activity";
import Geolocation from "@react-native-community/geolocation";
import { UserState } from "@/Store/User";
import moment from "moment";
import TrackHistory from "@/Services/Parent/TrackHistory";
import { Activity, Optin } from "@/Models/DTOs";
import {
  storeHomeScreenCacheInfo,
  getHomeScreenCacheInfo,
} from "@/Storage/MainAppStorage";

import firestore from "@react-native-firebase/firestore";
import BackgroundService from "react-native-background-actions";
const StudentActivityScreen = ({ route }) => {
  const navigation = useNavigation();

  const isFocused = useIsFocused();
  const dependent = route && route.params && route.params.dependent;
  const swipeableRef = useRef(null);
  const dispatch = useDispatch();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedInstructions, setSelectedInstructions] = useState<Optin>();
  const currentUser = useSelector(
    (state: { user: UserState }) => state.user.item
  );

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
  console.log("currentUser", currentUser);
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
    const _date = moment(new Date()).format("YYYY-MM-DD");
    console.log("res889989898989889899898");
    const res = await TrackHistory(status, id, _date, latitude, longitude);
    firestore()
      .collection("students")
      .doc(JSON.stringify(currentUser.studentId))
      .set({
        email: currentUser.email,
        parentemail1: currentUser.parentemail1,
        parentemail2: currentUser.parentemail2,
        latitude,
        longitude,
      })
      .then(() => {
        console.log("User added!");
      })
      .catch((err) => {
        console.log("err", err);
      });
  };

  const handleTrackHistorySchedule = async () => {
    // if (currentUser?.childTrackHistory) {
    try {
      if (Platform.OS == "android") {
        GeolocationAndroid.getCurrentPosition(async (pos) => {
          const crd = pos.coords;
          console.log("crd", crd);
          await handleTrackHistory(
            true,
            currentUser?.studentId,
            crd.latitude,
            crd.longitude
          );
        });
      } else {
        Geolocation.getCurrentPosition(async (pos) => {
          const crd = pos.coords;
          console.log("crd", crd);
          await handleTrackHistory(
            true,
            currentUser?.studentId,
            crd.latitude,
            crd.longitude
          );
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
  useEffect(() => {
    if (isFocused) {
      getCacheActivites();
    }
  }, []);
  useEffect(() => {
    if (isFocused) {
      getActivities();
    }
  }, [isFocused]);

  const locationPermission = async () => {
    console.log("logs----");
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
        await handleTrackHistorySchedule();
      }
    } else {
      backgroundCall();
      // backgroundCall();
    }
    // handleTrackHistorySchedule();
  };

  const backgroundCall = async () => {
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
            await handleTrackHistorySchedule();
          } catch (error) {
            // console.log(error);
          }
          await sleep(30000);
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
        delay: 30000,
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
    // locationPermission();
    // return () => backgroundCall();
  }, []);

  // backgroundCall();
  const RightActions = (dragX: any, item: Activity) => (
    <View
      style={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
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

  useEffect(() => {
    if (selectedInstructions) {
      dispatch(ChangeModalState.action({ instructionsModalVisibility: true }));
    }
  }, [selectedInstructions]);

  return (
    <>
      {selectedInstructions && (
        <InstructionsModal
          selectedInstructions={selectedInstructions}
          setSelectedInstructions={setSelectedInstructions}
        />
      )}
      <View style={styles.layout}>
        {activities.length > 0 && (
          <FlatList
            data={activities}
            style={{ padding: 10, width: "100%", marginTop: 10 }}
            renderItem={({ item, index }) => (
              <Swipeable
                ref={swipeableRef}
                renderRightActions={(e) => RightActions(e, item)}
              >
                <TouchableOpacity
                  onPress={() => navigation.navigate("InstructorGroupApproval")}
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
});
