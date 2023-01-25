import React, { useEffect, useState, useRef } from "react";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { Text, CheckBox, Icon } from "@ui-kitten/components";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
// import axios from "axios";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Colors from "@/Theme/Colors";
import Entypo from "react-native-vector-icons/Entypo";
import Ionicons from "react-native-vector-icons/Ionicons";
import AntDesign from "react-native-vector-icons/AntDesign";
import { LinearGradientButton } from "@/Components";
import moment from "moment";
import { ApproveActivityModal } from "@/Modals";
import { InstructionsModal, DeclineActivityModal } from "@/Modals";
import {
  GetAllActivity,
  GetActivitiesByInsructorId,
  InstructorUpdateStatus,
} from "@/Services/Activity";
import {
  GetGroupByInstructorId,
  UpdateInstructorGroupStatus,
} from "@/Services/Group";
import User from "@/Store/User";
import { loadUserId, loadUserType, loadId } from "@/Storage/MainAppStorage";
import { useStateValue } from "@/Context/state/State";
import { actions } from "@/Context/state/Reducer";
import axios from "axios";
const _students = [
  {
    name: "Dylan B.",
    selected: false,
  },
  {
    name: "Peter C.",
    selected: false,
  },
  {
    name: "James B.",
    selected: false,
  },
  {
    name: "Mark K.",
    selected: false,
  },
  {
    name: "John B.",
    selected: false,
  },
];

const InstructorGroupPendingScreen = ({ route }) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const swipeableRef = useRef(null);
  const [pageGroup, pageNumberGroup] = useState(0);
  const [pageSizeGroup, setPageSizeGroup] = useState(15);
  const [totalRecordsGroup, setTotalRecordsGroup] = useState(0);
  const dispatch = useDispatch();
  const [students, setStudents] = useState(_students);
  const approveActivityModalVisibility = useSelector(
    (state: { modal: any }) => state.modal.approveActivityModalVisibility
  );
  const [selectAll, setSelectAll] = useState(false);
  const [activities, setActivities] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activity, setActivity] = useState(null);
  const [declineActivity, setDeclineActivity] = useState(null);
  const [selectedInstructions, setSelectedInstructions] = useState(null);
  const [{ instructorDetail: instructorDetail }, _dispatch] = useStateValue();
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      const data = [...students];
      const _data = [];
      data.forEach((i) =>
        _data.push({
          name: i.name,
          selected: true,
        })
      );
      setStudents(_data);
    } else {
      const data = [...students];
      const _data = [];
      data.forEach((i) =>
        _data.push({
          name: i.name,
          selected: false,
        })
      );
      setStudents(_data);
    }
  };
  // console.log("instructorDetail", instructorDetail);
  const getActivities = async () => {
    const userId = await loadUserId();
    console.log("userId", userId);

    GetActivitiesByInsructorId(userId, "pending")
      .then((res) => {
        console.log("res", res.data);
        const data =
          res.data &&
          res.data.map((item) => ({
            ...item,
            // scheduler: {
            //   fromDate: new Date(item.scheduler.fromDate),
            // },
          }));
        // .sort((a, b) => b?.scheduler.date - a?..date);
        setActivities({
          result: data,
        });
      })
      .catch((err) => {
        console.log("getActivities Error:", err);
      });
  };
  const getGroup = async () => {
    GetGroupByInstructorId(instructorDetail?.instructorId, "pending")
      .then((res) => {
        const data =
          res &&
          res.map((item) => ({
            ...item,
            // scheduler: {
            //   fromDate: new Date(item.scheduler.fromDate),
            // },
          }));
        // .sort((a, b) => b?.date - a?.date);
        setGroups(data);
      })
      .catch((err) => {
        console.log("getActivities Error:", err);
      });
  };
  console.log("groups", groups);

  useEffect(() => {
    // Alert.alert("kk");
    if (isFocused) {
      getActivities();
      getGroup();
    }
  }, [isFocused]);
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
        {item.status && (
          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TouchableOpacity
              style={{
                padding: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => {
                dispatch(
                  ChangeModalState.action({
                    approveActivityModalVisibility: true,
                  })
                );
                setActivity(item);
              }}
            >
              <AntDesign size={30} name="like1" color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                padding: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => {
                dispatch(
                  ChangeModalState.action({
                    declineActivityModalVisibility: true,
                  })
                );
                setDeclineActivity(item);
              }}
            >
              <AntDesign size={30} name="dislike2" color={Colors.primary} />
            </TouchableOpacity>
          </View>
        )}
        {!item.status && (
          <Icon
            style={{ width: 30, height: 30 }}
            fill={Colors.primary}
            name="trash"
          />
        )}
      </View>
    );
  };
  // console.log("acitivties--------", activities);
  return (
    <>
      <View style={styles.layout}>
        <InstructionsModal
          selectedInstructions={selectedInstructions}
          setSelectedInstructions={setSelectedInstructions}
        />

        {approveActivityModalVisibility && (
          <ApproveActivityModal
            fromParent={false}
            selectedChild={{}}
            setSelectedChild={() => null}
            activity={activity}
            setActivity={(id) => {
              if (activity?.activityId) {
                console.log("declinedactivity", activity);

                console.log("activites", activities);
                let filter = activities?.result?.filter(
                  (item) => item?.activityId != id
                );

                setActivities({ result: filter });
              } else {
                let filter = groups?.filter((item) => item?.groupId != id);
                setGroups(filter);
              }
            }}
          />
        )}
        {declineActivity && (
          <DeclineActivityModal
            fromParent={false}
            activity={declineActivity}
            setActivity={(id) => {
              if (declineActivity?.activityId) {
                console.log("declinedactivity", declineActivity);

                console.log("activites", activities);
                let filter = activities?.result.filter(
                  (item) => item?.activityId != id
                );
                setDeclineActivity(false);
                setActivities({ result: filter });
              } else {
                let filter = groups?.filter((item) => item?.groupId != id);
                setGroups(filter);
              }
            }}
          />
        )}

        <View style={{ flex: 1 }}>
          <FlatList
            data={(activities && activities?.result) || []}
            style={{ padding: 10, width: "100%", marginTop: 10 }}
            renderItem={({ item, index }) => {
              let date = item?.scheduler?.fromDate.split(" ");
              return (
                <Swipeable
                  ref={swipeableRef}
                  renderRightActions={(e) => RightActions(e, item)}
                >
                  <TouchableOpacity
                    onPress={() => {
                      // navigation.navigate('InstructorGroupApproval')
                    }}
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
                    <Text style={styles.text}>{`Date: ${date[0]} `}</Text>
                    <Text style={styles.text}>{`Time: ${
                      date[2] + " " + date[3]
                    }`}</Text>
                    <Text style={styles.text}>{`${
                      item?.activityType?.toLowerCase() === "activity"
                        ? "Activity"
                        : "Trip"
                    }: ${item?.activityName}`}</Text>
                    <Text
                      style={styles.text}
                    >{`Where: ${item?.venueFromName}`}</Text>
                    <Text
                      style={styles.text}
                    >{`Address: ${item?.venueFromAddress}`}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      dispatch(
                        ChangeModalState.action({
                          instructionsModalVisibility: true,
                        })
                      );
                      setSelectedInstructions(item?.optin);
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
              );
            }}
            // onEndReached={() => Alert.alert("kk")}
          />
          {/* {groups.length > 0 && (
            <Text style={{ marginVertical: 10, mar }}>Groups</Text>
          )} */}
          <FlatList
            data={groups}
            style={{ padding: 10, width: "100%" }}
            renderItem={({ item, index }) => (
              <Swipeable
                ref={swipeableRef}
                renderRightActions={(e) => RightActions(e, item)}
              >
                <View style={[styles.item, { backgroundColor: "#fff" }]}>
                  <Text
                    style={styles.text}
                  >{`Group Name: ${item?.groupName}`}</Text>
                  <Text style={styles.text}>{`Status: ${
                    item?.status ? "Active" : "Inactive"
                  }`}</Text>
                  {/* <Text style={styles.text}>{`${
                    item?.students && item?.students?.length
                  } Students`}</Text>
                  <Text style={styles.text}>{`Instructors: ${
                    (item?.instructors && item?.instructors?.length) || 0
                  }`}</Text> */}
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedInstructions(item?.optin)}
                  style={[styles.footer, { backgroundColor: "#fff" }]}
                >
                  <Text
                    style={styles.text}
                  >{`Instructions / Disclaimer / Agreement`}</Text>
                </TouchableOpacity>
              </Swipeable>
            )}
          />
        </View>
      </View>
    </>
  );
};

export default InstructorGroupPendingScreen;

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
  buttonSettings: {
    marginTop: 10,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 10,
  },
});
