import React, {
  ReactElement,
  ReactText,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Login } from "@/Services/LoginServices";
import { getDeviceId } from "react-native-device-info";
import { Linking } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { ImagePickerModal } from "@/Modals";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  CheckBox,
  Datepicker,
  Icon,
  IndexPath,
  Input,
  Layout,
  Popover,
  Select,
  SelectItem,
  StyleService,
  Text,
  useStyleSheet,
} from "@ui-kitten/components";
import { AppHeader, ProfileAvatarPicker } from "@/Components";

import { ProfileAvatar } from "../../../Components/SignUp/profile-avatar.component";
import {
  CalendarIcon,
  FacebookIcon,
  InstagramIcon,
  PaypalIcon,
  PersonIcon,
  PhoneIcon,
  PlusIcon,
  TwitterIcon,
  WebsiteIcon,
} from "@/Components/SignUp/icons";
import { Formik } from "formik";
import * as yup from "yup";
import { Props } from "@ui-kitten/components/devsupport/services/props/props.service";
import { CompleteRegistration, Register } from "@//Services/SignUpServices";
import { UserRegistrationDTO, RegisterDTO } from "@/Models/UserDTOs";

import Moment from "moment";
import { GetAllCities, GetAllStates } from "@/Services/PlaceServices";
import {
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from "react-native-image-picker";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { useDispatch, useSelector } from "react-redux";
import LoginStore from "@/Store/Authentication/LoginStore";
import Toast from "react-native-toast-message";
import { photoUpload } from "@/AWS/aws-upload-service";
import { AuthContext } from "@/Navigators/Auth/AuthProvider";
import { PlaceState } from "@/Store/Places";
import { CountryDTO } from "@/Models/CountryDTOs";
import { LinearGradientButton } from "@/Components";
import Entypo from "react-native-vector-icons/Entypo";
import Colors from "@/Theme/Colors";
import moment from "moment";
import { ParentPaymentModal, WelcomeMessageModal } from "@/Modals";
import { TouchableOpacity } from "react-native-gesture-handler";
import { storeToken, storeUserType } from "@/Storage/MainAppStorage";
import { GetSchoolByFilters } from "@/Services/School";
import { GetOrgByFilters } from "@/Services/Org";
import ImagePicker from "react-native-image-crop-picker";
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

const FinalRegistrationScreen = ({ navigation, route }: Props) => {
  const [unmount, setUnmount] = useState(false);
  const [reRender, setRerender] = useState(false);
  const isFocuesed = useIsFocused();
  const [passwordVisible, setPasswordVisible] = React.useState<boolean>(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] =
    React.useState<boolean>(false);
  const [languages, setLanguages] = useState<Array<ReactText>>(["English"]);
  const [genders, setGenders] = useState<Array<ReactText>>([
    "Female",
    "Male",
    "Other",
  ]);
  const countries = useSelector(
    (state: { places: PlaceState }) => state.places.countries
  );
  const [countriesData, setCountriesData] = React.useState(countries);
  const [schoolsData, setSchoolsData] = React.useState([]);
  const [schools, setSchools] = useState([]);
  const [orgData, setOrgData] = React.useState([]);
  const [org, setOrg] = useState([]);
  const [statesData, setStatesData] = React.useState<Array<any>>([]);
  const [citiesData, setCitiesData] = React.useState<Array<any>>([]);
  const [visibleImagePicker, setVisibleImagePicker] = useState(false);
  const [rows, setRows] = useState([
    {
      grade: "",
      subject: "",
    },
  ]);
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const [states, setStates] = useState<Array<any>>([]);
  const [cities, setCities] = useState<Array<any>>([]);
  const [phoneCode, setPhoneCode] = useState<string>("");
  const [placement, setPlacement] = React.useState("bottom");

  const { register } = useContext(AuthContext);

  const styles = useStyleSheet(themedStyles);
  const { emailAddress, user_type, student, activation_code } = route.params;
  const [selectedImage, setSelectedImage] = React.useState<string | undefined>(
    ""
  );
  const [uploadedImage, setUploadedImage] = React.useState(null);
  const [visible, setVisible] = React.useState(false);
  const dispatch = useDispatch();
  const [loginObj, setLoginObj] = useState(null);
  const _user_type = user_types.find((u) => u.label === user_type);

  const signUpValidationSchema = yup.object().shape({
    firstName: yup.string().required("First name is required"),
    lastName: yup.string().required("Last name is required"),
    address: yup.string(),
    apartment: yup.string(),
    zipcode: yup.string().required("Zip code is required"),
    country: yup.string().required("Country is required"),
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
  const signUpStudentValidationSchema = yup.object().shape({
    firstName: yup.string().required("First name is required"),
    lastName: yup.string().required("Last name is required"),
    address: yup.string(),
    apartment: yup.string(),
    // zipcode: yup.string(),
    // country: yup.string().required("Country is required"),
    selectedCountry: yup.string(),
    selectedState: yup.string(),
    selectedCity: yup.string(),
    // city: yup.string().required("City is required"),
    // state: yup.string().required("State is required"),
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

  const CheckboxLabel = (evaProps: any) => {
    return (
      <Text {...evaProps} style={styles.termsCheckBoxText}>
        I have read and agree to the{" "}
        <Text
          style={{ color: Colors.primary }}
          onPress={() => {
            Linking.openURL("https://trackmykidz.com/terms-of-use").then(
              (r) => {}
            );
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

  const getSchoolsByFilter = (
    country = "",
    state = "",
    city = "",
    schoolName
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
      .catch((err) => {
        console.log("GetSchoolByFilters", err);
      });
  };

  const getOrgByFilter = (
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
  const imageCameraLaunch = () => {
    ImagePicker.openCamera({
      cropping: true,
      cropperCircleOverlay: true,
      width: 139,
      height: 130,
      compressImageQuality: 1,
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
      compressImageQuality: 1,
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
  const maxDateOfBirth = moment(new Date()).subtract("years", 13);

  useEffect(() => {
    if (!isFocuesed) {
      setRerender(false);
    } else {
      setRerender(true);
    }
  }, [isFocuesed]);

  return (
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
      <ParentPaymentModal
        onPay={() => {
          dispatch(LoginStore.action(loginObj));
          dispatch(
            ChangeModalState.action({
              welcomeMessageModal: true,
            })
          );
        }}
      />
      <ScrollView style={styles.container}>
        {_user_type.id == 2 && (
          <View style={{ width: "100%" }}>
            {selectedImage != "" && (
              <ProfileAvatarPicker
                style={styles.profileImage}
                // resizeMode='center'
                source={{
                  uri: selectedImage + "?time" + new Date().getTime(),
                  headers: { Pragma: "no-cache" },
                }}
                editButton={true ? renderEditAvatarButton : null}
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
                    marginLeft: 75,
                  }}
                >
                  {true && renderEditButtonElement()}
                </View>
              </View>
            )}
          </View>
        )}
        {_user_type.id === 1 ? (
          <Formik
            validationSchema={signUpValidationSchema}
            validateOnMount={true}
            initialValues={{
              firstName: "",
              lastName: "",
              address: "",
              apartment: "",
              country: "",
              selectedCountry: "",
              selectedState: "",
              selectedCity: "",
              city: "",
              state: "",
              zipcode: "",
              phoneNumber: "",
              password: "",
              confirmPassword: "",
              termsAccepted: false,
            }}
            onSubmit={(values, { resetForm }) => {
              const registerObject: RegisterDTO = {
                email: emailAddress,
                password: values.password,
                activationcode: activation_code,
              };
              const userObject = {
                email: emailAddress,
                firstname: values.firstName,
                lastname: values.lastName,
                address: values.address,
                state: values.state,
                country: values.country,
                city: values.city,
                zipcode: values.zipcode,
                phone: values.phoneNumber,
                status: "",
                term: true,
                deviceId: getDeviceId(),
              };

              dispatch(ChangeModalState.action({ loading: true }));
              console.log("userobject", userObject);
              Register(registerObject, "parent")
                .then(async (res) => {
                  const _token = res.data.token;
                  await storeToken(_token);
                  await storeUserType("parent");
                  console.log("userobject", userObject);
                  CompleteRegistration(userObject, "parent")
                    .then((response: any) => {
                      const obj = {
                        token: _token,
                        userType: "parent",
                        id: response.data.parentId,
                        mainId: res.data.userId,
                      };
                      setLoginObj(obj);
                      if (response.status == 201) {
                        register(emailAddress, values.password);

                        // dispatch(
                        //     ChangeModalState.action({
                        //         parentPaymentModalVisibility: true,
                        //     }),
                        // )
                        dispatch(LoginStore.action(obj));
                        dispatch(
                          ChangeModalState.action({
                            welcomeMessageModal: true,
                          })
                        );
                      }
                    })
                    .catch((error: any) => {
                      console.log(error);
                      Toast.show({
                        type: "info",
                        position: "top",
                        text1: error.title,
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
                      // dispatch(ChangeModalState.action({ biometricRequestModal: true }))
                    });
                })
                .catch((err) => {
                  Alert.alert(err?.data?.statusDescription);
                  dispatch(ChangeModalState.action({ loading: false }));
                  console.log(err);
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
                    autoCapitalize="none"
                    accessoryRight={PersonIcon}
                    value={"Email: " + emailAddress}
                    disabled={true}
                  />
                  <Input
                    style={styles.inputSettngs}
                    autoCapitalize="words"
                    autoCorrect={false}
                    placeholder={`Parent's First Name*`}
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
                    placeholder={`Parent's Last Name*`}
                    accessoryRight={PersonIcon}
                    value={values.lastName}
                    onChangeText={handleChange("lastName")}
                    onBlur={handleBlur("lastName")}
                  />
                  {errors.lastName && touched.lastName && (
                    <Text style={styles.errorText}>{errors.lastName}</Text>
                  )}
                  <Input
                    style={styles.inputSettings}
                    autoCapitalize="words"
                    autoCorrect={false}
                    placeholder={`Parent's Street Address*`}
                    value={values.address}
                    onChangeText={handleChange("address")}
                    onBlur={handleBlur("address")}
                  />
                  {errors.address && touched.address && (
                    <Text style={styles.errorText}>{errors.address}</Text>
                  )}
                  <Input
                    style={styles.inputSettings}
                    autoCapitalize="words"
                    autoCorrect={false}
                    placeholder={`Ste/Apt`}
                    value={values.apartment}
                    onChangeText={handleChange("apartment")}
                    onBlur={handleBlur("apartment")}
                  />
                  {errors.apartment && touched.apartment && (
                    <Text style={styles.errorText}>{errors.apartment}</Text>
                  )}
                  <Autocomplete
                    placeholder="Country*"
                    value={values.country}
                    placement={placement}
                    style={{ marginVertical: 5 }}
                    // label={evaProps => <Text {...evaProps}>Country*</Text>}
                    onChangeText={(query) => {
                      setFieldValue("country", query);
                      setCountriesData(
                        countries.filter((item) => filterCountries(item, query))
                      );
                    }}
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
                      selectedCountry.phone_code.toString().startsWith("+")
                        ? setPhoneCode(selectedCountry.phone_code.toString())
                        : setPhoneCode("+" + selectedCountry.phone_code);
                    }}
                  >
                    {countriesData.map((item, index) => {
                      return <AutocompleteItem key={index} title={item.name} />;
                    })}
                  </Autocomplete>
                  <Autocomplete
                    placeholder="State*"
                    value={values.state}
                    placement={placement}
                    style={{ marginVertical: 5 }}
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
                      GetAllCities(values.selectedCountry, selectedState).then(
                        (res) => {
                          setCities(res.data);
                        }
                      );
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
                    placement={placement}
                    style={{ marginVertical: 5 }}
                    // label={evaProps => <Text {...evaProps}>City</Text>}
                    onChangeText={(query) => {
                      setFieldValue("city", query);
                      setCitiesData(
                        cities.filter((item) => filterCities(item, query))
                      );
                    }}
                    onSelect={(query) => {
                      setFieldValue("city", citiesData[query]);
                      setFieldValue("selectedCity", citiesData[query]);
                    }}
                  >
                    {citiesData.map((item, index) => {
                      return <AutocompleteItem key={index} title={item} />;
                    })}
                  </Autocomplete>
                  {errors.city && touched.city && (
                    <Text style={styles.errorText}>{errors.city}</Text>
                  )}
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
                  <View style={styles.phoneNumber}>
                    <Input
                      style={styles.prefixStyle}
                      editable={false}
                      disabled={true}
                      selectTextOnFocus={false}
                      value={phoneCode?.toString()}
                      placeholder="Prefix"
                    />
                    <Input
                      style={styles.phoneStyle}
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholder="Phone Number"
                      accessoryRight={PhoneIcon}
                      value={values.phoneNumber}
                      keyboardType="number-pad"
                      onChangeText={handleChange("phoneNumber")}
                    />
                  </View>
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
              </>
            )}
          </Formik>
        ) : _user_type.id === 2 ? (
          <Formik
            validationSchema={signUpValidationSchema}
            validateOnMount={true}
            initialValues={{
              firstName: "",
              lastName: "",
              schoolName: "",

              organizationName: "",
              schoolAddress: "",
              country: "",
              selectedCountry: "",
              selectedState: "",
              selectedCity: "",
              city: "",
              state: "",
              zipcode: "",
              phoneNumber: "",
              password: "",
              confirmPassword: "",
              termsAccepted: false,
              school: "",
              organization: "",
              selected_entity: null,
              schoolId: null,

              orgId: null,
            }}
            onSubmit={(values, { resetForm }) => {
              dispatch(ChangeModalState.action({ loading: true }));
              const registerObject: RegisterDTO = {
                email: emailAddress,
                password: values.password,
                activationcode: activation_code,
              };
              const loginObject = {
                email: emailAddress,
                password: values.password,
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
              formData.append("isAdmin", false);
              formData.append("deviceId", getDeviceId());
              values.schoolId
                ? formData.append("schoolId", values.schoolId)
                : formData.append("schoolId", "");
              values.orgId
                ? formData.append("orgId", values.orgId)
                : formData.append("orgId", "");

              const userObject: UserRegistrationDTO = {
                firstname: values.firstName,
                lastname: values.lastName,
                address: values.schoolAddress,
                state: values.state,
                country: values.country,
                zipcode: values.zipcode,
                phone: values.phoneNumber,
                password: values.password,
                city: values.city,
                term: true,
                email: emailAddress,
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
                isAdmin: false,
                schoolId: values.schoolId,

                orgId: values.orgId,
              };
              Register(registerObject, "instructor")
                .then(async (res) => {
                  console.log("res---", res?.data);
                  await storeToken(res?.data?.token);
                  console.log("userobject", JSON.stringify(formData));
                  CompleteRegistration(formData, "instructor")
                    .then(async (response: any) => {
                      console.log("response", response);
                      await Login(loginObject, user_type.toLowerCase());
                      dispatch(
                        LoginStore.action({
                          token: response?.data?.token,
                          userType: "instructor",
                          id: response?.data.instructorId,
                          mainId: res?.data?.userId,
                        })
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
                      console.log("instructor err", error);
                      Toast.show({
                        type: "info",
                        position: "top",
                        text1: error.data?.title,
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
                })
                .catch((err) => {
                  console.log("err", err);
                  Toast.show({
                    type: "info",
                    position: "top",

                    visibilityTime: 4000,
                    autoHide: true,
                    topOffset: 30,
                    bottomOffset: 40,
                    onShow: () => {},
                    onHide: () => {},
                    onPress: () => {},
                  });
                  dispatch(ChangeModalState.action({ loading: false }));
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
                  <Select
                    style={{ marginVertical: 18 }}
                    placeholder="Select Entity"
                    value={values.selected_entity}
                    // label={(evaProps: any) => <Text {...evaProps}>Entity</Text>}
                    onSelect={(index: any) => {
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
                  <Autocomplete
                    placeholder="Country*"
                    value={values.country}
                    placement={placement}
                    style={{ marginVertical: 5 }}
                    // label={evaProps => <Text {...evaProps}>Country*</Text>}
                    onChangeText={(query) => {
                      setFieldValue("country", query);
                      setCountriesData(
                        countries.filter((item) => filterCountries(item, query))
                      );
                    }}
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
                      selectedCountry.phone_code.toString().startsWith("+")
                        ? setPhoneCode(selectedCountry.phone_code.toString())
                        : setPhoneCode("+" + selectedCountry.phone_code);
                      getSchoolsByFilter(selectedCountry.name);
                      getOrgByFilter(selectedCountry.name);
                    }}
                  >
                    {countriesData.map((item, index) => {
                      return <AutocompleteItem key={index} title={item.name} />;
                    })}
                  </Autocomplete>
                  <Autocomplete
                    placeholder="State*"
                    value={values.state}
                    placement={placement}
                    disabled={!values.selectedCountry}
                    style={{ marginVertical: 5 }}
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
                      GetAllCities(values.selectedCountry, selectedState).then(
                        (res) => {
                          setCities(res.data);
                        }
                      );
                      getSchoolsByFilter(values.country, selectedState);
                      getOrgByFilter(values.country, selectedState);
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
                      getSchoolsByFilter(
                        values.country,
                        values.state,
                        selectedCity
                      );
                      getOrgByFilter(
                        values.country,
                        values.state,
                        selectedCity
                      );
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
                  {values.selected_entity === "School" ? (
                    <Autocomplete
                      placeholder="School Name"
                      value={values.school}
                      placement={placement}
                      style={{ marginVertical: 5 }}
                      onChangeText={(query) => {
                        console.log("schools", schools);
                        setFieldValue("school", query);
                        setSchoolsData(
                          schools.filter((item) =>
                            filterSchools(item.name, query)
                          )
                        );
                      }}
                      onSelect={(query) => {
                        const selectedSchool = schoolsData[query];
                        setFieldValue("school", selectedSchool.name);
                        setFieldValue("schoolId", selectedSchool.schoolId);
                        setFieldValue("schoolName", selectedSchool.name);
                        setFieldValue("schoolAddress", "School Address");
                        setFieldValue("schoolAddress", "School Address");
                        setSelectedGrades(["1st"]);
                        setSelectedSubjects(["Maths"]);
                      }}
                    >
                      {schoolsData.map((item, index) => {
                        return (
                          <AutocompleteItem key={index} title={item?.name} />
                        );
                      })}
                    </Autocomplete>
                  ) : (
                    <Autocomplete
                      placeholder="Select Organization"
                      value={values.organization}
                      placement={placement}
                      label={(evaProps) => (
                        <Text {...evaProps}>Organization*</Text>
                      )}
                      onChangeText={(query) => {
                        setFieldValue("organization", query);
                        setOrgData(
                          org.filter((item) => filterSchools(item.label, query))
                        );
                      }}
                      onSelect={(query) => {
                        const selectedOrg = orgData[query];

                        setFieldValue(
                          "organizationId",
                          selectedSchool.organizationId
                        );
                        setFieldValue("organization", selectedOrg.name);
                        setFieldValue("organizationName", selectedOrg.name);
                      }}
                    ></Autocomplete>
                  )}
                  {console.log("values", values.school)}
                  <View
                    style={{
                      marginTop: 10,
                      flexDirection: "row",
                      flexWrap: "wrap",
                    }}
                  >
                    <Text>Can't find school/organization? </Text>
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert(
                          "Confirmation",
                          "By registering your school or organisation, you accept to be the admin for that entity.",
                          [
                            {
                              text: "Cancel",
                            },
                            {
                              text: "Confirm",
                              onPress: () =>
                                navigation.navigate(
                                  "FinalOrgRegistrationScreen",
                                  {
                                    emailAddress: emailAddress,
                                    registrationId: "test",
                                    user_type: user_type,
                                    activation_code: activation_code,
                                    details: {
                                      email: emailAddress,
                                      firstname: values.firstName,
                                      lastname: values.lastName,
                                      phoneNumber: values.phoneNumber,
                                    },
                                  }
                                ),
                            },
                          ]
                        )
                      }
                    >
                      <Text style={{ color: Colors.primary }}>Register</Text>
                    </TouchableOpacity>
                  </View>
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
              </>
            )}
          </Formik>
        ) : (
          <Formik
            validationSchema={signUpStudentValidationSchema}
            validateOnMount={true}
            initialValues={{
              firstName: student ? student.firstname : "",
              lastName: student ? student.lastname : "",
              school: student ? student.school : "",
              grade: student ? student.grade : "",
              parentName: student ? student?.parentemail1 : "",
              parentName2: student ? student?.parentemail2 : "",
              password: "",
              confirmPassword: "",
              termsAccepted: false,
              phoneNumber: student ? student.phone : "",
              parentId: student && student.parentIds ? student.parentIds[0] : 0,
            }}
            onSubmit={(values, { resetForm }) => {
              dispatch(ChangeModalState.action({ loading: true }));
              const registerObject: RegisterDTO = {
                email: student.email,
                password: values.password,
                activationcode: activation_code,
              };
              const loginObject = {
                email: student.email,
                password: values.password,
              };
              console.log("response", registerObject);
              // const userObject: UserRegistrationDTO = {
              //   firstname: values.firstName,
              //   lastname: values.lastName,
              //   phone: values.phoneNumber,
              //   email: emailAddress,
              //   school: values.school,
              //   grade: values.grade,
              //   parentId: values?.parentId || 0,
              // };
              Register(registerObject, "student")
                .then(async (response) => {
                  console.log("response--", response.data);
                  await Login(loginObject, user_type.toLowerCase());
                  dispatch(
                    LoginStore.action({
                      token: response?.data?.token,
                      userType: "student",
                      id: student.studentId,
                    })
                  );
                  // register(emailAddress, values.password);
                  dispatch(
                    ChangeModalState.action({
                      welcomeMessageModal: true,
                    })
                  );
                })
                .catch((error) => {
                  Toast.show({
                    type: "info",
                    position: "top",
                    text1: error.data.title,
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
                  dispatch(
                    ChangeModalState.action({ biometricRequestModal: true })
                  );
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
                  <View style={{ width: "100%" }}>
                    {student?.studentPhoto && (
                      <ProfileAvatarPicker
                        style={styles.profileImage}
                        // resizeMode='center'
                        source={{
                          uri:
                            student?.studentPhotoe +
                            "?time" +
                            new Date().getTime(),
                          headers: { Pragma: "no-cache" },
                        }}
                        editButton={false ? renderEditAvatarButton : null}
                      />
                    )}
                    {!student?.studentPhoto && (
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
                        <Text style={{ fontSize: 30 }}>
                          {student?.firstname?.substring(0, 1)?.toUpperCase()}{" "}
                          {student?.lastname?.substring(0, 1)?.toUpperCase()}
                        </Text>
                        {/* {true && renderEditButtonElement()} */}
                      </View>
                    )}
                  </View>
                  <Input
                    textStyle={{ color: Colors.gray }}
                    style={styles.inputSettings}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder={`Student's First Name*`}
                    accessoryRight={PersonIcon}
                    value={values.firstName}
                    onChangeText={handleChange("firstName")}
                    onBlur={handleBlur("firstName")}
                    placeholderTextColor={Colors.gray}
                    disabled
                  />
                  {errors.firstName && touched.firstName && (
                    <Text style={styles.errorText}>{errors.firstName}</Text>
                  )}
                  <Input
                    textStyle={{ color: Colors.gray }}
                    style={styles.inputSettings}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder={`Student's Last Name*`}
                    accessoryRight={PersonIcon}
                    value={values.lastName}
                    onChangeText={handleChange("lastName")}
                    onBlur={handleBlur("lastName")}
                    placeholderTextColor={Colors.gray}
                    disabled
                  />
                  {errors.lastName && touched.lastName && (
                    <Text style={styles.errorText}>{errors.lastName}</Text>
                  )}
                  <Input
                    textStyle={{ color: Colors.gray }}
                    style={styles.inputSettings}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder={`Student's School*`}
                    value={values.school}
                    onChangeText={handleChange("school")}
                    placeholderTextColor={Colors.gray}
                    onBlur={handleBlur("school")}
                    disabled
                  />
                  {errors.school && touched.school && (
                    <Text style={styles.errorText}>{errors.school}</Text>
                  )}
                  {/* <Input
                    style={styles.inputSettings}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder={`Student's Grade`}
                    value={values.grade}
                    onChangeText={handleChange("grade")}
                    onBlur={handleBlur("grade")}
                    disabled
                  />
                  {errors.grade && touched.grade && (
                    <Text style={styles.errorText}>{errors.grade}</Text>
                  )} */}
                  <Input
                    textStyle={{ color: Colors.gray }}
                    style={styles.inputSettings}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder={`Parent1/Guardian1 Name*`}
                    accessoryRight={PersonIcon}
                    value={values.parentName}
                    onChangeText={handleChange("parentName")}
                    placeholderTextColor={Colors.gray}
                    onBlur={handleBlur("parentName")}
                    disabled
                  />
                  {errors.parentName && touched.parentName && (
                    <Text style={styles.errorText}>{errors.parentName}</Text>
                  )}
                  <Input
                    textStyle={{ color: Colors.gray }}
                    style={styles.inputSettings}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder={`Parent2/Guardian2 Email`}
                    accessoryRight={PersonIcon}
                    value={values.parentName2}
                    onChangeText={handleChange("parentName2")}
                    placeholderTextColor={Colors.gray}
                    onBlur={handleBlur("parentName2")}
                    disabled
                  />
                  {errors.parentName2 && touched.parentName2 && (
                    <Text style={styles.errorText}>{errors.parentName2}</Text>
                  )}
                  <Input
                    textStyle={{ color: Colors.gray }}
                    style={styles.inputSettings}
                    autoCapitalize="none"
                    accessoryRight={PersonIcon}
                    value={"Email: " + (student?.email || "")}
                    disabled={true}
                  />
                  <View style={styles.phoneNumber}>
                    <Input
                      textStyle={{ color: Colors.gray }}
                      style={styles.prefixStyle}
                      editable={false}
                      disabled={true}
                      placeholderTextColor={Colors.gray}
                      selectTextOnFocus={false}
                      value={phoneCode?.toString()}
                      placeholder="Prefix"
                    />
                    <Input
                      textStyle={{ color: Colors.gray }}
                      style={styles.phoneStyle}
                      autoCapitalize="none"
                      autoCorrect={false}
                      disabled={true}
                      placeholder="Phone Number"
                      placeholderTextColor={Colors.gray}
                      accessoryRight={PhoneIcon}
                      value={values.phoneNumber}
                      keyboardType="number-pad"
                      onChangeText={handleChange("phoneNumber")}
                      disabled
                    />
                  </View>
                  <View style={{ marginVertical: 10 }}>
                    <Text
                      style={{ color: "red", fontWeight: "600", fontSize: 16 }}
                    >
                      Do not proceed if any of the above information is not
                      correct. Ensure your parent/guardian has entered your
                      correct information.
                    </Text>
                  </View>
                  <Input
                    textStyle={{ color: Colors.gray }}
                    textStyle={{ color: Colors.gray }}
                    style={styles.inputSettings}
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={!passwordVisible}
                    placeholder="Password*"
                    accessoryRight={renderPasswordIcon}
                    value={values.password}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                    placeholderTextColor={Colors.gray}
                  />
                  {errors.password && touched.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}
                  <Input
                    textStyle={{ color: Colors.gray }}
                    style={styles.inputSettings}
                    autoCapitalize="none"
                    secureTextEntry={!confirmPasswordVisible}
                    placeholder="Confirm Password*"
                    accessoryRight={renderConfirmPasswordIcon}
                    value={values.confirmPassword}
                    onChangeText={handleChange("confirmPassword")}
                    onBlur={handleBlur("confirmPassword")}
                    placeholderTextColor={Colors.gray}
                  />
                  {/* {console.log("error", errors)} */}
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
              </>
            )}
          </Formik>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
export default FinalRegistrationScreen;

const themedStyles = StyleService.create({
  container: {
    flex: 1,
    backgroundColor: "background-basic-color-1",
    paddingTop: 10,
  },
  content: {
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
    color: Colors.gray,

    // maxHeight: 35
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
});
