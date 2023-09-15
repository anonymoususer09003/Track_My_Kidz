import { AppHeader, Calendar } from "@/Components";
import SearchBar from "@/Components/SearchBar/SearchBar";
import { EditDependentModal, WelcomeMessageModal } from "@/Modals";
import { GetAllStudents } from "@/Services/Parent";
import FetchOne from "@/Services/User/FetchOne";
import { ModalState } from "@/Store/Modal";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { UserState } from "@/Store/User";
import Colors from "@/Theme/Colors";
import { useNavigation } from "@react-navigation/native";
import { Icon, Text } from "@ui-kitten/components";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList, StyleSheet, TouchableOpacity, View
} from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import MapView from "react-native-maps";
import Entypo from "react-native-vector-icons/Entypo";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useDispatch, useSelector } from "react-redux";

const _children = [
  {
    id: 1,
    firstName: "John",
    lastName: "Gibbs",
    type: "Trip",
    schoolName: "Grace High School",
    grade: "12th Grade",
    status: "Science Field Trip",
    approve: true,
  },
  {
    id: 2,
    firstName: "Steve",
    lastName: "Gibbs",
    type: "Activity",
    schoolName: "Grace High School",
    grade: "12th Grade",
    status: "Soccer Practice",
    approve: false,
  },
  {
    id: 3,
    firstName: "Liz",
    lastName: "Gibbs",
    type: "Trip",
    schoolName: "Grace High School",
    grade: "12th Grade",
    status: "Basket Ball Tournament",
    approve: false,
  },
];

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const swipeableRef = useRef(null);
  const dispatch = useDispatch();
  const [initialRoute, setInitialRoute] = useState("FeaturedScreen");
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState(_children);
  const [thumbnail, setThumbnail] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [selectedDependent, setSelectedDependent] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(
    moment(new Date()).month()
  );
  const [selectedDay, setSelectedDay] = useState(moment(new Date()).date());
  const currentUser = useSelector(
    (state: { user: UserState }) => state.user.item
  );

  const loadUserDetails = async () => {
    FetchOne();
  };

  const isCalendarVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.showCalendar
  );

  useEffect(() => {
    loadUserDetails();
    GetAllStudents()
      .then((res) => {
        setChildren(res.result);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    if (selectedDependent) {
      dispatch(ChangeModalState.action({ editDependentModalVisibility: true }));
    }
  }, [selectedDependent]);

  const RightActions = (dragX: any, item) => {
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
          //   onPress={pressRightAction}
          style={{
            padding: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FontAwesome size={30} color={Colors.primary} name="plane" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("StudentLocationScreen", {
              student: item,
            })
          }
          style={{
            padding: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Entypo size={30} color={Colors.primary} name="back-in-time" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedDependent(item)}
          style={{
            padding: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            style={{ width: 30, height: 30 }}
            fill={Colors.primary}
            name="edit-2"
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <WelcomeMessageModal />
      {!!selectedDependent && (
        <EditDependentModal
          selectedDependent={selectedDependent}
          setSelectedDependent={setSelectedDependent}
        />
      )}
      <AppHeader title="Home" hideCalendar />
      {isCalendarVisible && (
        <Calendar
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
        />
      )}
      <SearchBar
        searchText={searchParam}
        onChangeText={(value) => setSearchParam(value)}
        thumbnailView={thumbnail}
        onToggleChange={() => setThumbnail(!thumbnail)}
        isThumbnail
      />
      <View style={styles.layout}>
        {!thumbnail ? (
          <FlatList
            data={children}
            style={{ padding: 10, width: "100%" }}
            renderItem={({ item, index }) => (
              <Swipeable
                ref={swipeableRef}
                renderRightActions={(e) => RightActions(e, item)}
              >
                <TouchableOpacity
                  style={[
                    styles.item,
                    {
                      backgroundColor:
                        index % 3 === 0
                          ? "lightgreen"
                          : index % 2 === 0
                          ? "#F6DDCC"
                          : "#fff",
                    },
                  ]}
                  onPress={() =>
                    navigation.navigate("Activity", {
                      dependent: item,
                      setThumbnail:()=>setThumbnail(true),

                    })
                  }
                >
                  <Text
                    style={[styles.text, { fontWeight: "600" }]}
                  >{`${item.firstName} ${item.lastName}`}</Text>
                  <Text style={styles.text}>{`${item.schoolName}`}</Text>
                  <Text style={styles.text}>{`${item.grade}`}</Text>
                  <Text style={styles.text}>{`Status: ${item.status}`}</Text>
                </TouchableOpacity>
              </Swipeable>
            )}
          />
        ) : (
          <MapView
            initialRegion={{
              latitude: 37.78825,
              longitude: -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            style={{ width: "100%", height: "100%" }}
          />
        )}
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
});
