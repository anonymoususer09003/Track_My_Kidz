import { Input, Text, Layout, Button } from "@ui-kitten/components";
import Modal from "react-native-modal";
import { useDispatch, useSelector } from "react-redux";
import { ModalState } from "@/Store/Modal";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { Formik } from "formik";
import * as yup from "yup";
import Colors from "@/Theme/Colors";
import { Dimensions, TouchableOpacity, FlatList } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Icon from "react-native-vector-icons/Entypo";
import { useIsFocused } from "@react-navigation/native";

// import { useTheme } from "@/Theme";
import {
  Table,
  TableWrapper,
  Row,
  Rows,
  Col,
  Cols,
  Cell,
} from "react-native-table-component";
import {
  GetInstructor,
  FindInstructorBySchoolOrg,
} from "@/Services/Instructor";
import { loadUserId } from "@/Storage/MainAppStorage";
import { GetSchool, UpdateSchool } from "@/Services/School";
import { AppHeader } from "@/Components";
import EditOrgInstructorsModal from "@/Modals/EditOrganizationInstructorModal";
import BackgroundLayout from "@/Components/BackgroundLayout";
const height = Dimensions.get("screen").height;

const OrgInstructorListFormModal = ({ route }: any) => {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const [visible, setVisible] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState({});
  const [rerender, setRerender] = useState(0);
  const [userId, setUserId] = useState(0);
  const [tableData, setTableData] = useState({
    tableHead: ["First Name", "Last Name", "Email", "Phone", "Admin", " "],
    tableData: [],
    item: [],
  });
  const [addEditVisible, setaddEditVisible] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const shoppingListValidationSchema = yup.object().shape({
    firstName: yup.string().required("First name is required"),
    lastName: yup.string().required("Last name is required"),
    email: yup.string().required("Email is required"),
  });
  console.log("instructor", selectedInstructor);
  const handleGetOrganizationInfo = async () => {
    const userId = await loadUserId();
  };
  const getInstructor = async () => {
    const userId = await loadUserId();
    setUserId(userId);
    GetInstructor(userId)
      .then((res) => {
        // setUser(res);
        FindInstructorBySchoolOrg({
          schoolId: res?.schoolId,
          orgId: res?.orgId,
        })
          .then((instructors) => {
            let temp = { ...tableData };
            let row = [];
            let rowItem = [];
            instructors?.map((item, index) => {
              let { firstname, lastname, email, phone, isAdmin, state } = item;
              row.push([
                firstname,
                lastname,
                email,
                phone ? phone : "",
                isAdmin,
                state,
              ]);
              rowItem.push(item);
            });
            console.log("row", row);
            temp.tableData = row;
            temp.item = rowItem;
            setTableData(temp);
            setInstructors(instructors);
            // setOrgInfo(org);
          })
          .catch((err) => console.log(err));
      })

      .catch((err) => {
        console.log("Error:", err);
      });
  };
  const formatTableData = (data: any) => {
    let temp = { ...tableData };
    let row = [];
    let rowItem = [];
    data.map((item, index) => {
      let { firstname, lastname, email, phone, phoneNumber, isAdmin, state } =
        item;
      row.push([
        firstname,
        lastname,
        email,
        phone ? phone : phoneNumber ? phoneNumber : "",
        isAdmin,
        state,
      ]);
      rowItem.push(item);
    });
    console.log("row", row);
    temp.tableData = row;
    temp.item = rowItem;
    setTableData(temp);
    // console.log("data", data);

    setInstructors(data);
  };
  useEffect(() => {
    if (isFocused) {
      getInstructor();
    }
  }, [isFocused, rerender]);
  const elements = (index, data, item) => {
    switch (index) {
      case 4:
        return (
          <Text style={{ fontSize: 13, marginLeft: 5 }}>
            {data ? "Admin" : " "}
          </Text>
        );
        break;
      default:
        return (
          <TouchableOpacity
            onPress={() => {
              setSelectedInstructor(item);
              setVisible(true);
            }}
          >
            <Icon name="dots-three-vertical" size={15} />
          </TouchableOpacity>
        );
    }
  };
  const updateInstructor = () => {};
  return (
    <BackgroundLayout title="Instructors List">
      <AppHeader
        hideCalendar={true}
        hideApproval={true}
        onAddPress={() => {
          setaddEditVisible(true);
        }}
      />
      {addEditVisible && (
        <EditOrgInstructorsModal
          userId={userId}
          isAdd={true}
          orgInfo={route.params.data}
          visible={addEditVisible}
          setRerender={() => {
            setRerender(rerender + 1);
          }}
          setAdd={(item: any) => {
            let { firstName, lastName, ...others } = item;
            let schema = {
              firstname: firstName,
              lastname: lastName,
              ...others,
            };
            let temp = [...instructors];
            temp.push(schema);
            formatTableData(temp);
            setaddEditVisible(value);
          }}
          setVisible={(value, id) => {
            setaddEditVisible(value);
            // console.log("length=-------------", temp.result.length);
          }}
          updateInstructor={(value) => updateInstructor(value)}
          getInstructor={() => null}
        />
      )}
      <EditOrgInstructorsModal
        userId={userId}
        isEdit={true}
        // setRerender={() => setRerender(rerender + 1)}
        orgInfo={route.params.data}
        visible={visible}
        instructors={selectedInstructor}
        onEdit={(item) => {
          let { firstName, lastName, ...others } = item;
          let schema = {
            firstname: firstName,
            lastname: lastName,
            ...others,
          };
          let temp = [...instructors];

          // console.log("length=-------------", temp.result.length);
          let index = temp.findIndex(
            (item) => item?.instructorId == selectedInstructor.instructorId
          );
          let temValue = { ...temp[index] };
          temValue = schema;
          temp[index] = temValue;

          // console.log("temp", temp.result.length);

          formatTableData(temp);
          setVisible(false);
        }}
        setVisible={(value, id) => {
          let temp = [...instructors];
          setVisible(value);
          // console.log("length=-------------", temp.result.length);

          temp = instructors.filter((item) => item.instructorId != id);
          // console.log("temp", temp.result.length);

          formatTableData(temp);
          // setInstructors(temp);
        }}
        getInstructor={() => null}
      />

      <View
        style={{
          paddingRight: 19,

          backgroundColor: Colors.newBackgroundColor,
          flex: 1,
          borderRadius: 20,
        }}
      >
        <ScrollView
          contentContainerStyle={{
            height: height * 0.55,
            overflow: "hidden",
            marginTop: 50,
            marginLeft: 15,
          }}
          horizontal={true}
        >
          <View style={styles.container}>
            <Table
              borderStyle={{
                borderWidth: 0,
              }}
            >
              <TableWrapper style={styles.row}>
                {tableData.tableHead.map((cellData, cellIndex) => (
                  <Cell
                    width={
                      cellIndex == 0 || cellIndex == 1
                        ? 60
                        : cellIndex == 2
                        ? 190
                        : cellIndex == 3
                        ? 80
                        : cellIndex == 4
                        ? 65
                        : 45
                    }
                    // widthArr={[
                    //   windowWidth / 4.0,
                    //   windowWidth / 4.0,
                    //   windowWidth / 2.0,
                    //   windowWidth / 4.0,
                    //   windowWidth / 4.0,

                    // ]}
                    key={cellIndex}
                    data={cellData}
                    style={[
                      styles.head,
                      {
                        // borderTopLeftRadius:
                        //   cellIndex == 0 ? 20 : 0,
                        // borderTopRightRadius:
                        //   cellIndex + 1 ==
                        //   tableData.tableData.length
                        //     ? 20
                        //     : 0,
                        backgroundColor: Colors.primary,
                      },
                    ]}
                    textStyle={[
                      styles.tableHeadertext,
                      false ? { ...styles.textDecoration } : {},
                    ]}
                  />
                ))}
              </TableWrapper>
            </Table>
            <View style={styles.tableView}>
              <Table>
                <FlatList
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                  data={tableData.tableData}
                  keyExtractor={(item, index) => index}
                  renderItem={({ item, index }) => {
                    return (
                      <View key={index}>
                        <TableWrapper
                          key={index}
                          style={{ flexDirection: "row" }}
                        >
                          {item.map((cellData, cellIndex) => {
                            return (
                              <Cell
                                style={{
                                  marginLeft: cellIndex < 2 ? 5 : 0,
                                  textAlign: "center",
                                }}
                                width={
                                  cellIndex == 0 || cellIndex == 1
                                    ? 60
                                    : cellIndex == 2
                                    ? 190
                                    : cellIndex == 3
                                    ? 80
                                    : cellIndex == 4
                                    ? 65
                                    : 45
                                }
                                key={cellIndex}
                                data={
                                  cellIndex > 3
                                    ? elements(
                                        cellIndex,
                                        cellData,
                                        tableData.item[index]
                                      )
                                    : cellData
                                }
                                textStyle={styles.text}
                              />
                            );
                          })}
                        </TableWrapper>
                      </View>
                    );
                  }}
                />
              </Table>
            </View>
          </View>
        </ScrollView>

        <Text style={[styles.errorText, { textAlign: "center", fontSize: 18 }]}>
          {"Scroll to the right"}
        </Text>
      </View>
    </BackgroundLayout>
  );
};
export default OrgInstructorListFormModal;

const styles = StyleSheet.create({
  modal: {
    height: "100%",
    width: "100%",
    backgroundColor: "red",
    // elevation: 5,
    shadowColor: Colors.primaryGray,
    shadowOffset: {
      height: 5,
      width: 2,
    },
    borderRadius: 5,
    shadowRadius: 5,
    shadowOpacity: 0.3,
    zIndex: 166,

    // marginTop: "13%",
  },
  background: {
    flex: 1,
    color: Colors.white,
    zIndex: 1,
    backgroundColor: Colors.primary,
  },
  topNav: {
    color: Colors.white,
    marginTop: 35,
  },

  heading: {
    fontWeight: "bold",
    marginTop: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "30%",
  },
  modalButton: {
    width: "95%",
    marginTop: 10,
  },
  selectInput: {
    marginTop: 10,
  },
  mainAsset: {
    alignItems: "center",
    height: 300,
    width: "100%",
    flex: 3,
  },
  mainContent: {
    flex: 4,
  },
  textContent: {
    fontSize: 16,
    padding: 10,
    width: "100%",
    borderBottomColor: Colors.lightgray,
    borderBottomWidth: 1,
  },
  extraImages: {
    flex: 1,
    flexDirection: "row",
    width: "100%",
    height: 100,
  },
  centerItems: {
    justifyContent: "center",
    alignItems: "center",
  },

  errorText: {
    fontSize: 10,
    color: "red",
    marginBottom: 80,
  },
  formView: {
    flex: 9,
  },
  bottomView: {
    width: "100%",
    flexDirection: "row",
    position: "absolute",
    justifyContent: "center",
    backgroundColor: Colors.transparent,
    bottom: 0,
    height: 50,
  },
  linearBottom: {
    width: "100%",

    height: 50,
  },
  createPostButton: {
    margin: 3,
    width: "50%",

    height: 50,
    right: 0,
    backgroundColor: Colors.transparent,
    borderColor: Colors.transparent,
    borderWidth: 0,
  },
  ghostButton: {
    margin: 8,
    width: "100%",
    alignSelf: "center",
  },
  buttonSettings: {
    marginTop: 20,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },

  formContainer: {
    flex: 1,
    marginVertical: 20,
  },
  button: {
    paddingTop: 5,
    fontSize: 15,
    color: Colors.white,
    borderRadius: 10,
  },
  backgroundButton: {
    width: "80%",
    borderRadius: 10,
    paddingBottom: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    backgroundColor: Colors.primary,
  },
  sppinerContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  sent: {
    fontSize: 16,
    marginLeft: 10,
    marginTop: 10,
    fontWeight: "bold",
    color: Colors.gray,
    textAlign: "center",
  },
  selectSettings: {
    marginTop: 18,
  },
  tableHeadertext: {
    textAlign: "center",
    margin: 6,
    color: Colors.white,
  },
  tableHeadertext0: {
    textAlign: "center",
    margin: 6,
    color: Colors.black,
  },
  head0: {
    height: 50,
    padding: 5,
    backgroundColor: Colors.white,
    borderTopEndRadius: 5,
    borderBottomEndRadius: 5,

    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 10,
  },
  tableView: {
    marginTop: 70,
    marginBottom: 50,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    // justifyContent: 'space-between',
    flex: 1,
    backgroundColor: Colors.primary,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    // marginBottom: 10,
    // borderRadius: 20,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  head: {
    height: 60,
    padding: 5,
    // width: 100,
    backgroundColor: Colors.primary,
  },
  floatButton: {
    marginTop: 20,
    alignSelf: "flex-end",
    marginRight: 10,
    // position: "absolute",
    // bottom: 20,
    // right: 20,
    shadowColor: Colors.primary,
    shadowOffset: {
      height: 10,
      width: 10,
    },
    shadowOpacity: 0.9,
    shadowRadius: 50,
    elevation: 5,
  },
});
