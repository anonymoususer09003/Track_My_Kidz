import React, { useEffect, useState, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  Text,
  Icon,
  Input,
  Select,
  SelectItem,
  CheckBox,
  useTheme,
} from "@ui-kitten/components";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { StackActions } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Colors from "@/Theme/Colors";
import AntDesign from "react-native-vector-icons/AntDesign";
import { LinearGradientButton } from "@/Components";
import { InstructionsModal } from "@/Modals";
import { Formik } from "formik";
import { AppHeader } from "@/Components";
import Toast from "react-native-toast-message";
import { AddMembersStudentsState } from "@/Store/AddMembersStudents";
import ChangeAddMembersStudentsState from "@/Store/AddMembersStudents/ChangeAddMembersStudentsState";
import { GetAllInstructors } from "@/Services/Instructor";
import {
  CreateGroup,
  NotifyToInstructors,
  NotifyToParent,
  UpdateGroup,
  DeleteParticipant,
} from "@/Services/Group";
import { useStateValue } from "@/Context/state/State";
import { actions } from "@/Context/state/Reducer";
import FetchOne from "@/Services/User/FetchOne";
import { loadUserId, loadUserType } from "@/Storage/MainAppStorage";
import {
  GetInstructor,
  FindInstructorBySchoolOrg,
} from "@/Services/Instructor";
import { template } from "@babel/core";
const AddMembersInstructorScreen = ({ route }) => {
  const navigation = useNavigation();
  const [{ group, orgInstructors }, _dispatch] = useStateValue();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [deletedInstructors, setDeletedInstructors] = useState([]);
  const students = useSelector(
    (state: { students: AddMembersStudentsState }) => state.students?.students
  );
  console.log("group", group);
  const theme = useTheme();
  const [askPermission, setAskPermission] = useState(false);
  const [user, setUser] = useState(null);

  const getAllInstructors = () => {
    GetAllInstructors(0, 10)
      .then((res) => {
        setInstructors(res?.result);
      })
      .catch((err) => console.log("Error:", err));
  };
  const getInstructor = async () => {
    console.log("instructor------------------");
    const userId = await loadUserId();

    console.log("instructor------------------");
    GetInstructor(userId)
      .then((res) => {
        console.log("res", res);
        setUser(res);
        FindInstructorBySchoolOrg({
          schoolId: res?.schoolId,
          // 2198,
          // res?.schoolId,
          orgId: res?.orgId || null,
        })
          .then((instructors) => {
            setInstructors(instructors);
            // setOrgInfo(org);
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => {
        console.log("Error:", err);
      });
  };
  console.log("user", user);
  useEffect(() => {
    // loadUserDetails();

    if (isFocused) {
      // if (orgInstructors?.result) {
      //   setSelectedInstructors(orgInstructors?.result);
      // }
      getInstructor();
    }
    if (group?.isEdit) {
      setSelectedInstructors(group?.isEdit?.instructors);
    }
    // getAllInstructors();
  }, [isFocused]);

  const handleSelectInstructor = (index, status) => {
    const data = [...instructors];
    if (status) {
      const item = data[index];

      // console.log("if", item);
      const filterDeletedInstrutors = deletedInstructors.filter(
        (instructor) => instructor?.email != item?.email
      );
      setDeletedInstructors(filterDeletedInstrutors);
      const _selectedInstructors = [...selectedInstructors];
      if (
        !_selectedInstructors.find(
          (i) => i?.instructorId === item?.instructorId
        )
      ) {
        _selectedInstructors.push(item);
        setSelectedInstructors(_selectedInstructors);
      }
    } else {
      const item = selectedInstructors[index];
      if (group?.isEdit) {
      }
      const filterDeletedInstrutors = deletedInstructors.filter(
        (instructor) => instructor?.email != item?.email
      );
      setDeletedInstructors([...deletedInstructors, item]);
      let _selectedInstructors = [...selectedInstructors];
      _selectedInstructors = _selectedInstructors.filter(
        (i) => i?.instructorId !== item?.instructorId
      );
      setSelectedInstructors(_selectedInstructors);
    }
  };

  // const loadUserDetails = async () => {
  //   FetchOne().then((res) => {
  //     setUser(res);
  //   });
  // };
  // console.log("groups", group);
  console.log("group----", group);
  const handleSubmit = () => {
    console.log("user", user);
    const data = {
      ...group,

      students: [],
      instructors: [],
      status: "approved",
      schoolId: user?.schoolId || null,
      orgId: user?.orgId || null,
      aggrement: true,
      requestPermission: true,
      optin: {
        ...group.optin,

        status: true,
      },
      schedule: {
        recurrence: 0,
        fromDate: new Date(),
        toDate: new Date(),
        days: "0000000",
        status: "enabled",
      },
    };
    if (group?.isEdit) {
      data["id"] = group?.isEdit?.groupId;
    }
    delete data["isEdit"];
    console.log("989889", group?.isEdit);
    if (!group?.isEdit) {
      CreateGroup(data)
        .then(async (res) => {
          console.log("res0000000020202020020202020", res);
          Toast.show({
            type: "success",
            text2:
              "Permission request has been sent to parents and invited instructors",
          });

          // console.log("group", group);
          const _students = group?.students?.map((item) => ({
            firstName: item?.name?.split(" ")[0],
            lastName: item?.name?.split(" ")[1],
            parentEmail1: item?.parent1_email,
            parentEmail2: item?.parent2_email,
          }));

          console.log("students90909090", _students);
          try {
            let notifyToParents = await NotifyToParent(res?.groupId, _students);
            console.log("notiftoparent", notifyToParents);
            // NotifyToParent(res?.groupId, _students)
            //   .then((res) => {
            //     console.log("parent", res);
            //   })
            //   .catch((err) => console.log("NotifyToInstructors", err));
            const _instructors = [];
            selectedInstructors.map((item) => {
              if (!item?.isEdit) {
                _instructors.push({
                  firstName: item?.firstname,
                  lastName: item?.lastname,
                  email: item?.email,
                });
              }
            });
            console.log("instructris", _instructors);
            let notifyToInstructor = await NotifyToInstructors(
              res?.groupId,
              _instructors
            );
            console.log("notifyToInsftructor", notifyToInstructor);
            if (notifyToParents && notifyToInstructor) {
              _dispatch({
                type: actions.SET_GROUP,
                payload: null,
              });
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: "InstructorActivity",
                    params: {
                      screen: "InstructorGroup",
                    },
                  },
                ],
              });
              setAskPermission(false);
              dispatch(
                ChangeAddMembersStudentsState.action({
                  students: [],
                })
              );
              setSelectedInstructors([]);
            }
          } catch (err) {
            console.log("err", err);
            Toast.show({
              type: "success",
              text2: "Something went wrong",
            });
          }
          // NotifyToInstructors(res?.groupId, _instructors)
          //   .then((res) => {
          //     console.log(res);
          //     navigation.navigate("InstructorActivity", {
          //       screen: "InstructorGroup",
          //     });
          //   })
          //   .catch((err) => console.log("NotifyToInstructors", err));
        })
        .catch((err) => {
          console.log("CreateGroup", err);
        });
    } else {
      UpdateGroup(data)
        .then(async (res) => {
          console.log("res0000000020202020020202020", res);
          Toast.show({
            type: "success",
            text2:
              "Permission request has been sent to parents and invited instructors",
          });

          // console.log("group", group);
          const _students = group?.students?.map((item) => ({
            firstName: item?.name?.split(" ")[0],
            lastName: item?.item?.name?.split(" ")[1] || "",
            parentEmail1: item?.parent1_email,
            parentEmail2: item?.parent2_email,
          }));

          console.log("students90909090", _students);
          try {
            let notifyToParents = true;
            if (_students && _students?.length > 0) {
              notifyToParents = await NotifyToParent(
                group?.isEdit?.groupId,
                _students
              );
            }

            console.log("notiftoparent", notifyToParents);
            // NotifyToParent(res?.groupId, _students)
            //   .then((res) => {
            //     console.log("parent", res);
            //   })
            //   .catch((err) => console.log("NotifyToInstructors", err));
            const _instructors = selectedInstructors.map((item) => ({
              firstName: item?.firstname,
              lastName: item?.lastname,
              email: item?.email,
            }));
            console.log("instructris", _instructors);
            let notifyToInstructor = true;
            if (_instructors?.length > 0) {
              await NotifyToInstructors(group?.isEdit?.groupId, _instructors);
              notifyToInstructor = true;
            }
            console.log("notifyToInsftructor", notifyToInstructor);

            if (notifyToParents && notifyToInstructor) {
              setDeletedInstructors([]);
              _dispatch({
                type: actions.SET_GROUP,
                payload: null,
              });
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: "InstructorActivity",
                    params: {
                      screen: "InstructorGroup",
                    },
                  },
                ],
              });
              setAskPermission(false);
              dispatch(
                ChangeAddMembersStudentsState.action({
                  students: [],
                })
              );
              setSelectedInstructors([]);
            }
            let deletedInstructor = [];
            let deletedStudents = [];
            deletedInstructors.map((item) => {
              deletedInstructor.push(item?.instructorId);
            });
            if (group?.deletedStudent) {
              group?.deletedStudent.map((item) => {
                deletedStudents.push(item?.studentId);
              });
            }
            let deleteParticipant = await DeleteParticipant({
              studentId: deletedStudents.length == 0 ? [0] : deletedStudents,
              instructorId:
                deletedInstructor.length == 0 ? [0] : deletedInstructor,
              groupId: group?.isEdit?.groupId,
            });
            console.log("deleteParticipant", deleteParticipant);
          } catch (err) {
            console.log("err", err);
            Toast.show({
              type: "success",
              text2: "Something went wrong",
            });
          }
          // NotifyToInstructors(res?.groupId, _instructors)
          //   .then((res) => {
          //     console.log(res);
          //     navigation.navigate("InstructorActivity", {
          //       screen: "InstructorGroup",
          //     });
          //   })
          //   .catch((err) => console.log("NotifyToInstructors", err));
        })
        .catch((err) => {
          console.log("CreateGroup", err);
        });
    }
  };

  return (
    <ScrollView>
      <View style={styles.layout}>
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          <View style={{ marginTop: 10, maxHeight: 150 }}>
            <FlatList
              data={instructors}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={{
                    marginVertical: 2,
                    padding: 2,
                    backgroundColor: selectedInstructors.find((i) => i === item)
                      ? Colors.primary
                      : "transparent",
                  }}
                  onPress={() => handleSelectInstructor(index, true)}
                >
                  <Text
                    style={{
                      color: selectedInstructors.find((i) => i === item)
                        ? Colors.white
                        : Colors.black,
                    }}
                  >
                    {`${item.firstname} ${item.lastname}`}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
          <View style={{ marginVertical: 5 }}>
            <Text
              style={{ textAlign: "center" }}
            >{`Selection: ${selectedInstructors?.length}`}</Text>
          </View>
          <View style={{ marginTop: 10, maxHeight: 150 }}>
            <FlatList
              data={selectedInstructors}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={{
                    marginVertical: 2,
                    padding: 2,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                  onPress={() => handleSelectInstructor(index, false)}
                >
                  <Text>{`${item.firstname} ${item.lastname}`}</Text>
                  <AntDesign name="close" color={Colors.primary} size={20} />
                </TouchableOpacity>
              )}
            />
          </View>
          <View style={{ marginVertical: 20 }}>
            {/* <CheckBox
              style={{ marginLeft: 20 }}
              checked={askPermission}
              onChange={() => setAskPermission(!askPermission)}
            >
              Request Permission from instructor
            </CheckBox> */}
          </View>
          <View style={styles.buttonSettings}>
            <View
              style={[
                styles.background,
                {
                  backgroundColor:
                    // selectedInstructors.length === 0
                    //   ? Colors.lightgray
                    //   :
                    Colors.primary,
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.background,
                  {
                    backgroundColor:
                      // selectedInstructors.length === 0
                      //   ? Colors.lightgray
                      //   :
                      Colors.primary,
                  },
                ]}
                // disabled={selectedInstructors.length === 0}
                onPress={() => {
                  console.log("deleted instructors", deletedInstructors);
                  // const _instructors = [];
                  // selectedInstructors.map((item) => {
                  //   if (!item?.isEdit) {
                  //     _instructors.push({
                  //       firstName: item?.firstname,
                  //       lastName: item?.lastname,
                  //       email: item?.email,
                  //     });
                  //   }
                  // });
                  // console.log("instructris", _instructors);
                  handleSubmit();
                }}
              >
                <Text style={styles.button}>
                  {group?.isEdit ? "Update Group" : "Invite to Group"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.background}>
              <TouchableOpacity
                style={styles.background}
                onPress={() => {
                  navigation.reset({
                    index: 0,
                    routes: [
                      {
                        name: "InstructorActivity",
                        params: {
                          screen: "InstructorGroup",
                        },
                      },
                    ],
                  });
                  setAskPermission(false);
                  dispatch(
                    ChangeAddMembersStudentsState.action({
                      students: [],
                    })
                  );
                  _dispatch({
                    type: actions.SET_GROUP,
                    payload: null,
                  });
                  setSelectedInstructors([]);
                }}
              >
                <Text style={styles.button}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default AddMembersInstructorScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: "column",
    paddingTop: 20,
  },
  mainLayout: {
    flex: 1,
    marginTop: 40,
  },
  sppinerContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  sent: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "left",
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
  formContainer: {
    flex: 1,
  },
  buttonSettings: {
    marginTop: 20,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  errorText: {
    fontSize: 10,
    color: "red",
    marginLeft: 10,
    marginTop: 10,
  },
});
