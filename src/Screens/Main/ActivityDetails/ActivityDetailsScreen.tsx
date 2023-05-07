import React, { useEffect, useState, useRef } from "react";
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { Text, Icon } from "@ui-kitten/components";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Switch,
} from "react-native";
import { loadToken } from "@/Storage/MainAppStorage";
import * as Stomp from "stompjs";
import SockJS from "sockjs-client";
import { AppHeader } from "@/Components";
import Fontisto from "react-native-vector-icons/Fontisto";
import messaging from "@react-native-firebase/messaging";
import { UpdateDeviceToken } from "@/Services/User";
import { useDispatch, useSelector } from "react-redux";
import ChangeSearchString from "@/Store/Blogs/ChangeSearchString";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { navigateAndSimpleReset } from "@/Navigators/Functions";
import { WelcomeMessageModal, EditDependentModal } from "@/Modals";
import SearchBar from "@/Components/SearchBar/SearchBar";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Colors from "@/Theme/Colors";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { LinearGradientButton } from "@/Components";
import MapView, { Marker } from "react-native-maps";
import { ParticipantLocation } from "@/Services/Activity";
import { AwsLocationTracker } from "@/Services/TrackController";
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
  const [getParticipantsIds, setParticipantsIds] = useState([]);
  const [trackingList, setTrackingList] = useState({});
  const isFocused = useIsFocused();

  const getParticipantLocation = async () => {
    try {
      let res = await ParticipantLocation(activity?.activityId);
      let deviceIds = [];
      res.map((item) => {
        item.deviceId && deviceIds.push(item.deviceId);
      });

      setParticipantsIds(deviceIds);
      deviceIds.length > 0 &&
        turnOnTracker(activity?.activityId, deviceIds, "activity");
      console.log("res", res);
      setParticipants(res);
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

  useEffect(() => {
    if (isFocused) {
      getParticipantLocation();
    }
    if (selectedDependent) {
      dispatch(ChangeModalState.action({ editDependentModalVisibility: true }));
    }
  }, [selectedDependent, isFocused]);

  return (
    <>
      <AppHeader title="" hideCalendar={true} />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "60%",
          alignSelf: "center",
          marginVertical: 20,
        }}
      >
        <Text>List View</Text>
        <Switch
          style={{ marginLeft: 20 }}
          trackColor={{ false: "#767577", true: "#50CBC7" }}
          thumbColor={Colors.white}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => {
            setThumbnail(!thumbnail);
          }}
          value={thumbnail}
        />
        <Text>Map View</Text>
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
                >{`${item.firstName} ${item.lastName}`}</Text>
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
      <View
        style={{
          position: "absolute",
          bottom: 30,
          left: 0,
          right: 0,
          alignItems: "center",
        }}
      >
        <View style={styles.background}>
          <TouchableOpacity
            style={[styles.background]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.button}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default ActivityDetailsScreen;

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
