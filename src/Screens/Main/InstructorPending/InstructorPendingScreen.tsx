import React, { useEffect, useState, useRef } from "react";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { Text, CheckBox, Icon } from "@ui-kitten/components";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
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
import { date } from "yup";
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
  const isVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.instructionsModalVisibility
  );
  let prevOpenedRow: any;
  let row: Array<any> = [];
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();
  const [students, setStudents] = useState(_students);
  const approveActivityModalVisibility = useSelector(
    (state: { modal: any }) => state.modal.approveActivityModalVisibility
  );
  const calendarIcon = require("@/Assets/Images/navigation_icon2.png");
  const marker = require("@/Assets/Images/marker.png");

  const email = require("@/Assets/Images/email.png");
  const clockIcon = require("@/Assets/Images/clock1.png");
  const instructorImage = require("@/Assets/Images/approval_icon2.png");
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [pageActivity, pageNumberActivity] = useState(0);
  const [pageSizeActivity, setPageSizeActivity] = useState(20);
  const [totalRecordsActivity, setTotalRecordsActivity] = useState(0);
  const [pageGroup, pageNumberGroup] = useState(0);
  const [pageSizeGroup, setPageSizeGroup] = useState(20);
  const [totalRecordsGroup, setTotalRecordsGroup] = useState(0);
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
  const closeRow = (index) => {
    console.log(index);
    if (prevOpenedRow && prevOpenedRow !== row[index]) {
      prevOpenedRow.close();
    }
    prevOpenedRow = row[index];
  };
  // console.log("instructorDetail", instructorDetail);
  const getActivities = async (refreshing: any) => {
    if (refreshing) {
      setRefreshing(true);
    }
    const userId = await loadUserId();
    console.log("userId", userId);
    let pageNumberActivityCount = refreshing ? pageActivity : 0;

    GetActivitiesByInsructorId(
      userId,
      "pending",
      pageNumberActivityCount,
      pageSizeActivity
    )
      .then((res) => {
        console.log("res", res.data);
        setTotalRecordsActivity(res.data.totalRecords);
        setRefreshing(false);
        setPageSizeActivity(20);

        pageNumberActivity(refreshing ? pageActivity + 1 : 1);
        // const data =
        //   res.data &&
        //   res.data.map((item) => ({
        //     ...item,
        //     // scheduler: {
        //     //   fromDate: new Date(item.scheduler.fromDate),
        //     // },
        //   }));
        // .sort((a, b) => b?.scheduler.date - a?..date);
        if (refreshing) {
          setActivities([...activities, ...res.data.result]);
        } else {
          setActivities(res.data.result);
        }
      })
      .catch((err) => {
        setRefreshing(false);
        setPageSizeActivity(20);

        pageNumberActivity(pageActivity);
        console.log("getActivities Error:", err);
      });
  };
  const getGroup = async (refreshing: any) => {
    if (refreshing) {
      setRefreshing(true);
    }
    let pageNumberGroupCount = refreshing ? pageGroup : 0;
    GetGroupByInstructorId(
      instructorDetail?.instructorId,
      "pending",
      pageNumberGroupCount,
      pageSizeGroup
    )
      .then((res) => {
        setTotalRecordsGroup(res.totalRecords);
        setRefreshing(false);
        setPageSizeGroup(20);

        pageNumberGroup(refreshing ? pageGroup + 1 : 1);
        // const data =
        //   res &&
        //   res.map((item) => ({
        //     ...item,
        //     // scheduler: {
        //     //   fromDate: new Date(item.scheduler.fromDate),
        //     // },
        //   }));
        // .sort((a, b) => b?.date - a?.date);
        if (refreshing) {
          setGroups([...groups, ...res?.result]);
        } else {
          setGroups(res.result);
        }
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
                setShowAcceptModal(true);
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

  return (
    <>
      <View style={styles.layout}>
        {isVisible && selectedInstructions && (
          <InstructionsModal
            selectedInstructions={selectedInstructions}
            setSelectedInstructions={setSelectedInstructions}
            activity={selectedInstructions}
          />
        )}
        {showAcceptModal && (
          <ApproveActivityModal
            fromParent={false}
            selectedChild={{}}
            setSelectedChild={() => null}
            activity={activity}
            visible={showAcceptModal}
            onClose={() => setShowAcceptModal(false)}
            setActivity={(id) => {
              if (activity?.activityId) {
                console.log("declinedactivity", activity);

                console.log("activites", activities);
                let filter = activities?.filter(
                  (item) => item?.activityId != id
                );

                setActivities(filter);
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
            onClose={() => null}
            activity={declineActivity}
            setActivity={(id) => {
              if (declineActivity?.activityId) {
                console.log("declinedactivity", declineActivity);

                console.log("activites", activities);
                let filter = activities?.filter(
                  (item) => item?.activityId != id
                );
                setDeclineActivity(false);
                setActivities(filter);
              } else {
                let filter = groups?.filter((item) => item?.groupId != id);
                setGroups(filter);
              }
            }}
          />
        )}
        {activities.length === 0 && groups.length == 0 && (
          <View style={{ margin: 10 }}>
            <Text style={[styles.text, { textAlign: "center" }]}>
              You do not have any pending activities or groups
            </Text>
          </View>
        )}
        <View style={{ flex: 1, backgroundColor: Colors.newBackgroundColor }}>
          {isFocused && (
            <FlatList
              data={[...activities, ...groups] || []}
              keyExtractor={(item, index) => index}
              style={{ padding: 10, width: "100%", marginTop: 10 }}
              contentContainerStyle={{ paddingBottom: 15 }}
              renderItem={({ item, index }) => {
                if (item?.activityId) {
                  let date = moment(item.fromDate).format("YYYY-MM-DD");

                  return (
                    <Swipeable
                      key={item?.activityId}
                      // ref={swipeableRef}
                      ref={(ref) => (row[item?.activityId] = ref)}
                      onSwipeableOpen={() => closeRow(item?.activityId)}
                      renderRightActions={(e) => RightActions(e, item)}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          // navigation.navigate('InstructorGroupApproval')
                        }}
                        style={[styles.item]}
                      >
                        <Text style={[styles.text, { fontSize: 25 }]}>
                          {item?.activityName}
                        </Text>
                        <View style={styles.horizontal}>
                          <Image
                            source={calendarIcon}
                            style={styles.iconStyle}
                          />
                          <Text style={styles.text}>{`Date: ${date} `}</Text>
                        </View>

                        <View style={styles.horizontal}>
                          <Image source={clockIcon} style={styles.iconStyle} />
                          <Text style={styles.text}>{`${moment().format(
                            "hh:mm a"
                          )}`}</Text>
                        </View>

                        <View style={styles.horizontal}>
                          <Image source={marker} style={styles.iconStyle} />
                          <Text style={styles.text}>{item?.venueFromName}</Text>
                        </View>

                        <View style={styles.horizontal}>
                          <Image source={marker} style={styles.iconStyle} />
                          <Text style={styles.text}>
                            {item?.venueFromAddress}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          dispatch(
                            ChangeModalState.action({
                              instructionsModalVisibility: true,
                            })
                          );
                          setSelectedInstructions(item);
                        }}
                        style={[styles.footer]}
                      >
                        <Text
                          style={[styles.text, { textAlign: "center" }]}
                        >{`Instructions / Disclaimer / Agreement`}</Text>
                      </TouchableOpacity>
                    </Swipeable>
                  );
                } else {
                  return (
                    <Swipeable
                      key={item?.groupId}
                      ref={(ref) => (row[item?.groupId] = ref)}
                      renderRightActions={(e) => RightActions(e, item)}
                      onSwipeableOpen={() => closeRow(item?.groupId)}
                    >
                      <View style={[styles.item]}>
                        <Text style={[styles.text, { fontSize: 25 }]}>
                          {item?.groupName}
                        </Text>

                        <View style={styles.horizontal}>
                          <Image
                            source={instructorImage}
                            style={styles.iconStyle}
                          />
                          <Text style={styles.text}>
                            {item?.status ? "Active" : "Inactive"}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => setSelectedInstructions(item?.optin)}
                        style={[styles.footer, { backgroundColor: "#fff" }]}
                      >
                        <Text
                          style={[styles.text, { textAlign: "center" }]}
                        >{`Instructions / Disclaimer / Agreement`}</Text>
                      </TouchableOpacity>
                    </Swipeable>
                  );
                }
              }}
              onEndReached={async () => {
                // if (totalRecordsActivity > activities.length) {
                //   console.log("logs");
                //   getActivities(true);
                // }
                // if (totalRecordsGroup > groups.length) {
                //   getGroup(true);
                // }
              }}
              refreshing={false}
              onRefresh={() => null}

              // onEndReached={() => Alert.alert("kk")}
            />
          )}
          {/* {groups.length > 0 && (
            <Text style={{ marginVertical: 10, mar }}>Groups</Text>
          )} */}

          {refreshing && (
            <ActivityIndicator size="large" color={Colors.primary} />
          )}
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
    paddingVertical: 10,
  },
  footer: {
    borderTopWidth: 0.3,
    borderTopColor: Colors.lightgray,
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
  iconStyle: {
    height: 25,
    width: 15,
    marginRight: 10,
    resizeMode: "contain",
    tintColor: Colors.secondary,
  },
  horizontal: {
    flexDirection: "row",
    alignItems: "center",
  },
});
