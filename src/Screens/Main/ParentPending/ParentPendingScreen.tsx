import React, { useEffect, useState, useRef } from "react";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Text, Icon } from "@ui-kitten/components";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Colors from "@/Theme/Colors";
import AntDesign from "react-native-vector-icons/AntDesign";
import {
  InstructionsModal,
  ApproveActivityModal,
  DeclineActivityModal,
} from "@/Modals";
import moment from "moment";
import { GetChildrenAcitivities } from "@/Services/Activity";
import { UserState } from "@/Store/User";
import FetchOne from "@/Services/User/FetchOne";
import ChildrenSelectionModal from "@/Modals/ChildrenSelectionModal";
import { ModalState } from "@/Store/Modal";
import { GetChildrenGroups } from "@/Services/Group";
import GetParentChildrens from "@/Services/Parent/GetParentChildrens";
const ParentPendingScreen = ({ route }) => {
  const swipeableRef = useRef(null);
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const [pageActivity, pageNumberActivity] = useState(0);
  const [pageSizeActivity, setPageSizeActivity] = useState(10);
  const [totalRecordsActivity, setTotalRecordsActivity] = useState(0);
  const [pageGroup, pageNumberGroup] = useState(0);
  const [pageSizeGroup, setPageSizeGroup] = useState(10);
  const [totalRecordsGroup, setTotalRecordsGroup] = useState(0);
  const [children, setChildren] = useState([]);
  const [activities, setActivities] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activity, setActivity] = useState(null);
  const [declineActivity, setDeclineActivity] = useState(null);
  const [selectedInstructions, setSelectedInstructions] = useState(null);
  const [selectedChild, setSelectedChild] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const currentUser = useSelector(
    (state: { user: UserState }) => state.user.item
  );

  const loadUserDetails = async () => {
    GetParentChildrens(currentUser?.referenceCode)
      .then((res) => {
        console.log("children", res);
        setChildren(res);
      })
      .catch((err) => console.log("loadUserDetails", err));
  };
  // Alert.alert("jjh");
  const getActivities = async (refreshing: any) => {
    if (refreshing) {
      setRefreshing(true);
    }
    let pageNumberActivityCount = refreshing ? pageActivity : 0;
    let pageNumberGroupCount = refreshing ? pageGroup : 0;
    let email = currentUser?.email;

    GetChildrenAcitivities(
      email,
      "pending",
      pageNumberActivityCount,
      pageSizeActivity
    )
      .then((res) => {
        setTotalRecordsActivity(res.totalRecords);
        setRefreshing(false);
        setPageSizeActivity(10);

        pageNumberActivity(refreshing ? pageActivity + 1 : 1);
        console.log("res", res);

        if (refreshing) {
          setActivities([...activities, ...res.result]);
        } else {
          setActivities(res.result);
        }
      })
      .catch((err) => {
        setRefreshing(false);
        setPageSizeActivity(10);

        pageNumberActivity(pageActivity);
        console.log("Error:", err);
      });
  };
  const getGroups = async (refreshing: any) => {
    if (refreshing) {
      setRefreshing(true);
    }

    let pageNumberGroupCount = refreshing ? pageGroup : 0;
    let email = currentUser?.email;
    GetChildrenGroups(email, "pending", pageNumberGroupCount, pageSizeGroup)
      .then((res) => {
        console.log("res", res);
        setTotalRecordsGroup(res.totalRecords);
        setRefreshing(false);
        setPageSizeGroup(10);

        pageNumberGroup(refreshing ? pageGroup + 1 : 1);
        console.log("res", res);
        if (refreshing) {
          setGroups([...groups, ...res?.result]);
        } else {
          setGroups(res.result);
        }
        // setGroups(res);
      })
      .catch((err) => {
        setRefreshing(false);
        setPageSizeGroup(10);

        pageNumberGroup(pageGroup);
        console.log("Error:", err);
      });
  };

  useEffect(() => {
    loadUserDetails();
  }, []);

  useEffect(() => {
    if (isFocused) {
      getActivities();
      getGroups();
    }
  }, [isFocused]);

  useEffect(() => {
    if (selectedInstructions) {
      dispatch(ChangeModalState.action({ instructionsModalVisibility: true }));
    }
  }, [selectedInstructions]);

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
                    childrenSelectionModalVisibility: true,
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

  const approveActivityModalVisibility = useSelector(
    (state: { modal: ModalState }) => state.modal.approveActivityModalVisibility
  );

  return (
    <>
      {selectedInstructions && (
        <InstructionsModal
          selectedInstructions={selectedInstructions}
          setSelectedInstructions={setSelectedInstructions}
        />
      )}
      {activity && (
        <ChildrenSelectionModal
          setSelectedChild={setSelectedChild}
          activity={activity}
          children={children}
        />
      )}
      {/* {approveActivityModalVisibility && !!selectedChild && ( */}
      {approveActivityModalVisibility && !!selectedChild && (
        <ApproveActivityModal
          fromParent={true}
          selectedChild={selectedChild}
          setSelectedChild={setSelectedChild}
          activity={activity}
          setActivity={(id) => {
            if (activity?.activity) {
              console.log("declinedactivity", activity);

              console.log("activites", activities);
              let filter = activities.filter(
                (item) => item?.activity?.activityId != id
              );

              setActivities(filter);
            } else {
              let filter = groups.filter((item) => item?.group?.groupId != id);
              setGroups(filter);
            }
          }}
        />
      )}
      {declineActivity && (
        <DeclineActivityModal
          fromParent={true}
          activity={declineActivity}
          setActivity={(id) => {
            if (declineActivity?.activity) {
              console.log("declinedactivity", declineActivity);

              console.log("activites", activities);
              let filter = activities.filter(
                (item) => item?.activity?.activityId != id
              );
              setDeclineActivity(false);
              setActivities(filter);
            } else {
              let filter = groups.filter((item) => item?.group?.groupId != id);
              setGroups(filter);
            }
          }}
        />
      )}

      {activities.length === 0 && (
        <View style={{ margin: 10 }}>
          <Text style={[styles.text, { textAlign: "center" }]}>
            You do not have any pending activities or groups to approve
          </Text>
        </View>
      )}

      <View style={styles.layout}>
        {activities.length > 0 && (
          <View style={{ flex: 1 }}>
            <FlatList
              data={activities}
              style={{ padding: 20, width: "100%" }}
              renderItem={({ item, index }) => {
                let date = item?.activity?.fromDate;
                return (
                  <Swipeable
                    ref={swipeableRef}
                    renderRightActions={(e) => RightActions(e, item)}
                  >
                    <View
                      style={[
                        styles.item,
                        {
                          backgroundColor: !item.status
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
                      >{` Activity Name: ${item?.activity?.activityName}`}</Text>
                      {/* 
                      <Text style={styles.text}>{`Date: ${moment(
                        date == "string" ? new Date() : date[0]
                      ).format("YYYY-MM-DD")}`}</Text>
                      {!date[1] ? (
                        <Text style={styles.text}>{`Time: ${moment(
                          date == "string" ? new Date() : date
                        )
                          .subtract("hours", 5)
                          .format("hh:mm a")}`}</Text>
                      ) : (
                        <Text style={styles.text}>{`Time: ${
                          date[2] + " " + date[3]
                        }`}</Text>
                      )} */}

                      <Text style={styles.text}>{` Date: ${moment(date).format(
                        "YYYY-MM-DD"
                      )}`}</Text>
                      <Text style={styles.text}>{` Time: ${moment(date).format(
                        "hh:mm A"
                      )}`}</Text>
                      <Text
                        style={styles.text}
                      >{` ${item?.firstName} ${item?.lastName}`}</Text>
                      <Text
                        style={styles.text}
                      >{`Status: ${item?.status}`}</Text>
                      <Text
                        style={styles.text}
                      >{`Parent Email 1: ${item?.parentEmail1}`}</Text>
                    </View>
                  </Swipeable>
                );
              }}
              // onEndReached={async () => {
              //   if (totalRecordsActivity > activities.length) {
              //     console.log("logs");

              //     getActivities(true);

              //     if (totalRecordsGroup > groups.length) {
              //       getGroups(true);
              //     }
              //   }
              // }}
              refreshing={false}
              onRefresh={() => null}
            />
          </View>
        )}
        {activities.length > 0 && (
          <View style={{ flex: 1 }}>
            <FlatList
              data={groups}
              style={{ padding: 10, width: "100%" }}
              renderItem={({ item, index }) => (
                <Swipeable
                  ref={swipeableRef}
                  renderRightActions={(e) => RightActions(e, item)}
                >
                  <View
                    style={[
                      styles.item,
                      {
                        backgroundColor: !item.status
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
                    >{` Group Name: ${item?.group?.groupName}`}</Text>
                    <Text style={styles.text}>{` Date: ${moment(
                      item?.activity?.scheduler?.fromDate
                    ).format("YYYY-MM-DD")}`}</Text>
                    <Text
                      style={styles.text}
                    >{` ${item?.firstName} ${item?.lastName}`}</Text>
                    <Text style={styles.text}>{`Status: ${item?.status}`}</Text>
                    <Text
                      style={styles.text}
                    >{`Parent Email 1: ${item?.parentEmail1}`}</Text>
                  </View>
                </Swipeable>
              )}
              // onEndReached={async () => {
              //   if (totalRecordsActivity > activities.length) {
              //     console.log("logs");

              //     getActivities(true);

              //     if (totalRecordsGroup > groups.length) {
              //       getGroups(true);
              //     }
              //   }
              // }}
              refreshing={false}
              onRefresh={() => null}
            />
          </View>
        )}
        {refreshing && (
          <ActivityIndicator size="large" color={Colors.primary} />
        )}
      </View>
    </>
  );
};

export default ParentPendingScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    // flexDirection: "column",
  },
  item: {
    borderRadius: 10,
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
