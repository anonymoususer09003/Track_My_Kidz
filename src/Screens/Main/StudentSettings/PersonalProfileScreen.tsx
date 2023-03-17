import React, { ReactElement, ReactText, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useTheme } from "@/Theme";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  Button,
  Card,
  CheckBox,
  Icon,
  Input,
  Select,
  SelectItem,
  Spinner,
  Text,
} from "@ui-kitten/components";
import { ImagePickerModal } from "@/Modals";

import ProfileIcon from "react-native-vector-icons/EvilIcons";
import ImagePicker from "react-native-image-crop-picker";
import { AppHeader, ProfileAvatarPicker } from "@/Components";

import {
  ImagePickerResponse,
  launchImageLibrary,
} from "react-native-image-picker";
import { loadUserId } from "@/Storage/MainAppStorage";
import { UpdateUser } from "../../../Services/SettingsServies";
import { Formik } from "formik";
import * as yup from "yup";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
// @ts-ignore
import { useSelector, useDispatch } from "react-redux";
import { UserState } from "@/Store/User";
import { PlaceState } from "@/Store/Places";
import { GetAllCities } from "@/Services/PlaceServices";
import FetchOne from "@/Store/User/FetchOne";
import Colors from "@/Theme/Colors";

const PersonalProfileScreen = () => {
  const { Layout } = useTheme();
  const [selectedImage, setSelectedImage] = React.useState<string | undefined>(
    undefined
  );

  const [uploadedImage, setUploadedImage] = React.useState();
  const [languages, setLanguages] = useState<Array<ReactText>>(["English"]);
  const [passwordVisible, setPasswordVisible] = React.useState<boolean>(false);
  const countries = useSelector(
    (state: { places: PlaceState }) => state.places.countries
  );
  const [isEditMode, setisEditMode] = useState(false);
  const [isSending, setisSending] = useState(false);
  const [isSent, setisSent] = useState(false);
  const [userId, setuserId] = useState(null);
  const [visible, setVisible] = useState(false);
  const user = useSelector((state: { user: UserState }) => state.user.item);
  const isLoading = useSelector(
    (state: { user: UserState }) => state.user.fetchOne.loading
  );
  const dispatch = useDispatch();
  console.log("user", user);
  const [states, setStates] = useState<Array<any>>([]);
  const [cities, setCities] = useState<Array<any>>([]);

  const getUserId = async () => {
    const id: any = await loadUserId();
    setuserId(id);
    // dispatch(FetchOne.action(id));
  };

  useEffect(() => {
    getUserId();
  }, []);

  function getUriSource(): any {
    return { uri: selectedImage };
  }
  const onPasswordIconPress = (): void => {
    setPasswordVisible(!passwordVisible);
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
  const renderPasswordIcon = (props: any): ReactElement => (
    <TouchableWithoutFeedback onPress={onPasswordIconPress}>
      <Icon {...props} name={passwordVisible ? "eye-off" : "eye"} />
    </TouchableWithoutFeedback>
  );

  const renderEditAvatarButton = (): React.ReactElement => (
    <Button
      style={styles.editAvatarButton}
      status="basic"
      accessoryRight={<Icon name="plus" />}
      onPress={() => setVisible(true)}
    />
  );

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
        setSelectedImage(source.uri);
      }
    });
  };

  const personalProfileValidationSchema = yup.object().shape({
    username: yup
      .string()
      .min(4, ({ min }) => `Username is not up to ${min} characters`)
      .required("Username is required"),
    school: yup.string().when("professional", {
      is: (professional: boolean) => professional === true,
      then: yup.string().min(4).required("Year graduated is required"),
    }),
    yearGraduated: yup.string().when("professional", {
      is: (professional: boolean) => professional === true,
      then: yup.string().required("Year graduated is required"),
    }),
  });

  function getUriSource(): any {
    return { uri: selectedImage };
  }
  const renderEditButtonElement = (): ButtonElement => {
    const buttonElement: React.ReactElement<ButtonProps> =
      renderEditAvatarButton();

    return React.cloneElement(buttonElement, {
      style: [buttonElement.props.style, styles.editButton],
    });
  };

  return (
    <>
      {visible && (
        <ImagePickerModal
          openCamera={imageCameraLaunch}
          openGallery={imageGalleryLaunch}
          close={() => setVisible(false)}
        />
      )}
      <AppHeader title="Profile" isBack />
      {isLoading ? (
        <View style={styles.sppinerContainer}>
          <View style={styles.sppinerContainer}>
            <Spinner status="primary" />
          </View>
        </View>
      ) : (
        <KeyboardAwareScrollView style={{ flex: 1 }} extraScrollHeight={150}>
          <ScrollView style={styles.container}>
            <View style={[[Layout.column, Layout.justifyContentCenter]]}>
              <View style={{ width: "100%" }}>
                {user?.studentPhoto && (
                  <ProfileAvatarPicker
                    style={styles.profileImage}
                    // resizeMode='center'
                    source={{ uri: user?.studentPhoto }}
                    editButton={false ? renderEditAvatarButton : null}
                  />
                )}
                {!user?.studentPhoto && (
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
                      {user?.firstname?.substring(0, 1)?.toUpperCase()}{" "}
                      {user?.lastname?.substring(0, 1)?.toUpperCase()}
                    </Text>
                    {/* {true && renderEditButtonElement()} */}
                  </View>
                )}
              </View>

              <Formik
                validationSchema={personalProfileValidationSchema}
                validateOnMount={true}
                initialValues={{
                  username: user?.username || "",
                  firstName: user?.firstname || "",
                  lastName: user?.lastname || "",
                  school: user?.school || "",
                  grade: user?.grade || "",
                  country: user?.country || "",
                  email: user?.email || "",
                  zipcode: user?.zipcode || "",
                  city: user?.city || "",
                  state: user?.state || "",
                  phone: user?.phone || "",
                  parentemail1: user?.parentemail1 || "",
                  parentemail2: user?.parentemail2 || "",
                }}
                onSubmit={(values, { resetForm }) => {
                  let formData = new FormData();
                  formData.append(
                    "image",
                    uploadedImage
                      ? {
                          uri: uploadedImage?.path,
                          name: uploadedImage.mime,
                          type: uploadedImage.mime,
                        }
                      : ""
                  );
                  formData.append("parentId", parseInt(userId, 0));
                  formData.append("firstName", values.firstName);
                  formData.append("lastName", values.lastName);
                  formData.append("country", values.country);
                  formData.append("state", values.state);
                  formData.append("city", values.city);
                  formData.append("id", userId);
                  setisSending(true);
                  // let objectToPass = {
                  //   firstName: values.firstName,
                  //   lastName: values.lastName,
                  //   id: userId,
                  //   country: values.country,
                  //   state: values.state,
                  //   city: values.city,
                  // };
                  UpdateUser(formData)
                    .then((response: any) => {
                      if (response.status == 200) {
                        setisEditMode(false);
                        setisSending(false);
                        getUserId();
                      }
                    })
                    .catch((error: any) => {
                      Alert.alert(
                        error.response.data.title,
                        error.response.data.detail,
                        [{ text: "OK", style: "cancel" }]
                      );
                      setisSending(false);
                      setisEditMode(!isEditMode);
                    });
                }}
              >
                {({
                  handleChange,
                  handleSubmit,
                  setFieldValue,
                  values,
                  errors,
                  touched,
                }) => (
                  <>
                    {isSending ? (
                      <View style={styles.sppinerContainer}>
                        <Spinner status="primary" />
                      </View>
                    ) : (
                      <>
                        <View style={{ flexDirection: "column" }}>
                          <Text style={styles.editLabel}>Email</Text>
                          <Text style={styles.editField}>{values.email}</Text>
                        </View>

                        {!isEditMode ? (
                          <View style={{ flexDirection: "column" }}>
                            <Text style={styles.editLabel}>First Name</Text>
                            <Text style={styles.editField}>
                              {values.firstName}
                            </Text>
                          </View>
                        ) : (
                          <Input
                            style={styles.inputSettings}
                            autoCapitalize="none"
                            label={(evaProps) => (
                              <Text {...evaProps}>First Name</Text>
                            )}
                            value={values.firstName}
                            onChangeText={handleChange("firstName")}
                          />
                        )}

                        {!isEditMode ? (
                          <View style={{ flexDirection: "column" }}>
                            <Text style={styles.editLabel}>Last Name</Text>
                            <Text style={styles.editField}>
                              {values.lastName}
                            </Text>
                          </View>
                        ) : (
                          <Input
                            style={styles.inputSettings}
                            autoCapitalize="none"
                            label={(evaProps) => (
                              <Text {...evaProps}>Last Name</Text>
                            )}
                            value={values.lastName}
                            onChangeText={handleChange("lastName")}
                          />
                        )}
                        {!isEditMode ? (
                          <View style={{ flexDirection: "column" }}>
                            <Text style={styles.editLabel}>School</Text>
                            <Text style={styles.editField}>
                              {values.school}
                            </Text>
                          </View>
                        ) : (
                          <Input
                            style={styles.inputSettings}
                            autoCapitalize="none"
                            label={(evaProps) => (
                              <Text {...evaProps}>School</Text>
                            )}
                            value={values.school}
                            onChangeText={handleChange("school")}
                          />
                        )}
                        {/* {!isEditMode ? (
                          <View style={{ flexDirection: "column" }}>
                            <Text style={styles.editLabel}>Grade</Text>
                            <Text style={styles.editField}>{values.grade}</Text>
                          </View>
                        ) : (
                          <Input
                            style={styles.inputSettings}
                            autoCapitalize="none"
                            label={(evaProps) => (
                              <Text {...evaProps}>Grade</Text>
                            )}
                            value={values.grade}
                            onChangeText={handleChange("grade")}
                          />
                        )} */}
                        <View style={{ flexDirection: "column" }}>
                          <Text style={styles.editLabel}>
                            Parent 1/Guardian 1 Email
                          </Text>
                          <Text style={styles.editField}>
                            {values.parentemail1}
                          </Text>
                        </View>
                        <View style={{ flexDirection: "column" }}>
                          <Text style={styles.editLabel}>
                            Parent 2/Guardian 2 Email
                          </Text>
                          <Text style={styles.editField}>
                            {values.parentemail2}
                          </Text>
                        </View>

                        <View style={{ flexDirection: "column" }}>
                          <Text style={styles.editLabel}>Phone Number</Text>
                          <Text style={styles.editField}></Text>
                        </View>

                        {isEditMode ? (
                          <View style={{ marginTop: 10 }}>
                            <View style={styles.background}>
                              <TouchableOpacity
                                style={styles.background}
                                onPress={handleSubmit}
                              >
                                <Text style={styles.button}>Submit</Text>
                              </TouchableOpacity>
                            </View>
                            <Button
                              size="small"
                              appearance="outline"
                              onPress={() => {
                                setFieldValue("firstName", user?.firstName);
                                setFieldValue("lastName", user?.lastName);
                                setFieldValue("country", user?.country);
                                setFieldValue("state", user?.state);
                                setFieldValue("city", user?.city);
                                setisEditMode(false);
                              }}
                              style={{ borderRadius: 10, width: "100%" }}
                            >
                              Cancel
                            </Button>
                          </View>
                        ) : (
                          <View style={{ marginTop: 10 }}></View>
                        )}
                      </>
                    )}
                  </>
                )}
              </Formik>
            </View>
          </ScrollView>
        </KeyboardAwareScrollView>
      )}
    </>
  );
};

export default PersonalProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    //backgroundColor: 'background-basic-color-1',
  },
  layout: {
    flex: 1,
    flexDirection: "column",
  },
  mainLayout: {
    flex: 9,
    marginTop: 40,
  },
  profileAvatar: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignSelf: "center",
    backgroundColor: "#3AA5A2",
    tintColor: "#ECF1F7",
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
  selectSettings: {
    marginTop: 18,
  },
  inputSettings: {
    marginTop: 7,
  },
  disabledInputSettings: {
    marginTop: 7,
    borderColor: Colors.transparent,
    backgroundColor: Colors.transparent,
    color: "black",
    tintColor: "black",
  },

  background: {
    width: "100%",
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
  },
  button: {
    paddingTop: 10,
    fontSize: 15,
    color: Colors.white,
    borderRadius: 10,
  },
  sppinerContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  editField: {
    paddingLeft: 20,
    backgroundColor: Colors.white,
    borderRadius: 5,
    paddingVertical: 10,
  },
  editLabel: {
    fontSize: 15,
    color: "#8f9bb3",
    marginBottom: 4,
    marginTop: 8,
    fontWeight: "bold",
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
  errorText: {
    fontSize: 13,
    color: "red",
  },
  label: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.fieldLabel,
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
  },
});
