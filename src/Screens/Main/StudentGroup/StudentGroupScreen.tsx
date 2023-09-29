import { InstructionsModal } from "@/Modals";
import {
  DeleteGroup,
  FindGroupsByName,
  GetGroupByStudentId,
  GetGroupCount
} from "@/Services/Group";
import { getHomeScreenCacheInfo, loadToken, storeHomeScreenCacheInfo } from "@/Storage/MainAppStorage";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { StudentState } from "@/Store/StudentActivity";
import { UserState } from "@/Store/User";
import SetChatParam from "@/Store/chat/SetChatParams";
import Colors from "@/Theme/Colors";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Icon, Text } from "@ui-kitten/components";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import MapView, { Marker } from "react-native-maps";
import Entypo from "react-native-vector-icons/Entypo";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import SockJS from "sockjs-client";
import * as Stomp from "stompjs";
const StudentGroupScreen = ({ route }) => {
  const navigation = useNavigation();
  const [children, setChildren] = useState([]);
  const instructorImage = require("@/Assets/Images/approval_icon2.png");
  const dependent = route && route.params && route.params.dependent;
  const isFocused = useIsFocused();
  const [trackingList, setTrackingList] = useState({});
  const swipeableRef = useRef(null);
  const ref = useRef();
  const [groupCount, setGroupCount] = useState({});
  const dispatch = useDispatch();
  let prevOpenedRow: any;
  let row: Array<any> = [];
  const searchBarValue = useSelector(
    (state: any) => state.header.searchBarValue
  );
  const { hideCalendar, showFamilyMap, showParticipantMap } = useSelector(
    (state: { studentActivity: StudentState }) => state.studentActivity
  );
  const [studentsEmails, setStudentsEmail] = useState([]);

  const [selectedDependent, setSelectedDependent] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedInstructions, setSelectedInstructions] = useState(null);

  const currentUser = useSelector(
    (state: { user: UserState }) => state.user.item
  );

  const getGroups = async () => {
    GetGroupByStudentId(currentUser?.studentId)
      .then((res) => {
        setGroups(res);
        storeHomeScreenCacheInfo("student_groups", JSON.stringify(res));
      })
      .catch((err) => {
        console.log("Error:", err);
      });
  };
  const getCacheGroups = async () => {
    let group = await getHomeScreenCacheInfo("student_groups");
    if (group) {
      setGroups(JSON.parse(group));
    }
  };

  const getGroupCountApi = async (body: any) => {
    try {
      let temp = {};
      let res = await GetGroupCount(body);
      res.map((item) => {
        temp[item.groupId] = item;
      });
      setGroupCount({ ...groupCount, ...temp });
    } catch (err) {
      console.log("err", err);
    }
  };
  const search = (text: String) => {
    if (text == "") {
      getGroups();
    } else {
      FindGroupsByName({ groupName: text }, 0, 30)
        .then((res) => {
          setGroups(res?.result);
        })
        .catch((err) => {
          console.log("Error:", err);
        });
    }
  };
  const closeRow = (index) => {
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
      let temp = [];
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
      let res = await GetParentChildrens(referenceCode);
      let temp = [];
      let deviceIds = [];
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
      console.log("err in children", err);
    }
  };

  let stompClient: any = React.createRef<Stomp.Client>();
  const connectSockets = async (deviceIds: any) => {
    const token = await loadToken();
    const socket = new SockJS("https://live-api.trackmykidz.com/ws-location");
    stompClient = Stomp.over(socket);
    stompClient.connect({ token }, () => {
      console.log("Connected");

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

  const fetchParent = async () => {
    try {
      getChildrens(currentUser?.parentReferenceCode1);
    } catch (err) {
      console.log("err", err);
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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            dispatch(
              SetChatParam.action({
                title: item?.groupName,
                chatId: `activity_${item?.groupId}`,
                subcollection: "student",
                user: {
                  _id: currentUser?.studentId,
                  avatar: currentUser?.imageurl,
                  name: currentUser?.firstname
                    ? currentUser?.firstname[0].toUpperCase() +
                      currentUser?.firstname.slice(1) +
                      "" +
                      currentUser?.lastname[0]
                    : currentUser?.firstname + "" + currentUser?.lastname,
                },
              })
            );
            navigation.navigate("ChatScreen", {
              title: item?.groupName,
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
            onPress={() =>
              DeleteGroup(item.id)
                .then((res) => {
                  getGroups();
                })
                .catch((err) => {
                  console.log("Error:", err);
                })
            }
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
  };

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
              width: "100%",
              marginTop: 10,
              marginBottom: 20,
            }}
            renderItem={({ item, index }) => {
              let temp = [];
              let instructor = item?.instructors?.map((item) =>
                temp.push(item?.firstName)
              );
              return (
                <Swipeable
                  ref={(ref) => (row[index] = ref)}
                  onSwipeableOpen={() => closeRow(index)}
                  renderRightActions={(e) => RightActions(e, item)}
                >
                  <View style={[styles.item, { backgroundColor: "#fff" }]}>
                    <Text
                      style={[
                        styles.text,
                        {
                          fontSize: 20,
                          fontWeight: "800",
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
                          fontWeight: "700",
                          paddingLeft: 25,
                        },
                      ]}
                    >{`Instructors: ${temp.toString()}`}</Text>
                    <View style={styles.divider}>
                      <View style={{ alignItems: "center" }}>
                        <Text style={styles.text}>{`Approval`}</Text>
                        <View style={{ flexDirection: "row" }}>
                          <TouchableOpacity
                            style={styles.horizontal}
                            onPress={() => {
                              setSelectionData({
                                status: "approved",
                                type: "student",
                                group: item,
                              });
                              setShowStudentsInstructorsModal(true);
                            }}
                          >
                            <Text style={styles.footerText}>{`${
                              groupCount[item.groupId]?.countApprovedStudents ||
                              "0"
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
                              setSelectionData({
                                status: "approved",
                                type: "instructor",
                                group: item,
                              });
                              setShowStudentsInstructorsModal(true);
                            }}
                          >
                            <Text style={styles.text}>
                              {groupCount[item.groupId]
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
                              setSelectionData({
                                status: "declined",
                                type: "student",
                                group: item,
                              });
                              setShowStudentsInstructorsModal(true);
                            }}
                          >
                            <Text style={styles.text}>{`${
                              groupCount[item.groupId]?.countDeclinedStudents ||
                              "0"
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
                              setSelectionData({
                                status: "declined",
                                type: "instructor",
                                group: item,
                              });
                              setShowStudentsInstructorsModal(true);
                            }}
                          >
                            <Text style={styles.text}>
                              {groupCount[item.groupId]
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
                              setSelectionData({
                                status: "pending",
                                type: "student",
                                group: item,
                              });
                              setShowStudentsInstructorsModal(true);
                            }}
                            style={styles.horizontal}
                          >
                            <Text style={styles.text}>
                              {`${
                                groupCount[item.groupId]
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
                              setSelectionData({
                                status: "pending",
                                type: "instructor",
                                group: item,
                              });
                              setShowStudentsInstructorsModal(true);
                            }}
                          >
                            <Text style={styles.text}>
                              {groupCount[item.groupId]
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

                    <TouchableOpacity
                      onPress={() => {
                        setSelectedInstructions(item);
                        dispatch(
                          ChangeModalState.action({
                            instructionsModalVisibility: true,
                          })
                        );
                      }}
                      style={{ width: "100%", alignItems: "center" }}
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
              if (trackingList[item.childDevice]?.lat) {
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
                                // height: "100%",
                                // width: "100%",
                                borderRadius: 20,
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
                                height: 50,
                                width: 50,
                                borderRadius: 40,
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
              }
            })}
          </MapView>
        )}

        {groups.length == 0 && (
          <Text style={{ textAlign: "center", marginTop: 5 }}>
            You currently do not have any groups
          </Text>
        )}
      </View>
    </>
  );
};

export default StudentGroupScreen;

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
    minHeight: 205,
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
  horizontal: {
    flexDirection: "row",
    alignItems: "center",
  },
  divider: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: Colors.lightgray,
    paddingVertical: 10,
    marginVertical: 10,
  },
});
