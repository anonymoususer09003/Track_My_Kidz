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
import Entypo from "react-native-vector-icons/Entypo";
import Ionicons from "react-native-vector-icons/Ionicons";
import AntDesign from "react-native-vector-icons/AntDesign";
import { LinearGradientButton } from "@/Components";
import moment from "moment";
import { InstructionsModal, DeclineActivityModal } from "@/Modals";
import GetActivityByStatus from "@/Services/Activity/GetActivityByStatus";
import { GetChildrenAcitivities } from "@/Services/Activity";
import { UserState } from "@/Store/User";
import { GetChildrenGroups } from "@/Services/Group";
const ParentApprovalScreen = ({ route }) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const dependent = route && route.params && route.params.dependent;
  const swipeableRef = useRef(null);
  const dispatch = useDispatch();
  const [initialRoute, setInitialRoute] = useState("FeaturedScreen");
  const [loading, setLoading] = useState(true);
  const [thumbnail, setThumbnail] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [activities, setActivities] = useState([]);
  const [selectedInstructions, setSelectedInstructions] = useState(null);
  const [declineActivity, setDeclineActivity] = useState(null);
  const currentUser = useSelector(
    (state: { user: UserState }) => state.user.item
  );
  let prevOpenedRow: any;
  let row: Array<any> = [];
  const [groups, setGroups] = useState([]);
  const [pageGroup, pageNumberGroup] = useState(0);
  const [pageSizeGroup, setPageSizeGroup] = useState(10);
  const [totalRecordsGroup, setTotalRecordsGroup] = useState(0);

  const [pageActivity, pageNumberActivity] = useState(0);
  const [pageSizeActivity, setPageSizeActivity] = useState(10);
  const [totalRecordsActivity, setTotalRecordsActivity] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const getActivities = async (refreshing: any) => {
    if (refreshing) {
      setRefreshing(true);
    }
    let pageNumberActivityCount = refreshing ? pageActivity : 0;
    let pageNumberGroupCount = refreshing ? pageGroup : 0;
    let email = currentUser?.email;
    GetChildrenAcitivities(
      email,
      "approved",
      pageNumberActivityCount,
      pageSizeActivity
    )
      .then((res) => {
        setTotalRecordsActivity(res.totalRecords);
        setRefreshing(false);
        setPageSizeActivity(10);

        pageNumberActivity(refreshing ? pageActivity + 1 : 1);
        console.log("res", res.result);

        if (refreshing) {
          setActivities([...activities, ...res.result]);
        } else {
          setActivities(res.result);
        }
      })
      .catch((err) => {
        console.log("Error:", err);
        setRefreshing(false);
        setPageSizeActivity(10);

        pageNumberActivity(pageActivity);
      });
  };

  const getGroups = async (refreshing: any) => {
    if (refreshing) {
      setRefreshing(true);
    }

    let pageNumberGroupCount = refreshing ? pageGroup : 0;
    let email = currentUser?.email;
    GetChildrenGroups(email, "approved", pageNumberGroupCount, pageSizeGroup)
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
    if (isFocused || declineActivity) {
      getActivities();
      getGroups();
    }
  }, [isFocused, declineActivity]);
  const closeRow = (index) => {
    console.log(index);
    if (prevOpenedRow && prevOpenedRow !== row[index]) {
      prevOpenedRow.close();
    }
    prevOpenedRow = row[index];
  };
  useEffect(() => {
    if (selectedInstructions) {
      dispatch(ChangeModalState.action({ instructionsModalVisibility: true }));
    }
  }, [selectedInstructions]);

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
          style={{
            padding: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => {
            dispatch(
              ChangeModalState.action({ declineActivityModalVisibility: true })
            );
            setDeclineActivity(item);
          }}
        >
          {item.status ? (
            <AntDesign size={30} name="dislike2" color={Colors.primary} />
          ) : (
            <Icon
              style={{ width: 30, height: 30 }}
              fill={Colors.primary}
              name="trash"
            />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <InstructionsModal
        selectedInstructions={selectedInstructions}
        setSelectedInstructions={setSelectedInstructions}
      />
      {declineActivity && (
        <DeclineActivityModal
          fromParent={true}
          activity={declineActivity}
          setActivity={setDeclineActivity}
        />
      )}
      <View style={styles.layout}>
        {activities.length === 0 && (
          <View style={{ margin: 10 }}>
            <Text style={[styles.text, { textAlign: "center" }]}>
              You do not have any approved activities or groups
            </Text>
          </View>
        )}

        <View style={styles.layout}>
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
              } else {
                return (
                  <Swipeable
                    ref={(ref) => (row[item?.groupId] = ref)}
                    renderRightActions={(e) => RightActions(e, item)}
                    onSwipeableOpen={() => closeRow(item?.groupId)}
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
                      <Text
                        style={styles.text}
                      >{`Status: ${item?.status}`}</Text>
                      <Text
                        style={styles.text}
                      >{`Parent Email 1: ${item?.parentEmail1}`}</Text>
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
      </View>
    </>
  );
};

export default ParentApprovalScreen;

const styles = StyleSheet.create({
  layout: {
    // flex: 1,
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
