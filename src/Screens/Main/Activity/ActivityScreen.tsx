import React, { useEffect, useState, useRef } from "react";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Text, Icon } from "@ui-kitten/components";
import { StyleSheet, View, FlatList, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Colors from "@/Theme/Colors";
import Entypo from "react-native-vector-icons/Entypo";
import { LinearGradientButton } from "@/Components";
import { InstructionsModal } from "@/Modals";
import { GetActivityByStudentId, GetAllActivity } from "@/Services/Activity";
import { Activity } from "@/Models/DTOs";
import { useStateValue } from "@/Context/state/State";
import moment from "moment";

const ActivityScreen = ({ route }) => {
  const navigation = useNavigation();
  const dependent = route && route.params && route.params.dependent;
  const [{ selectedDependentActivity, child }] = useStateValue();
  const swipeableRef = useRef(null);
  const dispatch = useDispatch();
  const [activities, setActivities] = useState(selectedDependentActivity);
  const [selectedInstructions, setSelectedInstructions] = useState<Optin>(null);
  console.log("selected dependet", child);
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
  };
  const getActivities = async () => {
    GetActivityByStudentId(child?.studentId)
      .then((res) => {
        console.log("res---------", res);
        setActivities(res);
      })
      .catch((err) => {
        console.log("Error:", err);
      });
  };
  useEffect(() => {
    getActivities();
    dispatch(ChangeModalState.action({ instructionsModalVisibility: true }));
  }, [child]);

  return (
    <>
      {selectedInstructions && (
        <InstructionsModal
          selectedInstructions={selectedInstructions}
          setSelectedInstructions={setSelectedInstructions}
        />
      )}
      <View style={styles.layout}>
        <FlatList
          data={activities}
          style={{ padding: 10, width: "100%" }}
          renderItem={({ item, index }) => (
            <Swipeable
              ref={swipeableRef}
              renderRightActions={(e) => RightActions(e, item)}
            >
              <TouchableOpacity
                onPress={() => {
                  // _dispatch({
                  //     type: actions.SET_SELECTED_ACTIVITY,
                  //     payload: item,
                  // })
                  // dispatch(
                  //     ChangeModalState.action({ rollCallModalVisibility: true }),
                  // )
                  // navigation.navigate('InstructorGroupApproval')
                }}
                style={[
                  styles.item,
                  {
                    backgroundColor: !item?.activity?.status
                      ? "#fff"
                      : index % 3 === 0
                      ? "lightgreen"
                      : index % 2 === 0
                      ? "#F6DDCC"
                      : "#fff",
                  },
                ]}
              >
                <Text style={styles.text}>{`Date: ${moment(
                  item?.activity?.scheduler?.fromDate
                ).format("YYYY-MM-DD hh:mm:ss")}`}</Text>
                <Text style={styles.text}>{`${
                  item?.activity?.activityType?.toLowerCase() === "activity"
                    ? "Activity"
                    : "Trip"
                }: ${item?.activity?.activityName}`}</Text>
                <Text
                  style={styles.text}
                >{`Where: ${item?.activity?.venueFromName}`}</Text>
                <Text
                  style={styles.text}
                >{`Address: ${item?.activity?.venueFromAddress}`}</Text>
                <Text style={styles.text}>{`Status: ${
                  item?.activity?.status ? "Active" : "Inactive"
                }`}</Text>
                <Text style={styles.text}>{`Students: ${
                  (item?.activity?.studentsActivity &&
                    item?.activity?.studentsActivity?.length) ||
                  0
                }`}</Text>
                <Text style={styles.text}>{`Instructors: ${
                  (item?.activity?.instructors &&
                    item?.activity?.instructors?.length) ||
                  0
                }`}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSelectedInstructions(item?.activity?.optin);
                  dispatch(
                    ChangeModalState.action({
                      instructionsModalVisibility: true,
                    })
                  );
                }}
                style={[
                  styles.footer,
                  {
                    backgroundColor: !item?.activity?.status
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
      </View>
    </>
  );
};

export default ActivityScreen;

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
