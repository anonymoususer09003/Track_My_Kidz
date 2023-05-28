import React, { useEffect, useState, useRef } from "react";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import {
  Text,
  CheckBox,
  TopNavigation,
  TopNavigationAction,
  Icon,
} from "@ui-kitten/components";
import {
  Switch,
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Colors from "@/Theme/Colors";
import Entypo from "react-native-vector-icons/Entypo";
import Ionicons from "react-native-vector-icons/Ionicons";
import AntDesign from "react-native-vector-icons/AntDesign";
import { LinearGradientButton } from "@/Components";

import moment from "moment";
import {
  InstructionsModal,
  DeclineActivityModal,
  MarkAllRollCallModal,
} from "@/Modals";
import SearchBar from "@/Components/SearchBar/SearchBar";
import { ModalState } from "@/Store/Modal";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Modal from "react-native-modal";
import { useStateValue } from "@/Context/state/State";
import {
  CreateAttendance,
  GetAttendance,
  EditAttendance,
} from "@/Services/Attendance";
import { SetupVehicleModal } from "@/Modals";
import {
  FindAllStudentsWhichActivity,
  FindAllIstructorActivities,
  SendEmailToPendingStudent,
} from "@/Services/Activity";
const _approvals = [
  {
    name: "Dylan B.",
    type: "Student",
    to: false,
    from: false,
  },
  {
    name: "Peter C.",
    type: "Student",
    to: false,
    from: false,
  },
  {
    name: "James B.",
    type: "Student",
    to: false,
    from: false,
  },
  {
    name: "Mark K.",
    type: "Instructor",
    to: false,
    from: false,
  },
  {
    name: "John B.",
    type: "Instructor",
    to: false,
    from: false,
  },
];

const RollCallModal = ({ activity, setSelectedActivity, buses, setBuses }) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [{ selectedActivity }] = useStateValue();

  const dispatch = useDispatch();
  const [markAll, setMarkAll] = useState(false);
  const [approvals, setApprovals] = useState(_approvals);
  const [isToggle, setIsToggle] = useState({});

  const [isAttendance, setisAttendance] = useState(false);
  const list = [];
  const [rollCall, setRollCall] = useState(false);
  const [attendanceDetail, setAttendanceDetail] = useState({});
  const [saved, setSaved] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [thumbnail, setThumbnail] = useState(false);
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([...list]);
  const isVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.rollCallModalVisibility
  );
  const showVehicle = useSelector(
    (state: { modal: ModalState }) => state.modal.setupVehicleModal
  );

  const getApprovedStudents = async () => {
    let body = {
      activityId: selectedActivity?.activityId,
      status: "approved",
      page: 0,
      page_size: 1000,
    };

    // console.log("body", body);
    FindAllStudentsWhichActivity(body)
      .then((res) => {
        console.log("res", res);
        addIsToggle(res, []);
        // setStudents(res);
      })
      .catch((err) => {
        console.log("err", err);
      });
  };
  const getApprovedInstructors = async () => {
    let body = {
      activityId: selectedActivity?.activityId,
      status: "approved",
      page: 0,
      page_size: 1000,
    };

    // console.log("body", body);
    FindAllIstructorActivities(body)
      .then((res) => {
        console.log("res", res);
        // setInstructors(res);
        addIsToggle([], res);
      })
      .catch((err) => {
        console.log("err", err);
      });
  };
  const createAttendance = (stdArr: any, instrArr: any) => {
    let tempStudents = students?.map((item) => ({
      id: item?.studentId,
      journeyStartToDestination: item?.journeyStartToDestination || false,
      journeyStartToOrigin: item.journeyStartToOrigin || false,
    }));
    let tempInstructors = instructors?.map((item) => ({
      id: item?.instructorId,
      journeyStartToDestination: item?.journeyStartToDestination || false,
      journeyStartToOrigin: item?.journeyStartToOrigin || false,
    }));

    let body = {
      attendanceId: 0,
      activityId: selectedActivity?.activityId,
      student: stdArr || tempStudents,
      instructors: instrArr || tempInstructors,
    };
    console.log("body---", body);
    CreateAttendance(body)
      .then((res) => {
        Toast.show({
          type: "success",
          text2: "Attendance saved Successfully",
        });
      })
      .catch((err) => {
        console.log("err", err);
      });
  };
  const updateAttendance = (stdArr: any, instrArr: any) => {
    let tempStudents = students?.map((item) => ({
      id: item?.studentId,
      journeyStartToDestination: item?.journeyStartToDestination || false,
      journeyStartToOrigin: item.journeyStartToOrigin || false,
    }));
    let tempInstructors = instructors?.map((item) => ({
      id: item?.instructorId,
      journeyStartToDestination: item?.journeyStartToDestination || false,
      journeyStartToOrigin: item?.journeyStartToOrigin || false,
    }));
    let body = {
      attendanceId: isAttendance?.attendanceId,
      activityId: selectedActivity?.activityId,
      student: stdArr || tempStudents,
      instructors: instrArr || tempInstructors,
    };
    EditAttendance(body)
      .then((res) => {
        Toast.show({
          type: "success",
          text2: "Attendance saved Successfully",
        });
      })
      .catch((err) => {
        console.log("err", err);
      });
  };
  const fetchAttendance = () => {
    GetAttendance(selectedActivity?.activityId)
      .then((res) => {
        console.log("resss", res);
        if (!res?.data[0]?.attendanceId) {
          getApprovedStudents();
          getApprovedInstructors();
        } else {
          setisAttendance(res.data);
          console.log("res", res?.data[0]);
          addIsToggle(res?.data[0]?.student, res?.data[0]?.instructors);
          // setStudents(res?.data?.students);
          // setInstructors(res?.data?.instructors);
        }
        setAttendanceDetail(res?.data);
      })
      .catch((err) => {
        console.log("err", err);
      });
  };
  const addIsToggle = (students, instructors) => {
    let tempStudents = students?.map((item) => ({
      ...item,
      journeyStartToDestination: item?.journeyStartToDestination || false,
      journeyStartToOrigin: item.journeyStartToOrigin || false,
    }));
    let tempInstructors = instructors?.map((item) => ({
      ...item,
      journeyStartToDestination: item?.journeyStartToDestination || false,
      journeyStartToOrigin: item.journeyStartToOrigin || false,
    }));
    console.log("temp students", tempStudents);
    console.log("temp instructors", tempInstructors || []);
    setInstructors(tempInstructors || []);
    setStudents(tempStudents || []);
  };

  const handleMarkAll = (students, instructors) => {
    let tempStudents = students?.map((item) => ({
      ...item,
      journeyStartToDestination: true,
      journeyStartToOrigin: true,
    }));
    let tempInstructors = instructors?.map((item) => ({
      ...item,
      journeyStartToDestination: true,
      journeyStartToOrigin: true,
    }));
    setInstructors(tempInstructors);
    setStudents(tempStudents);
  };
  console.log("kkwkwk", attendanceDetail);
  useEffect(() => {
    setThumbnail(false);
    if (isFocused) {
      fetchAttendance();
    }
  }, [isFocused]);

  const handleToChange = (index, type) => {
    const data = type == "student" ? [...students] : [...instructors];
    const item = data[index];
    item.journeyStartToDestination = !item.journeyStartToDestination;
    data[index] = item;
    type == "student" ? setStudents(data) : setInstructors(data);
  };

  const handleFromChange = (index, type) => {
    const data = type == "student" ? [...students] : [...instructors];
    const item = data[index];
    item.journeyStartToOrigin = !item.journeyStartToOrigin;
    data[index] = item;
    type == "student" ? setStudents(data) : setInstructors(data);
  };

  const RightDrawerAction = () => (
    <TopNavigationAction
      icon={(props: any) => (
        <Icon {...props} name="close-circle-outline" fill={Colors.white} />
      )}
      onPress={() => {
        dispatch(ChangeModalState.action({ rollCallModalVisibility: false }));
        setSelectedActivity(null);
      }}
    />
  );

  // @ts-ignore
  return (
    <View>
      <MarkAllRollCallModal
        visible={markAll}
        setVisible={() => {
          setMarkAll(false);
        }}
        onSave={(to, from) => {
          let temp = students.map((item) => ({
            id: item?.studentId,
            journeyStartToDestination: to,
            journeyStartToOrigin: from,
          }));
          let temp1 = instructors.map((item) => ({
            id: item?.instructorId,
            journeyStartToDestination: to,
            journeyStartToOrigin: from,
          }));

          isAttendance
            ? updateAttendance(temp, temp1)
            : createAttendance(temp, temp1);
          setSaved(true);
          setRollCall(false);
        }}
      />
      <View style={{ flex: 1, zIndex: -30 }}>
        <Modal
          propagateSwipe={true}
          coverScreen={true}
          isVisible={isVisible}
          style={{ margin: 0, marginTop: 50 }}
          swipeDirection="down"
          onSwipeComplete={() => {
            dispatch(
              ChangeModalState.action({ rollCallModalVisibility: false })
            );
            setSelectedActivity(null);
          }}
          onBackdropPress={() => {
            dispatch(
              ChangeModalState.action({ rollCallModalVisibility: false })
            );
            setSelectedActivity(null);
          }}
          onBackButtonPress={() => {
            dispatch(
              ChangeModalState.action({ rollCallModalVisibility: false })
            );
            setSelectedActivity(null);
          }}
        >
          <>
            <View style={styles.background}>
              <TopNavigation
                style={styles.topNav}
                title={() => (
                  <Text
                    style={{
                      color: Colors.white,
                      marginLeft: 20,
                      fontSize: 18,
                    }}
                  >
                    Trip: {activity?.activityName || ""}
                  </Text>
                )}
                appearance="control"
                alignment="start"
                accessoryRight={RightDrawerAction}
              />
            </View>

            <View style={{ flex: 1, backgroundColor: Colors.white }}>
              <View style={styles.layout}>
                <View style={{ flex: 1, paddingHorizontal: 20 }}>
                  <View
                    style={{
                      justifyContent: "flex-end",
                      alignItems: "flex-end",
                      marginTop: 10,
                      flexDirection: "row",
                    }}
                  >
                    <Text>Use Bus Configuiration</Text>
                    <Switch
                      style={{ marginLeft: 20 }}
                      trackColor={{ false: "#767577", true: "#50CBC7" }}
                      thumbColor={Colors.white}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={() => {
                        setThumbnail(!thumbnail);
                        if (
                          attendanceDetail.length > 0 &&
                          attendanceDetail[0]?.buses?.length > 0
                        ) {
                          navigation.navigate("DragDropStudent", {
                            bus: { busId: attendanceDetail[0]?.buses[0] },
                            students: students,
                            activity: activity,
                            attendanceMark: true,
                          });
                        } else {
                          dispatch(
                            ChangeModalState.action({
                              setupVehicleModal: true,
                              rollCallModalVisibility: false,
                            })
                          );
                        }
                      }}
                      value={thumbnail}
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      marginTop: 10,
                    }}
                  >
                    <Text>{`To`}</Text>
                    <Text style={{ marginLeft: 10 }}>{`From`}</Text>
                  </View>
                  <View style={{ marginTop: 10, maxHeight: 150 }}>
                    <FlatList
                      data={students}
                      renderItem={({ item, index }) => (
                        <View
                          style={{
                            marginVertical: 2,
                            padding: 2,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            {item.type === "Instructor" ? (
                              <Ionicons
                                name="person"
                                color={Colors.secondaryDark}
                                size={20}
                                style={{ marginHorizontal: 5 }}
                              />
                            ) : (
                              <Entypo
                                name="book"
                                color={Colors.secondaryDark}
                                size={20}
                                style={{ marginHorizontal: 5 }}
                              />
                            )}
                            <Text style={{ marginLeft: 10 }}>{`${
                              item?.firstName || item?.firstname
                            } ${item?.lastName || item?.lastname}`}</Text>
                          </View>
                          {(rollCall || saved) && (
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <CheckBox
                                checked={item?.journeyStartToDestination}
                                disabled={saved}
                                onChange={() =>
                                  handleToChange(index, "student")
                                }
                              >
                                {""}
                              </CheckBox>
                              <CheckBox
                                checked={item?.journeyStartToOrigin}
                                disabled={saved}
                                style={{ marginLeft: 30 }}
                                onChange={() =>
                                  handleFromChange(index, "student")
                                }
                              >
                                {""}
                              </CheckBox>
                            </View>
                          )}
                        </View>
                      )}
                    />
                    <FlatList
                      data={instructors}
                      renderItem={({ item, index }) => (
                        <View
                          style={{
                            marginVertical: 2,
                            padding: 2,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <Ionicons
                              name="person"
                              color={Colors.secondaryDark}
                              size={20}
                              style={{ marginHorizontal: 5 }}
                            />

                            <Text
                              style={{ marginLeft: 10 }}
                            >{`${item.firstName} ${item.lastName}`}</Text>
                          </View>
                          {(rollCall || saved) && (
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <CheckBox
                                checked={item?.journeyStartToDestination}
                                disabled={saved}
                                onChange={() =>
                                  handleToChange(index, "instructor")
                                }
                              >
                                {""}
                              </CheckBox>
                              <CheckBox
                                checked={item?.journeyStartToOrigin}
                                disabled={saved}
                                style={{ marginLeft: 30 }}
                                onChange={() =>
                                  handleFromChange(index, "instructor")
                                }
                              >
                                {""}
                              </CheckBox>
                            </View>
                          )}
                        </View>
                      )}
                    />
                  </View>
                </View>
                <View
                  style={{
                    bottom: 30,
                    left: 0,
                    right: 0,
                    alignItems: "center",
                    width: "90%",
                    alignSelf: "center",
                  }}
                >
                  {!rollCall && (
                    <>
                      <LinearGradientButton
                        onPress={() => {
                          setSaved(false);
                          setRollCall(true);
                        }}
                      >
                        Roll Call
                      </LinearGradientButton>

                      <TouchableOpacity
                        onPress={() => {
                          dispatch(
                            ChangeModalState.action({
                              rollCallModalVisibility: false,
                            })
                          );
                          setSelectedActivity(null);
                        }}
                      >
                        <Text
                          style={[styles.button, { color: Colors.primary }]}
                        >
                          Close
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {rollCall && (
                    <LinearGradientButton onPress={() => setMarkAll(true)}>
                      Mark All
                    </LinearGradientButton>
                  )}
                  <View style={{ marginVertical: 10 }} />
                  {rollCall && (
                    <LinearGradientButton
                      gradient={[Colors.primaryLight, Colors.primaryDark]}
                      onPress={() => {
                        isAttendance ? updateAttendance() : createAttendance();
                        setSaved(true);
                        setRollCall(false);
                      }}
                    >
                      Save
                    </LinearGradientButton>
                  )}
                </View>
              </View>
            </View>
          </>
        </Modal>
      </View>
    </View>
  );
};
export default RollCallModal;

const styles = StyleSheet.create({
  container: {
    minHeight: 192,
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    width: "90%",
  },
  modal: { borderRadius: 10 },
  header: { flex: 1, textAlign: "center", fontWeight: "bold", fontSize: 20 },
  body: { flex: 3 },
  background: {
    flex: 0,
    color: Colors.white,
    zIndex: -1,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  topNav: {
    color: Colors.white,
  },
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
  bottomButton: {
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
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
