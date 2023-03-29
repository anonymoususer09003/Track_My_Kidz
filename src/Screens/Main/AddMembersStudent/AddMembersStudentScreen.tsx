import React, { useEffect, useState, useRef } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Text,
  Icon,
  CheckBox,
  Select,
  SelectItem,
  Input,
} from "@ui-kitten/components";
import {
  StyleSheet,
  View,
  Linking,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { useIsFocused } from "@react-navigation/native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Colors from "@/Theme/Colors";
import AntDesign from "react-native-vector-icons/AntDesign";
import DocumentPicker from "react-native-document-picker";
import Papa from "papaparse";
import ChangeAddMembersStudentsState from "@/Store/AddMembersStudents/ChangeAddMembersStudentsState";
import { useStateValue } from "@/Context/state/State";
import { actions } from "@/Context/state/Reducer";
import { AddIndividialMembersModal } from "@/Modals";

const AddMembersStudentScreen = ({ route }) => {
  const isFocused = useIsFocused();
  const [{ group }, _dispatch] = useStateValue();
  const navigation = useNavigation();
  const studentss = useSelector(
    (state: { students: AddMembersStudentsState }) => state.students?.students
  );
  const dispatch = useDispatch();
  const [selctedGrade, setSelectedGrade] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [askPermission, setAskPermission] = useState(false);
  const [students, setStudents] = useState([]);
  const [deletedStudents, setDeletedStudents] = useState([]);
  // const _students = useSelector(
  //     (state: { students: AddMembersStudentsState }) =>
  //         state.students?.students,
  // )
  const handleSelectStudent = (index, status) => {
    const data = [...students];
    if (status) {
      const item = data[index];
      console.log("item------if", item);
      // let filterRemoveStudents=deletedStudents.filter((student)=>student.)
      const _selectedStudents = [...selectedStudents];
      _selectedStudents.push(item);
      setSelectedStudents(_selectedStudents);
      dispatch(
        ChangeAddMembersStudentsState.action({
          students: _selectedStudents,
        })
      );
    } else {
      const item = selectedStudents[index];
      console.log("else------", item);
      let _selectedStudents = [...selectedStudents];
      _selectedStudents = _selectedStudents.filter((i) => i !== item);
      setSelectedStudents(_selectedStudents);
      const filterDeletedInstrutors = deletedInstructors.filter(
        (instructor) => instructor?.email != item?.email
      );
      setDeletedInstructors(filterDeletedInstrutors);
      dispatch(
        ChangeAddMembersStudentsState.action({
          students: _selectedStudents,
        })
      );
    }
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      const data = [...students];
      const _data = [];
      data.forEach((i) => _data.push(i));
      setSelectedStudents(_data);
      dispatch(
        ChangeAddMembersStudentsState.action({
          students: _data,
        })
      );
    } else {
      setSelectedStudents([]);
      dispatch(
        ChangeAddMembersStudentsState.action({
          students: [],
        })
      );
    }
  };

  const handleSubmit = () => {
    let addStudents = [...students];
    let temp = [];
    if (group?.isEdit) {
      addStudents.map((item) => {
        if (!item?.studentId) {
          temp.push(item);
        }
      });
    }
    addStudents = group?.isEdit ? temp : [...students];
    let filter = addStudents.filter((s) => s?.firstName !== "");
    console.log("deletedstudent", deletedStudents);
    console.log("students---", filter);
    // deletedStudent: group?.isEdit ? deletedStudents : false,
    // students: addStudents.filter((s) => s?.firstName !== ""),

    _dispatch({
      type: actions.SET_GROUP,
      payload: {
        ...group,
        deletedStudent: group?.isEdit ? deletedStudents : false,
        students: addStudents.filter((s) => s?.firstName !== ""),
      },
    });
    navigation.navigate("AddMembers", {
      screen: "AddMembersInstructor",
      data: group?.isEdit ? true : false,
    });
  };

  const handleImport = () => {
    DocumentPicker.pick({ type: [DocumentPicker.types.csv] })
      .then((res) => {
        Papa.parse(res[0].fileCopyUri, {
          download: true,
          delimiter: ",",
          complete: function (results: any) {
            const _data: any = [];
            if (results.data && results.data.length > 0) {
              let i = 1;
              results.data.map((item: any) => {
                const items = item[0].split(";");
                _data.push({
                  id: i,
                  firstName: items[0],
                  lastName: items[1],
                  email: items[2],
                });
                i = i + 1;
              });
              setStudents(_data);
            }
          },
          error: function (error: any) {},
        });
      })
      .catch((err) => {});
  };

  const handleRemoveStudent = (item) => {
    let data = [...students];
    console.log("item", item);
    if (!item?.studentId) {
      data = data.filter((d) => d.parent1_email !== item.parent1_email);
    } else {
      setDeletedStudents([...deletedStudents, item]);
      data = data.filter((d) => d?.studentId !== item?.studentId);
    }
    setStudents(data);
  };
  const resetFields = () => {
    dispatch(
      ChangeAddMembersStudentsState.action({
        students: [],
      })
    );
    setSelectedStudents([]);
    setAskPermission(false);
  };

  useEffect(() => {
    setSelectedStudents([]);
    setAskPermission(false);
    setStudents([]);
    if (isFocused && group?.isEdit) {
      setStudents(group?.isEdit?.students);
      // setSelectedStudents([...group?.isEdit?.students]);
    }
  }, [isFocused]);

  return (
    <ScrollView>
      <AddIndividialMembersModal
        individuals={students}
        setIndividuals={setStudents}
        hideImport
      />
      <View style={styles.layout}>
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          <View
            style={{
              marginVertical: 10,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                color: Colors.primary,
                fontSize: 18,
                fontWeight: "700",
              }}
            >
              Add Students
            </Text>
            <AntDesign
              name="pluscircle"
              size={25}
              color={Colors.primary}
              onPress={() =>
                dispatch(
                  ChangeModalState.action({
                    addIndividualMemberModalVisibility: true,
                  })
                )
              }
            />
          </View>
          <View style={{ marginTop: 10, maxHeight: 150 }}>
            <FlatList
              data={students}
              style={{ minHeight: 320 }}
              nestedScrollEnabled
              renderItem={({ item, index }) => (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 2.5,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text>{item.name}</Text>
                  </View>
                  <AntDesign
                    name="delete"
                    color={Colors.primary}
                    size={20}
                    style={{ marginHorizontal: 5 }}
                    onPress={() => handleRemoveStudent(item)}
                  />
                </View>
              )}
            />
            {false && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={styles.bottomButton}>
                  <TouchableOpacity
                    style={styles.bottomButton}
                    onPress={handleImport}
                  >
                    <Text style={styles.button}>Import from CSV</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(
                      "https://csv-tmk.s3.us-east-2.amazonaws.com/Student.csv"
                    )
                  }
                >
                  <Text
                    style={{
                      color: Colors.primary,
                      textDecorationLine: "underline",
                      fontSize: 14,
                    }}
                  >
                    Download Template
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View style={{ marginTop: 10, maxHeight: 150 }}>
            <FlatList
              data={selectedStudents}
              nestedScrollEnabled
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={{
                    marginVertical: 2,
                    padding: 2,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                  onPress={() => handleSelectStudent(index, false)}
                >
                  <Text>{item}</Text>
                  <AntDesign name="close" color={Colors.primary} size={20} />
                </TouchableOpacity>
              )}
            />
          </View>
          {/* <View style={{ marginVertical: 20, marginTop: 270 }}>
            <CheckBox
              style={{ marginLeft: 20 }}
              checked={askPermission}
              onChange={() => setAskPermission(!askPermission)}
            >
              {"Request Permission from Parents/Guardian"}
            </CheckBox>
          </View> */}
          <View style={[styles.buttonSettings, { paddingBottom: 20 }]}>
            <View
              style={[
                styles.background,
                {
                  backgroundColor:
                    students.filter((s) => s.firstName !== "").length === 0
                      ? Colors.lightgray
                      : Colors.primary,
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.background,
                  {
                    backgroundColor:
                      students.filter((s) => s.firstName !== "").length === 0
                        ? Colors.lightgray
                        : Colors.primary,
                  },
                ]}
                disabled={
                  students.filter((s) => s.firstName !== "").length === 0
                }
                onPress={handleSubmit}
              >
                <Text style={styles.button}>Continue</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.background}>
              <TouchableOpacity
                style={styles.background}
                onPress={() => {
                  resetFields();
                  navigation.reset({
                    index: 0,
                    routes: [
                      {
                        name: "InstructorActivity",
                      },
                    ],
                  });
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

export default AddMembersStudentScreen;

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
  bottomButton: {
    width: "60%",
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
