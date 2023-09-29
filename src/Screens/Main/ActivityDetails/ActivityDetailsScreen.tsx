import { AppHeader } from "@/Components";
import BackgroundLayout from "@/Components/BackgroundLayout";
import { GroupParticipantsModal } from "@/Modals";
import { ParticipantLocation } from "@/Services/Activity";
import { loadToken } from "@/Storage/MainAppStorage";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Colors from "@/Theme/Colors";
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { Text } from "@ui-kitten/components";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Image, StyleSheet, Switch, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import MapView, { Marker } from "react-native-maps";
import Fontisto from "react-native-vector-icons/Fontisto";
import { useDispatch } from "react-redux";
import SockJS from "sockjs-client";
import * as Stomp from "stompjs";
import { calculateDistance } from "../../../Utils/DistanceCalculator";
const ActivityDetailsScreen = () => {
  const ref = useRef();
  const navigation = useNavigation();
  const route = useRoute();
  const activity = route?.params?.activity || null;
  const swipeableRef = useRef(null);
  const dispatch = useDispatch();
  const [initialRoute, setInitialRoute] = useState("FeaturedScreen");
  const [loading, setLoading] = useState(true);
  const [thumbnail, setThumbnail] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [selectedDependent, setSelectedDependent] = useState(null);
  const [participantsEmail, setParticipantsEmail] = useState([]);
  const [partcipants, setParticipants] = useState([]);
  const [newParticipnatsArr, setnewParticipnatsArr] = useState([]);
  const [getParticipantsIds, setParticipantsIds] = useState([]);
  const [showModal, setModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [trackingList, setTrackingList] = useState({
    // 1: {
    //   lat: 40.7128,
    //   lang: -74.006,
    //   childDeviceId: 1,
    // },
    // 2: {
    //   lat: 40.7129,
    //   lang: -74.006,
    //   childDeviceId: 2,
    // },
  });
  const [groups, setGroups] = useState({});
  const isFocused = useIsFocused();

  const getParticipantLocation = async () => {
    try {
      let res = await ParticipantLocation(activity?.activityId);
      let deviceIds = [];
      res.map((item) => {
        item?.childDeviceId && deviceIds.push(item?.childDeviceId);
      });

      setParticipantsIds(deviceIds);
      deviceIds.length > 0 &&
        turnOnTracker(activity?.activityId, deviceIds, "activity");
      // , { childDeviceId: 1 }, { childDeviceId: 2 }
      setParticipants([...res]);
    } catch (err) {
      console.log("err", err);
    }
  };
  let stompClient: any = React.createRef<Stomp.Client>();
  const turnOnTracker = async (id: any, deviceIds: any, from: any) => {
    try {
      const token = await loadToken();

      const socket = new SockJS("https://live-api.trackmykidz.com/ws-location");
      stompClient = Stomp.over(socket);
      stompClient.connect({ token }, () => {
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
        lat: messageBody?.latitude,
        lang: messageBody?.longitude,
      },
    });
  };

  useEffect(() => {
    if (isFocused) {
      getParticipantLocation();
    }
    if (selectedDependent) {
      dispatch(ChangeModalState.action({ editDependentModalVisibility: true }));
    }
  }, [selectedDependent, isFocused]);

  // [
  //   {
  //   lat,lang
  // group:false,
  // },
  //   {
  // lat:,
  // lang:,
  // group:true,
  // group:'1'
  //   }
  // ]

  // [
  //   {
  //     lat:,
  //     lang:,
  //     group:true,
  //     group:'1'
  //   }
  // ]

  useEffect(() => {
    let temp = [];
    let groups = {};
    let trackingListKeys = Object.keys(trackingList);
    trackingListKeys.map((item, index) => {
      let latitude1 = trackingList[item]?.lat;
      let longititude1 = trackingList[item]?.lang;
      for (let j = index + 1; j < trackingListKeys.length - 1; j++) {
        let nextParticipant = trackingList[trackingListKeys[j]];
        let latitude2 = nextParticipant?.lat;
        let longititude2 = nextParticipant?.lang;
        let distance = calculateDistance(
          latitude1,
          longititude1,
          latitude2,
          longititude2
        );
        const isUnderEqual100Meters = distance <= 100;
        let participant = partcipants.find(
          (pers) => pers.childDeviceId == nextParticipant.childDeviceId
        );
        if (isUnderEqual100Meters) {
          participant["group"] = true;
          participant["groupName"] = index + 1;
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

      let firstPers = partcipants.find(
        (firPer) => firPer?.childDeviceId == item
      );

      let isAnyParticipantExist = temp.find(
        (temMember) => temMember?.groupName == index + 1
      );
      if (isAnyParticipantExist) {
        firstPers["group"] = true;
        firstPers["groupName"] = index + 1;
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
    let groupedArray = [];
    let groupNames = [];

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
  }, [trackingList]);

  return (
    <BackgroundLayout title={"Participants"}>
      <AppHeader title="" hideCalendar={true} hideCenterIcon={true} />
      {selectedGroup && showModal && (
        <GroupParticipantsModal
          isVisible={showModal}
          setIsVisible={() => setModal(false)}
          participants={groups[selectedGroup]?.participants}
        />
      )}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "60%",
          alignSelf: "center",
          marginVertical: 20,
          backgroundColor: "transparent",
          padding: 10,
        }}
      >
        <Text style={{ color: Colors.white }}>List View</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#50CBC7" }}
          thumbColor={Colors.white}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => {
            setThumbnail(!thumbnail);
          }}
          value={thumbnail}
        />
        <Text style={{ color: Colors.white }}>Map View</Text>
      </View>
      <View style={styles.layout}>
        {!thumbnail ? (
          <FlatList
            data={partcipants || []}
            style={{ padding: 10, width: "100%" }}
            renderItem={({ item, index }) => (
              <View style={[styles.item]}>
                <Text
                  style={[styles.text, { fontWeight: "600" }]}
                >{`${item?.firstName} ${item?.lastName}`}</Text>
              </View>
            )}
          />
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
            // onLayout={() => {
            //   ref?.current?.fitToCoordinates(studentsEmails, {
            //     edgePadding: {
            //       top: 10,
            //       right: 10,
            //       bottom: 10,
            //       left: 10,
            //     },
            //     animated: true,
            //   });
            // }}
            style={{ flex: 1 }}
          >
            {newParticipnatsArr.map((item, index) => {
              let latitude = trackingList[item?.childDeviceId]?.lat;
              let longititude = trackingList[item?.childDeviceId]?.lang;

              return (
                <View style={{ flex: 1 }}>
                  {latitude && longititude && (
                    <Marker
                      onSelect={() => console.log("pressed")}
                      onPress={() => {
                        if (!item?.group) {
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
                        } else {
                          setModal(true);
                          setSelectedGroup(item?.groupName);
                        }
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
                      {!item?.group && (
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
                            {item?.image == "" && (
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
                                  {item?.firstName
                                    ?.substring(0, 1)
                                    ?.toUpperCase() || ""}
                                  {item?.lastName
                                    ?.substring(0, 1)
                                    ?.toUpperCase() || ""}
                                </Text>
                              </View>
                            )}
                            {item?.image != "" && (
                              <Image
                                source={{
                                  uri: item?.image,
                                }}
                                style={{
                                  height: 50,
                                  width: 50,
                                  borderRadius: 40,
                                  aspectRatio: 1.5,
                                }}
                                resizeMode="contain"
                              />
                            )}
                          </View>
                          {/* <FA5 name="map-marker" size={40} color={"red"} /> */}
                        </View>
                      )}

                      {item?.group && (
                        <TouchableOpacity
                          style={{
                            alignItems: "center",
                          }}
                        >
                          <View
                            style={{
                              // position: "absolute",
                              zIndex: 10,
                              bottom: 2,
                              // height: 80,
                              // width: 80,
                              // backgroundColor: Colors.primary,
                              // opacity: 0.7,
                            }}
                          >
                            <Text style={{ fontWeight: "bold" }}>
                              {groups[item?.groupName]?.participants?.length}
                            </Text>
                          </View>

                          <Fontisto
                            name="map-marker-alt"
                            size={25}
                            color="red"
                          />
                        </TouchableOpacity>
                      )}
                    </Marker>
                  )}
                </View>
                // </>
                // </Circle>
              );
            })}
          </MapView>
        )}
      </View>
    </BackgroundLayout>
  );
};

export default ActivityDetailsScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: Colors.newBackgroundColor,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  background: {
    width: "80%",
    borderRadius: 10,
    paddingBottom: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    backgroundColor: Colors.primary,
  },
  button: {
    paddingTop: 5,
    fontSize: 15,
    color: Colors.white,
    borderRadius: 10,
  },
});
