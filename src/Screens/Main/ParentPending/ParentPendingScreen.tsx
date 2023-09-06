import {
  ApproveActivityModal,
  DeclineActivityModal, InstructionsModal
} from "@/Modals";
import ChildrenSelectionModal from "@/Modals/ChildrenSelectionModal";
import { GetChildrenAcitivities } from "@/Services/Activity";
import { GetChildrenGroups } from "@/Services/Group";
import GetParentChildrens from "@/Services/Parent/GetParentChildrens";
import { ModalState } from "@/Store/Modal";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { UserState } from "@/Store/User";
import Colors from "@/Theme/Colors";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Icon, Text } from "@ui-kitten/components";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, FlatList, Image, StyleSheet, TouchableOpacity, View
} from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useDispatch, useSelector } from "react-redux";
const ParentPendingScreen = ({ route }) => {
  const calendarIcon = require("@/Assets/Images/navigation_icon2.png");
  const marker = require("@/Assets/Images/marker.png");

  const email = require("@/Assets/Images/email.png");
  const clockIcon = require("@/Assets/Images/clock1.png");
  const instructorImage = require("@/Assets/Images/approval_icon2.png");
  const swipeableRef = useRef(null);

  let prevOpenedRow: any;
  let row: Array<any> = [];
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
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const closeRow = (index) => {
    console.log(index);
    if (prevOpenedRow && prevOpenedRow !== row[index]) {
      prevOpenedRow.close();
    }
    prevOpenedRow = row[index];
  };
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
        setPageSizeActivity(20);

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
        setPageSizeActivity(20);

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
        setPageSizeGroup(20);

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
        setPageSizeGroup(20);

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
    } else {
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
                setShowAcceptModal(true);
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
                // dispatch(
                //   ChangeModalState.action({
                //     declineActivityModalVisibility: true,
                //   })
                // );

                dispatch(
                  ChangeModalState.action({
                    childrenSelectionModalVisibility: true,
                  })
                );
                // setShowAcceptModal(true);
                setActivity(item);
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
          acceptModal={showAcceptModal ? true : false}
          setSelectedChild={setSelectedChild}
          activity={activity}
          children={children}
        />
      )}
      {/* {approveActivityModalVisibility && !!selectedChild && ( */}
      {showAcceptModal && !!selectedChild && (
        <ApproveActivityModal
          visible={showAcceptModal}
          onClose={() => setShowAcceptModal(false)}
          fromParent={true}
          selectedChild={selectedChild}
          setSelectedChild={setSelectedChild}
          activity={{ ...activity, selectedStudentId: selectedChild.studentId }}
          setActivity={(id) => {
            setSelectedChild("");
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
      {declineActivity && !!selectedChild && (
        <DeclineActivityModal
          fromParent={true}
          activity={{
            ...declineActivity,
            selectedStudentId: selectedChild.studentId,
          }}
          setActivity={(id) => {
            setSelectedChild("");
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

      {activities.length === 0 && groups.length === 0 && (
        <View
          style={{ backgroundColor: Colors.newBackgroundColor, padding: 10 }}
        >
          <Text style={[styles.text, { textAlign: "center" }]}>
            You do not have any pending activities or groups to approve
          </Text>
        </View>
      )}

      {isFocused && (
        <View style={{ flex: 1, backgroundColor: Colors.newBackgroundColor }}>
          <FlatList
            data={[...activities, ...groups]}
            // style={{ padding: 20, width: "100%" }}
            renderItem={({ item, index }) => {
              if (item?.activity?.activityId) {
                let date = item?.activity?.fromDate;
                return (
                  <Swipeable
                    ref={(ref) => (row[item?.activity?.activityId] = ref)}
                    onSwipeableOpen={() => closeRow(item?.activity?.activityId)}
                    renderRightActions={(e) => RightActions(e, item)}
                  >
                    <TouchableOpacity
                        onPress={() => {
                          // navigation.navigate('InstructorGroupApproval')
                        }}
                        style={[styles.item]}
                      >
                      <Text style={[styles.text, { fontSize: 25 }]}>
                        {`${item?.activity?.activityName}`}
                      </Text>
                      
                      <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        
                      }}
                      >
                      <Image
                        source={require("@/Assets/Images/circle-dashed.png")}
                        style={{
                          height: 40,
                          width: 15,
                          resizeMode: "contain",
                         marginRight: 10,
                        }}
                      />
                        <View>
                          <Text style={styles.text}>{`${moment(
                          item?.activity?.fromDate == "string"
                            ? new Date()
                            : item?.activity?.fromDate
                         ).format("MMM DD YYYY")} at ${moment(
                          item?.activity?.fromDate == "string"
                            ? new Date()
                            : item?.activity?.fromDate
                          )
                          .subtract("hours", 5)
                          .format("hh:mm a")} `}</Text>
                        <Text style={styles.text}>{`${moment(
                          item?.activity?.toDate == "string" ? new Date() : item?.activity?.toDate
                        ).format("MMM DD YYYY")} at ${moment(
                          item?.activity?.toDate == "string" ? new Date() : item?.activity?.toDate
                        )
                          .subtract("hours", 5)
                          .format("hh:mm a")} `}</Text>
                      </View>
                    </View>

                      
                      <View style={styles.horizontal}>
                          <Image source={marker} style={styles.iconStyle} />
                          <Text style={styles.text}>{item?.activity?.venueFromName}</Text>
                      </View>

                        <View style={styles.horizontal}>
                          <Image source={marker} style={styles.iconStyle} />
                          <View>
                            <Text style={styles.text}>
                            {`${item?.activity?.venueFromAddress}, ${item?.activity?.venueFromCity}, ${item?.activity?.venueFromState} ${item?.activity?.venueFromZip}, ${item?.activity?.venueFromCountry}`}
                            </Text>
                          </View>
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
                    ref={(ref) => (row[item?.groupId] = ref)}
                    renderRightActions={(e) => RightActions(e, item)}
                    onSwipeableOpen={() => closeRow(item?.groupId)}
                  >
                    <View style={[styles.item]}>
                      <Text style={[styles.text, { fontSize: 25 }]}>
                        {item?.group?.groupName}
                      </Text>
                      <View style={styles.horizontal}>
                        <Image
                          source={instructorImage}
                          style={styles.iconStyle}
                        />
                        <Text
                          style={styles.text}
                        >{` ${item?.firstName} ${item?.lastName}`}</Text>
                      </View>
                      <View style={styles.horizontal}>
                        <Image source={calendarIcon} style={styles.iconStyle} />
                        <Text style={styles.text}>{`${moment(
                          item?.activity?.scheduler?.fromDate
                        ).format("YYYY-MM-DD")}`}</Text>
                      </View>

                      {/* <View style={styles.horizontal}>
                        <Image source={email} style={styles.iconStyle} />
                        <Text
                          style={styles.text}
                        >{`Parent Email 1: ${item?.parentEmail1}`}</Text>
                      </View> */}
                    </View>
                  </Swipeable>
                );
              }
            }}
            onEndReached={async () => {
              if (totalRecordsActivity > activities.length) {
                console.log("logs");

                getActivities(true);

                if (totalRecordsGroup > groups.length) {
                  getGroups(true);
                }
              }
            }}
            refreshing={false}
            onRefresh={() => null}
          />
          {refreshing && (
            <ActivityIndicator size="large" color={Colors.primary} />
          )}
        </View>
      )}
    </>
  );
};

export default ParentPendingScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: Colors.newBackgroundColor,
  },
  item: {
    borderRadius: 20,
    width: "96%",
    backgroundColor: "#fff",
    marginTop: 10,
    marginHorizontal: "2%",
    paddingHorizontal: 15,
    paddingVertical: 15,
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
    overflow: "hidden",
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
