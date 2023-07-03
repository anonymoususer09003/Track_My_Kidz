import {
  CustomTextDropDown,
  LinearGradientButton,
  Spinner,
} from "@/Components";
import ProfileAvatarPicker from "@/Components/ProfileAvatar";
import { ImagePickerModal } from "@/Modals";
import { CountryDTO } from "@/Models/CountryDTOs";
import { GetAllCities, GetAllStates } from "@/Services/PlaceServices";
import {
  GetAllSchools,
  GetSchoolByFilters,
  UpdateSchool,
} from "@/Services/School";
import { UpdateStudent } from "@/Services/Student";
import { loadUserId } from "@/Storage/MainAppStorage";
import { ModalState } from "@/Store/Modal";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { PlaceState } from "@/Store/Places";
import { UserState } from "@/Store/User";
import Colors from "@/Theme/Colors";
import { useIsFocused } from "@react-navigation/native";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Card,
  CheckBox,
  Icon,
  Input,
  Modal,
  Text,
} from "@ui-kitten/components";
import { Formik } from "formik";
import React, { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import ImagePicker from "react-native-image-crop-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { useDispatch, useSelector } from "react-redux";
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
const screenHeight = Dimensions.get("screen").height;
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
  const [uploadedImage, setUploadedImage] = React.useState();
  const [selectedImage, setSelectedImage] = React.useState<string | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  // const [dependents, setCities] = useState<Array<any>>([]);
  const [checkBox, setCheckBox] = useState(false);
  const [schoolsData, setSchoolsData] = React.useState([]);
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
  const imageGalleryLaunch = () => {
    ImagePicker.openPicker({
      cropping: true,
      cropperCircleOverlay: true,
      width: 139,
      height: 130,
      compressImageQuality: 0.2,
      loadingLabelText: "Loading image",
    }).then((image) => {
      if (image != null) {
        const source = { uri: image?.path };
        setUploadedImage(image);
        setSelectedImage(source.uri);
        // uploadAvatarToAWS(source.uri).then(r => { console.log('here', r) }).catch((err) => { console.log('Errorr', err) })
      }
    });
  };
  const imageCameraLaunch = () => {
    ImagePicker.openCamera({
      cropping: true,
      cropperCircleOverlay: true,
      width: 139,
      height: 130,
      compressImageQuality: 0.2,
      loadingLabelText: "Loading image",
    }).then((image) => {
      if (image != null) {
        const source = { uri: image?.path };
        setUploadedImage(image);
        setSelectedImage(source.uri);
        // uploadAvatarToAWS(source.uri).then(r => { console.log('here', r) }).catch((err) => { console.log('Errorr', err) })
      }
    });
  };

  const renderEditAvatarButton = (): React.ReactElement => (
    <Button
      style={styles.editAvatarButton}
      status='basic'
      accessoryRight={<Icon name='edit' />}
      onPress={() => setVisible(true)}
    />
  );
  const renderEditButtonElement = (): ButtonElement => {
    const buttonElement: React.ReactElement<ButtonProps> =
      renderEditAvatarButton();

    return React.cloneElement(buttonElement, {
      style: [buttonElement.props.style, styles.editButton],
    });
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

  // useEffect(() => {
  //   getSchools();
  // }, [isVisible]);

  const handleSetStudent = () => {
    if (selectedDependent) {
      setStudent(selectedDependent);
    }
  };
  console.log("school data", schoolsData);
  useEffect(() => {
    if (isFocused) {
      handleSetStudent();
      getSchoolsByFilter(
        selectedDependent?.country,
        selectedDependent?.state,
        selectedDependent?.city
      );
      // setSelectedImage(selectedDependent?.studentImage);
      // setUploadedImage(selectedDependent?.studentImage);
    } else {
      setCheckBox(false);
      setSelectedImage(null);
    }
  }, [isFocused, selectedDependent]);
  function getUriSource(): any {
    return { uri: selectedImage };
  }
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
      {visible && (
        <ImagePickerModal
          openCamera={imageCameraLaunch}
          openGallery={imageGalleryLaunch}
          close={() => setVisible(false)}
        />
      )}
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flex: 1 }}
      >
        {isFocused && (
          <ScrollView style={{ flex: 1 }}>
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

              <View style={{ width: "100%" }}>
                {(selectedImage != "" || selectedDependent?.studentImage) && (
                  <View>
                    <ProfileAvatarPicker
                      style={styles.profileImage}
                      // resizeMode='center'
                      source={{
                        uri: selectedImage || selectedDependent?.studentImage,
                      }}
                      // source={{ uri: selectedImage }}
                      editButton={false ? () => renderEditAvatarButton() : null}
                    />
                  </View>
                )}
                {!selectedImage && !selectedDependent?.studentImage && (
                  <View
                    style={[
                      styles.profileImage,
                      {
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: Colors.lightgray,
                      },
                    ]}
                  >
                    <Text>
                      {student?.firstname?.substring(0, 1)?.toUpperCase() || ""}
                      {student?.lastname?.substring(0, 1)?.toUpperCase() || ""}
                    </Text>
                    {/* <ProfileIcon
                  size={110}
                  // style={{ marginRight: 20 }}
                  name="user"
                /> */}
                  </View>
                )}
                {true && renderEditButtonElement()}
                <Text
                  style={[
                    styles.errorText,
                    {
                      marginTop: 20,
                      lineHeight: 17,
                      textAlign: "center",
                    },
                  ]}
                >
                  Headshots preffered
                </Text>
              </View>

              <Formik
                validateOnMount={true}
                validationSchema={validationSchema}
                initialValues={{
                  firstName: selectedDependent?.firstname,
                  lastName: selectedDependent?.lastname,
                  school: selectedDependent?.childSchool,
                  selectedSchool: "",
                  grade: "",
                  parentName: "",
                  parentName2: "",
                  password: "",
                  confirmPassword: "",
                  termsAccepted: false,
                  phoneNumber: selectedDependent?.childPhone,
                  email: selectedDependent?.childEmail,
                  country: selectedDependent?.country || "",
                  state: selectedDependent?.state || "",
                  city: selectedDependent?.city || "",
                  selectedCountry: selectedDependent?.country || "",
                  selectedState: selectedDependent?.state || "",
                  selectedCity: selectedDependent?.city || "",
                  selectedSchool: "",
                }}
                onSubmit={async (values, { resetForm }) => {
                  const userId = await loadUserId();

                  setLoading(true);
                  let formData = new FormData();
                  formData.append(
                    "image",
                    uploadedImage
                      ? {
                          uri: uploadedImage?.path,
                          name: uploadedImage.mime,
                          type: uploadedImage.mime,
                        }
                      : {
                          uri:
                            selectedDependent?.studentImage ||
                            "https://pictures-tmk.s3.amazonaws.com/images/image/man.png",
                          name: "avatar",
                          type: "image/png",
                        }
                  );
                  formData.append("id", parseInt(student?.studentId));
                  formData.append("parentId", parseInt(userId, 0));
                  formData.append("firstname", values.firstName);
                  formData.append("lastname", values.lastName);
                  formData.append("phone", values.phoneNumber);
                  formData.append("email", values?.email);
                  formData.append(
                    "school",
                    values.selectedSchool != ""
                      ? values.selectedSchool
                      : values.school
                  );
                  formData.append("country", values.country);

                  formData.append("state", values.state);
                  formData.append("city", values.city);
                  formData.append("parentemail1", currentUser.email);
                  formData.append("parentemail2", "");

                  console.log("data", JSON.stringify(formData));
                  UpdateStudent(formData)
                    .then((response) => {
                      console.log("response", response);
                      dispatch(
                        ChangeModalState.action({
                          editDependentModalVisibility: false,
                        })
                      );
                      setSelectedImage(null);
                      setUploadedImage(null);
                      setSelectedDependent(null);
                      setStudent(null);
                      Toast.show({
                        type: "success",
                        position: "top",
                        text1: `Dependent Info has been successfully updated`,
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
                    })
                    .finally(() => {
                      setLoading(false);
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
                    <View style={{ marginTop: 30, padding: 10 }}>
                      <View
                        style={{
                          flexDirection: "row",

                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            marginRight: 20,
                            marginTop: 10,
                            color: Colors.black,
                            fontSize: 14,
                            marginLeft: 5,
                          }}
                        >
                          Use my address
                        </Text>
                        <CheckBox
                          style={[{ flex: 1, marginTop: 13 }]}
                          checked={checkBox}
                          onChange={(checked) => {
                            if (checked) {
                              setCheckBox(checked);
                              setFieldValue(
                                "country",
                                currentUser?.country || ""
                              );
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
                        style={styles.textInput}
                        autoCapitalize='none'
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
                        style={styles.textInput}
                        autoCapitalize='none'
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
                        style={styles.textInput}
                        autoCapitalize='none'
                        autoCorrect={false}
                        value={values.email}
                        placeholder='Email*'
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
                        style={styles.textInput}
                        autoCapitalize='none'
                        autoCorrect={false}
                        placeholder={`Phone # (Optional)`}
                        value={values.phoneNumber}
                        keyboardType='number-pad'
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
                        placeholder='Country*'
                        value={values?.country}
                        placement='bottom'
                        style={styles.textInput}
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
                          getSchoolsByFilter(selectedCountry);
                          // getSchoolsByFilter(selectedCountry.name);
                        }}
                      >
                        {countriesData.map((item, index) => {
                          return (
                            <AutocompleteItem
                              style={styles.autoCompleteItem}
                              key={index}
                              title={item.name}
                            />
                          );
                        })}
                      </Autocomplete>
                      {errors.country && touched.country && (
                        <Text style={styles.errorText}>{errors.country}</Text>
                      )}
                      <Autocomplete
                        placeholder='State*'
                        value={values.state}
                        // value={student?.state}
                        placement='bottom'
                        style={styles.textInput}
                        disabled={!values.selectedCountry}
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
                          getSchoolsByFilter(
                            values.selectedCountry,
                            selectedState
                          );
                          // getSchoolsByFilter(values.selectedCountry, selectedState);
                        }}
                      >
                        {statesData.map((item, index) => {
                          return (
                            <AutocompleteItem
                              style={styles.autoCompleteItem}
                              key={index}
                              title={item}
                            />
                          );
                        })}
                      </Autocomplete>

                      {errors.state && touched.state && (
                        <Text style={styles.errorText}>{errors.state}</Text>
                      )}
                      <Autocomplete
                        placeholder='City'
                        value={values?.city}
                        placement='bottom'
                        disabled={!values.selectedState}
                        // disabled={!student?.selectedState}
                        style={styles.textInput}
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
                          getSchoolsByFilter(
                            values.selectedCountry,
                            values.selectedState,
                            selectedCity
                          );
                          // getSchoolsByFilter("", "", selectedCity);
                        }}
                      >
                        {citiesData.map((item, index) => {
                          return (
                            <AutocompleteItem
                              style={styles.autoCompleteItem}
                              key={index}
                              title={item}
                            />
                          );
                        })}
                      </Autocomplete>
                      {/* {console.log("values", values)} */}
                      <CustomTextDropDown
                        placeholder='Select School'
                        value={values.school}
                        onSelect={(index: any) => {
                          console.log("index", index);

                          let school = schoolsData[index];
                          setFieldValue("school", school.name);
                          setFieldValue("selectedSchool", school.name);
                          if (school.name != "Other") {
                            setFieldValue("schoolName", school.name);
                            setFieldValue("schoolAddress", school.address);
                          } else {
                            setFieldValue("schoolName", "");
                            setFieldValue("schoolAdress", "");
                          }
                        }}
                        dropDownList={schoolsData}
                      />
                      {/* <Autocomplete
                        placeholder="School*"
                        value={values.school}
                        placement="bottom"
                        onBlur={() => setSchoolsData(schools)}
                        // disabled={!values.selectedState}
                        style={styles.textInput}
                        onChangeText={(query) => {
                          console.log("query", query);
                          setFieldValue("school", query);
                          if (values.school.length > 4) {
                            getSchoolsByFilter("", "", "", query);
                          }
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
                              <AutocompleteItem
                                style={styles.autoCompleteItem}
                                key={index}
                                title={school?.name || ""}
                              />
                            );
                          })}
                      </Autocomplete> */}
                      {values.school == "Other" && (
                        <>
                          <Input
                            style={styles.inputSettings}
                            autoCapitalize='words'
                            // accessoryRight={PersonIcon}
                            value={values.selectedSchool}
                            placeholder='School Name*'
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
                    </View>
                    {!loading ? (
                      <View style={styles.buttonText}>
                        <LinearGradientButton
                          style={{
                            borderRadius: 25,
                            flex: 1,
                            backgroundColor:
                              isValid && selectedImage != ""
                                ? Colors.primary
                                : Colors.gray,
                          }}
                          appearance='ghost'
                          size='medium'
                          status='control'
                          onPress={() => selectedImage != "" && handleSubmit()}
                        >
                          I'm done
                        </LinearGradientButton>
                      </View>
                    ) : (
                      <Spinner />
                    )}
                    <View style={styles.buttonText}>
                      <LinearGradientButton
                        style={{
                          borderRadius: 25,
                          flex: 1,
                        }}
                        appearance='ghost'
                        size='medium'
                        status='control'
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
                    <View style={{ marginBottom: 50 }} />
                  </>
                )}
              </Formik>
            </Card>
          </ScrollView>
        )}
      </KeyboardAwareScrollView>
    </Modal>
  );
};
export default EditDependentModal;

const styles = StyleSheet.create({
  container: {
    maxHeight: screenHeight * 0.85,
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    width: "90%",
    backgroundColor: Colors.newBackgroundColor,
  },
  inputSettings: {
    marginTop: 7,
  },
  modal: { borderRadius: 10, backgroundColor: Colors.newBackgroundColor },
  header: { flex: 1, textAlign: "center", fontWeight: "bold", fontSize: 20 },
  body: { flex: 3 },
  background: {
    flex: 1,
    flexDirection: "row",

    zIndex: -1,
    backgroundColor: Colors.newBackgroundColor,
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
    zIndex: -1,
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
    marginTop: 10,
  },
  errorText: {
    color: "red",

    fontSize: 12,
    marginLeft: 10,
    marginTop: 5,
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  editButton: {
    position: "absolute",
    alignSelf: "flex-end",
    bottom: 0,
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
    position: "absolute",
    top: 70,
    right: 90,
    // alignSelf: "center",
    // marginRight: -50,
  },
  textInput: {
    marginTop: 10,
    alignSelf: "center",
    width: "100%",

    borderRadius: 8,
    elevation: 2,
  },
  autoCompleteItem: {
    // elevation: 2,
    backgroundColor: "transparent",
    width: "100%",
  },
  inputLabels: {
    color: Colors.black,
    fontSize: 14,
    marginBottom: 10,
  },
});
