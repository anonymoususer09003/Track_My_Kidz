import React, { useEffect, useState } from "react";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { Text } from "@ui-kitten/components";

import { StyleSheet, View, FlatList, TouchableOpacity } from "react-native";
import { useDispatch } from "react-redux";
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
import { GetGroupByInstructorId } from "@/Services/Group";
import { loadUserId } from "@/Storage/MainAppStorage";
const InstructorGroupPendingScreen = ({ route }) => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [activities, setActivities] = useState([]);
  const [selectedInstructions, setSelectedInstructions] = useState(null);
  const [groups, setGroups] = useState([]);
  const getActivities = async () => {
    const userId = await loadUserId();
    GetActivitiesByInsructorId(userId, "declined")
      .then((res) => {
        const data =
          res &&
          res.data &&
          res.data.map((item) => ({
            ...item,
            // scheduler: {
            //   fromDate: new Date(item.scheduler.fromDate),
            // },
          }));
        // .sort((a, b) => b?.date - a?.date);
        setActivities({
          result: data,
        });
      })
      .catch((err) => {
        console.log("getActivities Error:", err);
      });
  };
  const getGroup = async () => {
    const userId = await loadUserId();
    GetGroupByInstructorId(userId, "declined")
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
  useEffect(() => {
    // Alert.alert("kk");
    if (isFocused) {
      getActivities();
      getGroup();
    }
  }, [isFocused]);

  return (
    <>
      <View style={styles.layout}>
        <InstructionsModal
          selectedInstructions={selectedInstructions}
          setSelectedInstructions={setSelectedInstructions}
        />
        <View style={{ flex: 1 }}>
          <FlatList
            data={(activities && activities?.result) || []}
            style={{ padding: 10, width: "100%", marginTop: 10 }}
            renderItem={({ item, index }) => {
              let date = item?.scheduler?.fromDate.split(" ");
              return (
                <>
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
                </>
              );
            }}
          />

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
