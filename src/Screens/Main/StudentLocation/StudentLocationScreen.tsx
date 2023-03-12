import React, { useEffect, useState, useRef } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Text, Icon, Select, SelectItem } from "@ui-kitten/components";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { AppHeader } from "@/Components";
import { useDispatch, useSelector } from "react-redux";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import {
  WelcomeMessageModal,
  EditDependentModal,
  OtherTrackingModal,
} from "@/Modals";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import SearchBar from "@/Components/SearchBar/SearchBar";
import Colors from "@/Theme/Colors";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Entypo from "react-native-vector-icons/Entypo";
import Fontisto from "react-native-vector-icons/Fontisto";
import MapView, { Marker, Circle } from "react-native-maps";
import { ModalState } from "@/Store/Modal";
import moment from "moment";
import { Calendar } from "@/Components";
import { UserState } from "@/Store/User";
import { GetAllStudents } from "@/Services/Parent";
import FetchOne from "@/Services/User/FetchOne";
import { parse } from "date-fns";

const StudentLocationScreen = () => {
  const route = useRoute();
  console.log("route.params", route.params);
  const { student, parent } = route.params;
  const navigation = useNavigation();

  const dispatch = useDispatch();

  const [thumbnail, setThumbnail] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [selectedDependent, setSelectedDependent] = useState(null);
  const [trackHistroy, setTrackHistory] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(
    moment(new Date()).month()
  );
  const [selectedDay, setSelectedDay] = useState(moment().format("D"));
  const currentUser = useSelector(
    (state: { user: UserState }) => state.user.item
  );

  const isCalendarVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.showCalendar
  );
  const filterHistory = (month: any, day: any) => {
    let activities = [...student.trackHistory];
    console.log("month", month);
    console.log("day", day);

    let temp = [];
    activities.map((item, index) => {
      let activmonth = moment(item?.date).format("M");

      let activeday = moment(item.date).format("D");
      if (activeday == day && activmonth == month) {
        temp.push(item);
      }
      console.log("month-", activmonth);
      console.log("day-", activeday);
    });
    setTrackHistory(temp);
  };

  useEffect(() => {
    if (selectedDependent) {
      dispatch(ChangeModalState.action({ editDependentModalVisibility: true }));
    }
  }, [selectedDependent]);

  return (
    <>
      <OtherTrackingModal />
      <WelcomeMessageModal />
      {!!selectedDependent && (
        <EditDependentModal
          selectedDependent={selectedDependent}
          setSelectedDependent={setSelectedDependent}
        />
      )}
      <AppHeader
        hideCalendar={thumbnail || false}
        title={`${student?.firstname || ""} History`}
        isStack
      />
      {isCalendarVisible && (
        <Calendar
          selectedMonth={selectedMonth}
          setSelectedMonth={(value) => {
            if (
              moment().format("M") <= value + 1 ||
              parseInt(moment().format("M")) - 1 == value + 1
            ) {
              setSelectedMonth(value);
              filterHistory(value, selectedDay);
            } else {
              Toast.show({
                type: "success",
                position: "top",
                text1: `History Tracker is only for the last 30 days`,
              });
            }
          }}
          selectedDay={parseInt(selectedDay)}
          setSelectedDay={(value) => {
            setSelectedDay(value);
            filterHistory(selectedMonth, value);
          }}
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
        isThumbnail
        isThumbnailOnly
      />
      <View style={styles.layout}>
        {!thumbnail ? (
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginVertical: 10,
              }}
            >
              <View style={{ width: "33.33%" }}>
                <Text style={{ textAlign: "center" }}>Time</Text>
              </View>
              <View style={{ width: "33.33%" }}>
                <Text style={{ textAlign: "center" }}>Latitude</Text>
              </View>
              <View style={{ width: "33.33%" }}>
                <Text style={{ textAlign: "center" }}>Longitude</Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                height: 30,
              }}
            >
              <View
                style={[
                  styles.rowItem,
                  { backgroundColor: "#cccccc", width: "38%" },
                ]}
              >
                <Text>{moment(new Date()).format("hh:mm")}</Text>
              </View>
              <View style={[styles.rowItem, { backgroundColor: "#cccccc" }]}>
                <Text>{student?.latitude}</Text>
              </View>
              <View style={[styles.rowItem, { backgroundColor: "#cccccc" }]}>
                <Text>{student?.longititude}</Text>
              </View>
            </View>

            {student &&
              student?.trackHistory &&
              student?.trackHistory?.length > 0 &&
              trackHistroy.map((item, index) => (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    height: 30,
                  }}
                >
                  <View
                    style={[
                      styles.rowItem,
                      {
                        backgroundColor: index / 2 === 1 && "#cccccc",
                        width: "38%",
                      },
                    ]}
                  >
                    <Text>{moment(item?.date).format("hh:mm")}</Text>
                  </View>
                  <View
                    style={[
                      styles.rowItem,
                      { backgroundColor: index / 2 === 1 && "#cccccc" },
                    ]}
                  >
                    <Text>{item?.latitude}</Text>
                  </View>
                  <View
                    style={[
                      styles.rowItem,
                      { backgroundColor: index / 2 === 1 && "#cccccc" },
                    ]}
                  >
                    <Text>{item?.longititude}</Text>
                  </View>
                </View>
              ))}
          </View>
        ) : (
          <MapView
            initialRegion={{
              latitude: parseFloat(student?.latitude),
              longitude: parseFloat(student?.longititude),
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            style={{ width: "100%", height: "100%" }}
          >
            <>
              {true && (
                <Circle
                  center={{
                    latitude: parent?.location[0]?.parentLat
                      ? parseFloat(parent?.location[0]?.parentLat)
                      : parseFloat(10),
                    longitude: parent?.location[0]?.parentLong
                      ? parseFloat(parent?.location[0]?.parentLong)
                      : parseFloat(10),
                  }}
                  radius={student?.allowedDistance || 100}
                  strokeWidth={2}
                  strokeColor={"#1a66ff"}
                  fillColor={"rgba(230,238,255,0.5)"}
                />
              )}
              <Marker
                coordinate={{
                  latitude: parseFloat(student?.latitude),
                  longitude: parseFloat(student?.longititude),
                }}
              >
                <View style={{ alignItems: "center" }}>
                  <Text>{student.firstname}</Text>

                  <Fontisto name="map-marker-alt" size={25} color="red" />
                </View>
              </Marker>
            </>
          </MapView>
        )}
      </View>
    </>
  );
};

export default StudentLocationScreen;

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
  rowItem: {
    width: "31%",
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});
