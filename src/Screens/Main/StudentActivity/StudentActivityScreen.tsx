import React, { useEffect, useState, useRef } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Text, Icon } from "@ui-kitten/components";
import { StyleSheet, View, FlatList, TouchableOpacity } from "react-native";
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

  const handleTrackHistory = async (
    status: boolean,
    id: any,
    latitude: any,
    longitude: any
  ) => {
    const _date = moment(new Date()).format("YYYY-MM-DD");
    await TrackHistory(status, id, _date, latitude, longitude);
  };

  const handleTrackHistorySchedule = () => {
    if (currentUser?.childTrackHistory) {
      setTimeout(() => {
        Geolocation.getCurrentPosition(async (pos) => {
          const crd = pos.coords;
          await handleTrackHistory(
            true,
            currentUser?.studentId,
            crd.latitude,
            crd.longitude
          );
        });
      }, 300000);
    }
  };
  const getCacheActivites = async () => {
    let activites = await getHomeScreenCacheInfo("student_activites");
    if (activites) {
      setActivities(JSON.parse(activites));
    }
  };
  useEffect(() => {
    getCacheActivites();
  }, [isFocused]);
  useEffect(() => {
    getActivities();
  }, [isFocused]);

  useEffect(() => {
    handleTrackHistorySchedule();
  }, []);

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
