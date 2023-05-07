import React, { useEffect, useState, useRef } from "react";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Text, Icon } from "@ui-kitten/components";
import { useIsFocused } from "@react-navigation/native";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { actions } from "@/Context/state/Reducer";
import { useDispatch, useSelector } from "react-redux";
import { loadToken } from "@/Storage/MainAppStorage";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Colors from "@/Theme/Colors";
import Entypo from "react-native-vector-icons/Entypo";
import { LinearGradientButton } from "@/Components";
import { InstructionsModal, ShowInstructorsStudentsModal } from "@/Modals";
import { GetActivityByStudentId, GetActivitesCount } from "@/Services/Activity";
import { ParticipantLocation } from "@/Services/Activity";
import { Activity } from "@/Models/DTOs";
import { useStateValue } from "@/Context/state/State";
import { AwsLocationTracker } from "@/Services/TrackController";
import moment from "moment";
import Ionicons from "react-native-vector-icons/Ionicons";
import SetChatParam from "@/Store/chat/SetChatParams";
import axios from "axios";
import MapView from "react-native-maps";
import SockJS from "sockjs-client";
import * as Stomp from "stompjs";
const ActivityScreen = ({ route }) => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const swipeableRef = useRef(null);
  const [, _dispatch] = useStateValue();
  const searchBarValue = useSelector(
    (state: any) => state.header.searchBarValue
  );
  const dispatch = useDispatch();
  let prevOpenedRow: any;
  let row: Array<any> = [];
  const [showStudentsInstructorsModal, setShowStudentsInstructorsModal] =
    useState(false);
  const [selectionData, setSelectionData] = useState({
    type: "student",
    status: "pending",
  });
  const instructorImage = require("@/Assets/Images/approval_icon2.png");
  const dependent = route && route.params && route.params.dependent;
  const currentUser = useSelector(
    (state: { user: UserState }) => state.user.item
  );
  const cancelToken = axios.CancelToken;
  const source = cancelToken.source();
  const [activitiesCount, setActivitiesCount] = useState({});
  const [getChildrendeviceIds, setChildrensDeviceIds] = useState([]);
  const [{ selectedDependentActivity, child }] = useStateValue();
  const [originalActivities, setOriginalActivities] = useState<Activity[]>([]);
  const [trackingList, setTrackingList] = useState({});
  const [activities, setActivities] = useState(selectedDependentActivity);
  const [selectedInstructions, setSelectedInstructions] = useState<Optin>(null);
  const [showParticipantMap, setParticipantMap] = useState(false);
  const [getParticipantsIds, setParticipantsIds] = useState([]);
  const [partcipants, setParticipants] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState();

  const RightActions = (dragX: any, item: any) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    return (
      <View
        style={{
          // flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            dispatch(
              SetChatParam.action({
                title: item?.activityName,
                chatId: `activity_${item?.activityId}`,
                subcollection: "parent",
                user: {
                  _id: currentUser?.parentId,
                  avatar:
                    currentUser?.imageurl ||
                    "https://pictures-tmk.s3.amazonaws.com/images/image/man.png",
                  name: currentUser?.firstname
                    ? currentUser?.firstname[0].toUpperCase() +
                      currentUser?.firstname.slice(1) +
                      " " +
                      currentUser?.lastname[0].toUpperCase()
                    : currentUser?.firstname + "" + currentUser?.lastname,
                },
              })
            );
            navigation.navigate("ChatScreen", {
              title: item?.activityName,
              receiverUser: {},
              chatId: 1,
              showHeader: true,
              fromChat: true,
            });
          }}
          style={{
            padding: 5,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons size={40} color={Colors.primary} name="chatbox-ellipses" />
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
              style={{ width: 40, height: 40 }}
              fill={Colors.primary}
              name="trash"
            />
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
    );
  };
  const getParticipantLocation = async (activityId: any) => {
    try {
      let res = await ParticipantLocation(activityId);
      let deviceIds = [];
      res.map((item) => {
        item.deviceId && deviceIds.push(item.deviceId);
      });

      setParticipantsIds(deviceIds);
      connectSockets(deviceIds);
      console.log("res", res);
      setParticipants(res);
    } catch (err) {
      console.log("err", err);
    }
  };

  const getActivities = async () => {
    GetActivityByStudentId(child?.studentId)
      .then((res) => {
        setActivities(res);
        setOriginalActivities(res);
      })
      .catch((err) => {
        console.log("Error:", err);
      });
  };

  const getActivityesCountApi = async (body: any) => {
    try {
      let res = await GetActivitesCount(body, {
        cancelToken: source.token,
      });
      let temp = {};
      res.map((item) => {
        temp[item.activityId] = item;
      });
      console.log("res", res);
      setActivitiesCount({ ...activitiesCount, ...temp });
    } catch (err) {
      console.log("err", err);
    }
  };
  const closeRow = (index) => {
    console.log(index);
    if (prevOpenedRow && prevOpenedRow !== row[index]) {
      prevOpenedRow.close();
    }
    prevOpenedRow = row[index];
  };
  let stompClient: any = React.createRef<Stomp.Client>();
  const connectSockets = async (deviceIds: any) => {
    try {
      const token = await loadToken();

      const socket = new SockJS("https://live-api.trackmykidz.com/ws-location");
      stompClient = Stomp.over(socket);
      stompClient.connect({ token }, () => {
        console.log("Connected");
        deviceIds.map((item) => {
          stompClient.subscribe(`/device/${item}`, subscriptionCallback);
        });
      });
    } catch (err) {
      console.log("Error:", err);
    }
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
    console.log("Update Received", messageBody);
  };

  const search = (text: String) => {
    let allActivities = { ...activities };

    let temp = originalActivities?.filter((item, index) =>
      item.activityName.toLowerCase().includes(text.toLowerCase())
    );
    allActivities = temp;
    setActivities(allActivities);
  };

  useEffect(() => {
    if (isFocused) {
      // if (selectedActivity) {
      getActivities();
      // }
    }
  }, [child, isFocused]);

  useEffect(() => {
    if (isFocused) {
      let temp = [];
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
  return (
    <>
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
        {!showParticipantMap ? (
          <FlatList
            data={activities}
            style={{
              padding: 10,
              width: "100%",
              marginTop: 10,
            }}
            renderItem={({ item, index }) => (
              <Swipeable
                ref={(ref) => (row[index] = ref)}
                // ref={swipeableRef}

                onSwipeableOpen={() => closeRow(index)}
                renderRightActions={(e) => RightActions(e, item, index)}
              >
                <View
                  style={[
                    styles.item,
                    {
                      backgroundColor: "#fff",
                    },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate("InstructorActivityDetail", {
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
                          fontWeight: "800",
                          paddingLeft: 25,
                        },
                      ]}
                    >
                      {item?.activityName}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingBottom: 20,
                        borderBottomWidth: 0.5,
                        paddingHorizontal: 10,
                        borderColor: Colors.borderGrey,
                      }}
                    >
                      <Image
                        source={require("@/Assets/Images/circle-dashed.png")}
                        style={{
                          height: 40,
                          width: 40,
                          resizeMode: "contain",
                          // marginRight: 10,
                        }}
                      />
                      <View>
                        <Text style={styles.text}>{`${moment(
                          item?.fromDate == "string"
                            ? new Date()
                            : item?.fromDate
                        ).format("YYYY-MM-DD")} at ${moment(
                          item?.fromDate == "string"
                            ? new Date()
                            : item?.fromDate
                        )
                          .subtract("hours", 5)
                          .format("hh:mm a")} `}</Text>
                        <Text style={styles.text}>{`${moment(
                          item?.toDate == "string" ? new Date() : item?.toDate
                        ).format("YYYY-MM-DD")} at ${moment(
                          item?.toDate == "string" ? new Date() : item?.toDate
                        )
                          .subtract("hours", 5)
                          .format("hh:mm a")} `}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-around",
                    }}
                  >
                    <View style={{ alignItems: "center" }}>
                      <Text style={styles.text}>{`Approval`}</Text>
                      <View style={{ flexDirection: "row" }}>
                        <TouchableOpacity
                          style={styles.horizontal}
                          onPress={() => {
                            _dispatch({
                              type: actions.SET_SELECTED_ACTIVITY,
                              payload: item,
                            });
                            setSelectionData({
                              status: "approved",
                              type: "student",
                            });
                            setShowStudentsInstructorsModal(true);
                          }}
                        >
                          <Text style={styles.footerText}>{`${
                            activitiesCount[item.activityId]
                              ?.countApprovedStudents || "0"
                          }`}</Text>
                          <Entypo
                            name="book"
                            color={Colors.primary}
                            size={15}
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
                              status: "approved",
                              type: "instructor",
                            });
                            setShowStudentsInstructorsModal(true);
                          }}
                        >
                          <Text style={styles.text}>
                            {activitiesCount[item.activityId]
                              ?.countApprovedInstructors || "0"}
                          </Text>
                          <Image
                            source={instructorImage}
                            style={styles.iconImages}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={{ alignItems: "center" }}>
                      <Text style={styles.footerText}>{`Declined`}</Text>
                      <View style={{ flexDirection: "row" }}>
                        <TouchableOpacity
                          style={styles.horizontal}
                          onPress={() => {
                            _dispatch({
                              type: actions.SET_SELECTED_ACTIVITY,
                              payload: item,
                            });
                            setSelectionData({
                              status: "declined",
                              type: "student",
                            });
                            setShowStudentsInstructorsModal(true);
                          }}
                        >
                          <Text style={styles.text}>{`${
                            activitiesCount[item.activityId]
                              ?.countDeclinedStudents || "0"
                          }`}</Text>
                          <Entypo
                            name="book"
                            color={Colors.primary}
                            size={15}
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
                              status: "declined",
                              type: "instructor",
                            });
                            setShowStudentsInstructorsModal(true);
                          }}
                        >
                          <Text style={styles.text}>
                            {activitiesCount[item.activityId]
                              ?.countDeclinedInstructors || "0"}
                          </Text>
                          <Image
                            source={instructorImage}
                            style={styles.iconImages}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={{ alignItems: "center" }}>
                      <Text style={styles.footerText}>{`Pending`}</Text>
                      <View style={{ flexDirection: "row" }}>
                        <TouchableOpacity
                          onPress={() => {
                            _dispatch({
                              type: actions.SET_SELECTED_ACTIVITY,
                              payload: item,
                            });
                            setSelectionData({
                              status: "pending",
                              type: "student",
                            });
                            setShowStudentsInstructorsModal(true);
                          }}
                          style={styles.horizontal}
                        >
                          <Text style={styles.text}>
                            {`${
                              activitiesCount[item.activityId]
                                ?.countPendingStudents || "0"
                            }`}
                          </Text>
                          <Entypo
                            name="book"
                            color={Colors.primary}
                            size={15}
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
                              status: "pending",
                              type: "instructor",
                            });
                            setShowStudentsInstructorsModal(true);
                          }}
                        >
                          <Text style={styles.text}>
                            {activitiesCount[item.activityId]
                              ?.countPendingInstructors || "0"}
                            {/* {item.countPendingInstructors || `0`} */}
                          </Text>
                          <Image
                            source={instructorImage}
                            style={styles.iconImages}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </Swipeable>
            )}
          />
        ) : (
          <MapView style={{ flex: 1 }}>
            {partcipants.map((item, index) => {
              // console.log("item", item);
              return (
                <View style={{ flex: 1 }}>
                  <Marker
                    onSelect={() => console.log("pressed")}
                    onPress={() => {
                      let latitude = trackingList[item.deviceId].lat;
                      let longititude = trackingList[item.deviceId].lang;
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
          </MapView>
        )}
      </View>
    </>
  );
};

export default ActivityScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: Colors.newBackgroundColor,
  },
  item: {
    borderRadius: 15,
    width: "96%",
    backgroundColor: "#fff",
    marginTop: 10,
    marginHorizontal: "2%",
    // paddingHorizontal: 10,
    paddingTop: 10,
    height: 175,
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
    fontSize: 13,
    marginVertical: 4,
  },

  iconImages: {
    height: 15,
    width: 15,
    resizeMode: "contain",
    marginLeft: 5,
    marginRight: 5,
  },
  footerText: {
    fontSize: 13,
    marginVertical: 2,
  },
  horizontal: {
    flexDirection: "row",
    alignItems: "center",
  },
});
