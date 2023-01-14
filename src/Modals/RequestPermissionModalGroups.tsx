import React, { useEffect, useState, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  Text,
  CheckBox,
  TopNavigation,
  TopNavigationAction,
  Icon,
} from "@ui-kitten/components";
import { StyleSheet, View, FlatList, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Colors from "@/Theme/Colors";
import Entypo from "react-native-vector-icons/Entypo";
import Ionicons from "react-native-vector-icons/Ionicons";
import AntDesign from "react-native-vector-icons/AntDesign";
import { LinearGradientButton } from "@/Components";
import moment from "moment";
import { InstructionsModal, DeclineActivityModal } from "@/Modals";
import SearchBar from "@/Components/SearchBar/SearchBar";
import { ModalState } from "@/Store/Modal";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Modal from "react-native-modal";
import {
  CreateGroup,
  NotifyToInstructors,
  NotifyToParent,
} from "@/Services/Group";
import Toast from "react-native-toast-message";
import { useStateValue } from "@/Context/state/State";
import { actions } from "@/Context/state/Reducer";
import {
  FindAllStudentsWhichActivity,
  FindAllIstructorActivities,
  SendEmailToPendingStudent,
} from "@/Services/Activity";
import {
  GetPendingApprovedInstructors,
  GetPendingApprovedStudents,
} from "@/Services/Group";

const RequestPermissionModal = ({ activity }) => {
  const [{ selectedActivity }, _dispatch] = useStateValue();
  console.log("selectedActivity", selectedActivity);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [students, setStudents] = useState(activity?.studentsActivity);
  const [instructors, setInstructors] = useState(activity?.instructorsActivity);

  const [selectAll, setSelectAll] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("pending");

  const isVisible = useSelector(
    (state: { modal: ModalState }) =>
      state.modal.requestPermissionModalGroupVisibility
  );

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      const data = [...activity?.studentsActivity];
      const _data = [];
      data.forEach((i) =>
        _data.push({
          ...i,
          selected: true,
        })
      );
      setStudents(_data);
      const instructorData = [...activity?.instructorsActivity];
      const __data = [];
      instructorData.forEach((i) =>
        __data.push({
          ...i,
          selected: true,
        })
      );
      setInstructors(__data);
    } else {
      const data = [...activity?.studentsActivity];
      const _data = [];
      data.forEach((i) =>
        _data.push({
          ...i,
          selected: false,
        })
      );
      setStudents(_data);
      const instructorData = [...activity?.instructorsActivity];
      const __data = [];
      instructorData.forEach((i) =>
        __data.push({
          ...i,
          selected: true,
        })
      );
      setInstructors(__data);
    }
  };

  const handleCheckboxChange = (index) => {
    const data = [...students];
    const item = data[index];
    item.selected = !item.selected;
    data[index] = item;
    setStudents(data);
  };

  const handleCheckboxInstructorChange = (index) => {
    const data = [...instructors];
    const item = data[index];
    item.selected = !item.selected;
    data[index] = item;
    setInstructors(data);
  };

  const handleSubmit = () => {
    const _students = students?.map((item) => ({
      firstName: item?.firstname,
      lastName: item?.lastname,
      email: item?.email,
    }));
    NotifyToParent(activity?.groupId, _students)
      .then((res) => {
        const _instructors = instructors.map((item) => ({
          firstName: item?.firstname,
          lastName: item?.lastname,
          email: item?.email,
        }));
        NotifyToInstructors(activity?.groupId, _instructors)
          .then((res) => {
            console.log(res);
            dispatch(
              ChangeModalState.action({
                requestPermissionModalGroupVisibility: false,
              })
            );
            _dispatch({
              type: actions.SET_SELECTED_ACTIVITY,
              payload: null,
            });
            setSelectAll(false);
            Toast.show({
              type: "success",
              text1: "Success",
              text2: "Permission request resent successfully.",
            });
          })
          .catch((err) => console.log("NotifyToInstructors", err));

        console.log("parent", res);
      })
      .catch((err) => console.log("NotifyToInstructors", err));

    // SendEmailToPendingStudent(body)
    //   .then((res) => {
    //     console.log("res", res);
    //     dispatch(
    //       ChangeModalState.action({
    //         requestPermissionModalGroupVisibility: false,
    //       })
    //     );
    //     _dispatch({
    //       type: actions.SET_SELECTED_ACTIVITY,
    //       payload: null,
    //     });
    //     setSelectAll(false);
    //     Toast.show({
    //       type: "success",
    //       text1: "Success",
    //       text2: "Permission request resent successfully.",
    //     });
    //   })
    //   .catch((err) => {
    //     console.log("err", err);
    //   });
    // let filterInstructors =
    //   instructors &&
    //   instructors?.map((item: any) => {
    //     if (item.selected) {
    //       ids.push(item.studentId);
    //     }
    //   });

    // console.log("id", ids);

    // dispatch(
    //   ChangeModalState.action({ requestPermissionModalGroupVisibility: false })
    // );
    // _dispatch({
    //   type: actions.SET_SELECTED_ACTIVITY,
    //   payload: null,
    // });
  };

  const RightDrawerAction = () => (
    <TopNavigationAction
      icon={(props: any) => (
        <Icon {...props} name="close-circle-outline" fill={Colors.white} />
      )}
      onPress={() => {
        dispatch(
          ChangeModalState.action({
            requestPermissionModalGroupVisibility: false,
          })
        );
        _dispatch({
          type: actions.SET_SELECTED_ACTIVITY,
          payload: null,
        });
        setSelectAll(false);
      }}
    />
  );
  console.log("selectedactvity", activity);
  const getPendingStudents = async () => {
    let body = {
      groupId: activity?.groupId,
      status: "pending",
    };
    console.log("body", body);
    GetPendingApprovedStudents(body)
      .then((res) => {
        console.log("res", res);
        setStudents(res);
      })
      .catch((err) => {
        console.log("err", err);
      });
  };
  const getPendingInstructors = async () => {
    let body = {
      groupId: activity?.groupId,
      status: "pending",
    };
    GetPendingApprovedInstructors(body)
      .then((res) => {
        console.log(
          "res ins==============00000000303399398983983899839839838998393",
          res
        );
        setInstructors(res);
      })
      .catch((err) => {
        console.log("err9999999999999999999999999999999999999", err);
      });
  };
  useEffect(() => {
    getPendingStudents();
    getPendingInstructors();
  }, []);
  // console.log("selectedacitivty-------------", selectedActivity);
  // @ts-ignore
  return (
    <Modal
      propagateSwipe={true}
      coverScreen={true}
      isVisible={isVisible}
      style={{ margin: 0, marginTop: 50 }}
      swipeDirection="down"
      onSwipeComplete={() => {
        dispatch(
          ChangeModalState.action({
            requestPermissionModalGroupVisibility: false,
          })
        );
        _dispatch({
          type: actions.SET_SELECTED_ACTIVITY,
          payload: null,
        });
      }}
      onBackdropPress={() => {
        dispatch(
          ChangeModalState.action({
            requestPermissionModalGroupVisibility: false,
          })
        );
        _dispatch({
          type: actions.SET_SELECTED_ACTIVITY,
          payload: null,
        });
      }}
      onBackButtonPress={() => {
        dispatch(
          ChangeModalState.action({
            requestPermissionModalGroupVisibility: false,
          })
        );
        _dispatch({
          type: actions.SET_SELECTED_ACTIVITY,
          payload: null,
        });
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
                  textAlign: "center",
                }}
              >
                Resend Permission Request
              </Text>
            )}
            appearance="control"
            alignment="start"
            accessoryRight={RightDrawerAction}
          />
        </View>
        <View style={{ flex: 1, backgroundColor: Colors.white }}>
          <View style={styles.layout}>
            {/* <View
              style={{
                width: "100%",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  {
                    backgroundColor:
                      selectedStatus === "approved"
                        ? Colors.primaryGray
                        : Colors.primary,
                  },
                ]}
                onPress={() => setSelectedStatus("approved")}
              >
                <Text style={styles.tabText}>Approved</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  {
                    backgroundColor:
                      selectedStatus === "declined"
                        ? Colors.primaryGray
                        : Colors.primary,
                  },
                ]}
                onPress={() => setSelectedStatus("declined")}
              >
                <Text style={styles.tabText}>Declined</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  {
                    backgroundColor:
                      selectedStatus === "pending"
                        ? Colors.primaryGray
                        : Colors.primary,
                  },
                ]}
                onPress={() => setSelectedStatus("pending")}
              >
                <Text style={styles.tabText}>Pending</Text>
              </TouchableOpacity>
            </View> */}
            <View style={{ flex: 1, paddingHorizontal: 20 }}>
              {selectedStatus !== "approved" && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 10,
                  }}
                >
                  <CheckBox checked={selectAll} onChange={handleSelectAll}>
                    {""}
                  </CheckBox>
                  <Text style={{ marginLeft: 10 }}>Select All</Text>
                </View>
              )}
              <View style={{ marginTop: 10, maxHeight: 250 }}>
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
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Entypo
                          name="book"
                          color={Colors.primary}
                          size={20}
                          style={{ marginHorizontal: 5 }}
                        />
                        <Text
                          style={{ marginLeft: 5 }}
                        >{`${item.firstName} ${item.lastName}`}</Text>
                      </View>
                      <CheckBox
                        checked={item.selected}
                        onChange={() => handleCheckboxChange(index)}
                      >
                        {""}
                      </CheckBox>
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
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Ionicons
                          name="person"
                          color={Colors.primary}
                          size={20}
                          style={{ marginHorizontal: 5 }}
                        />
                        <Text
                          style={{ marginLeft: 5 }}
                        >{`${item.firstName} ${item.lastName}`}</Text>
                      </View>
                      <CheckBox
                        checked={item.selected}
                        onChange={() => handleCheckboxInstructorChange(index)}
                      >
                        {""}
                      </CheckBox>
                    </View>
                  )}
                />
              </View>
            </View>
            {selectedStatus !== "approved" && (
              <View style={{ marginVertical: 5 }}>
                <Text style={{ textAlign: "center" }}>
                  These are yet to respond to your invitation. Select to resend
                  permission request
                </Text>
              </View>
            )}
            <View style={styles.buttonSettings}>
              {selectedStatus !== "approved" && (
                <View
                  style={[
                    styles.bottomButton,
                    {
                      backgroundColor:
                        students?.filter((i) => i.selected).length === 0
                          ? Colors.lightgray
                          : Colors.primary,
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.bottomButton,
                      {
                        backgroundColor:
                          students?.filter((i) => i.selected).length === 0
                            ? Colors.lightgray
                            : Colors.primary,
                      },
                    ]}
                    disabled={students?.filter((i) => i.selected).length === 0}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.button}>Resend Permission Request</Text>
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.bottomButton}>
                <TouchableOpacity
                  style={styles.bottomButton}
                  onPress={() => {
                    dispatch(
                      ChangeModalState.action({
                        requestPermissionModalGroupVisibility: false,
                      })
                    );
                    setSelectAll(false);
                    _dispatch({
                      type: actions.SET_SELECTED_ACTIVITY,
                      payload: null,
                    });
                  }}
                >
                  <Text style={styles.button}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </>
    </Modal>
  );
};
export default RequestPermissionModal;

const styles = StyleSheet.create({
  container: {
    minHeight: 192,
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    width: "90%",
  },
  tabButton: {
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    width: "33%",
    paddingVertical: 10,
  },
  tabText: {
    color: Colors.white,
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
  buttonSettings: {
    marginTop: 10,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 10,
  },
});
