import { CompleteRegistration, Register } from "@//Services/SignUpServices";
import { LinearGradientButton, ProfileAvatarPicker, Spinner } from "@/Components";
import BackgroundLayout from "@/Components/BackgroundLayout";
import {
  PersonIcon,
  PhoneIcon
} from "@/Components/SignUp/icons";
import { AddInstructorsModal, EditInstructorsModal, ImagePickerModal } from "@/Modals";
import AddBusInformation from "@/Modals/AddBusInformation";
import { CountryDTO } from "@/Models/CountryDTOs";
import { RegisterDTO, UserRegistrationDTO } from "@/Models/UserDTOs";
import { AuthContext } from "@/Navigators/Auth/AuthProvider";
import { Login } from "@/Services/LoginServices";
import { GetAllOrg, GetOrgByFilters } from "@/Services/Org";
import { GetAllCities, GetAllStates } from "@/Services/PlaceServices";
import { GetAllSchools, GetSchoolByFilters } from "@/Services/School";
import { storeInstructors, storeToken } from "@/Storage/MainAppStorage";
import LoginStore from "@/Store/Authentication/LoginStore";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { PlaceState } from "@/Store/Places";
import Colors from "@/Theme/Colors";
import { useIsFocused } from "@react-navigation/native";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  CheckBox, Icon, Input,
  Layout, Select,
  SelectItem,
  StyleService,
  Text,
  useStyleSheet
} from "@ui-kitten/components";
import { Props } from "@ui-kitten/components/devsupport/services/props/props.service";
import { Formik } from "formik";
import React, {
  ReactElement,
  ReactText,
  useContext,
  useEffect,
  useState
} from "react";
import {
  Alert,
  KeyboardAvoidingView, Linking, Platform,
  ScrollView, TouchableOpacity, TouchableWithoutFeedback,
  View
} from "react-native";
import { getDeviceId } from "react-native-device-info";
import ImagePicker from "react-native-image-crop-picker";
import Toast from "react-native-toast-message";
import AntDesign from "react-native-vector-icons/AntDesign";
import Feather from "react-native-vector-icons/Feather";
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
  return item?.toLowerCase().includes(query.toLowerCase());
};
const filter = (item: String, query: string) => {
  return item.toLowerCase().includes(query.toLowerCase());
};

const user_types = [
  { id: 1, label: "Parent", value: "Parent" },
  { id: 2, label: "Instructor", value: "Instructor" },
  { id: 3, label: "Student", value: "Student" },
];

const organisations = [
  { id: 1, label: "School", value: "School" },
  { id: 2, label: "Organisation", value: "Organisation" },
];

const schools = [
  { id: 1, label: "School 1", value: "School 1" },
  { id: 2, label: "School 2", value: "School 2" },
  { id: 3, label: "New School", value: "New School" },
];

const _instructors = [];

const FinalOrgRegistrationScreen = ({ navigation, route }: Props) => {
  const [passwordVisible, setPasswordVisible] = React.useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] =
    React.useState<boolean>(false);
  const [languages, setLanguages] = useState<Array<ReactText>>(["English"]);
  const isFocuesed = useIsFocused();
  const [genders, setGenders] = useState<Array<ReactText>>([
    "Female",
    "Male",
    "Other",
  ]);
  const countries = useSelector(
    (state: { places: PlaceState }) => state.places.countries
  );
  const isVisibleAddInstructor = useSelector(
    (state: { modal: ModalState }) => state.modal.addInstructorModalVisibility
  );
  const isVisible = useSelector(
    (state: { modal: ModalState }) =>
      state.modal.addButInformationModalVisibility
  );
  const [countriesData, setCountriesData] = React.useState(countries);
  const [schoolsData, setSchoolsData] = React.useState(schools);
  const [schools, setSchools] = useState([]);
  const [statesData, setStatesData] = React.useState<Array<any>>([]);
  const [citiesData, setCitiesData] = React.useState<Array<any>>([]);
  const [orgData, setOrgData] = React.useState([]);
  const [org, setOrg] = useState([]);
  const [rows, setRows] = useState([
    {
      grade: "",
      subject: "",
    },
  ]);
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const [reRender, setRerender] = useState(false);
  const [states, setStates] = useState<Array<any>>([]);
  const [cities, setCities] = useState<Array<any>>([]);
  const [phoneCode, setPhoneCode] = useState<string>("");
  const [placement, setPlacement] = React.useState("bottom");
  const [instructors, setInstructors] = useState(_instructors);
  const [selectedImage, setSelectedImage] = React.useState<string | undefined>(
    ""
  );
  const [visibleImagePicker, setVisibleImagePicker] = useState(false);
  const [buses, setBuses] = useState([]);
  const [uploadedImage, setUploadedImage] = React.useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState({});
  const { register } = useContext(AuthContext);

  const styles = useStyleSheet(themedStyles);
  const { emailAddress, user_type, details } = route.params;
  const { registrationId, activation_code } = route.params;

  const [visible, setVisible] = React.useState(false);
  const dispatch = useDispatch();

  const _user_type = user_types.find((u) => u.label === user_type);

  const signUpValidationSchema = yup.object().shape({
    firstName: yup.string().required("First name is required"),
    lastName: yup.string().required("Last name is required"),
    zipcode: yup.string().required("Zip code is required"),
    // schoolName: yup.string().required("School name is required"),
    address: yup.string(),

    country: yup.string(),
    schoolAddress: yup.string().required("School address is required"),
    selectedCountry: yup.string(),
    selectedState: yup.string(),
    selectedCity: yup.string(),
    city: yup.string().required("City is required"),
    state: yup.string().required("State is required"),
    phoneNumber: yup.string(),
    password: yup
      .string()
      .min(8, ({ min }) => `Password must be at least ${min} characters`)
      .required("Password is required"),
    confirmPassword: yup
      .string()
      .when("password", {
        is: (val: any) => (val && val.length > 0 ? true : false),
        then: yup
          .string()
          .oneOf(
            [yup.ref("password")],
            "Password & Confirm Password do not match"
          ),
      })
      .required("Re-Password is required"),
    termsAccepted: yup.boolean().required(),
  });

  const onPasswordIconPress = (): void => {
    setPasswordVisible(!passwordVisible);
  };

  const onConfirmPasswordIconPress = (): void => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const renderPasswordIcon = (props: any): ReactElement => (
    <TouchableWithoutFeedback onPress={onPasswordIconPress}>
      <Icon {...props} name={passwordVisible ? "eye-off" : "eye"} />
    </TouchableWithoutFeedback>
  );

  const renderConfirmPasswordIcon = (props: any): ReactElement => (
    <TouchableWithoutFeedback onPress={onConfirmPasswordIconPress}>
      <Icon {...props} name={confirmPasswordVisible ? "eye-off" : "eye"} />
    </TouchableWithoutFeedback>
  );
  const renderEditAvatarButton = (): React.ReactElement => (
    <Button
      style={styles.editAvatarButton}
      status="basic"
      accessoryRight={<Icon name="edit" />}
      onPress={() => setVisibleImagePicker(true)}
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
    if (!isFocuesed) {
      setInstructors([]);
      setBuses([]);
      setRerender(false);
    } else {
      setRerender(true);
    }
  }, [isFocuesed]);
  const CheckboxLabel = (evaProps: any) => {
    return (
      <Text {...evaProps} style={styles.termsCheckBoxText}>
        I have read and agree to the{" "}
        <Text
          style={{ color: Colors.primary }}
          onPress={() => {
            Linking.openURL("https://trackmykidz.com/terms/").then((r) => {});
          }}
        >
          {" "}
          Terms of Use{" "}
        </Text>{" "}
        and
        <Text
          style={{ color: Colors.primary }}
          onPress={() => {
            Linking.openURL("https://trackmykidz.com/privacy-policy").then(
              (r) => {}
            );
          }}
        >
          {" "}
          Privacy Policy{" "}
        </Text>
        of TrackMyKidz
      </Text>
    );
  };

  const handleDeleteInstructor = (instructor: any) => {
    let data = [...instructors];
    data = data.filter((d) => d.email !== instructor.email);
    setInstructors(data);
  };

  const handleDeleteBus = (bus: any, index: any) => {
    let data = [...buses];
    data = data.filter((d, ind) => ind !== index);
    console.log(data);
    setBuses(data);
  };

  const getSchools = () => {
    GetAllSchools(0, 30)
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
      .catch((err) => {
        console.log(err);
        const data = [
          {
            schoolId: 0,
            name: "Other",
          },
        ];
        setSchoolsData(data);
      });
  };
  const getOrgs = () => {
    GetAllOrg(0, 30)
      .then((res) => {
        const _data = {
          orgId: 0,
          name: "Other",
        };
        const _org = [...res.result];
        _org.unshift(_data);
        setOrg(_org);
        setOrgData(_org);
      })
      .catch((err) => {
        console.log(err);
        const data = [
          {
            schoolId: 0,
            name: "Other",
          },
        ];
        setOrgData(data);
        // setSchoolsData(data);
      });
  };

  useEffect(() => {
    getSchools();
    getOrgs();
  }, []);

  const getSchoolsByFilter = (
    country = "",
    state = "",
    city = "",
    schoolName = ""
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
        console.log("res school", res);
        const _schools = [...res];
        _schools.unshift(_data);

        console.log("_school0000", _schools);
        setSchools(_schools);
        setSchoolsData(_schools);
        console.log("_schools", _schools);
      })
      .catch((err) => {
        console.log("GetSchoolByFilters", err);
      });
  };
  console.log("schoolsdta", schoolsData);
  const getOrgByFilter = (
    country = "",
    state = "",
    city = "",
    orgName = ""
  ) => {
    const query = {
      country: country,
      state: state,
      city: city,
      orgName: orgName,
    };
    GetOrgByFilters(query)
      .then((res) => {
        const _data = {
          schoolId: 0,
          name: "Other",
        };
        const _org = [...res];
        _org.unshift(_data);
        setOrg(_org);
        setOrgData(_org);
      })
      .catch((err) => {
        console.log("GetOrgByFilters", err);
      });
  };
  const handleInstructorEdit = (item: any, index: any) => {
    setSelectedInstructor({ ...item, index });
    dispatch(
      ChangeModalState.action({
        // previewInstructorModalVisibility: false,
        editInstructorFormModalVisibility: true,
      })
    );
    // );
    // let temp = [...instructors];
    // temp.splice(index, 1);
    // setInstructors(temp);
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
  return (
    <BackgroundLayout title="Registration">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -150}
      >
        {visibleImagePicker && (
          <ImagePickerModal
            openCamera={imageCameraLaunch}
            openGallery={imageGalleryLaunch}
            close={() => setVisibleImagePicker(false)}
          />
        )}

        {selectedInstructor && (
          <EditInstructorsModal
            selectedInstructor={selectedInstructor}
            instructors={instructors}
            setInstructors={(item) => {
              setInstructors(item);
            }}
          />
        )}
        {isVisibleAddInstructor && (
          <AddInstructorsModal
            instructors={instructors}
            setInstructors={setInstructors}
          />
        )}
        {isVisible && <AddBusInformation buses={buses} setBuses={setBuses} />}

        <View style={{ width: "100%" }}>
          {selectedImage != "" && (
            <ProfileAvatarPicker
              style={styles.profileImage}
              // resizeMode='center'
              source={
                Platform.OS == "android"
                  ? {
                      uri: selectedImage + "?time" + new Date().getTime(),
                      headers: { Pragma: "no-cache" },
                    }
                  : { uri: selectedImage }
              }
              editButton={false ? renderEditAvatarButton : null}
            />
          )}
          {selectedImage == "" && (
            <View
              style={[
                styles.profileImage,
                {
                  // alignItems: "center",
                  // justifyContent: "center",
                  backgroundColor: Colors.lightgray,
                },
              ]}
            >
              {/* <Text style={{ fontSize: 30 }}>
                      {user?.firstname?.substring(0, 1)?.toUpperCase()}{" "}
                      {user?.lastname?.substring(0, 1)?.toUpperCase()}
                    </Text> */}
              <View
                style={{
                  position: "absolute",
                  marginTop: 70,
                  marginLeft: 85,
                }}
              >
                {true && renderEditButtonElement()}
              </View>
            </View>
          )}
        </View>

        <ScrollView style={styles.container}>
          {reRender && (
            <Formik
              validationSchema={signUpValidationSchema}
              validateOnMount={true}
              initialValues={{
                firstName:
                  details && details.firstname ? details.firstname : "",
                lastName: details && details.lastname ? details.lastname : "",
                schoolName: "",
                school_name: "",
                schoolAddress: "",
                country: "",
                selectedCountry: "",
                selectedState: "",
                selectedCity: "",
                city: "",
                state: "",
                zipcode: "",

                phoneNumber:
                  details && details.phoneNumber ? details.phoneNumber : "",
                password: "",
                confirmPassword: "",
                termsAccepted: false,
                school: "",
                organization: "",
                selected_entity: "",
                organizationName: "",
              }}
              onSubmit={(values, { resetForm }) => {
                dispatch(ChangeModalState.action({ loading: true }));
                const school_name =
                  values.schoolName === "Other"
                    ? values.school_name
                    : values.schoolName;
                console.log("schooldata", school_name);
                let schoolId =
                  values.schoolName === "Other"
                    ? { schoolId: 0 }
                    : schoolsData.find((s) => s.name === school_name);
                console.log("----school", schoolId);
                schoolId = Array.isArray(schoolId)
                  ? schoolId[0].schoolId
                  : schoolId?.schoolId;

                let schoolAddress = Array.isArray(schoolId)
                  ? schoolId[0]?.address
                  : schoolId?.address;
                console.log("----888school", schoolId);
                const org_name = values.schoolName;
                const orgId =
                  values.schoolName === "Other"
                    ? null
                    : orgData.find((s) => s.name === org_name)?.orgId;
                const registerObject: RegisterDTO = {
                  email: emailAddress,
                  password: values.password,
                  activationcode: activation_code,
                };
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
                formData.append("firstname", values.firstName);
                formData.append("lastname", values.lastName);

                formData.append("address", values.schoolAddress || "");
                formData.append("email", emailAddress);
                formData.append("state", values.state);
                formData.append("city", values.city);
                formData.append("country", values.country);
                formData.append("zipcode", values.zipcode);
                formData.append("phone", values.phoneNumber);
                formData.append("password", values.password);
                formData.append("term", true);
                formData.append("isAdmin", true);
                formData.append("deviceId", getDeviceId());
                // formData.append("schoolId", schoolId || "");
                // formData.append("orgId", orgId || "");

                console.log("formData0202002020200202", formData);

                const userObject: UserRegistrationDTO = {
                  firstname: values.firstName,
                  lastname: values.lastName,
                  address:
                    schoolId != 0 && schoolId
                      ? schoolAddress
                      : values?.schoolAddress,
                  email: emailAddress,
                  state: values.state,
                  city: values.city,
                  country: values.country,
                  zipcode: values.zipcode,
                  phone: values.phoneNumber,
                  password: values.password,
                  term: true,
                  isAdmin: true,
                  grades: [
                    {
                      id: 0,
                      name: "Test",
                      subject: [
                        {
                          id: 0,
                          name: "Test",
                        },
                      ],
                    },
                  ],
                  schoolId: schoolId,
                  orgId: orgId,
                };
                console.log("values", values.schoolName);
                const schoolObject: UserRegistrationDTO = {
                  name:
                    values.school === "Other"
                      ? values.school_name
                      : values.schoolName,
                  address:
                    schoolId != 0 && schoolId
                      ? schoolAddress
                      : values?.schoolAddress,
                  country: values.country,
                  zipcode: values.zipcode,
                  city: values.city,
                  state: values.state,
                  grades: null,
                  // representatives:
                  //   instructors && instructors.length > 0
                  //     ? instructors.map((i) => ({
                  //         email: i.email,
                  //         firstname: i.firstName,
                  //         lastname: i.lastName,
                  //         isnew: true,
                  //         type: values.selected_entity.toLowerCase(),
                  //       }))
                  //     : [],
                };
                setLoading(true);
                const orgObject: UserRegistrationDTO = {
                  name: values.organizationName,
                  address: values.schoolAddress,
                  country: values.country,
                  zipcode: values.zipcode,
                  city: values.city,
                  state: values.state,
                  grades: null,
                  representatives: [],
                };
                let loginObject = {
                  email: emailAddress,
                  password: values.password,
                };

                Register(registerObject, "instructor")
                  .then(async (response) => {
                    console.log("response---", response.data);
                    await storeToken(response.data.token);
                    console.log("schoolId", schoolId);
                    if (
                      values.selected_entity == "School" &&
                      (schoolId == 0 || !schoolId)
                    ) {
                      CompleteRegistration(schoolObject, "school")
                        .then((_res) => {
                          console.log("kskksks", {
                            ...userObject,
                            schoolId: _res?.data?.schoolId,
                          });

                          formData.append("schoolId", _res?.data?.schoolId);

                          console.log("formdata---------------", formData);
                          // {
                          //   ...userObject,
                          //   schoolId: _res.data.schoolId,
                          // }
                          CompleteRegistration(formData, "instructor")
                            .then(async (response: any) => {
                              console.log("response2727878", response);
                              let obj = {
                                token: response.data.token,
                                userType: "instructor",
                                id: response.data.instructorId,
                                mainId: _res.data?.userId,
                              };
                              let _instructors = instructors.map((item) => ({
                                firstName: item?.firstName || "",
                                lastName: item?.lastName || "",
                                email: item?.email || "",
                                phoneNumber: item?.phoneNumber || "",
                                isAdmin: item?.isAdmin || false,
                              }));
                              await Login(loginObject, user_type.toLowerCase());
                              await storeInstructors(
                                JSON.stringify(_instructors)
                              );
                              dispatch(LoginStore.action(obj));

                              console.log("_instructors", _instructors);
                              console.log(
                                "_instructors",
                                response.data.instructorId
                              );

                              if (response.status == 201) {
                                register(emailAddress, values.password);
                                // dispatch(
                                //   ChangeModalState.action({
                                //     welcomeMessageModal: true,
                                //   })
                                // );
                              }
                            })
                            .catch((error: any) => {
                              console.log("error third", error);
                              Toast.show({
                                type: "info",
                                position: "top",
                                text1: error,
                                text2: error?.data?.statusDescription,
                                visibilityTime: 4000,
                                autoHide: true,
                                topOffset: 30,
                                bottomOffset: 40,
                                onShow: () => {},
                                onHide: () => {},
                                onPress: () => {},
                              });
                            })
                            .finally(() => {
                              dispatch(
                                ChangeModalState.action({ loading: false })
                              );
                            });
                        })
                        .catch((err) => {
                          console.log("err first", err);
                        });
                    } else if (
                      values.selected_entity == "School" &&
                      schoolId != 0
                    ) {
                      formData.append("schoolId", schoolId);

                      CompleteRegistration(formData, "instructor")
                        .then(async (res: any) => {
                          console.log("response2727878", res);
                          let obj = {
                            token: res.data.token,
                            userType: "instructor",
                            id: res.data.instructorId,
                            mainId: response.data?.userId,
                          };
                          console.log("obj", obj);
                          let _instructors = instructors.map((item) => ({
                            firstName: item?.firstName || "",
                            lastName: item?.lastName || "",
                            email: item?.email || "",
                            phoneNumber: item?.phoneNumber || "",
                            isAdmin: item?.isAdmin || false,
                          }));
                          await Login(loginObject, user_type.toLowerCase());
                          await storeInstructors(JSON.stringify(_instructors));
                          dispatch(LoginStore.action(obj));

                          if (response.status == 201) {
                            register(emailAddress, values.password);
                            // dispatch(
                            //   ChangeModalState.action({
                            //     welcomeMessageModal: true,
                            //   })
                            // );
                          }
                        })
                        .catch((error: any) => {
                          console.log("error third", error);
                          Toast.show({
                            type: "info",
                            position: "top",
                            text1: error,
                            text2: error?.data?.statusDescription,
                            visibilityTime: 4000,
                            autoHide: true,
                            topOffset: 30,
                            bottomOffset: 40,
                            onShow: () => {},
                            onHide: () => {},
                            onPress: () => {},
                          });
                        })
                        .finally(() => {
                          dispatch(ChangeModalState.action({ loading: false }));
                        });
                    } else if (values.selected_entity != "School" && !orgId) {
                      CompleteRegistration(schoolObject, "org")
                        .then((_res) => {
                          console.log({
                            ...userObject,
                            orgId: _res.data.orgId,
                          });
                          formData.append("orgId", _res.data.orgId);
                          formData.append("schoolId", null);
                          // {
                          //   ...userObject,
                          //   orgId: _res.data.orgId,
                          //   schoolId: null,
                          // },
                          CompleteRegistration(formData, "instructor")
                            .then(async (response: any) => {
                              let obj = {
                                token: response.data.token,
                                userType: "instructor",
                                id: response.data.instructorId,
                                mainId: _res.data?.userId,
                              };
                              let _instructors = instructors.map((item) => ({
                                firstName: item?.firstName || "",
                                lastName: item?.lastName || "",
                                email: item?.email || "",
                                phoneNumber: item?.phoneNumber || "",
                                isAdmin: item?.isAdmin || false,
                              }));
                              await Login(loginObject, user_type.toLowerCase());
                              await storeInstructors(
                                JSON.stringify(_instructors)
                              );
                              dispatch(LoginStore.action(obj));

                              console.log("_instructors", _instructors);
                              console.log(
                                "_instructors",
                                response.data.instructorId
                              );

                              if (response.status == 201) {
                                register(emailAddress, values.password);
                                // dispatch(
                                //   ChangeModalState.action({
                                //     welcomeMessageModal: true,
                                //   })
                                // );
                              }
                            })
                            .catch((error: any) => {
                              console.log("error third", error);
                              Toast.show({
                                type: "info",
                                position: "top",
                                text1: error,
                                text2: error?.data?.statusDescription,
                                visibilityTime: 4000,
                                autoHide: true,
                                topOffset: 30,
                                bottomOffset: 40,
                                onShow: () => {},
                                onHide: () => {},
                                onPress: () => {},
                              });
                            })
                            .finally(() => {
                              dispatch(
                                ChangeModalState.action({ loading: false })
                              );
                            });
                        })
                        .catch((err) => {
                          console.log("err first", err);
                        });
                    } else if (values.selected_entity != "School" && orgId) {
                      formData.append("schoolId", null);
                      formData.append("orgId", orgId);
                      CompleteRegistration(formData, "instructor")
                        .then(async (res: any) => {
                          console.log("response2727878", res);
                          let obj = {
                            token: res.data.token,
                            userType: "instructor",
                            id: res.data.instructorId,
                            mainId: response.data?.userId,
                          };
                          console.log("obj", obj);
                          let _instructors = instructors.map((item) => ({
                            firstName: item?.firstName || "",
                            lastName: item?.lastName || "",
                            email: item?.email || "",
                            phoneNumber: item?.phoneNumber || "",
                            isAdmin: item?.isAdmin || false,
                          }));
                          await Login(loginObject, user_type.toLowerCase());
                          await storeInstructors(JSON.stringify(_instructors));
                          dispatch(LoginStore.action(obj));

                          console.log("_instructors", _instructors);
                          console.log(
                            "_instructors",
                            response.data.instructorId
                          );

                          if (response.status == 201) {
                            register(emailAddress, values.password);
                            // dispatch(
                            //   ChangeModalState.action({
                            //     welcomeMessageModal: true,
                            //   })
                            // );
                          }
                        })
                        .catch((error: any) => {
                          console.log("error third", error);
                          Toast.show({
                            type: "info",
                            position: "top",
                            text1: error,
                            text2: error?.data?.statusDescription,
                            visibilityTime: 4000,
                            autoHide: true,
                            topOffset: 30,
                            bottomOffset: 40,
                            onShow: () => {},
                            onHide: () => {},
                            onPress: () => {},
                          });
                        })
                        .finally(() => {
                          dispatch(ChangeModalState.action({ loading: false }));
                        });
                    }
                  })
                  .catch((error) => {
                    dispatch(ChangeModalState.action({ loading: false }));
                    Toast.show({
                      type: "info",
                      position: "top",
                      text1: error,
                      text2: error?.data?.statusDescription,
                      visibilityTime: 4000,
                      autoHide: true,
                      topOffset: 30,
                      bottomOffset: 40,
                      onShow: () => {},
                      onHide: () => {},
                      onPress: () => {},
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
                resetForm,
                values,
                errors,
                touched,
                isValid,
              }) => (
                <>
                  <Layout style={styles.formContainer} level="1">
                    <Select
                      style={styles.inputSettings}
                      placeholder="Select Entity*"
                      value={values.selected_entity}
                      // label={(evaProps: any) => <Text {...evaProps}>Entity</Text>}
                      onSelect={(index: any) => {
                        resetForm();
                        setFieldValue(
                          "selected_entity",
                          organisations[index.row].value
                        );
                      }}
                    >
                      {organisations.map((item) => {
                        return <SelectItem key={item.id} title={item.label} />;
                      })}
                    </Select>
                    <Input
                      style={styles.inputSettings}
                      autoCapitalize="none"
                      accessoryRight={PersonIcon}
                      value={"Email: " + emailAddress}
                      disabled={true}
                    />
                    <Input
                      style={styles.inputSettings}
                      autoCapitalize="words"
                      autoCorrect={false}
                      placeholder={`Instructor's First Name*`}
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
                      placeholder={`Instructor's Last Name*`}
                      accessoryRight={PersonIcon}
                      value={values.lastName}
                      onChangeText={handleChange("lastName")}
                      onBlur={handleBlur("lastName")}
                    />
                    {errors.lastName && touched.lastName && (
                      <Text style={styles.errorText}>{errors.lastName}</Text>
                    )}
                    {values.selected_entity === "School" ? (
                      <Text
                        style={{
                          color: Colors.primary,
                          fontSize: 18,
                          fontWeight: "700",
                          marginTop: 5,
                        }}
                      >
                        School Information
                      </Text>
                    ) : (
                      <Text
                        style={{
                          color: Colors.primary,
                          fontSize: 18,
                          fontWeight: "700",
                          marginTop: 5,
                        }}
                      >
                        Organisation Information
                      </Text>
                    )}
                    <Autocomplete
                      placeholder="Country*"
                      value={values.country}
                      placement={placement}
                      style={styles.inputSettings}
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
                        setFieldValue("selectedCountry", selectedCountry.name);
                        setFieldValue("selectedState", "");
                        setFieldValue("state", "");
                        setStates([]);
                        GetAllStates(
                          selectedCountry.name.replace(/ /g, "")
                        ).then((res) => {
                          setStates(res.data);
                          setStatesData(res.data);
                        });
                        selectedCountry.phone_code.toString().startsWith("+")
                          ? setPhoneCode(selectedCountry.phone_code.toString())
                          : setPhoneCode("+" + selectedCountry.phone_code);
                        getSchoolsByFilter(selectedCountry.name);
                        getOrgByFilter(selectedCountry.name);
                      }}
                    >
                      {countriesData.map((item, index) => {
                        return (
                          <AutocompleteItem key={index} title={item.name} />
                        );
                      })}
                    </Autocomplete>
                    <Autocomplete
                      placeholder="State*"
                      value={values.state}
                      placement={placement}
                      style={styles.inputSettings}
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
                          setCitiesData(res.data);
                        });
                        getSchoolsByFilter(
                          values.selectedCountry,
                          selectedState
                        );
                        getOrgByFilter(values.selectedCountry, selectedState);
                      }}
                    >
                      {statesData.map((item, index) => {
                        return <AutocompleteItem key={index} title={item} />;
                      })}
                    </Autocomplete>
                    <Autocomplete
                      placeholder="City*"
                      value={values.city}
                      placement={placement}
                      disabled={!values.selectedState}
                      style={styles.inputSettings}
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
                        // getSchoolsByFilter('', '', selectedCity)
                        // getOrgByFilter('', '', selectedCity)
                      }}
                    >
                      {citiesData.map((item, index) => {
                        return <AutocompleteItem key={index} title={item} />;
                      })}
                    </Autocomplete>
                    <Input
                      style={styles.inputSettings}
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholder={`Zip/Post Code*`}
                      value={values.zipcode}
                      onChangeText={handleChange("zipcode")}
                      onBlur={handleBlur("zipcode")}
                    />
                    {errors.zipcode && touched.zipcode && (
                      <Text style={styles.errorText}>{errors.zipcode}</Text>
                    )}
                    {values.selected_entity === "School" && (
                      <>
                        {/* <Autocomplete
                        placeholder="School Name*"
                        value={values.school}
                        placement={placement}
                        style={{ marginVertical: 5 }}
                        onChangeText={(query) => {
                          setFieldValue("school", query);
                          let filtersarray = schools.filter((item) =>
                            item.name
                              .toLowerCase()
                              .includes(query.toLowerCase())
                          );
                          setSchoolsData(filtersarray);
                        }}
                        onSelect={(query) => {
                          const selectedSchool = schoolsData[query];
                          setFieldValue("school", selectedSchool.name);
                          setFieldValue("selectedSchool", selectedSchool.name);
                          setFieldValue("schoolName", selectedSchool.name);
                          setFieldValue(
                            "schoolAddress",
                            (selectedSchool && selectedSchool?.address) || ""
                          );
                          // setSchoolsData(schools);
                          setSelectedGrades(["1st"]);
                          setSelectedSubjects(["Maths"]);
                        }}
                      >
                        {schoolsData &&
                          schoolsData.map((item, index) => {
                            return (
                              <AutocompleteItem
                                key={index}
                                title={item?.name}
                              />
                            );
                          })}
                      </Autocomplete> */}

                        <Select
                          style={styles.inputSettings}
                          value={values.school}
                          placeholder="Select School*"
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
                        </Select>

                        {(values.schoolName === "Other" ||
                          values.school === "Other") && (
                          <>
                            <Input
                              style={styles.inputSettings}
                              autoCapitalize="words"
                              autoCorrect={false}
                              placeholder={`Enter School Name*`}
                              value={values.school_name}
                              onChangeText={handleChange("school_name")}
                              onBlur={handleBlur("school_name")}
                            />
                            {errors.school_name && touched.school_name && (
                              <Text style={styles.errorText}>
                                {errors.school_name}
                              </Text>
                            )}

                            <Input
                              style={styles.inputSettings}
                              autoCapitalize="words"
                              autoCorrect={false}
                              placeholder={`School Street Address*`}
                              value={values.schoolAddress}
                              onChangeText={handleChange("schoolAddress")}
                              onBlur={handleBlur("schoolAddress")}
                            />
                            {errors.schoolAddress && touched.schoolAddress && (
                              <Text style={styles.errorText}>
                                {errors.schoolAddress}
                              </Text>
                            )}
                          </>
                        )}

                        {/* <Input
                      style={styles.inputSettings}
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholder={`Zip code`}
                      value={values.zipcode}
                      onChangeText={handleChange("zipcode")}
                      onBlur={handleBlur("zipcode")}
                    />
                    {errors.zipcode && touched.zipcode && (
                      <Text style={styles.errorText}>{errors.zipcode}</Text>
                    )} */}
                      </>
                    )}
                    {values.selected_entity === "Organisation" && (
                      <>
                        <Select
                          style={{ width: "100%" }}
                          value={values.school}
                          placeholder="Select Organization*"
                          onSelect={(index: any) => {
                            let org = orgData[index.row];
                            setFieldValue("school", org.name);
                            setFieldValue("selectedSchool", org.name);
                            if (org.name != "Other") {
                              setFieldValue("schoolName", org.name);
                              setFieldValue("schoolAddress", org.address);
                            } else {
                              setFieldValue("schoolName", "");
                              setFieldValue("schoolAdress", "");
                            }
                          }}
                          label={(evaProps: any) => <Text {...evaProps}></Text>}
                        >
                          {orgData.map((org, index) => {
                            return <SelectItem key={index} title={org?.name} />;
                          })}
                        </Select>

                        {values.school === "Other" && (
                          <>
                            <Input
                              style={styles.inputSettings}
                              autoCapitalize="none"
                              autoCorrect={false}
                              placeholder={`Organisation Name*`}
                              value={values.schoolName}
                              onChangeText={handleChange("schoolName")}
                              onBlur={handleBlur("schoolName")}
                            />
                            {errors.schoolName && touched.schoolName && (
                              <Text style={styles.errorText}>
                                {errors.schoolName}
                              </Text>
                            )}
                            <Input
                              style={styles.inputSettings}
                              autoCapitalize="none"
                              autoCorrect={false}
                              placeholder={`Organization Address*`}
                              value={values.schoolAddress}
                              onChangeText={handleChange("schoolAddress")}
                              onBlur={handleBlur("schoolAddress")}
                            />
                            {errors.schoolAddress && touched.schoolAddress && (
                              <Text style={styles.errorText}>
                                {errors.schoolAddress}
                              </Text>
                            )}
                          </>
                        )}
                      </>
                    )}
                    <View
                      style={{
                        marginVertical: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: 20,
                      }}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Text
                          style={{
                            color: Colors.primary,
                            fontSize: 18,
                            fontWeight: "700",
                          }}
                        >
                          Add Instructors (Optional)
                        </Text>
                        <AntDesign
                          name="questioncircleo"
                          style={{ marginLeft: 10 }}
                          size={25}
                          color={Colors.secondaryDark}
                          onPress={() =>
                            Alert.alert(
                              "Why Add Instructors?",
                              `(Suggested) As admin, you may wish to: 
 (A) Create an activity or group on behalf of any instructor 
(B) View each instructor's list of created activities and/or groups.`,
                              [{ text: "OK" }]
                            )
                          }
                        />
                      </View>
                      <AntDesign
                        name="pluscircle"
                        size={25}
                        color={Colors.secondaryDark}
                        onPress={() =>
                          dispatch(
                            ChangeModalState.action({
                              addInstructorModalVisibility: true,
                            })
                          )
                        }
                      />
                    </View>
                    {instructors && instructors.length > 0 && (
                      <ScrollView
                        style={{
                          borderWidth: 1,
                          borderColor: Colors.primary,
                          maxHeight: 150,
                          marginBottom: 20,
                        }}
                      >
                        {instructors &&
                          instructors.map((instructor, index) => (
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: 5,
                              }}
                            >
                              <Text>{`${instructor.firstName} ${instructor.lastName}`}</Text>
                              <View
                                style={{
                                  width: "15%",
                                  flexDirection: "row",
                                  alignItems: "center",
                                  justifyContent: "space-evenly",
                                }}
                              >
                                <TouchableOpacity
                                  onPress={() =>
                                    handleInstructorEdit(instructor, index)
                                  }
                                >
                                  <Feather
                                    name="edit"
                                    color={Colors.primary}
                                    size={20}
                                  />
                                </TouchableOpacity>
                                <AntDesign
                                  name="delete"
                                  color={Colors.primary}
                                  size={20}
                                  style={{
                                    marginHorizontal: 10,
                                    marginLeft: 20,
                                  }}
                                  onPress={() =>
                                    handleDeleteInstructor(instructor)
                                  }
                                />
                              </View>
                            </View>
                          ))}
                      </ScrollView>
                    )}
                    <View
                      style={{
                        marginVertical: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Text
                          style={{
                            color: Colors.primary,
                            fontSize: 18,
                            fontWeight: "700",
                          }}
                        >
                          Add Bus Information (Optional)
                        </Text>
                        <AntDesign
                          name="questioncircleo"
                          style={{ marginLeft: 10 }}
                          size={25}
                          color={Colors.secondaryDark}
                          onPress={() =>
                            Alert.alert(
                              "Why Add Bus Information?",
                              "Optional - some schools like to assign seats to students for trips to off-campus events",
                              [{ text: "OK" }]
                            )
                          }
                        />
                      </View>
                      <AntDesign
                        name="pluscircle"
                        size={25}
                        color={Colors.secondaryDark}
                        onPress={() =>
                          dispatch(
                            ChangeModalState.action({
                              addButInformationModalVisibility: true,
                            })
                          )
                        }
                      />
                    </View>

                    {buses && buses.length > 0 && (
                      <ScrollView
                        style={{
                          borderWidth: 1,
                          borderColor: Colors.primary,
                          maxHeight: 150,
                          marginBottom: 15,
                        }}
                      >
                        {buses &&
                          buses.map((bus, index) => (
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: 5,
                              }}
                            >
                              <Text>{`${bus?.busName}`}</Text>
                              <View
                                style={{
                                  width: "15%",
                                  flexDirection: "row",
                                  alignItems: "center",
                                  justifyContent: "space-evenly",
                                }}
                              >
                                <AntDesign
                                  name="delete"
                                  color={Colors.primary}
                                  size={20}
                                  onPress={() => handleDeleteBus(bus, index)}
                                />
                              </View>
                            </View>
                          ))}
                      </ScrollView>
                    )}
                    <Input
                      style={styles.inputSettings}
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholder="Phone Number"
                      accessoryRight={PhoneIcon}
                      value={values.phoneNumber}
                      keyboardType="number-pad"
                      onChangeText={handleChange("phoneNumber")}
                    />
                    <Input
                      style={styles.inputSettings}
                      autoCapitalize="none"
                      autoCorrect={false}
                      secureTextEntry={!passwordVisible}
                      placeholder="Password*"
                      accessoryRight={renderPasswordIcon}
                      value={values.password}
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                    />
                    {errors.password && touched.password && (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    )}
                    <Input
                      style={styles.inputSettings}
                      autoCapitalize="none"
                      secureTextEntry={!confirmPasswordVisible}
                      placeholder="Confirm Password*"
                      accessoryRight={renderConfirmPasswordIcon}
                      value={values.confirmPassword}
                      onChangeText={handleChange("confirmPassword")}
                      onBlur={handleBlur("confirmPassword")}
                    />
                    {errors.confirmPassword && touched.confirmPassword && (
                      <Text style={styles.errorText}>
                        {errors.confirmPassword}
                      </Text>
                    )}
                    <View style={{ flexDirection: "row" }}>
                      <CheckBox
                        style={[styles.termsCheckBox, { flex: 1 }]}
                        checked={values.termsAccepted}
                        onChange={() =>
                          setFieldValue("termsAccepted", !values.termsAccepted)
                        }
                      >
                        {""}
                      </CheckBox>
                      <View style={[styles.termsCheckBox, { flex: 15 }]}>
                        <CheckboxLabel />
                      </View>
                    </View>
                  </Layout>

                  {!loading && (
                    <View style={{ marginTop: 18, marginBottom: 20 }}>
                      <LinearGradientButton
                        style={styles.signUpButton}
                        size="medium"
                        onPress={handleSubmit}
                        disabled={!isValid || !values.termsAccepted}
                      >
                        SIGN UP
                      </LinearGradientButton>
                    </View>
                  )}
                  {loading && <Spinner />}
                </>
              )}
            </Formik>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </BackgroundLayout>
  );
};
export default FinalOrgRegistrationScreen;

const themedStyles = StyleService.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: Colors.newBackgroundColor,
    borderRadius: 25,
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
  profileImage: {
    width: 126,
    height: 126,
    borderRadius: 63,
    alignSelf: "center",
  },
  editAvatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  inputSettings: {
    marginTop: 7,
    backgroundColor: Colors.white,
    width: "100%",
    elevation: 1,
    borderRadius: 10,
    // maxHeight: 35
  },
});
