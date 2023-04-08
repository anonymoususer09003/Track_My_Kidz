import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Switch,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from "react-native";

import { useTheme } from "@/Theme";
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
  Autocomplete,
  Text,
  AutocompleteItem,
  IndexPath,
  Select,
  SelectItem,
  Input,
  CheckBox,
} from "@ui-kitten/components";
import { GetAllCities, GetAllStates } from "@/Services/PlaceServices";
// @ts-ignore
import { ReportAProblem } from "../../../Services/SettingsServies";
import { useDispatch, useSelector } from "react-redux";
import { PlaceState } from "@/Store/Places";
import * as yup from "yup";
import { Formik } from "formik";
import { useHeaderHeight } from "react-native-screens/native-stack";
import { ScrollView } from "react-native-gesture-handler";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Colors from "@/Theme/Colors";
import {
  GetAllInstructors,
  FindInstructorBySchoolOrg,
} from "@/Services/Instructor";

import { AppHeader } from "@/Components";
import { UserState } from "@/Store/User";
import { GetSchool, UpdateSchool } from "@/Services/School";
import { loadUserId } from "@/Storage/MainAppStorage";
import { useIsFocused } from "@react-navigation/native";
import { GetInstructor } from "@/Services/Instructor";
import EditOrgInstructorsModal from "@/Modals/EditOrganizationInstructorModal";
import OrgInstructorsListModal from "@/Modals/OrgInstructorList";
import AddInstructorOrgModal from "@/Modals/AddInstructorOrgModal";
import Icon from "react-native-vector-icons/Entypo";
import { navigationRef } from "@/Navigators/Functions";

import ChangeModalState from "@/Store/Modal/ChangeModalState";
const filterCountries = (item: CountryDTO, query: string) => {
  return item.name.toLowerCase().includes(query.toLowerCase());
};

const Divider = () => (
  <View
    style={{
      borderBottomColor: "#E0E0E0",
      borderBottomWidth: 1,
    }}
  />
);

const grades = ["ECP", "Transition", "Kindergander", "1st Grade", "2nd Grade"];

const OrganizationInfoScreen = ({ navigation }) => {
  const { Layout } = useTheme();
  const windowWidth = Dimensions.get("window").width;
  const height = Dimensions.get("screen").height;
  const [instructors, setInstructors] = useState([]);
  const dispatch = useDispatch();
  const reportAProblemValidationSchema = yup.object().shape({
    message: yup
      .string()
      .max(20, "Name can not be more than 20 characters")
      .min(3, ({ min }) => `Name needs to be at least ${min} characters`)
      .required("Name is required"),
  });
  const [tableData, setTableData] = useState({
    tableHead: ["First Name", "Last Name", "Email", "Phone", "Admin", " "],
    tableData: [],
    item: [],
  });
  const getInstructors = async () => {
    GetAllInstructors(0, 30)
      .then((res) => {
        formatTableData(res);
      })
      .catch((err) => {});
  };
  const formatTableData = (data: any) => {
    let temp = { ...tableData };
    let row = [];
    let rowItem = [];
    data.result.map((item, index) => {
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
    // console.log("data", data);

    setInstructors(data);
  };
  const isFocused = useIsFocused();
  const [isTouched, setisTouched] = useState(false);

  const [isSending, setisSending] = useState(false);
  const [isSent, setisSent] = useState(false);

  const countries = useSelector(
    (state: { places: PlaceState }) => state.places.countries
  );
  const [countriesData, setCountriesData] = React.useState(countries);
  const [statesData, setStatesData] = React.useState<Array<any>>([]);
  const [citiesData, setCitiesData] = React.useState<Array<any>>([]);
  const [placement, setPlacement] = React.useState("bottom");
  const [isEditMode, setisEditMode] = useState(false);
  const [visible, setVisible] = useState(false);
  const [addEditVisible, setaddEditVisible] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState({});
  const [states, setStates] = useState<Array<any>>([]);
  const [cities, setCities] = useState<Array<any>>([]);
  const [orgInfo, setOrgInfo] = useState(null);

  const handleGetOrganizationInfo = async () => {
    const userId = await loadUserId();
    console.log("userId", userId);
    let res = await GetInstructor(userId);
    if (res.schoolId || res.orgId) {
      GetSchool(res.schoolId)
        .then((org) => {
          setOrgInfo(org);
          let temp = { ...tableData };
          let row = [];
          let rowItem = [];
          // org?.instructors?.map((item, index) => {
          //   let { firstname, lastname, email, phone, isAdmin, state } = item;
          //   row.push([
          //     firstname,
          //     lastname,
          //     email,
          //     phone ? phone : "",
          //     isAdmin,
          //     state,
          //   ]);
          //   rowItem.push(item);
          // });
          // console.log("row", row);
          // temp.tableData = row;
          // temp.item = rowItem;
          // setTableData(temp);
          // console.log("res", res);

          // setInstructors(res);
          setInstructors({ result: org?.instructors });
          // FindInstructorBySchoolOrg({
          //   schoolId: res?.schoolId,
          //   orgId: res?.orgId,
          // })
          //   .then((res) => {
          //     let temp = { ...tableData };
          //     let row = [];
          //     let rowItem = [];
          //     res.map((item, index) => {
          //       let { firstname, lastname, email, phone, isAdmin, state } =
          //         item;
          //       row.push([
          //         firstname,
          //         lastname,
          //         email,
          //         phone ? phone : "",
          //         isAdmin,
          //         state,
          //       ]);
          //       rowItem.push(item);
          //     });
          //     console.log("row", row);
          //     temp.tableData = row;
          //     temp.item = rowItem;
          //     setTableData(temp);
          //     // console.log("res", res);

          //     // setInstructors(res);
          //     setInstructors({ result: res });
          //     // setOrgInfo(org);
          //   })
          // .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    }
    // GetInstructor(userId).then((res) => {
    //   if (res.schoolId) {
    //     console.log(
    //       "res----------------------------------------------------------------",
    //       res.schoolId + " " + userId
    //     );
    //     GetSchool(res.schoolId)
    //       .then((org) => {
    //         setOrgInfo(org);
    //         let temp = { ...tableData };
    //         let row = [];
    //         let rowItem = [];
    //         // org?.instructors?.map((item, index) => {
    //         //   let { firstname, lastname, email, phone, isAdmin, state } = item;
    //         //   row.push([
    //         //     firstname,
    //         //     lastname,
    //         //     email,
    //         //     phone ? phone : "",
    //         //     isAdmin,
    //         //     state,
    //         //   ]);
    //         //   rowItem.push(item);
    //         // });
    //         // console.log("row", row);
    //         // temp.tableData = row;
    //         // temp.item = rowItem;
    //         // setTableData(temp);
    //         // console.log("res", res);

    //         // setInstructors(res);
    //         setInstructors({ result: org?.instructors });
    //         // FindInstructorBySchoolOrg({
    //         //   schoolId: res?.schoolId,
    //         //   orgId: res?.orgId,
    //         // })
    //         //   .then((res) => {
    //         //     let temp = { ...tableData };
    //         //     let row = [];
    //         //     let rowItem = [];
    //         //     res.map((item, index) => {
    //         //       let { firstname, lastname, email, phone, isAdmin, state } =
    //         //         item;
    //         //       row.push([
    //         //         firstname,
    //         //         lastname,
    //         //         email,
    //         //         phone ? phone : "",
    //         //         isAdmin,
    //         //         state,
    //         //       ]);
    //         //       rowItem.push(item);
    //         //     });
    //         //     console.log("row", row);
    //         //     temp.tableData = row;
    //         //     temp.item = rowItem;
    //         //     setTableData(temp);
    //         //     // console.log("res", res);

    //         //     // setInstructors(res);
    //         //     setInstructors({ result: res });
    //         //     // setOrgInfo(org);
    //         //   })
    //         // .catch((err) => console.log(err));
    //       })
    //       .catch((err) => console.log(err));
    //   }
    // });
  };

  useEffect(() => {
    // getInstructors();
    handleGetOrganizationInfo();
  }, [isFocused]);

  const admin1 =
    orgInfo && orgInfo.instructors && orgInfo.instructors.length > 0
      ? orgInfo.instructors[0]
      : {};
  const admin2 =
    orgInfo && orgInfo.instructors && orgInfo.instructors.length > 1
      ? orgInfo.instructors[1]
      : {};

  const elements = (index, data, item) => {
    switch (index) {
      case 4:
        return (
          <Text style={{ fontSize: 14 }}>{data ? "Admin" : " "}</Text>
          // <Select
          //   style={styles.selectSettings}
          //   value={data ? "Admin" : "Non-Admin"}
          //   disabled={true}
          //   style={{ width: "100%" }}
          //   onSelect={(index: any) => {
          //     // setFieldValue("city", cities[index.row]);
          //     // setFieldValue("selectedCity", cities[index.row]);
          //   }}
          //   // label={(evaProps) => <Text {...evaProps}>City</Text>}
          // >
          //   {[data ? "Non-Admin" : "Admin"]?.map((city, index) => {
          //     return <SelectItem key={index} title={city} />;
          //   })}
          // </Select>
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
            <Icon name="dots-three-vertical" size={20} />
          </TouchableOpacity>
        );
    }
  };
  // React.useEffect(() => {
  //   if (visible) {
  //     getInstructors();
  //   }
  // }, [visible]);
  // console.log("org", orgInfo);
  return (
    <>
      {!orgInfo && (
        <>
          <AppHeader title="Organization Information" />
          <ActivityIndicator style={{ marginTop: 50 }} color={Colors.primary} />
        </>
      )}

      {orgInfo && (
        <>
          {/* {visible && (
        <OrgInstructorsListModal
          visible={visible}
          setVisible={(value) => setVisible(value)}
        />
      )} */}
          {/* <AddInstructorOrgModal /> */}
          <AppHeader
            hideCalendar={true}
            title="Organization Information"
            hideApproval={true}
          />

          <KeyboardAwareScrollView
            extraHeight={10}
            enableOnAndroid={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flex: 1 }}
          >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              <View style={styles.layout}>
                <View style={[styles.mainLayout, { paddingLeft: 20 }]}>
                  <>
                    <Formik
                      validateOnMount={true}
                      initialValues={{
                        name: orgInfo ? orgInfo.name : "",
                        address: orgInfo ? orgInfo.address : "",
                        country: orgInfo ? orgInfo.country : "",
                        selectedCountry: "",
                        selectedState: "",
                        selectedCity: "",
                        city: orgInfo ? orgInfo.city : "",
                        state: orgInfo ? orgInfo.state : "",
                        zipcode: orgInfo ? orgInfo.zipcode : "",
                        newRepresentative1: false,
                        newRepresentative2: false,
                        email1: admin1 ? admin1.email : "",
                        firstName1: admin1 ? admin1.firstname : "",
                        lastName1: admin1 ? admin1.lastname : "",
                        email2: admin2 ? admin2.email : "",
                        firstName2: admin2 ? admin2.firstname : "",
                        lastName2: admin2 ? admin2.lastname : "",

                        phone1: admin1?.phone ? admin1.phone : "",

                        phone2: admin2.phone ? admin2.phone : "",
                      }}
                      enableReinitialize
                      onSubmit={(values, { resetForm }) => {
                        dispatch(ChangeModalState.action({ loading: true }));
                        if (isEditMode) {
                          const data = {
                            id: orgInfo.schoolId,
                            name: values.name,
                            address: values.address,
                            country: values.country,
                            zipcode: values.zipcode,
                            city: values.city,
                            state: values.state,
                            grades: [],
                            representatives: [
                              {
                                id: admin1.instructorId,
                                email: values.email1,
                                firstname: values.firstName1,
                                lastname: values.lastName1,
                                type: "school",

                                phone: values.phone1,
                              },
                              {
                                id: admin2.instructorId,
                                email: values.email2,
                                firstname: values.firstName2,
                                lastname: values.lastName2,
                                type: "school",
                                phone: values.phone2,
                              },
                            ],
                          };
                          UpdateSchool(data)
                            .then((res) => {
                              console.log("res", res);
                              setisEditMode(false);
                              dispatch(
                                ChangeModalState.action({ loading: false })
                              );
                            })
                            .catch((err) => {
                              console.log(err);
                              dispatch(
                                ChangeModalState.action({ loading: false })
                              );
                            });
                        } else {
                          setisEditMode(true);
                          dispatch(ChangeModalState.action({ loading: false }));
                        }
                      }}
                    >
                      {({
                        handleChange,
                        handleSubmit,
                        values,
                        errors,
                        isValid,
                        setFieldValue,
                      }) => (
                        <>
                          <View style={styles.formContainer}>
                            <Input
                              style={{ marginRight: 20, marginTop: 10 }}
                              placeholder="School Name"
                              onChangeText={handleChange("name")}
                              value={values.name}
                              disabled={!isEditMode}
                            />
                            <Input
                              style={{ marginRight: 20, marginTop: 10 }}
                              placeholder="School Address"
                              onChangeText={handleChange("address")}
                              value={values.address}
                              disabled={!isEditMode}
                            />
                            <Input
                              style={{ marginRight: 20, marginTop: 10 }}
                              placeholder="Zip/Post Code"
                              onChangeText={handleChange("zipcode")}
                              value={values.zipcode}
                              disabled={!isEditMode}
                            />
                            <Autocomplete
                              placeholder="Select your country"
                              value={values.country}
                              style={{ width: "95%" }}
                              placement={placement}
                              disabled={!isEditMode}
                              label={(evaProps) => (
                                <Text {...evaProps}>Country*</Text>
                              )}
                              onChangeText={(query) => {
                                setFieldValue("country", query);
                                setCountriesData(
                                  countries.filter((item) =>
                                    filterCountries(item, query)
                                  )
                                );
                              }}
                              onSelect={(query) => {
                                const selectedCountry = countriesData[query];
                                setFieldValue("country", selectedCountry.name);
                                setFieldValue(
                                  "selectedCountry",
                                  selectedCountry.name
                                );
                                setFieldValue("selectedState", "");
                                setFieldValue("state", "");
                                setStates([]);
                                GetAllStates(
                                  selectedCountry.name.replace(/ /g, "")
                                ).then((res) => {
                                  setStates(res.data);
                                  setStatesData(states);
                                });
                              }}
                            >
                              {countriesData.map((item, index) => {
                                return (
                                  <AutocompleteItem
                                    key={index}
                                    title={item.name}
                                  />
                                );
                              })}
                            </Autocomplete>
                            <Select
                              style={styles.selectSettings}
                              value={values.state}
                              style={{ width: "95%" }}
                              disabled={!isEditMode}
                              onSelect={(query: IndexPath) => {
                                const selectedState = states[query.row];
                                setFieldValue("state", selectedState);
                                setFieldValue("selectedState", selectedState);
                                setFieldValue("selectedCity", "");
                                setFieldValue("city", "");
                                setCities([]);
                                GetAllCities(
                                  values.selectedCountry,
                                  selectedState
                                ).then((res) => {
                                  setCities(res.data);
                                });
                              }}
                              label={(evaProps) => (
                                <Text {...evaProps}>State</Text>
                              )}
                            >
                              {states?.map((state, index) => {
                                return <SelectItem key={index} title={state} />;
                              })}
                            </Select>

                            <Select
                              style={styles.selectSettings}
                              value={values.city}
                              disabled={!isEditMode}
                              style={{ width: "95%" }}
                              onSelect={(index: any) => {
                                setFieldValue("city", cities[index.row]);
                                setFieldValue(
                                  "selectedCity",
                                  cities[index.row]
                                );
                              }}
                              label={(evaProps) => (
                                <Text {...evaProps}>City</Text>
                              )}
                            >
                              {cities.length > 0
                                ? cities?.map((city, index) => {
                                    return (
                                      <SelectItem key={index} title={city} />
                                    );
                                  })
                                : []}
                            </Select>
                            <TouchableOpacity
                              onPress={() =>
                                navigation.navigate("InstructorList", {
                                  data: orgInfo,
                                })
                              }
                              style={{
                                justifyContent: "space-between",
                                flexDirection: "row",
                                paddingRight: 15,
                                marginTop: 20,
                              }}
                            >
                              <Text>Instructor List</Text>
                              <Icon
                                // style={styles.icon}
                                size={25}
                                // fill={Colors.gray}
                                name="chevron-right"
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() =>
                                navigation.navigate("BusInfo", {
                                  data: orgInfo,
                                })
                              }
                              style={{
                                justifyContent: "space-between",
                                flexDirection: "row",
                                paddingRight: 15,
                                marginTop: 20,
                              }}
                            >
                              <Text>Bus Information</Text>
                              <Icon
                                // style={styles.icon}
                                size={25}
                                // fill={Colors.gray}
                                name="chevron-right"
                              />
                            </TouchableOpacity>

                            {/* <Input
                                                    style={{ marginRight: 20, marginTop: 10 }}
                                                    placeholder="Zipcode"
                                                    onChangeText={handleChange('zipCode')}
                                                    value={values.zipcode}
                                                    disabled={!isEditMode}
                                                /> */}
                            {/* <Text style={{ marginTop: 10 }}>
                          School Representative - 1
                        </Text>
                        <View
                          style={{
                            marginVertical: 10,
                            padding: 10,
                            borderWidth: 1,
                            borderColor: Colors.primary,
                            width: "95%",
                          }}
                        >
                          <Input
                            style={{ marginRight: 20, marginTop: 10 }}
                            placeholder="First Name"
                            onChangeText={handleChange("firstName1")}
                            value={values.firstName1}
                            disabled={!isEditMode}
                          />
                          <Input
                            style={{ marginRight: 20, marginTop: 10 }}
                            placeholder="Last Name"
                            onChangeText={handleChange("lastName1")}
                            value={values.lastName1}
                            disabled={!isEditMode}
                          />
                          <Input
                            style={{ marginRight: 20, marginTop: 10 }}
                            placeholder="Email"
                            onChangeText={handleChange("email1")}
                            value={values.email1}
                            disabled={!isEditMode}
                            autoCapitalize="none"
                            autoCorrect={false}
                          />
                          <Input
                            style={{ marginRight: 20, marginTop: 10 }}
                            placeholder="Phone Number"
                            keyboardType="number-pad"
                            onChangeText={handleChange("phone1")}
                            value={values.phone1}
                            disabled={!isEditMode}
                            autoCapitalize="none"
                            autoCorrect={false}
                          />
                          <View style={{ flexDirection: "row", padding: 5 }}>
                            <CheckBox
                              checked={values.newRepresentative1}
                              onChange={() =>
                                setFieldValue(
                                  "newRepresentative1",
                                  !values.newRepresentative1
                                )
                              }
                            >
                              {""}
                            </CheckBox>
                            <Text style={styles.terms}>
                              New Representative?
                            </Text>
                          </View>
                        </View>
                        <Text>School Representative - 2</Text>
                        <View
                          style={{
                            marginVertical: 10,
                            padding: 10,
                            borderWidth: 1,
                            borderColor: Colors.primary,
                            width: "95%",
                          }}
                        >
                          <Input
                            style={{ marginRight: 20, marginTop: 10 }}
                            placeholder="First Name"
                            onChangeText={handleChange("firstName2")}
                            value={values.firstName2}
                            disabled={!isEditMode}
                          />
                          <Input
                            style={{ marginRight: 20, marginTop: 10 }}
                            placeholder="Last Name"
                            onChangeText={handleChange("lastName2")}
                            value={values.lastName2}
                            disabled={!isEditMode}
                          />
                          <Input
                            style={{ marginRight: 20, marginTop: 10 }}
                            placeholder="Email"
                            onChangeText={handleChange("email2")}
                            value={values.email2}
                            disabled={!isEditMode}
                            autoCapitalize="none"
                            autoCorrect={false}
                          />
                          <Input
                            style={{ marginRight: 20, marginTop: 10 }}
                            placeholder="Phone Number"
                            keyboardType="number-pad"
                            onChangeText={handleChange("phone2")}
                            value={values.phone2}
                            disabled={!isEditMode}
                            autoCapitalize="none"
                            autoCorrect={false}
                          />
                          <View style={{ flexDirection: "row", padding: 5 }}>
                            <CheckBox
                              checked={values.newRepresentative2}
                              onChange={() =>
                                setFieldValue(
                                  "newRepresentative2",
                                  !values.newRepresentative2
                                )
                              }
                            >
                              {""}
                            </CheckBox>
                            <Text style={styles.terms}>
                              New Representative?
                            </Text>
                          </View>
                        </View> */}
                            <View style={styles.buttonSettings}>
                              <View style={[styles.background]}>
                                <TouchableOpacity
                                  style={[styles.background]}
                                  onPress={handleSubmit}
                                >
                                  <Text style={styles.button}>
                                    {isEditMode ? "Submit" : "Edit"}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        </>
                      )}
                    </Formik>
                  </>
                </View>
              </View>
            </ScrollView>
          </KeyboardAwareScrollView>
        </>
      )}
    </>
  );
};

export default OrganizationInfoScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    justifyContent: "space-around",
    backgroundColor: Colors.white,
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
    marginLeft: -20,
    marginBottom: 10,
  },
  selectSettings: {
    marginTop: 18,
  },
  errorText: {
    fontSize: 10,
    color: "red",
    marginLeft: 10,
    marginTop: 10,
  },
  terms: {
    color: "text-hint-color",
    marginLeft: 10,
  },
  floatButton: {
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
    marginBottom: 10,
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
  icon: {
    width: 32,
    height: 32,
  },
  text: {
    // backgroundColor: 'red',
    marginVertical: 6,
    // width: 50,
    // marginHorizontal: 2,
    color: Colors.black,
    textAlign: "center",
    fontSize: 12,
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
  regularButton: {
    marginTop: 20,
    alignSelf: "flex-end",
    width: "40%",
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },

  textDecoration: {
    textDecorationLine: "line-through",
    textDecorationStyle: "solid",
  },
  touchableRow: {
    position: "absolute",
    height: 29,

    backgroundColor: "transparent",
    zIndex: 1,
    bottom: 15,
  },
  cellView: {
    backgroundColor: Colors.white,

    alignItems: "center",
  },
});
