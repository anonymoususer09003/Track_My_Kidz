import {
  CustomTextDropDown,
  LinearGradientButton,
  Spinner
} from "@/Components";
import ProfileAvatarPicker from "@/Components/ProfileAvatar";
import { PersonIcon, PhoneIcon } from "@/Components/SignUp/icons";
import { ImagePickerModal } from "@/Modals";
import { CountryDTO } from "@/Models/CountryDTOs";
import { GetAllCities, GetAllStates } from "@/Services/PlaceServices";
import { GetAllSchools, GetSchoolByFilters } from "@/Services/School";
import { CreateStudent } from "@/Services/Student";
import { loadUserId } from "@/Storage/MainAppStorage";
import { ModalState } from "@/Store/Modal";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { PlaceState } from "@/Store/Places";
import { UserState } from "@/Store/User";
import Colors from "@/Theme/Colors";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  CheckBox,
  Icon,
  Input,
  Layout,
  Modal,
  Text
} from "@ui-kitten/components";
import { Formik } from "formik";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import ImagePicker from "react-native-image-crop-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import ProfileIcon from "react-native-vector-icons/EvilIcons";
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
const filterSchools = (item: string, query: string) => {
  console.log(item, query);
  return item?.toLowerCase().includes(query.toLowerCase());
};

const AddStudentModal = () => {
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = React.useState<string | undefined>(
    ""
  );
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const [schools, setSchools] = useState<[]>([]);
  const [grades, setGrades] = useState<string>("");
  const isVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.addStudentModal
  );
  const countries = useSelector(
    (state: { places: PlaceState }) => state.places.countries
  );
  const [visible, setVisible] = useState(false);
  const [checkBox, setCheckBox] = useState(false);
  const [countriesData, setCountriesData] = React.useState(countries);
  const [statesData, setStatesData] = React.useState<Array<any>>([]);
  const [citiesData, setCitiesData] = React.useState<Array<any>>([]);
  const [states, setStates] = useState<Array<any>>([]);
  const [cities, setCities] = useState<Array<any>>([]);
  const [schoolsData, setSchoolsData] = React.useState(schools);
  const [uploadedImage, setUploadedImage] = React.useState(null);
  const currentUser = useSelector(
    (state: { user: UserState }) => state.user.item
  );
  function getUriSource(): any {
    return { uri: selectedImage };
  }
  console.log("selectedimage", selectedImage);

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
        setSchools(_schools);
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
  const renderEditAvatarButton = (): React.ReactElement => (
    <Button
      style={styles.editAvatarButton}
      status="basic"
      accessoryRight={<Icon name="edit" />}
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
  useEffect(() => {
    if (!isFocused) {
      setSelectedImage("");
      setCheckBox(false);

      setUploadedImage(null);
    }
  }, [isFocused]);
  return (
    <Modal
      visible={isVisible}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: Colors.newBackgroundColor,
        // marginTop: 50,
      }}
      onBackdropPress={() => {
        dispatch(ChangeModalState.action({ addStudentModal: false }));
      }}
    >
      <>
        {visible && (
          <ImagePickerModal
            openCamera={imageCameraLaunch}
            openGallery={imageGalleryLaunch}
            close={() => setVisible(false)}
          />
        )}
        <KeyboardAwareScrollView
          nestedScrollEnabled={true}
          style={{ flex: 1, backgroundColor: Colors.newBackgroundColor }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: Colors.newBackgroundColor,
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
                  // grade: "",
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
                  image: selectedImage,
                }}
                onSubmit={async (values, { resetForm }) => {
                  console.log("values", values);
                  setLoading(true);
                  const userId = await loadUserId();
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
                          uri: "https://pictures-tmk.s3.amazonaws.com/images/image/man.png",
                          name: "avatar",
                          type: "image/png",
                        }
                  );
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

                  CreateStudent(formData)
                    .then((response) => {
                      console.log("response", response);
                      Toast.show({
                        type: "success",
                        position: "top",
                        text1: `Dependent has been successfully added`,
                      });

                      resetForm();
                      setUploadedImage(null);
                      setSelectedImage("");
                      setVisible(false);
                      setCheckBox(false);
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
                    })
                    .finally(() => setLoading(false));
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
                      <View style={{ width: "100%" }}>
                        {selectedImage != "" && (
                          <ProfileAvatarPicker
                            style={styles.profileImage}
                            // resizeMode='center'
                            source={
                              Platform.OS == "android"
                                ? {
                                    uri:
                                      selectedImage +
                                      "?time" +
                                      new Date().getTime(),
                                    headers: { Pragma: "no-cache" },
                                  }
                                : { uri: selectedImage }
                            }
                            // editButton={false ? renderEditAvatarButton : null}
                          />
                        )}

                        {renderEditButtonElement()}
                        {!selectedImage && (
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
                            <ProfileIcon size={110} name="user" />
                            {/* {true && renderEditButtonElement()} */}
                          </View>
                        )}

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
                          Mandatory. Close-up preferred
                        </Text>
                      </View>

                      {errors?.image && (
                        <Text style={styles.errorText}>{errors?.image}</Text>
                      )}
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
                            marginLeft: 10,
                          }}
                        >
                          Use My address
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

                              getSchoolsByFilter(
                                currentUser?.country,
                                currentUser?.state,
                                currentUser?.city
                              );
                            } else {
                              setSchoolsData([]);
                              setCheckBox(checked);
                              setFieldValue("country", "");
                              setFieldValue("selectedCountry", "");
                              setFieldValue("selectedCity", "");
                              setFieldValue("selectedState", "");
                              setFieldValue("state", "");
                              setFieldValue("city", "");
                              setFieldValue("school", "");
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
                        style={styles.textInput}
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
                        style={styles.textInput}
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
                        placeholder="State*"
                        value={values.state}
                        placement="bottom"
                        style={styles.textInput}
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
                        placeholder="City*"
                        value={values.city}
                        placement="bottom"
                        disabled={!values.selectedState}
                        style={styles.textInput}
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
                          getSchoolsByFilter(
                            values.selectedCountry,
                            values.selectedState,
                            selectedCity
                          );
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
                      <View style={{ width: "95%", marginLeft: 10, zIndex: 2 }}>
                        <CustomTextDropDown
                          disable={schoolsData?.length == 0 ? true : false}
                          placeholder="Select School"
                          value={values.school}
                          onSelect={(index: any) => {
                            console.log("index", index);

                            let school = schoolsData[index];
                            setFieldValue("school", school.name);
                            setFieldValue("selectedSchool", "");
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
                      </View>
                      {/* <Select
                        style={{
                          width: "95%",
                          marginLeft: 10,
                          marginTop: 0,
                          marginTop: -12,
                          fontSize: 12,

                          // borderRadius: 30,
                        }}
                        value={values.school}
                        placeholder="School*"
                        onSelect={(index: any) => {
                          let school = schoolsData[index.row];
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
                        label={(evaProps: any) => <Text {...evaProps}></Text>}
                      >
                        {schoolsData?.map((org, index) => {
                          return <SelectItem key={index} title={org?.name} />;
                        })}
                      </Select> */}

                      {errors.school && touched.school && (
                        <Text style={styles.errorText}>{errors.school}</Text>
                      )}

                      {values.school == "Other" && (
                        <>
                          <Input
                            style={styles.textInput}
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
                        style={styles.textInput}
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
                        style={styles.textInput}
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholder="Phone Number"
                        accessoryRight={PhoneIcon}
                        value={values.phoneNumber}
                        keyboardType="number-pad"
                        onChangeText={handleChange("phoneNumber")}
                      />
                    </Layout>

                    <>
                      {!loading ? (
                        <View
                          style={{
                            // position: "absolute",
                            // bottom: 120,
                            // left: 0,
                            // right: 0,
                            height: "100%",
                            alignItems: "center",
                            width: "90%",
                            paddingBottom: 30,
                            alignSelf: "center",
                            zIndex: -10,
                          }}
                        >
                          <View style={{ height: 20 }} />
                          <LinearGradientButton
                            disabled={isValid && values.phoneNumber ? false : true}
                            onPress={() => {
                              if (selectedImage != "") {
                                setFieldValue("addMore", false);
                                handleSubmit();
                              }
                            }}
                          >
                            I'm done
                          </LinearGradientButton>
                          {console.log("err", isValid)}
                          <View style={{ height: 20 }} />
                          <LinearGradientButton
                            disabled={isValid && values.phoneNumber? false : true}
                            onPress={() => {
                              if (selectedImage != "") {
                                setFieldValue("addMore", true);
                                handleSubmit(true);
                              }
                            }}
                          >
                            Add one more
                          </LinearGradientButton>
                          <View style={{ height: 10 }} />
                          <View style={[{ marginBottom: 50 }]}>
                            <TouchableOpacity
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
                      ) : (
                        <View style={{ marginBottom: 50 }}>
                          <Spinner />
                        </View>
                      )}
                    </>
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
    backgroundColor: Colors.newBackgroundColor,
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
    fontSize: 18,
    color: Colors.primaryTint,
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
    position: "absolute",
    right: 130,
    top: 80,
    zIndex: 2,
  },
  formContainer: {
    flex: 1,
    paddingTop: 32,
    paddingHorizontal: 16,
    backgroundColor: Colors.newBackgroundColor,
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
    color: "red",

    fontSize: 12,
    marginLeft: 10,
    marginTop: 5,
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
  editButton: {
    position: "absolute",
    alignSelf: "flex-end",
    bottom: 0,
  },
  textInput: {
    marginTop: 10,
    alignSelf: "center",
    width: "95%",

    borderRadius: 8,
    elevation: 2,
  },
  autoCompleteItem: {
    // elevation: 2,
    backgroundColor: "transparent",
    width: "90%",
  },
  inputLabels: {
    color: Colors.black,
    fontSize: 14,
    marginBottom: 10,
  },
});
