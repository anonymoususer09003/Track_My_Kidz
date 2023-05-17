import React, { useEffect, useState } from "react";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { Text, Icon } from "@ui-kitten/components";

import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Colors from "@/Theme/Colors";
import Entypo from "react-native-vector-icons/Entypo";
import Ionicons from "react-native-vector-icons/Ionicons";
import moment from "moment";
import { InstructionsModal } from "@/Modals";
import {
  GetAllActivity,
  GetActivitiesByInsructorId,
} from "@/Services/Activity";
import Swipeable from "react-native-gesture-handler/Swipeable";
import AntDesign from "react-native-vector-icons/AntDesign";
import { ApproveActivityModal } from "@/Modals";
import { GetGroupByInstructorId } from "@/Services/Group";
import { loadUserId } from "@/Storage/MainAppStorage";
import { useSelector, useDispatch } from "react-redux";
const InstructorGroupPendingScreen = ({ route }) => {
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();
  const [activity, setActivity] = useState(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [activities, setActivities] = useState([]);
  const [declineActivity, setDeclineActivity] = useState(null);
  const [selectedInstructions, setSelectedInstructions] = useState(null);
  const [groups, setGroups] = useState([]);
  const [pageActivity, pageNumberActivity] = useState(0);
  const [pageSizeActivity, setPageSizeActivity] = useState(10);
  const [totalRecordsActivity, setTotalRecordsActivity] = useState(0);
  const [pageGroup, pageNumberGroup] = useState(0);
  const [pageSizeGroup, setPageSizeGroup] = useState(10);
  const [totalRecordsGroup, setTotalRecordsGroup] = useState(0);
  const isVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.instructionsModalVisibility
  );
  const calendarIcon = require("@/Assets/Images/navigation_icon2.png");
  const marker = require("@/Assets/Images/marker.png");

  const email = require("@/Assets/Images/email.png");
  const clockIcon = require("@/Assets/Images/clock1.png");
  const instructorImage = require("@/Assets/Images/approval_icon2.png");
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const approveActivityModalVisibility = useSelector(
    (state: { modal: any }) => state.modal.approveActivityModalVisibility
  );
  let prevOpenedRow: any;
  let row: Array<any> = [];
  const getActivities = async (refreshing: any) => {
    if (refreshing) {
      setRefreshing(true);
    }
    const userId = await loadUserId();
    console.log("userId", userId);
    let pageNumberActivityCount = refreshing ? pageActivity : 0;

    GetActivitiesByInsructorId(
      userId,
      "declined",
      pageNumberActivityCount,
      pageSizeActivity
    )
      .then((res) => {
        console.log("res", res.data);
        setTotalRecordsActivity(res?.data?.totalRecords);
        setRefreshing(false);
        setPageSizeActivity(10);

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
        setPageSizeActivity(10);

        pageNumberActivity(pageActivity);
        console.log("getActivities Error:", err);
      });
  };
  const getGroup = async (refreshing: any) => {
    const userId = await loadUserId();
    if (refreshing) {
      setRefreshing(true);
    }
    let pageNumberGroupCount = refreshing ? pageGroup : 0;
    GetGroupByInstructorId(
      userId,
      "declined",
      pageNumberGroupCount,
      pageSizeGroup
    )
      .then((res) => {
        setTotalRecordsGroup(res.totalRecords);
        setRefreshing(false);
        setPageSizeGroup(10);

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
  const closeRow = (index) => {
    if (prevOpenedRow && prevOpenedRow !== row[index]) {
      prevOpenedRow.close();
    }
    prevOpenedRow = row[index];
  };
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
                setActivity(item);
                setShowAcceptModal(true);
                // closeRow();
              }}
            >
              <AntDesign size={30} name="like1" color={Colors.primary} />
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

  useEffect(() => {
    // Alert.alert("kk");
    if (isFocused) {
      getActivities();
      getGroup();
    }
  }, [isFocused]);
  // useEffect(() => {
  //   if (activity) {
  //     dispatch(
  //       ChangeModalState.action({
  //         approveActivityModalVisibility: true,
  //       })
  //     );
  //   }
  // }, [activity]);
  console.log("activity000", activity);
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
            visible={showAcceptModal}
            selectedChild={{}}
            setSelectedChild={() => setActivity(null)}
            onClose={() => setShowAcceptModal(false)}
            activity={activity}
            setActivity={(id) => {
              if (activity?.activityId) {
                console.log("declinedactivity", activity);
                closeRow();
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

        {/* {approveActivityModalVisibility && (
          <ApproveActivityModal
            fromParent={false}
            selectedChild={{}}
            setSelectedChild={() => null}
            activity={activity}
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
        )} */}
        {activities.length === 0 && groups.length == 0 && (
          <View style={{ backgroundColor: Colors.newBackgroundColor }}>
            <Text style={[styles.text, { textAlign: "center", marginTop: 20 }]}>
              You do not have any declined activities or groups
            </Text>
          </View>
        )}
        <View style={{ flex: 1, backgroundColor: Colors.newBackgroundColor }}>
          {isFocused && (
            <FlatList
              data={[...activities, ...groups]}
              style={{ padding: 10, width: "100%", marginTop: 10 }}
              keyExtractor={(item, index) => index}
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
                if (totalRecordsActivity > activities.length) {
                  console.log("logs");

                  getActivities(true);
                }
                if (totalRecordsGroup > groups.length) {
                  getGroup(true);
                }
              }}
              refreshing={false}
              onRefresh={() => null}
            />
          )}

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
