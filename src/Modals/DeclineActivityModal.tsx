import { Card, IndexPath, Modal, CheckBox, Text } from "@ui-kitten/components";
import { useDispatch, useSelector } from "react-redux";
import { ModalState } from "@/Store/Modal";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { UserState } from "@/Store/User";
import { useTheme } from "@/Theme";
import { LinearGradientButton } from "@/Components";
import ChangeSelectedState from "@/Store/Selected/ChangeSelectedState";
import { DeclineToGift } from "@/Services/GiftService";
import Colors from "@/Theme/Colors";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import { UpdateActivityByStatus } from "@/Services/Activity";
import { UpdateGroupByStatus } from "@/Services/Group";
import { useStateValue } from "@/Context/state/State";
import {
  GetAllActivity,
  GetActivitiesByInsructorId,
  InstructorUpdateStatus,
} from "@/Services/Activity";
import {
  GetGroupByInstructorId,
  UpdateInstructorGroupStatus,
} from "@/Services/Group";
const DeclineActivityModal = ({
  activity,
  setActivity,
  fromParent,
}: {
  activity: any;
  setActivity: Function;
  fromParent: any;
}) => {
  const isVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.declineActivityModalVisibility
  );
  const [{ instructorDetail: instructorDetail }, _dispatch] = useStateValue();
  const dispatch = useDispatch();
  console.log("acitivity", activity);

  const parentDecline = () => {
    if (activity?.activity) {
      const data = {
        activityId: activity?.activity?.activityId,
        status: "declined",
        studentId: activity?.studentId,
      };
      console.log("data", data);
      UpdateActivityByStatus(data)
        .then((res) => {
          console.log("8989898998989898", res);
          setActivity(activity?.activity?.activityId);
          dispatch(
            ChangeModalState.action({
              declineActivityModalVisibility: false,
            })
          );
        })
        .catch((err) => console.log("eeteet", err));
    } else {
      const data = {
        groupId: activity?.group?.groupId,
        status: "declined",
        studentId: activity?.studentId,
      };
      UpdateGroupByStatus(data)
        .then((res) => {
          console.log("8989898998989898 group", res);
          setActivity(activity?.activity?.activityId);
          dispatch(
            ChangeModalState.action({
              declineActivityModalVisibility: false,
            })
          );
        })
        .catch((err) => console.log(err));
    }
  };
  const instructorDecline = () => {
    if (activity.activityId) {
      const data = {
        activityId: activity?.activityId,
        status: "declined",
        instructorEmail: instructorDetail.email,
      };
      InstructorUpdateStatus(data)
        .then((res) => {
          console.log(res);
          dispatch(
            ChangeModalState.action({
              declineActivityModalVisibility: false,
            })
          );
          setActivity(activity?.activityId);

          // setSelectedChild(null);
        })
        .catch((err) => console.log(err));
    } else {
      const data = {
        groupyId: activity?.groupId,
        status: "declined",
        instructorEmail: instructorDetail.email,
      };
      UpdateInstructorGroupStatus(data)
        .then((res) => {
          console.log(res);
          dispatch(
            ChangeModalState.action({
              declineActivityModalVisibility: false,
            })
          );

          setActivity(activity?.groupId);

          // setActivities(filter);
          // setSelectedChild(null);
        })
        .catch((err) => console.log(err));
    }
  };
  // @ts-ignore
  return (
    <Modal
      style={styles.container}
      visible={isVisible}
      backdropStyle={styles.backdrop}
      onBackdropPress={() => {
        dispatch(
          ChangeModalState.action({ declineActivityModalVisibility: false })
        );
        setActivity(null);
      }}
    >
      <Card style={styles.modal} disabled={true}>
        <ScrollView>
          <View style={styles.body}>
            <View style={{ paddingBottom: 10, paddingTop: 10 }}>
              <Text
                textBreakStrategy={"highQuality"}
                style={{
                  textAlign: "center",
                  color: "#606060",
                  fontSize: 18,
                }}
              >
                You have opted to decline
              </Text>
            </View>
          </View>
          <View style={styles.buttonText}>
            <LinearGradientButton
              style={{
                borderRadius: 25,
                flex: 1,
              }}
              appearance="ghost"
              size="medium"
              status="control"
              onPress={() => {
                // console.log("data---", data);
                if (fromParent) {
                  parentDecline();
                } else {
                  instructorDecline();
                }
              }}
            >
              Confirm
            </LinearGradientButton>
          </View>
          <View style={styles.buttonText}>
            <LinearGradientButton
              style={{
                borderRadius: 25,
                flex: 1,
              }}
              appearance="ghost"
              size="medium"
              status="control"
              onPress={() => {
                dispatch(
                  ChangeModalState.action({
                    declineActivityModalVisibility: false,
                  })
                );
                setActivity(null);
              }}
            >
              Cancel
            </LinearGradientButton>
          </View>
        </ScrollView>
      </Card>
    </Modal>
  );
};
export default DeclineActivityModal;

const styles = StyleSheet.create({
  container: {
    minHeight: 200,
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    width: "90%",
  },
  modal: { borderRadius: 10 },
  header: { flex: 1, textAlign: "center", fontWeight: "bold", fontSize: 20 },
  body: { flex: 3 },
  background: {
    flex: 1,
    flexDirection: "row",
    color: Colors.white,
    zIndex: -1,
  },
  topNav: {
    color: Colors.white,
  },
  text: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 18,
  },
  bottom: {
    flex: 1,
    flexDirection: "row",
    height: 45,
    marginTop: 10,
    justifyContent: "space-between",
  },
  buttonText: {
    flex: 1,
    borderRadius: 25,
    fontFamily: "Gill Sans",
    textAlign: "center",
    margin: 2,
    shadowColor: "rgba(0,0,0, .4)", // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    shadowOpacity: 1, // IOS
    shadowRadius: 1, //IOS
    justifyContent: "center",
    backgroundColor: Colors.primary,
    alignItems: "center",
    flexDirection: "row",
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  termsCheckBox: {
    marginTop: 24,
  },
  termsCheckBoxText: {
    color: "text-hint-color",
    marginLeft: 10,
  },
});
