import React, { useEffect, useState, useRef } from "react";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Text, Icon } from "@ui-kitten/components";
import { useIsFocused } from "@react-navigation/native";
import { StyleSheet, View, FlatList, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Colors from "@/Theme/Colors";
import Entypo from "react-native-vector-icons/Entypo";
import { LinearGradientButton } from "@/Components";
import { InstructionsModal } from "@/Modals";
import { GetActivityByStudentId, GetAllActivity } from "@/Services/Activity";
import { ParticipantLocation } from "@/Services/Activity";
import { Activity } from "@/Models/DTOs";
import { useStateValue } from "@/Context/state/State";
import { AwsLocationTracker } from "@/Services/TrackController";
import moment from "moment";
import Ionicons from "react-native-vector-icons/Ionicons";
import SetChatParam from "@/Store/chat/SetChatParams";
const ActivityScreen = ({ route }) => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const dependent = route && route.params && route.params.dependent;
  const currentUser = useSelector(
    (state: { user: UserState }) => state.user.item
  );
  const [getChildrendeviceIds, setChildrensDeviceIds] = useState([]);
  const [{ selectedDependentActivity, child }] = useStateValue();
  const swipeableRef = useRef(null);
  const dispatch = useDispatch();
  const [trackingList, setTrackingList] = useState({});
  const [activities, setActivities] = useState(selectedDependentActivity);
  const [selectedInstructions, setSelectedInstructions] = useState<Optin>(null);
  const [showParticipantMap, setParticipantMap] = useState(false);
  const [getParticipantsIds, setParticipantsIds] = useState([]);
  const [partcipants, setParticipants] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState();
  console.log("selected dependet", child);
  const RightActions = (dragX: any, item: any) => {
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
        <TouchableOpacity
          onPress={() => {
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
                      " " +
                      currentUser?.lastname[0].toUpperCase()
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
        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={() => {
            setParticipantMap(true);
            setSelectedActivity(item);
            getParticipantLocation(item?.activityId);
          }}
        >
          <Entypo size={25} color={Colors.primary} name="location-pin" />
          <Text style={styles.textStyle}>View Attendees</Text>
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
      if (deviceIds.length > 0) {
        turnOnTracker(activityId, deviceIds, "activity");
      }
      console.log("res", res);
      setParticipants(res);
    } catch (err) {
      console.log("err", err);
    }
  };

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

  const turnOffTracker = async (id: any, deviceIds: any, from: any) => {
    try {
      let body = {
        deviceIds: getParticipantsIds,
        trackerName: selectedActivity?.activityId,
        locationTrackerTrigger: false,
      };

      let res = await AwsLocationTracker(body);
    } catch (err) {
      console.log("err", err);
    }
  };
  const getActivities = async () => {
    GetActivityByStudentId(child?.studentId)
      .then((res) => {
        console.log("res---------", res);
        setActivities(res);
      })
      .catch((err) => {
        console.log("Error:", err);
      });
  };
  useEffect(() => {
    if (isFocused) {
      if (selectedActivity) {
        getActivities();
      }
    } else {
      getChildrendeviceIds.length > 0 &&
        turnOffTracker(currentUser.parentId, getChildrendeviceIds, "parent");
    }
  }, [child, isFocused]);

  return (
    <>
      {selectedInstructions && (
        <InstructionsModal
          selectedInstructions={selectedInstructions}
          setSelectedInstructions={setSelectedInstructions}
        />
      )}
      <View style={styles.layout}>
        {!showParticipantMap ? (
          <FlatList
            data={activities}
            style={{ padding: 10, width: "100%" }}
            renderItem={({ item, index }) => (
              <Swipeable
                ref={swipeableRef}
                renderRightActions={(e) => RightActions(e, item)}
              >
                <TouchableOpacity
                  onPress={() => {
                    // _dispatch({
                    //     type: actions.SET_SELECTED_ACTIVITY,
                    //     payload: item,
                    // })
                    // dispatch(
                    //     ChangeModalState.action({ rollCallModalVisibility: true }),
                    // )
                    // navigation.navigate('InstructorGroupApproval')
                  }}
                  style={[
                    styles.item,
                    {
                      backgroundColor: !item?.activity?.status
                        ? "#fff"
                        : index % 3 === 0
                        ? "lightgreen"
                        : index % 2 === 0
                        ? "#F6DDCC"
                        : "#fff",
                    },
                  ]}
                >
                  <Text style={styles.text}>{`Date: ${moment(
                    item?.activity?.scheduler?.fromDate
                  ).format("YYYY-MM-DD hh:mm:ss")}`}</Text>
                  <Text style={styles.text}>{`${
                    item?.activity?.activityType?.toLowerCase() === "activity"
                      ? "Activity"
                      : "Trip"
                  }: ${item?.activity?.activityName}`}</Text>
                  <Text
                    style={styles.text}
                  >{`Where: ${item?.activity?.venueFromName}`}</Text>
                  <Text
                    style={styles.text}
                  >{`Address: ${item?.activity?.venueFromAddress}`}</Text>
                  <Text style={styles.text}>{`Status: ${
                    item?.activity?.status ? "Active" : "Inactive"
                  }`}</Text>
                  <Text style={styles.text}>{`Students: ${
                    (item?.activity?.studentsActivity &&
                      item?.activity?.studentsActivity?.length) ||
                    0
                  }`}</Text>
                  <Text style={styles.text}>{`Instructors: ${
                    (item?.activity?.instructors &&
                      item?.activity?.instructors?.length) ||
                    0
                  }`}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedInstructions(item?.activity?.optin);
                    dispatch(
                      ChangeModalState.action({
                        instructionsModalVisibility: true,
                      })
                    );
                  }}
                  style={[
                    styles.footer,
                    {
                      backgroundColor: !item?.activity?.status
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
        ) : (
          <>
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
          </>
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
