import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  Input,
  Layout,
  Select,
  SelectItem,
  Text,
  Modal,
  Autocomplete,
  AutocompleteItem,
} from "@ui-kitten/components";
import { PersonIcon, PhoneIcon } from "@/Components/SignUp/icons";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Colors from "@/Theme/Colors";
import { ModalState } from "@/Store/Modal";
import ChangeModalState from "@/Store/Modal/ChangeModalState";

import { Formik } from "formik";
import { CreateStudent } from "@/Services/Student";
import { loadUserId } from "@/Storage/MainAppStorage";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { GetSchoolByFilters, GetAllSchools } from "@/Services/School";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { PlaceState } from "@/Store/Places";
import { GetAllCities, GetAllStates } from "@/Services/PlaceServices";
import { CountryDTO } from "@/Models/CountryDTOs";
import { UserState } from "@/Store/User";
import * as yup from "yup";

const filterCountries = (item: CountryDTO, query: string) => {
  return item.name.toLowerCase().includes(query.toLowerCase());
};
const filterStates = (item: string, query: string) => {
  return item?.toLowerCase().includes(query.toLowerCase());
};
const filterCities = (item: string, query: string) => {
  return item?.toLowerCase().includes(query.toLowerCase());
};
const filterSchools = (item: string, query: string) => {
  console.log(item, query);
  return item?.toLowerCase().includes(query.toLowerCase());
};

const AddStudentModal = () => {
  const navigation = useNavigation();

  const dispatch = useDispatch();
  const [schools, setSchools] = useState<[]>([]);
  const [grades, setGrades] = useState<string>("");
  const isVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.addStudentModal
  );
  const countries = useSelector(
    (state: { places: PlaceState }) => state.places.countries
  );
  const [countriesData, setCountriesData] = React.useState(countries);
  const [statesData, setStatesData] = React.useState<Array<any>>([]);
  const [citiesData, setCitiesData] = React.useState<Array<any>>([]);
  const [states, setStates] = useState<Array<any>>([]);
  const [cities, setCities] = useState<Array<any>>([]);
  const [schoolsData, setSchoolsData] = React.useState(schools);
  const currentUser = useSelector(
    (state: { user: UserState }) => state.user.item
  );

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
        console.log("res", res);
        const _data = {
          schoolId: 0,
          name: "Other",
        };
        const _schools = [...res];
        _schools.unshift(_data);
        // setSchools(_schools);
        setSchoolsData(_schools);
      })
      .catch((err) => {
        console.log(err);
      });
  };

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

  // useEffect(() => {
  //     getSchools()
  // }, [isVisible])

  // @ts-ignore
  const getSchools = () => {
    GetAllSchools(0, 30)
      .then((res) => {
        console.log("result", res);
        setSchools(res.result);
        setSchoolsData(res.result);
      })
      .catch((err) => {
        console.log("err", err);
      });
  };
  // useEffect(() => {
  //   getSchools();
  // }, []);
  return (
    <Modal
      visible={isVisible}
      style={{
        width: "100%",
        height: "100%",
        marginTop: 50,
      }}
      onBackdropPress={() => {
        dispatch(ChangeModalState.action({ addStudentModal: false }));
      }}
    >
      <>
        <KeyboardAwareScrollView style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: Colors.white,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
            }}
          >
            <View style={styles.layout}>
              <Formik
                validateOnMount={true}
                validationSchema={validationSchema}
                initialValues={{
                  firstName: "",
                  lastName: "",
                  school: "",
                  selectedSchool: "",
                  grade: "",
                  parentName: "",
                  parentName2: "",
                  password: "",
                  confirmPassword: "",
                  termsAccepted: false,
                  phoneNumber: "",
                  email: "",
                  country: "",
                  state: "",
                  city: "",
                  selectedCountry: "",
                  selectedState: "",
                  selectedCity: "",
                  addMore: false,
                }}
                onSubmit={async (values, { resetForm }) => {
                  console.log("values", values);
                  const userId = await loadUserId();
                  const data = {
                    parentId: parseInt(userId, 0),
                    firstname: values.firstName,
                    lastname: values.lastName,
                    phone: values.phoneNumber,
                    email: values.email,
                    school:
                      values.selectedSchool != ""
                        ? values.selectedSchool
                        : values.school,
                    grade: values.grade,
                    country: values.selectedCountry,
                    state: values.state,
                    city: values.city,
                    parentemail1: currentUser.email,
                    parentemail2: "",
                  };
                  console.log("data", data);
                  CreateStudent(data)
                    .then((response) => {
                      console.log("response", response);
                      Toast.show({
                        type: "success",
                        position: "top",
                        text1: `Dependent has been successfully added`,
                      });

                      resetForm();
                      if (!values.addMore) {
                        dispatch(
                          ChangeModalState.action({
                            addStudentModal: false,
                          })
                        );
                      }

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
                    <Layout style={styles.formContainer} level="1">
                      <Input
                        style={styles.inputSettings}
                        autoCapitalize="words"
                        autoCorrect={false}
                        placeholder={`Child's First Name*`}
                        accessoryRight={PersonIcon}
                        value={values.firstName}
                        onChangeText={handleChange("firstName")}
                        onBlur={handleBlur("firstName")}
                      />
                      {errors.firstName && touched.firstName && (
                        <Text style={styles.errorText}>{errors.firstName}</Text>
                      )}
                      <Input
                        style={styles.inputSettings}
                        autoCapitalize="words"
                        autoCorrect={false}
                        placeholder={`Child's Last Name*`}
                        accessoryRight={PersonIcon}
                        value={values.lastName}
                        onChangeText={handleChange("lastName")}
                        onBlur={handleBlur("lastName")}
                      />
                      {errors.lastName && touched.lastName && (
                        <Text style={styles.errorText}>{errors.lastName}</Text>
                      )}
                      <Autocomplete
                        placeholder="Country*"
                        value={values.country}
                        placement="bottom"
                        style={{ marginVertical: 5 }}
                        // label={evaProps => <Text {...evaProps}>Country*</Text>}
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
                          // getSchoolsByFilter(selectedCountry.name);
                        }}
                      >
                        {countriesData.map((item, index) => {
                          return (
                            <AutocompleteItem key={index} title={item.name} />
                          );
                        })}
                      </Autocomplete>
                      {errors.country && touched.country && (
                        <Text style={styles.errorText}>{errors.country}</Text>
                      )}
                      <Autocomplete
                        placeholder="State*"
                        value={values.state}
                        placement="bottom"
                        style={{ marginVertical: 5 }}
                        disabled={!values.selectedCountry}
                        // label={evaProps => <Text {...evaProps}>State</Text>}
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
                          GetAllCities(
                            values.selectedCountry,
                            selectedState
                          ).then((res) => {
                            setCities(res.data);
                          });
                          // getSchoolsByFilter(
                          //   values.selectedCountry,
                          //   selectedState
                          // );
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
                        placeholder="City*"
                        value={values.city}
                        placement="bottom"
                        disabled={!values.selectedState}
                        style={{ marginVertical: 5 }}
                        // label={evaProps => <Text {...evaProps}>City</Text>}
                        onChangeText={(query) => {
                          setFieldValue("city", query);
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
                      <Autocomplete
                        placeholder="School*"
                        value={values.school}
                        placement="bottom"
                        onBlur={() => setSchoolsData(schools)}
                        // disabled={!values.selectedState}
                        style={{ marginVertical: 5 }}
                        onChangeText={(query) => {
                          setFieldValue("school", query);
                          // let schoolList = schools.filter((item: any) =>
                          //   item?.name?.includes(query)
                          // );
                          if (values.school.length > 4) {
                            getSchoolsByFilter("", "", "", query);
                          }
                          // if (schoolList.length > 0) {
                          //   setSchoolsData(schoolList);
                          // } else {
                          //   // setSchoolsData([
                          //   //   {
                          //   //     schoolId: 0,
                          //   //     name: "Other",
                          //   //   },
                          //   // ]);
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
                          setFieldValue("selectedSchool", "");
                        }}
                      >
                        {schoolsData &&
                          schoolsData.length > 0 &&
                          schoolsData.map((school, index) => {
                            return (
                              <SelectItem
                                key={index}
                                title={school?.name || ""}
                              />
                            );
                          })}
                      </Autocomplete>
                      {errors.school && touched.school && (
                        <Text style={styles.errorText}>{errors.school}</Text>
                      )}

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

                      <Input
                        style={styles.inputSettings}
                        autoCapitalize="none"
                        accessoryRight={PersonIcon}
                        value={values.email}
                        placeholder="Child's Email* (not parent's email)"
                        onChangeText={handleChange("email")}
                        onBlur={handleBlur("email")}
                      />
                      {errors.email && touched.email && (
                        <Text style={styles.errorText}>{errors.email}</Text>
                      )}
                      <Text
                        style={[
                          styles.errorText,
                          { marginTop: 5, lineHeight: 17 },
                        ]}
                      >
                        Your child will need to log in with this email and must
                        be different from parent's email for your child's
                        account.
                      </Text>
                      <Input
                        style={[styles.inputSettings, { marginBottom: 50 }]}
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholder="Phone Number"
                        accessoryRight={PhoneIcon}
                        value={values.phoneNumber}
                        keyboardType="number-pad"
                        onChangeText={handleChange("phoneNumber")}
                      />
                    </Layout>
                    <View
                      style={{
                        // position: "absolute",
                        // bottom: 120,
                        // left: 0,
                        // right: 0,
                        height: "100%",
                        alignItems: "center",
                        width: "100%",
                        paddingBottom: 30,
                      }}
                    >
                      {console.log(isValid)}
                      <View
                        style={[
                          styles.bottomButton,
                          {
                            backgroundColor: isValid
                              ? Colors.primary
                              : Colors.gray,
                          },
                        ]}
                      >
                        <TouchableOpacity
                          style={[
                            styles.bottomButton,
                            {
                              backgroundColor: isValid
                                ? Colors.primary
                                : Colors.gray,
                            },
                          ]}
                          onPress={() => {
                            setFieldValue("addMore", false);
                            handleSubmit();
                          }}
                        >
                          <Text style={styles.button}>I'm done</Text>
                        </TouchableOpacity>
                      </View>
                      <View
                        style={[
                          styles.bottomButton,
                          {
                            backgroundColor: isValid
                              ? Colors.primary
                              : Colors.gray,
                          },
                        ]}
                      >
                        <TouchableOpacity
                          style={[
                            styles.bottomButton,
                            {
                              backgroundColor: isValid
                                ? Colors.primary
                                : Colors.gray,
                            },
                          ]}
                          onPress={() => {
                            setFieldValue("addMore", true);
                            handleSubmit(true);
                          }}
                        >
                          <Text style={styles.button}>Add one more</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={[styles.bottomButton, { marginBottom: 50 }]}>
                        <TouchableOpacity
                          style={styles.bottomButton}
                          onPress={() =>
                            dispatch(
                              ChangeModalState.action({
                                addStudentModal: false,
                              })
                            )
                          }
                        >
                          <Text style={styles.button}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                )}
              </Formik>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </>
    </Modal>
  );
};
export default AddStudentModal;

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
  content: {
    // flexDirection: 'row',
    backgroundColor: "red",
    width: 100,
    height: 100,
  },
  profileAvatar: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignSelf: "center",
    backgroundColor: "color-primary-default",
    tintColor: "background-basic-color-1",
  },
  profileImage: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignSelf: "center",
  },
  editAvatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  formContainer: {
    flex: 1,
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  inputSettings: {
    marginTop: 7,
  },
  professionalCheckbox: {
    marginTop: 10,
  },
  termsCheckBox: {
    marginTop: 24,
  },
  termsCheckBoxText: {
    color: "text-hint-color",
    marginLeft: 10,
  },
  signUpButton: {
    marginHorizontal: 16,
    borderRadius: 20,
  },
  createPostButton: {
    marginVertical: 12,
    marginHorizontal: 16,
  },
  selectSettings: {
    marginTop: 18,
  },
  errorText: {
    fontSize: 13,
    color: "red",
  },
  textArea: {
    marginTop: 10,
    height: 80,
  },
  phoneNumber: {
    flexDirection: "row",
  },
  prefixStyle: {
    marginTop: 10,
    width: "25%",
    marginRight: "2%",
  },
  phoneStyle: {
    width: "73%",
    marginTop: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.fieldLabel,
  },
  multiSelectMenuStyle: {
    backgroundColor: "#f7f9fc",
    borderColor: "#e4e9f2",
    borderWidth: 1,
    borderRadius: 3,
    paddingLeft: 16,
  },
  searchInputStyle: {
    color: "#000",
    backgroundColor: "#fff",
  },
  dropdownMenuStyle: {
    fontWeight: "400",
    fontSize: 16,
    color: Colors.primary,
  },
  selectedDropdownStyle: {
    fontWeight: "bold",
    fontSize: 15,
  },
  itemsContainerStyle: {
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  selectorContainerStyle: {
    height: 200,
    backgroundColor: "#fff",
  },
  rowListStyle: {
    paddingVertical: 5,
  },
});
