import {
  Card,
  Modal,
  Input,
  Text,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
  CheckBox,
} from "@ui-kitten/components";
import * as yup from "yup";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { loadUserId } from "@/Storage/MainAppStorage";
import { useDispatch, useSelector } from "react-redux";
import { ModalState } from "@/Store/Modal";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { LinearGradientButton } from "@/Components";
import { UpdateStudent } from "@/Services/Student";
import Colors from "@/Theme/Colors";
import {
  GetAllSchools,
  GetSchoolByFilters,
  UpdateSchool,
} from "@/Services/School";
import { Formik } from "formik";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { GetAllCities, GetAllStates } from "@/Services/PlaceServices";
import { PlaceState } from "@/Store/Places";
import { CountryDTO } from "@/Models/CountryDTOs";
import { useIsFocused } from "@react-navigation/native";
import { UserState } from "@/Store/User";
const filterCountries = (item: CountryDTO, query: string) => {
  return item.name.toLowerCase().includes(query.toLowerCase());
};
const filterStates = (item: string, query: string) => {
  return item?.toLowerCase().includes(query.toLowerCase());
};
const filterCities = (item: string, query: string) => {
  return item?.toLowerCase().includes(query.toLowerCase());
};

const EditDependentModal = ({
  selectedDependent,
  setSelectedDependent,
}: {
  selectedDependent: any;
  setSelectedDependent: Function;
}) => {
  const isFocused = useIsFocused();
  const [student, setStudent] = useState(null);
  const [schools, setSchools] = useState([]);
  const currentUser = useSelector(
    (state: { user: UserState }) => state.user.item
  );

  const grades =
    schools &&
    schools.length > 0 &&
    schools.find((s) => s.name === selectedDependent?.school) &&
    schools?.find((s) => s.name === selectedDependent?.school)?.gradeEntities;
  const countries = useSelector(
    (state: { places: PlaceState }) => state.places.countries
  );
  console.log("selectedepenedted", selectedDependent);
  const [countriesData, setCountriesData] = React.useState(countries);
  const [statesData, setStatesData] = React.useState<Array<any>>([]);
  const [citiesData, setCitiesData] = React.useState<Array<any>>([]);
  const [states, setStates] = useState<Array<any>>([]);
  const [cities, setCities] = useState<Array<any>>([]);
  // const [dependents, setCities] = useState<Array<any>>([]);
  const [checkBox, setCheckBox] = useState(false);
  const [schoolsData, setSchoolsData] = React.useState(schools);
  const isVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.editDependentModalVisibility
  );
  const validationSchema = yup.object().shape({
    firstName: yup.string().required("First Name is required"),
    lastName: yup.string().required("Last Name is required"),
    email: yup
      .string()
      .email("Please enter valid email")
      .required("Email is required"),
    country: yup.string().required("Please select country"),
    state: yup.string().required("Please select state"),
    school: yup.string().required("Please select school"),
  });
  const dispatch = useDispatch();

  const getSchools = () => {
    GetAllSchools(0, 30)
      .then((res) => {
        setSchools(res.result);
        setSchoolsData(res.result);
      })
      .catch((err) => {});
  };

  const handleSubmit = () => {
    UpdateSchool()
      .then((res) => {})
      .catch((err) => {});
    dispatch(ChangeModalState.action({ editDependentModalVisibility: false }));
    setSelectedDependent(null);
    setStudent(null);
  };
  const validations = (name, value) => {};
  const getSchoolsByFilter = (
    country = "",
    state = "",
    city = "",
    schoolName: any
  ) => {
    const query = {
      country: country,
      state: state,
      city: city,
      schoolName: schoolName,
    };
    GetSchoolByFilters(query)
      .then((res) => {
        const _data = {
          schoolId: 0,
          name: "Other",
        };
        const _schools = [...res];
        _schools.unshift(_data);
        setSchools(_schools);
        setSchoolsData(_schools);
      })
      .catch((err) => {});
  };

  useEffect(() => {
    getSchools();
  }, [isVisible]);

  const handleSetStudent = () => {
    if (!!selectedDependent) {
      setStudent(selectedDependent);
    }
  };

  useEffect(() => {
    handleSetStudent();
  }, [isFocused]);

  // @ts-ignore
  return (
    <Modal
      style={styles.container}
      visible={isVisible}
      backdropStyle={styles.backdrop}
      onBackdropPress={() => {
        dispatch(
          ChangeModalState.action({ editDependentModalVisibility: false })
        );
        setSelectedDependent(null);
        setStudent(null);
      }}
    >
      <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}>
        <Card style={styles.modal} disabled={true}>
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
                Edit Dependent
              </Text>
            </View>
          </View>
          <Formik
            validateOnMount={true}
            validationSchema={validationSchema}
            initialValues={{
              firstName: student?.firstname,
              lastName: student?.lastname,
              school: student?.school,
              selectedSchool: "",
              grade: "",
              parentName: "",
              parentName2: "",
              password: "",
              confirmPassword: "",
              termsAccepted: false,
              phoneNumber: student?.phone,
              email: student?.email,
              country: student?.country || "",
              state: student?.state || "",
              city: student?.city || "",
              selectedCountry: student?.country || "",
              selectedState: student?.state || "",
              selectedCity: student?.city || "",
              selectedSchool: "",
            }}
            onSubmit={async (values, { resetForm }) => {
              const userId = await loadUserId();
              const data = {
                parentId: parseInt(userId),
                id: parseInt(student?.studentId),
                firstname: values.firstName,
                lastname: values.lastName,
                phone: values.phoneNumber,
                email: values.email,
                school:
                  values.selectedSchool != ""
                    ? values.selectedSchool
                    : values.school,
                grade: values.grade,
                // "grade": "string",
                status: "",
                latitude: "",
                longititude: "",
                country: values.selectedCountry,
                city: values.selectedCity,
                state: values.selectedState,
                parentemail1: currentUser.email,
                parentemail2: "",
              };
              console.log("data", data);
              UpdateStudent(data)
                .then((response) => {
                  console.log("response", response);
                  dispatch(
                    ChangeModalState.action({
                      editDependentModalVisibility: false,
                    })
                  );
                  setSelectedDependent(null);
                  setStudent(null);
                  Toast.show({
                    type: "success",
                    position: "top",
                    text1: `Dependent has been successfully added`,
                  });
                  // resetForm();
                  //   dispatch(
                  //     ChangeModalState.action({ addStudentModal: false })
                  //   );
                })
                .catch((err) => {
                  console.log("err", err);
                  Toast.show({
                    type: "info",
                    position: "top",
                    text1: `An error occured`,
                  });
                });
              // CreateStudent(data)
              //   .then((response) => {
              //     console.log("response", response);
              //     Toast.show({
              //       type: "success",
              //       position: "top",
              //       text1: `Dependent has been successfully added`,
              //     });
              //     resetForm();
              //     //   dispatch(
              //     //     ChangeModalState.action({ addStudentModal: false })
              //     //   );
              //   })
              //   .catch((err) => {
              //     Toast.show({
              //       type: "info",
              //       position: "top",
              //       text1: `An error occured`,
              //     });
            }}
          >
            {({
              handleChange,
              setFieldValue,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isValid,
            }) => (
              <>
                <View style={{ marginTop: 30, padding: 20 }}>
                  <View
                    style={{
                      flexDirection: "row",

                      alignItems: "center",
                    }}
                  >
                    <Text style={{ marginRight: 20, marginTop: 10 }}>
                      Use my address
                    </Text>
                    <CheckBox
                      style={[{ flex: 1, marginTop: 13 }]}
                      checked={checkBox}
                      onChange={(checked) => {
                        if (checked) {
                          setCheckBox(checked);
                          setFieldValue("country", currentUser?.country || "");
                          setFieldValue(
                            "selectedCountry",
                            currentUser?.country || ""
                          );
                          setFieldValue("state", currentUser?.state || "");
                          setFieldValue(
                            "selectedState",
                            currentUser?.state || ""
                          );
                          setFieldValue("city", currentUser?.city || "");
                          setFieldValue(
                            "selectedCity",
                            currentUser?.city || ""
                          );
                        } else {
                          setCheckBox(checked);
                          setFieldValue("country", "");
                          setFieldValue("selectedCountry", "");
                          setFieldValue("selectedCity", "");
                          setFieldValue("selectedState", "");
                          setFieldValue("state", "");
                          setFieldValue("city", "");
                        }
                        // if (checked) {
                        //   Alert.alert(checked);
                        // } else {
                        //   Alert.alert(checked);
                        // }
                      }}
                    ></CheckBox>
                  </View>
                  <Input
                    style={styles.inputSettings}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder={`First Name`}
                    value={values?.firstName}
                    onChangeText={handleChange("firstName")}
                    onBlur={handleBlur("firstName")}
                    // onChangeText={(value: string) =>
                    //   setStudent({
                    //     ...student,
                    //     firstname: value,
                    //   })
                    // }
                  />
                  {errors.firstName && touched.firstName && (
                    <Text style={styles.errorText}>{errors.firstName}</Text>
                  )}
                  <Input
                    style={styles.inputSettings}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder={`Last Name`}
                    value={values.lastName}
                    onChangeText={handleChange("lastName")}
                    onBlur={handleBlur("lastName")}
                    // value={student?.lastname}
                    // onChangeText={(value: string) =>
                    //   setStudent({
                    //     ...student,
                    //     lastname: value,
                    //   })
                    // }
                  />
                  {errors.lastName && touched.lastName && (
                    <Text style={styles.errorText}>{errors.lastName}</Text>
                  )}
                  <Input
                    style={styles.inputSettings}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={values.email}
                    placeholder="Email*"
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    // placeholder={`Email*`}

                    // value={student?.email}
                    // onChangeText={(value: string) =>
                    //   setStudent({
                    //     ...student,
                    //     email: value,
                    //   })
                    // }
                  />
                  {errors.email && touched.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                  <Input
                    style={styles.inputSettings}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder={`Phone # (Optional)`}
                    value={values.phoneNumber}
                    keyboardType="number-pad"
                    onChangeText={handleChange("phoneNumber")}
                    // value={student?.phone}
                    // onChangeText={(value: string) =>
                    //   setStudent({
                    //     ...student,
                    //     phone: value,
                    //   })
                    // }
                  />
                  <Autocomplete
                    placeholder="Country*"
                    value={values?.country}
                    placement="bottom"
                    style={{ marginVertical: 5 }}
                    // label={evaProps => <Text {...evaProps}>Country*</Text>}
                    // onChangeText={(query) => {
                    //   // setFieldValue("country", query);
                    //   setCountriesData(
                    //     countries.filter((item) => filterCountries(item, query))
                    //   );
                    // }}
                    onChangeText={(query) => {
                      setFieldValue("country", query);
                      setCountriesData(
                        countries.filter((item) => filterCountries(item, query))
                      );
                    }}
                    // onSelect={(query) => {
                    //   const selectedCountry = countriesData[query];
                    //   // setFieldValue("country", selectedCountry.name);
                    //   // setFieldValue("selectedCountry", selectedCountry.name);
                    //   // setFieldValue("selectedState", "");
                    //   // setFieldValue("state", "");
                    //   setStates([]);
                    //   GetAllStates(selectedCountry.name.replace(/ /g, "")).then(
                    //     (res) => {
                    //       setStates(res.data);
                    //       setStatesData(states);
                    //     }
                    //   );
                    //   getSchoolsByFilter(selectedCountry.name);
                    // }}
                    onSelect={(query) => {
                      const selectedCountry = countriesData[query];
                      setFieldValue("country", selectedCountry.name);
                      setFieldValue("selectedCountry", selectedCountry.name);
                      setFieldValue("selectedState", "");
                      setFieldValue("state", "");
                      setStates([]);
                      GetAllStates(selectedCountry.name.replace(/ /g, "")).then(
                        (res) => {
                          setStates(res.data);
                          setStatesData(states);
                        }
                      );
                      // getSchoolsByFilter(selectedCountry.name);
                    }}
                  >
                    {countriesData.map((item, index) => {
                      return <AutocompleteItem key={index} title={item.name} />;
                    })}
                  </Autocomplete>
                  {errors.country && touched.country && (
                    <Text style={styles.errorText}>{errors.country}</Text>
                  )}
                  <Autocomplete
                    placeholder="State*"
                    value={values.state}
                    // value={student?.state}
                    placement="bottom"
                    style={{ marginVertical: 5 }}
                    disabled={!values.selectedCountry}
                    // disabled={!student?.selectedCountry}
                    // label={evaProps => <Text {...evaProps}>State</Text>}
                    // onChangeText={(query) => {
                    //   // setFieldValue("state", query);
                    //   setStatesData(
                    //     states.filter((item) => filterStates(item, query))
                    //   );
                    // }}
                    // onSelect={(query) => {
                    //   const selectedState = statesData[query];
                    //   // setFieldValue("state", selectedState);
                    //   // setFieldValue("selectedState", selectedState);
                    //   // setFieldValue("selectedCity", "");
                    //   // setFieldValue("city", "");
                    //   setCities([]);
                    //   GetAllCities(values.selectedCountry, selectedState).then(
                    //     (res) => {
                    //       setCities(res.data);
                    //     }
                    //   );
                    //   getSchoolsByFilter("", selectedState);
                    // }}
                    onChangeText={(query) => {
                      setFieldValue("state", query);
                      setStatesData(
                        states.filter((item) => filterStates(item, query))
                      );
                    }}
                    onSelect={(query) => {
                      const selectedState = statesData[query];
                      setFieldValue("state", selectedState);
                      setFieldValue("selectedState", selectedState);
                      setFieldValue("selectedCity", "");
                      setFieldValue("city", "");
                      setCities([]);
                      GetAllCities(values.selectedCountry, selectedState).then(
                        (res) => {
                          setCities(res.data);
                        }
                      );
                      // getSchoolsByFilter(values.selectedCountry, selectedState);
                    }}
                  >
                    {statesData.map((item, index) => {
                      return <AutocompleteItem key={index} title={item} />;
                    })}
                  </Autocomplete>

                  {errors.state && touched.state && (
                    <Text style={styles.errorText}>{errors.state}</Text>
                  )}
                  <Autocomplete
                    placeholder="City"
                    value={values?.city}
                    placement="bottom"
                    disabled={!values.selectedState}
                    // disabled={!student?.selectedState}
                    style={{ marginVertical: 5 }}
                    // label={evaProps => <Text {...evaProps}>City</Text>}
                    // onChangeText={(query) => {
                    //   // setFieldValue("city", query);
                    //   setCitiesData(
                    //     cities.filter((item) => filterCities(item, query))
                    //   );
                    // }}
                    // onSelect={(query) => {
                    //   const selectedCity = citiesData[query];
                    //   // setFieldValue("city", selectedCity);
                    //   // setFieldValue("selectedCity", selectedCity);
                    //   getSchoolsByFilter("", "", selectedCity);
                    // }}
                    onChangeText={(query) => {
                      setFieldValue("city", query);
                      // setFieldValue("selectedCity", query);
                      setCitiesData(
                        cities.filter((item) => filterCities(item, query))
                      );
                    }}
                    onSelect={(query) => {
                      const selectedCity = citiesData[query];
                      setFieldValue("city", selectedCity);
                      setFieldValue("selectedCity", selectedCity);
                      // getSchoolsByFilter("", "", selectedCity);
                    }}
                  >
                    {citiesData.map((item, index) => {
                      return <AutocompleteItem key={index} title={item} />;
                    })}
                  </Autocomplete>
                  {/* {console.log("values", values)} */}

                  <Autocomplete
                    placeholder="School*"
                    value={values.school}
                    placement="bottom"
                    onBlur={() => setSchoolsData(schools)}
                    // disabled={!values.selectedState}
                    style={{ marginVertical: 5 }}
                    onChangeText={(query) => {
                      console.log("query", query);
                      setFieldValue("school", query);
                      if (values.school.length > 4) {
                        getSchoolsByFilter("", "", "", query);
                      }
                      // let schoolList = schools.filter((item: any) =>
                      //   item?.name?.includes(query)
                      // );
                      // if (schoolList.length > 0) {
                      //   setSchoolsData(schoolList);
                      // } else {
                      //   setSchoolsData([
                      //     {
                      //       schoolId: 0,
                      //       name: "Other",
                      //     },
                      //   ]);
                      // }
                      // setSchoolsData(
                      //   schools.filter((item) =>
                      //     filterSchools(item?.name, query)
                      //   )
                      // );
                    }}
                    onSelect={(query) => {
                      const selectedSchool = schoolsData[query];
                      setFieldValue("school", selectedSchool?.name);
                      // setFieldValue("selectedSchool", selectedSchool?.name);
                    }}
                  >
                    {schoolsData &&
                      schoolsData.length > 0 &&
                      schoolsData.map((school, index) => {
                        return (
                          <SelectItem key={index} title={school?.name || ""} />
                        );
                      })}
                  </Autocomplete>
                  {values.school == "Other" && (
                    <>
                      <Input
                        style={styles.inputSettings}
                        autoCapitalize="words"
                        // accessoryRight={PersonIcon}
                        value={values.selectedSchool}
                        placeholder="School Name*"
                        onChangeText={handleChange("selectedSchool")}
                        onBlur={handleBlur("selectedSchool")}
                      />
                      {values.selectedSchool == "" &&
                        touched.selectedSchool && (
                          <Text style={styles.errorText}>
                            {"School is required"}
                          </Text>
                        )}
                    </>
                  )}

                  {/* <Select
                    value={student?.school}
                    placeholder="School"
                    label={(evaProps: any) => <Text {...evaProps}>School</Text>}
                    onSelect={(index: any) => {
                      setStudent({
                        ...student,
                        school: schools[index.row]?.name,
                      });
                      setFieldValue("school", schools[index.row]?.name);
                    }}
                  >
                    {schools &&
                      schools.length > 0 &&
                      schools.map((school, index) => {
                        return (
                          <SelectItem
                            key={school?.schoolId}
                            title={school?.name || ""}
                          />
                        );
                      })}
                  </Select> */}
                  {/* <Select
              value={student?.grade}
              placeholder="Grade"
              label={(evaProps: any) => <Text {...evaProps}>Grade</Text>}
              onSelect={(index: any) => {
                setStudent({
                  ...student,
                  grade: grades[index.row]?.name,
                });
              }}
            >
              {grades &&
                grades.map((item, index) => {
                  return (
                    <SelectItem key={item?.gradeId} title={item?.name || ""} />
                  );
                })}
            </Select> */}
                </View>
                <View style={styles.buttonText}>
                  <LinearGradientButton
                    style={{
                      borderRadius: 25,
                      flex: 1,
                      backgroundColor: isValid ? Colors.primary : Colors.gray,
                    }}
                    appearance="ghost"
                    size="medium"
                    status="control"
                    onPress={() => handleSubmit()}
                  >
                    I'm done
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
                          editDependentModalVisibility: false,
                        })
                      );
                      setSelectedDependent(null);
                      setStudent(null);
                    }}
                  >
                    Cancel
                  </LinearGradientButton>
                </View>
              </>
            )}
          </Formik>
        </Card>
      </KeyboardAwareScrollView>
    </Modal>
  );
};
export default EditDependentModal;

const styles = StyleSheet.create({
  container: {
    minHeight: 192,
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    width: "90%",
  },
  inputSettings: {
    marginTop: 7,
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
  errorText: {
    fontSize: 13,
    color: "red",
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
