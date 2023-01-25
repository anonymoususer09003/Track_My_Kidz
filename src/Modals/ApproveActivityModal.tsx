import { Card, Modal, CheckBox, Text } from "@ui-kitten/components";
import { useDispatch, useSelector } from "react-redux";
import { ModalState } from "@/Store/Modal";
import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { LinearGradientButton } from "@/Components";
import Colors from "@/Theme/Colors";
import UpdateActivityStatus from "@/Services/Activity/UpdateActivityStatus";
import { UpdateActivityByStatus } from "@/Services/Activity";
import { UpdateGroupByStatus } from "@/Services/Group";
import { useStateValue } from "@/Context/state/State";
import {
  GetAllActivity,
  GetActivitiesByInsructorId,
  InstructorUpdateStatus,
  GetOptIn,
} from "@/Services/Activity";
import {
  GetGroupByInstructorId,
  UpdateInstructorGroupStatus,
  GetOptInGroup,
} from "@/Services/Group";
const ApproveActivityModal = ({
  selectedChild,
  setSelectedChild,
  activity,
  setActivity,
  fromParent,
}: {
  selectedChild: any;
  setSelectedChild: (item: any) => void;
  activity: any;
  setActivity: Function;
  fromParent: any;
}) => {
  const [{ instructorDetail: instructorDetail }, _dispatch] = useStateValue();
  const isVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.approveActivityModalVisibility
  );
  const [infomation, setInformation] = useState({});
  const getActivityOptInDetail = async (id: any) => {
    try {
      let res = await GetOptIn(id);

      setInformation({ ...infomation, ...res });
    } catch (err) {
      console.log("err", err);
    }
  };
  const getGroupOptInDetail = async (id: any) => {
    try {
      let res = await GetOptInGroup(id);

      setInformation({ ...infomation, ...res });
    } catch (err) {
      console.log("err", err);
    }
  };
  const [terms, setTerms] = useState(false);
  const dispatch = useDispatch();
  const parentApproval = () => {
    if (activity && activity?.activity) {
      const data = {
        activityId: activity?.activity?.activityId,
        status: "approved",
        studentId: activity?.studentId,
      };
      console.log("data", data);
      UpdateActivityByStatus(data)
        .then((res) => {
          console.log("accepted", res);
          dispatch(
            ChangeModalState.action({
              approveActivityModalVisibility: false,
            })
          );
          setActivity(activity?.activity?.activityId);
          setSelectedChild(null);
        })
        .catch((err) => console.log(err));
    } else {
      const data = {
        groupId: activity?.group?.groupId,
        status: "approved",
        studentId: activity?.studentId,
      };
      UpdateGroupByStatus(data)
        .then((res) => {
          console.log(res);
          dispatch(
            ChangeModalState.action({
              approveActivityModalVisibility: false,
            })
          );
          setActivity(activity?.group?.groupId);
          setSelectedChild(null);
        })
        .catch((err) => console.log(err));
    }
  };

  const instructorApproval = () => {
    console.log("acitivyt", activity.activityId);
    if (activity.activityId) {
      const data = {
        activityId: activity?.activityId,
        status: "approved",
        instructorEmail: instructorDetail.email,
      };
      InstructorUpdateStatus(data)
        .then((res) => {
          console.log("approved", res);
          dispatch(
            ChangeModalState.action({
              approveActivityModalVisibility: false,
            })
          );
          setActivity(activity?.activityId);
          setSelectedChild(null);

          // setSelectedChild(null);
        })
        .catch((err) => console.log(err));
    } else {
      const data = {
        groupyId: activity?.groupId,
        status: "approved",
        instructorEmail: instructorDetail.email,
      };
      UpdateInstructorGroupStatus(data)
        .then((res) => {
          console.log(res);
          dispatch(
            ChangeModalState.action({
              approveActivityModalVisibility: false,
            })
          );

          setActivity(activity?.groupId);
          setSelectedChild(null);
          // setActivities(filter);
          // setSelectedChild(null);
        })
        .catch((err) => console.log(err));
    }
  };
  console.log("activity0000", activity);
  useEffect(() => {
    if (fromParent) {
      if (activity?.activity) {
        getActivityOptInDetail(activity?.activity?.activityId);
      } else {
        getGroupOptInDetail(activity?.group?.groupId);
      }
    } else {
      if (activity?.activityId) {
        getActivityOptInDetail(activity?.activityId);
      } else {
        getGroupOptInDetail(activity?.groupId);
      }
    }
  }, []);
  // @ts-ignore
  return (
    <Modal
      style={styles.container}
      visible={isVisible}
      backdropStyle={styles.backdrop}
      onBackdropPress={() => {
        dispatch(
          ChangeModalState.action({ approveActivityModalVisibility: false })
        );
        setActivity(null);
      }}
    >
      <Card style={styles.modal} disabled={true}>
        <View style={{ flex: 1 }}>
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
                You have opted to approve
              </Text>
            </View>
          </View>
          <View style={{ marginTop: 20, paddingHorizontal: 10 }}>
            <Text style={{ fontWeight: "600", fontSize: 16 }}>
              Instructions
            </Text>
            <View style={{ maxHeight: 100 }}>
              <ScrollView nestedScrollEnabled>
                <Text style={{ fontSize: 15, marginTop: 10 }}>
                  {infomation?.instructions}
                </Text>
              </ScrollView>
            </View>
            <Text style={{ fontWeight: "600", fontSize: 16, marginTop: 20 }}>
              Disclaimer
            </Text>
            <View style={{ maxHeight: 100 }}>
              <ScrollView nestedScrollEnabled>
                <Text style={{ fontSize: 15, marginTop: 10 }}>
                  {infomation?.disclaimer}
                </Text>
              </ScrollView>
            </View>
            <Text style={{ fontWeight: "600", fontSize: 16, marginTop: 20 }}>
              Agreement
            </Text>
            <View style={{ maxHeight: 100 }}>
              <ScrollView nestedScrollEnabled>
                <Text style={{ fontSize: 15, marginTop: 10 }}>
                  {infomation?.agreement}
                </Text>
              </ScrollView>
            </View>
          </View>
          <View style={{ flexDirection: "row" }}>
            <CheckBox
              style={[styles.termsCheckBox, { flex: 1, marginRight: 18 }]}
              checked={terms}
              onChange={() => setTerms(!terms)}
            >
              {""}
            </CheckBox>
            <View style={[styles.termsCheckBox, { flex: 15 }]}>
              <Text>By checking the box, you agree to all of the above</Text>
            </View>
          </View>
          <View
            style={[
              styles.buttonText,
              { backgroundColor: terms ? Colors.primary : Colors.gray },
            ]}
          >
            <LinearGradientButton
              style={{
                borderRadius: 25,
                flex: 1,
              }}
              appearance="ghost"
              size="medium"
              disabled={!terms}
              status="control"
              onPress={() => {
                fromParent ? parentApproval() : instructorApproval();
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
                    approveActivityModalVisibility: false,
                  })
                );
                setActivity(null);
              }}
            >
              Cancel
            </LinearGradientButton>
          </View>
        </View>
      </Card>
    </Modal>
  );
};
export default ApproveActivityModal;

const styles = StyleSheet.create({
  container: {
    maxHeight: "80%",
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
